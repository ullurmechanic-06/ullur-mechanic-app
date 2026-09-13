const { PrismaClient } = require("@prisma/client");
const { calculateDistance } = require("../services/maps.service");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

// GET /api/v1/mechanics/nearby?lat=&lng=&vehicleType=&radius=
const getNearbyMechanics = asyncHandler(async (req, res) => {
  const { lat, lng, vehicleType, radius = 15 } = req.query;

  if (!lat || !lng) {
    return errorResponse(res, "lat and lng query parameters are required", 400);
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = parseFloat(radius);

  // Fetch online mechanics
  const mechanics = await prisma.mechanic.findMany({
    where: {
      isOnline: true,
      ...(vehicleType && { vehicleTypes: { has: vehicleType } }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          profileImageUrl: true,
        },
      },
    },
  });

  // Filter by Haversine distance
  const mechanicsWithDistance = mechanics
    .map((mech) => {
      const mechLat = mech.currentLat || userLat + (Math.random() - 0.5) * 0.05;
      const mechLng = mech.currentLng || userLng + (Math.random() - 0.5) * 0.05;
      const distance = calculateDistance(userLat, userLng, mechLat, mechLng);
      return {
        id: mech.id,
        userId: mech.userId,
        name: mech.user.name,
        phone: mech.user.phone,
        profileImageUrl: mech.user.profileImageUrl,
        skills: mech.skills,
        vehicleTypes: mech.vehicleTypes,
        experience: mech.experience,
        rating: mech.rating,
        totalJobs: mech.totalJobs,
        isOnline: mech.isOnline,
        isVerified: mech.isVerified,
        lat: mechLat,
        lng: mechLng,
        distanceKm: distance,
        estimatedEtaMins: Math.max(5, Math.round(distance * 3)),
      };
    })
    .filter((m) => m.distanceKm <= searchRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return successResponse(res, mechanicsWithDistance, "Nearby mechanics fetched");
});

// GET /api/v1/mechanics/:id
const getMechanicById = asyncHandler(async (req, res) => {
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          profileImageUrl: true,
        },
      },
      requests: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { review: true },
      },
    },
  });

  if (!mechanic) return errorResponse(res, "Mechanic not found", 404);
  return successResponse(res, mechanic);
});

// POST /api/v1/mechanics/register
const registerMechanic = asyncHandler(async (req, res) => {
  const { skills, vehicleTypes, experience } = req.body;
  const certImageUrl = req.files?.certImage?.[0]?.location || req.files?.certImage?.[0]?.path;
  const idProofUrl = req.files?.idProof?.[0]?.location || req.files?.idProof?.[0]?.path;

  const parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills || [];
  const parsedVehicleTypes =
    typeof vehicleTypes === "string" ? JSON.parse(vehicleTypes) : vehicleTypes || ["CAR", "BIKE"];

  const mechanic = await prisma.mechanic.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      skills: parsedSkills,
      vehicleTypes: parsedVehicleTypes,
      experience: parseInt(experience) || 1,
      certImageUrl,
      idProofUrl,
      isOnline: true,
    },
    update: {
      skills: parsedSkills,
      vehicleTypes: parsedVehicleTypes,
      experience: parseInt(experience) || 1,
      ...(certImageUrl && { certImageUrl }),
      ...(idProofUrl && { idProofUrl }),
    },
  });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { role: "MECHANIC" },
  });

  return successResponse(res, mechanic, "Mechanic profile registered", 201);
});

// PUT /api/v1/mechanics/status
const updateStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const mechanic = await prisma.mechanic.update({
    where: { userId: req.user.id },
    data: { isOnline: Boolean(isOnline) },
  });
  return successResponse(res, mechanic, `Status changed to ${isOnline ? "online" : "offline"}`);
});

// PUT /api/v1/mechanics/location
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const mechanic = await prisma.mechanic.update({
    where: { userId: req.user.id },
    data: { currentLat: parseFloat(lat), currentLng: parseFloat(lng) },
  });
  return successResponse(res, mechanic, "Location updated");
});

// GET /api/v1/mechanics/jobs/history
const getJobHistory = asyncHandler(async (req, res) => {
  const mechanic = await prisma.mechanic.findUnique({ where: { userId: req.user.id } });
  if (!mechanic) return errorResponse(res, "Mechanic record not found", 404);

  const jobs = await prisma.breakdownRequest.findMany({
    where: { mechanicId: mechanic.id },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      vehicle: true,
      payment: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(res, jobs, "Job history fetched");
});

module.exports = {
  getNearbyMechanics,
  getMechanicById,
  registerMechanic,
  updateStatus,
  updateLocation,
  getJobHistory,
};
