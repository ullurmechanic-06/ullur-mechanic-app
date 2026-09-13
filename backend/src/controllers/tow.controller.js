const { PrismaClient } = require("@prisma/client");
const { calculateDistance, getDirections } = require("../services/maps.service");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

// POST /api/v1/tow/request
const createTowRequest = asyncHandler(async (req, res) => {
  const {
    vehicleId,
    pickupLat,
    pickupLng,
    pickupAddress,
    dropoffLat,
    dropoffLng,
    dropoffAddress,
  } = req.body;

  if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
    return errorResponse(res, "Pickup and dropoff coordinates are required", 400);
  }

  const pLat = parseFloat(pickupLat);
  const pLng = parseFloat(pickupLng);
  const dLat = parseFloat(dropoffLat);
  const dLng = parseFloat(dropoffLng);

  const distanceKm = calculateDistance(pLat, pLng, dLat, dLng);
  // Pricing: Base fare ₹500 + ₹40/km
  const estimatedFee = Math.max(500, Math.round(500 + distanceKm * 40));

  let activeVehicleId = vehicleId;
  if (!activeVehicleId) {
    const defaultVehicle = await prisma.vehicle.findFirst({ where: { userId: req.user.id } });
    if (defaultVehicle) activeVehicleId = defaultVehicle.id;
    else {
      const v = await prisma.vehicle.create({
        data: {
          userId: req.user.id,
          type: "CAR",
          make: "General",
          model: "Vehicle",
          year: 2022,
          regNumber: `TN-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
      activeVehicleId = v.id;
    }
  }

  const towRequest = await prisma.towRequest.create({
    data: {
      userId: req.user.id,
      vehicleId: activeVehicleId,
      pickupLat: pLat,
      pickupLng: pLng,
      pickupAddress: pickupAddress || "Current Pickup Location",
      dropoffLat: dLat,
      dropoffLng: dLng,
      dropoffAddress: dropoffAddress || "Destination Garage",
      distanceKm,
      estimatedFee,
      status: "PENDING",
    },
    include: { customer: true, vehicle: true },
  });

  return successResponse(res, towRequest, "Tow request created successfully", 201);
});

// GET /api/v1/tow/nearby?lat=&lng=
const getNearbyTowPartners = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat) || 10.0104;
  const userLng = parseFloat(lng) || 77.4768;

  const partners = await prisma.towPartner.findMany({
    where: { isOnline: true },
    include: { user: true },
  });

  const withDist = partners.map((p) => {
    const pLat = p.currentLat || userLat + 0.02;
    const pLng = p.currentLng || userLng + 0.02;
    return {
      id: p.id,
      name: p.user.name,
      phone: p.user.phone,
      vehicleType: p.vehicleType,
      rating: p.rating,
      distanceKm: calculateDistance(userLat, userLng, pLat, pLng),
    };
  });

  return successResponse(res, withDist, "Nearby tow partners");
});

// GET /api/v1/tow/:id
const getTowRequestById = asyncHandler(async (req, res) => {
  const tow = await prisma.towRequest.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      vehicle: true,
      towPartner: { include: { user: true } },
      payment: true,
    },
  });
  if (!tow) return errorResponse(res, "Tow request not found", 404);
  return successResponse(res, tow);
});

// PUT /api/v1/tow/:id/accept
const acceptTow = asyncHandler(async (req, res) => {
  const partner = await prisma.towPartner.findUnique({ where: { userId: req.user.id } });
  if (!partner) return errorResponse(res, "Tow partner profile not found", 404);

  const updated = await prisma.towRequest.update({
    where: { id: req.params.id },
    data: { towPartnerId: partner.id, status: "ACCEPTED" },
  });
  return successResponse(res, updated, "Tow request accepted");
});

// PUT /api/v1/tow/:id/status
const updateTowStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.towRequest.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(status === "DELIVERED" && { completedAt: new Date() }),
    },
  });
  return successResponse(res, updated, `Tow status updated to ${status}`);
});

// GET /api/v1/tow
const getMyTowRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.towRequest.findMany({
    where: { userId: req.user.id },
    include: { vehicle: true, towPartner: { include: { user: true } }, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, requests);
});

module.exports = {
  createTowRequest,
  getNearbyTowPartners,
  getTowRequestById,
  acceptTow,
  updateTowStatus,
  getMyTowRequests,
};
