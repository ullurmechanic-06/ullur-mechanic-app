const express = require("express");
const router = express.Router();
const requestController = require("../controllers/request.controller");
const { verifyToken, authorize } = require("../middleware/auth.middleware");
const { createUploader } = require("../services/s3.service");

const upload = createUploader("issue-images");

// POST /api/v1/requests/breakdown
router.post(
  "/breakdown",
  verifyToken,
  upload.array("issueImages", 5),
  requestController.createRequest
);

// GET /api/v1/requests/:id
router.get("/:id", verifyToken, requestController.getRequestById);

// GET /api/v1/requests (my requests)
router.get("/", verifyToken, requestController.getMyRequests);

// PUT /api/v1/requests/:id/accept
router.put("/:id/accept", verifyToken, authorize("MECHANIC"), requestController.acceptRequest);

// PUT /api/v1/requests/:id/status
router.put("/:id/status", verifyToken, authorize("MECHANIC"), requestController.updateRequestStatus);

// PUT /api/v1/requests/:id/cancel
router.put("/:id/cancel", verifyToken, requestController.cancelRequest);

// PUT /api/v1/requests/:id/complete
router.put("/:id/complete", verifyToken, authorize("MECHANIC"), requestController.completeRequest);

module.exports = router;
