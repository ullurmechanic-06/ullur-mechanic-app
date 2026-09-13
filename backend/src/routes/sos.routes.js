const express = require("express");
const router = express.Router();
const sosController = require("../controllers/sos.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// POST /api/v1/sos/trigger (Immediate SOS police alert)
router.post("/trigger", verifyToken, sosController.triggerSosAlert);

// GET /api/v1/sos/police-stations?lat=&lng=
router.get("/police-stations", verifyToken, sosController.getNearbyPoliceStations);

// Emergency contacts management
router.get("/contacts", verifyToken, sosController.getEmergencyContacts);
router.post("/contacts", verifyToken, sosController.addEmergencyContact);
router.delete("/contacts/:id", verifyToken, sosController.deleteEmergencyContact);

module.exports = router;
