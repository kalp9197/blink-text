import express from "express";
import cors from "cors";
import { config } from "./config/config";
import { connectDB } from "./utils/database";
import { setupMiddleware } from "./middleware/setup";
import { setupRoutes } from "./routes/setup";
import { setupCleanupCronJob } from "./services/cleanupService";

// Create Express app
const app = express();

// Set up CORS manually to ensure it works correctly
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://blink-text.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Password"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle OPTIONS requests explicitly
app.options(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://blink-text.netlify.app",
    ],
    credentials: true,
  })
);

// Setup other middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Setup cleanup job
    setupCleanupCronJob();

    // Start server
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Close server and exit process
  process.exit(1);
});
