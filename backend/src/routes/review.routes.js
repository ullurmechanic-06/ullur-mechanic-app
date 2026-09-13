const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/response");

router.post("/", verifyToken, async (req, res) => {
  const { requestId, subjectId, rating, comment } = req.body;
  if (!subjectId || !rating) return errorResponse(res, "subjectId and rating are required", 400);

  const review = await prisma.review.create({
    data: {
      customerId: req.user.id,
      subjectId,
      requestId,
      rating: parseFloat(rating),
      comment,
    },
  });

  // Update subject mechanic's average rating
  const avg = await prisma.review.aggregate({
    where: { subjectId },
    _avg: { rating: true },
  });

  await prisma.mechanic.updateMany({
    where: { userId: subjectId },
    data: { rating: Math.round((avg._avg.rating || 5.0) * 10) / 10 },
  });

  return successResponse(res, review, "Review submitted successfully", 201);
});

router.get("/mechanic/:mechanicId", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { subjectId: req.params.mechanicId },
    include: { customer: { select: { id: true, name: true, profileImageUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, reviews, "Reviews fetched");
});

module.exports = router;
