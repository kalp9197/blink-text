import express from "express";
// import cors from "cors"; // Remove the CORS import
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "../config/config";

export const setupMiddleware = (app: express.Application): void => {
  // CORS is now handled in index.ts
  // app.use(cors(config.cors)); // Remove this line

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // Compression
  app.use(compression());

  // Body parser
  app.use(express.json());

  // Logging
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // Cache control
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
  const limiter = rateLimit(config.rateLimit);
  app.use(limiter);
};
