const admin = require("firebase-admin");

let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp && process.env.FIREBASE_PROJECT_ID) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log("✅ Firebase Admin initialized");
    } catch (err) {
      console.warn("⚠️ Firebase Admin init skipped or failed (mock mode enabled):", err.message);
    }
  }
  return firebaseApp;
};

const getFirebaseAdmin = () => admin;

// Send push notification via FCM
const sendPushNotification = async ({ token, title, body, data = {} }) => {
  try {
    if (!firebaseApp) return null;
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (err) {
    console.error("FCM error:", err.message);
  }
};

// Send to multiple tokens
const sendMulticastNotification = async ({ tokens, title, body, data = {} }) => {
  try {
    if (!firebaseApp || !tokens || tokens.length === 0) return null;
    const message = {
      tokens,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    return response;
  } catch (err) {
    console.error("FCM multicast error:", err.message);
  }
};

module.exports = { initializeFirebase, getFirebaseAdmin, sendPushNotification, sendMulticastNotification };
