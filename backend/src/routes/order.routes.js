const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/response");

router.post("/", verifyToken, async (req, res) => {
  const { shopId, items, address, lat, lng } = req.body;
  if (!items || !items.length) return errorResponse(res, "Order items cannot be empty", 400);

  const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const order = await prisma.order.create({
    data: {
      customerId: req.user.id,
      shopId: shopId || "default-shop",
      totalAmount: total,
      address: address || "Customer Location",
      lat: parseFloat(lat) || 10.0104,
      lng: parseFloat(lng) || 77.4768,
      items: {
        create: items.map((i) => ({
          partId: i.partId,
          quantity: i.qty || 1,
          priceAtTime: i.price || 0,
        })),
      },
    },
    include: { items: true },
  });
  return successResponse(res, order, "Order placed successfully", 201);
});

router.get("/", verifyToken, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user.id },
    include: { items: { include: { part: true } }, shop: true },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, orders, "Orders fetched");
});

module.exports = router;
