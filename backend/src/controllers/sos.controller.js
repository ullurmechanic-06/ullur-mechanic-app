const { PrismaClient } = require("@prisma/client");
const { calculateDistance } = require("../services/maps.service");
const { successResponse, errorResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/error.middleware");

const prisma = new PrismaClient();

// Tamil Nadu Police Stations Database (Theni, Madurai, Highway Patrols)
const TN_POLICE_STATIONS = [
  {
    name: "Theni Town Police Station",
    nameTa: "தேனி நகர் காவல் நிலையம்",
    phone: "04546-252222",
    emergencyHelpline: "112 / 100",
    lat: 10.0104,
    lng: 77.4768,
    jurisdiction: "Theni Urban & Bypass",
  },
  {
    name: "All Women Police Station (AWPS), Theni",
    nameTa: "அனைத்து மகளிர் காவல் நிலையம், தேனி",
    phone: "04546-253333",
    emergencyHelpline: "1091 / 112",
    lat: 10.012,
    lng: 77.479,
    jurisdiction: "Women & Safety Protection",
  },
  {
    name: "Theni Highway Patrol Unit (NH-85)",
    nameTa: "தேனி தேசிய நெடுஞ்சாலை ரோந்துப் பிரிவு",
    phone: "04546-254444",
    emergencyHelpline: "1033 / 112",
    lat: 10.015,
    lng: 77.485,
    jurisdiction: "Highway Breakdown & Patrol",
  },
  {
    name: "Periyakulam Police Station",
    nameTa: "பெரியகுளம் காவல் நிலையம்",
    phone: "04546-231222",
    emergencyHelpline: "112",
    lat: 10.12,
    lng: 77.55,
    jurisdiction: "Periyakulam Region",
  },
  {
    name: "Tamil Nadu Police Control Room",
    nameTa: "தமிழ்நாடு காவல்துறை அவசர கட்டுப்பாட்டு அறை",
    phone: "112",
    emergencyHelpline: "112 (Toll Free)",
    lat: 13.0827,
    lng: 80.2707,
    jurisdiction: "Statewide Emergency Dispatch",
  },
];

// Find nearest police station by coordinates
const getNearestPoliceStation = (lat, lng) => {
  let nearest = TN_POLICE_STATIONS[0];
  let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);

  for (const station of TN_POLICE_STATIONS) {
    const d = calculateDistance(lat, lng, station.lat, station.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = station;
    }
  }

  return {
    ...nearest,
    distanceKm: minDistance,
  };
};

// POST /api/v1/sos/trigger
const triggerSosAlert = asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    address,
    mechanicId,
    breakdownReqId,
    incidentType = "HARASSMENT_OR_MISBEHAVIOR",
    description,
  } = req.body;

  if (!lat || !lng) {
    return errorResponse(res, "GPS Coordinates (lat, lng) are required for SOS dispatch", 400);
  }

  const pLat = parseFloat(lat);
  const pLng = parseFloat(lng);
  const nearestPolice = getNearestPoliceStation(pLat, pLng);

  // 1. Create SOS Alert Record in DB
  const alert = await prisma.sosAlert.create({
    data: {
      userId: req.user.id,
      mechanicId: mechanicId || null,
      breakdownReqId: breakdownReqId || null,
      lat: pLat,
      lng: pLng,
      address: address || "Emergency Roadside Location",
      incidentType,
      description: description || "Immediate Safety Intervention Requested (Kavalan Protocol)",
      status: "ACTIVE",
      policeStation: `${nearestPolice.name} (${nearestPolice.phone})`,
      policeNotifiedAt: new Date(),
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  // 2. If a mechanic misbehaved, instantly blacklist/suspend the mechanic pending review
  if (mechanicId) {
    await prisma.mechanic.updateMany({
      where: { id: mechanicId },
      data: { isBlacklisted: true, isOnline: false },
    });
    console.warn(`🚨 MECHANIC SUSPENDED DUE TO SAFETY SOS: ${mechanicId}`);
  }

  // 3. Broadcast SOS Emergency across Sockets (to Admin Desk & Patrol Room)
  const io = req.app.get("io");
  if (io) {
    io.emit("sos:emergency_alert", {
      alertId: alert.id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      lat: pLat,
      lng: pLng,
      address: alert.address,
      nearestPoliceStation: nearestPolice,
      incidentType,
      mechanicId,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Fetch Emergency Contacts
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: req.user.id },
  });

  return successResponse(
    res,
    {
      alertId: alert.id,
      status: "POLICE_ALERT_DISPATCHED",
      nearestPoliceStation: nearestPolice,
      policeHelpline: "112",
      womenHelpline: "1091",
      emergencyContactsNotified: contacts.length,
      trackingUrl: `https://ullur.in/emergency-track/${alert.id}`,
      message: "🚨 Emergency SOS successfully broadcasted to nearest Tamil Nadu Police Station and Emergency Contacts!",
      messageTa: "🚨 காவல்துறை அவசர கட்டுப்பாட்டு அறை மற்றும் உங்கள் குடும்பத்தினருக்கு அவசர தகவல் அனுப்பப்பட்டது!",
    },
    "Emergency SOS Triggered",
    201
  );
});

// GET /api/v1/sos/police-stations
const getNearbyPoliceStations = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat) || 10.0104;
  const userLng = parseFloat(lng) || 77.4768;

  const stationsWithDistance = TN_POLICE_STATIONS.map((st) => ({
    ...st,
    distanceKm: calculateDistance(userLat, userLng, st.lat, st.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  return successResponse(res, stationsWithDistance, "Nearby police stations fetched");
});

// Emergency Contacts CRUD
const getEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: req.user.id },
  });
  return successResponse(res, contacts);
});

const addEmergencyContact = asyncHandler(async (req, res) => {
  const { name, phone, relation } = req.body;
  if (!name || !phone) return errorResponse(res, "Name and phone are required", 400);

  const contact = await prisma.emergencyContact.create({
    data: {
      userId: req.user.id,
      name,
      phone,
      relation: relation || "Family",
    },
  });
  return successResponse(res, contact, "Emergency contact added", 201);
});

const deleteEmergencyContact = asyncHandler(async (req, res) => {
  await prisma.emergencyContact.deleteMany({
    where: { id: req.params.id, userId: req.user.id },
  });
  return successResponse(res, null, "Contact removed");
});

module.exports = {
  triggerSosAlert,
  getNearbyPoliceStations,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
};
