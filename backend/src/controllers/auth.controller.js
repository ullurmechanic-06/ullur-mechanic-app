const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

const generateJWT = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "ullur_secret_key_2026", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Demo/Development OTP sender
const sendOtp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, "Validation failed", 400, errors.array());

  const { phone } = req.body;
  // In production, Firebase Phone Auth sends the SMS OTP directly to client.
  // For backend testing / mock, return success.
  return successResponse(
    res,
    { phone, message: "OTP sent successfully. Use Firebase client or mock code 123456" },
    "OTP initiated"
  );
});

// Verify OTP / Firebase Token and return User + JWT
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, idToken, name, role = "CUSTOMER" } = req.body;

  if (!phone) {
    return errorResponse(res, "Phone number is required", 400);
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { phone },
    include: { mechanic: true, shop: true, towPartner: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name: name || `User_${phone.slice(-4)}`,
        role,
        isVerified: true,
      },
      include: { mechanic: true, shop: true, towPartner: true },
    });

    // If registered as mechanic, create Mechanic record
    if (role === "MECHANIC") {
      await prisma.mechanic.create({
        data: {
          userId: user.id,
          skills: ["Engine Repair", "Tire Puncture", "Electrical", "Brake Service"],
          vehicleTypes: ["CAR", "BIKE"],
          isOnline: true,
        },
      });
    }
  }

  const token = generateJWT(user.id);

  return successResponse(
    res,
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
      },
    },
    "Authentication successful"
  );
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const token = generateJWT(req.user.id);
  return successResponse(res, { token }, "Token refreshed");
});

// Logout
const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, "Logged out successfully");
});

module.exports = { sendOtp, verifyOtp, refreshToken, logout };
