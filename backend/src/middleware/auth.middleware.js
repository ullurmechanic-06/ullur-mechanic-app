const jwt = require("jsonwebtoken");
const { getFirebaseAdmin } = require("../services/firebase.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Verify JWT token (for internal API calls)
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ullur_secret_key_2026");

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or deactivated" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Verify Firebase ID Token (from client SDK)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const idToken = authHeader.split(" ")[1];
    const admin = getFirebaseAdmin();
    if (admin) {
      const decoded = await admin.auth().verifyIdToken(idToken);
      req.firebaseUser = decoded;
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid Firebase token" });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, verifyFirebaseToken, authorize };
