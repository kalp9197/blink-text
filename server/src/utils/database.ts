import mongoose from "mongoose";
import { config } from "../config/config";

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongodb.uri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(config.mongodb.uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};
