import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import compression from "compression";
import authRoutes from "./routes/auth";
import textRoutes from "./routes/text";
import healthRoutes from "./routes/health";
import { errorHandler } from "./middleware/error";
import Text from "./models/Text";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://blinktext.netlify.app", // Add your Netlify domain
    process.env.FRONTEND_URL || "", // Add environment variable for frontend URL
  ].filter(Boolean), // Remove empty strings
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Password"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Add cache control middleware for GET requests
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=300");
  } else {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Health check route
app.use("/api/health", healthRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/texts", textRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blinktext";
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    setupCleanupCronJob();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Function to set up cron job for cleaning expired texts
const setupCleanupCronJob = () => {
  cron.schedule("0 */6 * * *", async () => {
    try {
      console.log("Running scheduled cleanup of expired texts...");
      const result = await Text.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      console.log(`Deleted ${result.deletedCount} expired texts`);
    } catch (error) {
      console.error("Error cleaning up expired texts:", error);
    }
  });

  console.log("Scheduled cleanup job for expired texts (runs every 6 hours)");
};

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
