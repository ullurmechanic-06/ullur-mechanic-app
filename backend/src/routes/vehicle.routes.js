const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/response");

router.get("/", verifyToken, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, vehicles, "Vehicles fetched");
});

router.post("/", verifyToken, async (req, res) => {
  const { type = "CAR", make, model, year, regNumber, color } = req.body;
  if (!make || !model || !regNumber) {
    return errorResponse(res, "Make, model, and registration number are required", 400);
  }
  const vehicle = await prisma.vehicle.create({
    data: {
      userId: req.user.id,
      type,
      make,
      model,
      year: parseInt(year) || new Date().getFullYear(),
      regNumber,
      color,
    },
  });
  return successResponse(res, vehicle, "Vehicle added successfully", 201);
});

router.put("/:id", verifyToken, async (req, res) => {
  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return successResponse(res, vehicle, "Vehicle updated");
});

router.delete("/:id", verifyToken, async (req, res) => {
  await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  return successResponse(res, null, "Vehicle removed");
});

module.exports = router;
