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
import { errorHandler } from "./middleware/error";
import Text from "./models/Text";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Password"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with options - must be before other middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow cross-origin resource sharing
  })
); // Security headers
app.use(compression()); // Add compression for all responses
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Logging

// Add cache control middleware for GET requests
app.use((req, res, next) => {
  // Add cache headers for GET requests
  if (req.method === "GET") {
    // Cache for 5 minutes (300 seconds) - adjust as needed
    res.setHeader("Cache-Control", "public, max-age=300");
  } else {
    // For non-GET requests, set no-cache
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Test route to verify CORS
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/texts", textRoutes); // Update to match the API endpoint in the client

// Error handling
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blinktext";
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Set up cron job to clean up expired texts
    setupCleanupCronJob();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Function to set up cron job for cleaning expired texts
const setupCleanupCronJob = () => {
  // Schedule a job to run every 6 hours to clean up expired texts (instead of every hour)
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
