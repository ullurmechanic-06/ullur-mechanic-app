const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// POST /api/v1/auth/send-otp
router.post(
  "/send-otp",
  [body("phone").notEmpty().withMessage("Phone number is required")],
  authController.sendOtp
);

// POST /api/v1/auth/verify-otp
router.post(
  "/verify-otp",
  [body("phone").notEmpty().withMessage("Phone number is required")],
  authController.verifyOtp
);

// POST /api/v1/auth/refresh
router.post("/refresh", verifyToken, authController.refreshToken);

// POST /api/v1/auth/logout
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
