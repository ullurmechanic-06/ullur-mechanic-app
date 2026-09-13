const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/v1/tracking/:requestId
router.get("/:requestId", verifyToken, async (req, res) => {
  const { requestId } = req.params;
  const request = await prisma.breakdownRequest.findUnique({
    where: { id: requestId },
    include: {
      mechanic: {
        include: {
          user: {
            select: { id: true, name: true, phone: true, profileImageUrl: true },
          },
        },
      },
      customer: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  if (!request) return errorResponse(res, "Request not found", 404);

  const mechanic = request.mechanic;
  return successResponse(
    res,
    {
      requestId: request.id,
      status: request.status,
      customerLat: request.lat,
      customerLng: request.lng,
      customerAddress: request.address,
      mechanic: mechanic
        ? {
            id: mechanic.id,
            name: mechanic.user.name,
            phone: mechanic.user.phone,
            rating: mechanic.rating,
            lat: mechanic.currentLat || request.lat + 0.008,
            lng: mechanic.currentLng || request.lng + 0.008,
          }
        : null,
      updatedAt: request.updatedAt,
    },
    "Tracking details fetched"
  );
});

module.exports = router;
