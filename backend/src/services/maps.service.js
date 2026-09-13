const axios = require("axios");

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const RADIUS_KM = parseFloat(process.env.MECHANIC_SEARCH_RADIUS_KM || "15");

// Calculate distance between two lat/lng points using Haversine formula (km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

// Reverse geocode a lat/lng to human-readable address
const reverseGeocode = async (lat, lng) => {
  if (!MAPS_API_KEY) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_API_KEY}`;
    const { data } = await axios.get(url);
    if (data.status === "OK") {
      return data.results[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// Get estimated ETA and route directions between two points
const getDirections = async (originLat, originLng, destLat, destLng) => {
  if (!MAPS_API_KEY) {
    const dist = calculateDistance(originLat, originLng, destLat, destLng);
    const minutes = Math.max(5, Math.round(dist * 2.5));
    return {
      distanceText: `${dist} km`,
      distanceMeters: Math.round(dist * 1000),
      durationText: `${minutes} mins`,
      durationSeconds: minutes * 60,
    };
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${MAPS_API_KEY}`;
    const { data } = await axios.get(url);
    if (data.status === "OK") {
      const route = data.routes[0]?.legs[0];
      return {
        distanceText: route?.distance?.text,
        distanceMeters: route?.distance?.value,
        durationText: route?.duration?.text,
        durationSeconds: route?.duration?.value,
      };
    }
    return null;
  } catch (err) {
    console.error("Directions error:", err.message);
    return null;
  }
};

module.exports = { calculateDistance, reverseGeocode, getDirections, RADIUS_KM };
