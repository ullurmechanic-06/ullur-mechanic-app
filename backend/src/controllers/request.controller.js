const { PrismaClient } = require("@prisma/client");
const { reverseGeocode } = require("../services/maps.service");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

// POST /api/v1/requests/breakdown
const createRequest = asyncHandler(async (req, res) => {
  const { vehicleId, issueDesc, lat, lng, estimatedFee } = req.body;

  if (!lat || !lng || !issueDesc) {
    return errorResponse(res, "lat, lng, and issueDesc are required", 400);
  }

  // If vehicleId not provided, get default vehicle or create a temporary one
  let activeVehicleId = vehicleId;
  if (!activeVehicleId) {
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { userId: req.user.id, isActive: true },
    });
    if (existingVehicle) {
      activeVehicleId = existingVehicle.id;
    } else {
      const newVehicle = await prisma.vehicle.create({
        data: {
          userId: req.user.id,
          type: "CAR",
          make: "General",
          model: "Vehicle",
          year: 2022,
          regNumber: `TN-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
      activeVehicleId = newVehicle.id;
    }
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const address = await reverseGeocode(parsedLat, parsedLng);

  const issueImages = req.files ? req.files.map((f) => f.location || f.path) : [];

  const request = await prisma.breakdownRequest.create({
    data: {
      userId: req.user.id,
      vehicleId: activeVehicleId,
      issueDesc,
      issueImages,
      lat: parsedLat,
      lng: parsedLng,
      address,
      estimatedFee: parseFloat(estimatedFee) || 350.0,
      status: "PENDING",
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      vehicle: true,
    },
  });

  // Broadcast via Socket.IO
  const io = req.app.get("io");
  if (io) {
    io.to("mechanics").emit("request:new", {
      requestId: request.id,
      customerName: request.customer.name,
      phone: request.customer.phone,
      issueDesc: request.issueDesc,
      lat: request.lat,
      lng: request.lng,
      address: request.address,
      vehicleType: request.vehicle.type,
      estimatedFee: request.estimatedFee,
      createdAt: request.createdAt,
    });
  }

  return successResponse(res, request, "Breakdown request created", 201);
});

// GET /api/v1/requests/:id
const getRequestById = asyncHandler(async (req, res) => {
  const request = await prisma.breakdownRequest.findUnique({
    where: { id: req.params.id },
    include: {
      customer: { select: { id: true, name: true, phone: true, profileImageUrl: true } },
      vehicle: true,
      mechanic: {
        include: {
          user: { select: { id: true, name: true, phone: true, profileImageUrl: true } },
        },
      },
      payment: true,
      review: true,
    },
  });

  if (!request) return errorResponse(res, "Request not found", 404);
  return successResponse(res, request);
});

// GET /api/v1/requests
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.breakdownRequest.findMany({
    where: { userId: req.user.id },
    include: {
      vehicle: true,
      mechanic: {
        include: {
          user: { select: { id: true, name: true, phone: true } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(res, requests, "Requests fetched");
});

// PUT /api/v1/requests/:id/accept
const acceptRequest = asyncHandler(async (req, res) => {
  const mechanic = await prisma.mechanic.findUnique({ where: { userId: req.user.id } });
  if (!mechanic) return errorResponse(res, "Mechanic profile not found", 404);

  const existingRequest = await prisma.breakdownRequest.findUnique({
    where: { id: req.params.id },
  });

  if (!existingRequest) return errorResponse(res, "Request not found", 404);
  if (existingRequest.status !== "PENDING") {
    return errorResponse(res, `Request is already ${existingRequest.status}`, 400);
  }

  const updatedRequest = await prisma.breakdownRequest.update({
    where: { id: req.params.id },
    data: {
      mechanicId: mechanic.id,
      status: "ACCEPTED",
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      vehicle: true,
      mechanic: { include: { user: true } },
    },
  });

  // Notify customer via Socket.IO
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${updatedRequest.userId}`).emit("request:mechanic_assigned", {
      requestId: updatedRequest.id,
      mechanic: {
        id: mechanic.id,
        name: req.user.name,
        phone: req.user.phone,
        rating: mechanic.rating,
        lat: mechanic.currentLat,
        lng: mechanic.currentLng,
      },
      message: `${req.user.name} accepted your breakdown request!`,
    });
  }

  return successResponse(res, updatedRequest, "Request accepted");
});

// PUT /api/v1/requests/:id/status
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, mechanicNotes, finalFee } = req.body;

  const validStatuses = ["EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const updatedRequest = await prisma.breakdownRequest.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(mechanicNotes && { mechanicNotes }),
      ...(finalFee && { finalFee: parseFloat(finalFee) }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
    include: { customer: true },
  });

  if (status === "COMPLETED") {
    // Increment mechanic's total jobs
    await prisma.mechanic.update({
      where: { id: updatedRequest.mechanicId },
      data: { totalJobs: { increment: 1 } },
    });
  }

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${updatedRequest.userId}`).emit("request:status_update", {
      requestId: updatedRequest.id,
      status: updatedRequest.status,
      finalFee: updatedRequest.finalFee,
      timestamp: new Date().toISOString(),
    });
  }

  return successResponse(res, updatedRequest, `Request status updated to ${status}`);
});

// PUT /api/v1/requests/:id/cancel
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await prisma.breakdownRequest.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });
  return successResponse(res, request, "Request cancelled");
});

// PUT /api/v1/requests/:id/complete
const completeRequest = asyncHandler(async (req, res) => {
  const { finalFee, mechanicNotes } = req.body;
  const request = await prisma.breakdownRequest.update({
    where: { id: req.params.id },
    data: {
      status: "COMPLETED",
      finalFee: parseFloat(finalFee) || 400.0,
      mechanicNotes,
      completedAt: new Date(),
    },
  });
  return successResponse(res, request, "Request marked as completed");
});

module.exports = {
  createRequest,
  getRequestById,
  getMyRequests,
  acceptRequest,
  updateRequestStatus,
  cancelRequest,
  completeRequest,
};
