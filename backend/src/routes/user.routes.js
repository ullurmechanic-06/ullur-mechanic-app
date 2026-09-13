const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/response");

router.get("/me", verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { mechanic: true, shop: true, towPartner: true, vehicles: true },
  });
  return successResponse(res, user, "Profile fetched");
});

router.put("/me", verifyToken, async (req, res) => {
  const { name, email, profileImageUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(profileImageUrl && { profileImageUrl }),
    },
  });
  return successResponse(res, updated, "Profile updated");
});

router.get("/:id", verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, phone: true, role: true, profileImageUrl: true },
  });
  if (!user) return errorResponse(res, "User not found", 404);
  return successResponse(res, user);
});

module.exports = router;
