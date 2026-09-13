const { PrismaClient } = require("@prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

// GET /api/v1/spare-parts?category=&vehicleType=&search=&minPrice=&maxPrice=&shopId=
const getAllParts = asyncHandler(async (req, res) => {
  const { category, vehicleType, search, minPrice, maxPrice, shopId } = req.query;

  const whereClause = {
    isAvailable: true,
    ...(category && { category: { equals: category, mode: "insensitive" } }),
    ...(vehicleType && { vehicleTypes: { has: vehicleType } }),
    ...(shopId && { shopId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
  };

  const parts = await prisma.sparePart.findMany({
    where: whereClause,
    include: {
      shop: {
        select: {
          id: true,
          shopName: true,
          address: true,
          rating: true,
          isOpen: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(res, parts, "Spare parts fetched");
});

// GET /api/v1/spare-parts/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = [
    { id: "battery", name: "Batteries & Electrical", icon: "battery_charging_full", count: 42 },
    { id: "engine", name: "Engine & Transmission", icon: "engineering", count: 85 },
    { id: "brakes", name: "Brakes & Suspension", icon: "disc_full", count: 64 },
    { id: "tires", name: "Tires & Tubes", icon: "tire_repair", count: 38 },
    { id: "oils", name: "Engine Oils & Fluids", icon: "opacity", count: 29 },
    { id: "lighting", name: "Lights & Indicators", icon: "lightbulb", count: 53 },
    { id: "clutch", name: "Clutch & Cables", icon: "settings", count: 31 },
    { id: "accessories", name: "Accessories & Body", icon: "tune", count: 47 },
  ];
  return successResponse(res, categories, "Categories list fetched");
});

// GET /api/v1/spare-parts/:id
const getPartById = asyncHandler(async (req, res) => {
  const part = await prisma.sparePart.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  });
  if (!part) return errorResponse(res, "Spare part not found", 404);
  return successResponse(res, part);
});

// POST /api/v1/spare-parts
const createPart = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { userId: req.user.id } });
  if (!shop) return errorResponse(res, "Shop profile not registered", 404);

  const { name, description, category, vehicleTypes, brand, partNumber, price, wholesalePrice, stock } =
    req.body;

  const imageUrl = req.file ? req.file.location || req.file.path : null;
  const parsedTypes =
    typeof vehicleTypes === "string" ? JSON.parse(vehicleTypes) : vehicleTypes || ["CAR", "BIKE"];

  const part = await prisma.sparePart.create({
    data: {
      shopId: shop.id,
      name,
      description,
      category,
      vehicleTypes: parsedTypes,
      brand,
      partNumber,
      price: parseFloat(price),
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : parseFloat(price) * 0.85,
      stock: parseInt(stock) || 10,
      imageUrl,
    },
  });

  return successResponse(res, part, "Spare part added to catalog", 201);
});

// PUT /api/v1/spare-parts/:id
const updatePart = asyncHandler(async (req, res) => {
  const part = await prisma.sparePart.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return successResponse(res, part, "Spare part updated");
});

// DELETE /api/v1/spare-parts/:id
const deletePart = asyncHandler(async (req, res) => {
  await prisma.sparePart.update({
    where: { id: req.params.id },
    data: { isAvailable: false },
  });
  return successResponse(res, null, "Spare part deleted");
});

module.exports = { getAllParts, getCategories, getPartById, createPart, updatePart, deletePart };
