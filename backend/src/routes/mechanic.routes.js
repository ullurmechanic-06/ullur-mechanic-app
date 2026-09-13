const express = require("express");
const router = express.Router();
const mechanicController = require("../controllers/mechanic.controller");
const { verifyToken, authorize } = require("../middleware/auth.middleware");
const { createUploader } = require("../services/s3.service");

const upload = createUploader("mechanic-docs");

// GET /api/v1/mechanics/nearby?lat=&lng=&vehicleType=
router.get("/nearby", verifyToken, mechanicController.getNearbyMechanics);

// GET /api/v1/mechanics/:id
router.get("/:id", verifyToken, mechanicController.getMechanicById);

// POST /api/v1/mechanics/register
router.post(
  "/register",
  verifyToken,
  upload.fields([{ name: "certImage", maxCount: 1 }, { name: "idProof", maxCount: 1 }]),
  mechanicController.registerMechanic
);

// PUT /api/v1/mechanics/status (toggle online/offline)
router.put("/status", verifyToken, authorize("MECHANIC"), mechanicController.updateStatus);

// PUT /api/v1/mechanics/location
router.put("/location", verifyToken, authorize("MECHANIC"), mechanicController.updateLocation);

// GET /api/v1/mechanics/jobs/history
router.get("/jobs/history", verifyToken, authorize("MECHANIC"), mechanicController.getJobHistory);

module.exports = router;
