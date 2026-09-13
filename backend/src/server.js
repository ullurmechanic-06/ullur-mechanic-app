require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const logger = require("./utils/logger");
const { initializeFirebase } = require("./services/firebase.service");
const setupSockets = require("./sockets");
const { errorHandler, notFound } = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const mechanicRoutes = require("./routes/mechanic.routes");
const requestRoutes = require("./routes/request.routes");
const sparePartsRoutes = require("./routes/spareParts.routes");
const orderRoutes = require("./routes/order.routes");
const towRoutes = require("./routes/tow.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewRoutes = require("./routes/review.routes");
const trackingRoutes = require("./routes/tracking.routes");
const sosRoutes = require("./routes/sos.routes");

const app = express();
const httpServer = http.createServer(app);

// ===== Socket.IO Setup =====
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT"],
  },
});

// Make io available in Express
app.set("io", io);
setupSockets(io);

// ===== Initialize Firebase Admin =====
initializeFirebase();

// ===== Middleware =====
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "Ullur Mechanic API",
    version: "1.0.0",
    tamilSupport: true,
    emergencySosProtocol: "Kavalan 112 Enabled",
    razorpayEnabled: true,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// ===== API Routes =====
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/mechanics", mechanicRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/spare-parts", sparePartsRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/tow", towRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/tracking", trackingRoutes);
app.use("/api/v1/sos", sosRoutes);

// ===== Error Handling =====
app.use(notFound);
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Ullur Mechanic server running on port ${PORT}`);
  });
}

module.exports = { app, httpServer, io };
