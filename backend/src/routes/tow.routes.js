const express = require("express");
const router = express.Router();
const towController = require("../controllers/tow.controller");
const { verifyToken, authorize } = require("../middleware/auth.middleware");

// POST /api/v1/tow/request
router.post("/request", verifyToken, towController.createTowRequest);

// GET /api/v1/tow/nearby
router.get("/nearby", verifyToken, towController.getNearbyTowPartners);

// GET /api/v1/tow/:id
router.get("/:id", verifyToken, towController.getTowRequestById);

// PUT /api/v1/tow/:id/accept
router.put("/:id/accept", verifyToken, authorize("TOW_PARTNER"), towController.acceptTow);

// PUT /api/v1/tow/:id/status
router.put("/:id/status", verifyToken, authorize("TOW_PARTNER"), towController.updateTowStatus);

// GET /api/v1/tow
router.get("/", verifyToken, towController.getMyTowRequests);

module.exports = router;
