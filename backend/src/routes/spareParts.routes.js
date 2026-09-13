const express = require("express");
const router = express.Router();
const sparePartsController = require("../controllers/spareParts.controller");
const { verifyToken, authorize } = require("../middleware/auth.middleware");
const { createUploader } = require("../services/s3.service");

const upload = createUploader("spare-parts");

// GET /api/v1/spare-parts
router.get("/", sparePartsController.getAllParts);

// GET /api/v1/spare-parts/categories
router.get("/categories", sparePartsController.getCategories);

// GET /api/v1/spare-parts/:id
router.get("/:id", sparePartsController.getPartById);

// POST /api/v1/spare-parts
router.post(
  "/",
  verifyToken,
  authorize("SHOP_OWNER", "ADMIN"),
  upload.single("image"),
  sparePartsController.createPart
);

// PUT /api/v1/spare-parts/:id
router.put(
  "/:id",
  verifyToken,
  authorize("SHOP_OWNER", "ADMIN"),
  sparePartsController.updatePart
);

// DELETE /api/v1/spare-parts/:id
router.delete(
  "/:id",
  verifyToken,
  authorize("SHOP_OWNER", "ADMIN"),
  sparePartsController.deletePart
);

module.exports = router;
