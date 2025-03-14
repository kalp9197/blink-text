import express from "express";
import authRoutes from "./auth";
import textRoutes from "./text";
import healthRoutes from "./health";
import { errorHandler } from "../middleware/error";

export const setupRoutes = (app: express.Application): void => {
  // Health check route
  app.use("/api/health", healthRoutes);

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/texts", textRoutes);

  // Error handling
  app.use(errorHandler);
};
