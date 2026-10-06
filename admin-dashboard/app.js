// ==========================================================================
// ULLUR MECHANIC — ADMIN SUPER DASHBOARD & KAVALAN 112 REAL-TIME TELEMETRY
// Real-Time Firebase Firestore onSnapshot Telemetry Stream & Leaflet Mapping
// ==========================================================================

/* global firebase, L, lucide */

// --------------------------------------------------------------------------
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyADeAvhgZy29k_Cn_yFxlKVzOgPBNq2bis",
  authDomain: "ullur-mechanic.firebaseapp.com",
  projectId: "ullur-mechanic",
  storageBucket: "ullur-mechanic.firebasestorage.app",
  messagingSenderId: "325254482783",
  appId: "1:325254482783:web:1a9b071bae25ac4c8004ea",
  measurementId: "G-NW4REY73K0"
};

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = typeof firebase !== "undefined" && firebase.firestore ? firebase.firestore() : null;

// --------------------------------------------------------------------------
// 2. NON-BLOCKING TOAST NOTIFICATION STANDARD
// --------------------------------------------------------------------------
function showToast(message, type = "success", duration = 4000) {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 25px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: ${type === 'error' ? '#991b1b' : (type === 'info' ? '#1e293b' : '#0f766e')};
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 99999999;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid ${type === 'error' ? '#ef4444' : (type === 'info' ? '#38bdf8' : '#14b8a6')};
    font-family: 'Space Grotesk', sans-serif;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 50);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// --------------------------------------------------------------------------
// 3. UNIFIED REAL-TIME ADMIN TELEMETRY MAP
// --------------------------------------------------------------------------
let adminLeafletMap = null;
let telemetryUnsubscribers = [];

function initAdminTelemetryMap() {
  const mapContainer = document.getElementById('admin-leaflet-telemetry-map');
  if (!mapContainer || typeof L === 'undefined') return;

  // Clear previous listeners if re-initializing
  if (telemetryUnsubscribers.length > 0) {
    telemetryUnsubscribers.forEach((unsub) => {
      try { unsub(); } catch (e) {}
    });
    telemetryUnsubscribers = [];
  }

  if (adminLeafletMap) {
    adminLeafletMap.remove();
    adminLeafletMap = null;
  }

  // Centered on Tamil Nadu highway corridor (dynamic default)
  const defaultCenter = [10.0104, 77.4768];

  adminLeafletMap = L.map('admin-leaflet-telemetry-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(defaultCenter, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(adminLeafletMap);

  // Group Layers for Entities
  const layers = {
    customers: L.layerGroup().addTo(adminLeafletMap),
    mechanics: L.layerGroup().addTo(adminLeafletMap),
    towing: L.layerGroup().addTo(adminLeafletMap),
    shops: L.layerGroup().addTo(adminLeafletMap)
  };

  // Custom Category Div Icons
  const getCustomIcon = (role, status) => {
    if (role === 'customer') {
      return L.divIcon({
        className: 'admin-marker-customer',
        html: `<div style="background:#F59E0B; color:#000; border:2.5px solid #000; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 0 5px rgba(245, 158, 11, 0.4); animation:pulse 1.2s infinite; cursor:pointer;">🟡🚗</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
    }
    if (role === 'mechanic') {
      const isAvailable = status === 'available' || status === 'Verified' || status === 'online';
      const color = isAvailable ? '#10B981' : '#F97316';
      return L.divIcon({
        className: 'admin-marker-mechanic',
        html: `<div style="background:${color}; color:#fff; border:2.5px solid #000; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:2px 2px 0 #000; cursor:pointer;">🔧</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
    }
    if (role === 'towing') {
      return L.divIcon({
        className: 'admin-marker-tow',
        html: `<div style="background:#3B82F6; color:#fff; border:2.5px solid #000; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:2px 2px 0 #000; cursor:pointer;">🛻</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
    }
    if (role === 'shop') {
      return L.divIcon({
        className: 'admin-marker-shop',
        html: `<div style="background:#8B5CF6; color:#fff; border:2.5px solid #000; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:2px 2px 0 #000; cursor:pointer;">🏪</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
    }
  };

  // Rich Interactive Entity Popup
  const buildRichPopup = (item, roleTitle, roleColor) => {
    const title = item.name || item.storeName || item.driverName || item.customerName || 'Verified Entity';
    const phone = item.phone || '+91 98421 00000';
    const lat = Number(item.lat || 0).toFixed(4);
    const lng = Number(item.lng || 0).toFixed(4);
    const status = item.status || (item.isOnline ? 'Online' : 'Active');
    const updatedAt = item.updatedAt
      ? (item.updatedAt.toDate ? item.updatedAt.toDate().toLocaleTimeString() : new Date(item.updatedAt).toLocaleTimeString())
      : 'Live Stream';

    return `
      <div style="font-family:'Space Grotesk', sans-serif; min-width:210px; padding:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0D0D0D; padding-bottom:4px; margin-bottom:6px;">
          <strong style="font-size:13.5px; color:#0D0D0D;">${title}</strong>
          <span style="font-size:10px; font-weight:900; background:${roleColor}; color:#FFF; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${roleTitle}</span>
        </div>
        <div style="font-size:12px; line-height:1.6; color:#334155;">
          <div>📞 <strong>Phone:</strong> <a href="tel:${phone}" style="color:#2563EB; font-weight:800; text-decoration:none;">${phone}</a></div>
          <div>📍 <strong>Coordinates:</strong> <code>${lat}, ${lng}</code></div>
          <div>⚡ <strong>Status:</strong> <span style="font-weight:800; color:${status === 'available' || status === 'Verified' || status === 'Online' ? '#10B981' : '#F97316'};">${status}</span></div>
          <div style="font-size:10px; color:#64748B; margin-top:4px; border-top:1px dashed #CBD5E1; padding-top:4px;">⏱️ Last Synced: ${updatedAt}</div>
        </div>
      </div>
    `;
  };

  const autoFitBounds = () => {
    const allCoords = [];
    layers.customers.eachLayer((l) => allCoords.push(l.getLatLng()));
    layers.mechanics.eachLayer((l) => allCoords.push(l.getLatLng()));
    layers.towing.eachLayer((l) => allCoords.push(l.getLatLng()));
    layers.shops.eachLayer((l) => allCoords.push(l.getLatLng()));

    if (allCoords.length > 0 && adminLeafletMap) {
      const bounds = L.latLngBounds(allCoords);
      adminLeafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // ------------------------------------------------------------------------
  // FIRESTORE REAL-TIME SNAPSHOT STREAMS (onSnapshot)
  // ------------------------------------------------------------------------
  if (db) {
    // 1. Customers Snapshot Listener
    const unsubUsers = db.collection('users').onSnapshot((snapshot) => {
      layers.customers.clearLayers();
      snapshot.forEach((doc) => {
        const u = doc.data();
        if (u.lat && u.lng) {
          const m = L.marker([u.lat, u.lng], { icon: getCustomIcon('customer', u.status) });
          m.bindPopup(buildRichPopup(u, 'Customer', '#F59E0B'));
          layers.customers.addLayer(m);
        }
      });
      autoFitBounds();
    }, (err) => console.warn("Firestore users telemetry err:", err));
    telemetryUnsubscribers.push(unsubUsers);

    // 2. Mechanics Snapshot Listener
    const unsubMechs = db.collection('mechanics').onSnapshot((snapshot) => {
      layers.mechanics.clearLayers();
      snapshot.forEach((doc) => {
        const m = doc.data();
        if (m.lat && m.lng) {
          const marker = L.marker([m.lat, m.lng], { icon: getCustomIcon('mechanic', m.status) });
          marker.bindPopup(buildRichPopup(m, 'Mechanic', '#10B981'));
          layers.mechanics.addLayer(marker);
        }
      });
      autoFitBounds();
    }, (err) => console.warn("Firestore mechanics telemetry err:", err));
    telemetryUnsubscribers.push(unsubMechs);

    // 3. Tow Services Snapshot Listener
    const unsubTow = db.collection('tow_services').onSnapshot((snapshot) => {
      layers.towing.clearLayers();
      snapshot.forEach((doc) => {
        const t = doc.data();
        if (t.lat && t.lng) {
          const marker = L.marker([t.lat, t.lng], { icon: getCustomIcon('towing', t.status) });
          marker.bindPopup(buildRichPopup(t, 'Tow Fleet', '#3B82F6'));
          layers.towing.addLayer(marker);
        }
      });
      autoFitBounds();
    }, (err) => console.warn("Firestore tow telemetry err:", err));
    telemetryUnsubscribers.push(unsubTow);

    // 4. Spare Parts Shops Snapshot Listener
    const unsubShops = db.collection('spare_parts').onSnapshot((snapshot) => {
      layers.shops.clearLayers();
      snapshot.forEach((doc) => {
        const s = doc.data();
        if (s.lat && s.lng) {
          const marker = L.marker([s.lat, s.lng], { icon: getCustomIcon('shop', s.status || 'Active') });
          marker.bindPopup(buildRichPopup(s, 'Spares Shop', '#8B5CF6'));
          layers.shops.addLayer(marker);
        }
      });
      autoFitBounds();
    }, (err) => console.warn("Firestore spare_parts telemetry err:", err));
    telemetryUnsubscribers.push(unsubShops);

    showToast("⚡ Admin Telemetry Live Grid Connected to Firestore Stream", "info");
  }

  // Device GPS Location Acquisition for Super Admin
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (adminLeafletMap) {
          adminLeafletMap.setView([latitude, longitude], 13);
        }
        showToast(`📍 Admin GPS Position Synchronized: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, "success");
      },
      (err) => {
        console.warn("Admin GPS fallback notice:", err.message);
        showToast("Please allow GPS location access to detect nearby assistance.", "error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  setTimeout(() => {
    if (adminLeafletMap) adminLeafletMap.invalidateSize();
  }, 200);
}

// --------------------------------------------------------------------------
// 4. TAB NAVIGATION & INTERACTION
// --------------------------------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  const activeLink = document.querySelector(`.nav-item[href="#${tabId}"]`);
  if (activeLink) activeLink.classList.add('active');

  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  const targetTab = document.getElementById(`${tabId}-tab`);
  if (targetTab) {
    targetTab.classList.add('active');
  } else {
    document.getElementById('overview-tab').classList.add('active');
  }

  if (tabId === 'overview') {
    setTimeout(() => {
      if (adminLeafletMap) {
        adminLeafletMap.invalidateSize();
      } else {
        initAdminTelemetryMap();
      }
    }, 150);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initAdminTelemetryMap();
  if (window.lucide) lucide.createIcons();
  console.log('⚡ Ullur Mechanic Admin Super Panel & Telemetry Stream Initialized');
});
