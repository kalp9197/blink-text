import cron from "node-cron";
import Text from "../models/Text";
import { config } from "../config/config";

export const setupCleanupCronJob = (): void => {
  cron.schedule(config.cleanup.schedule, async () => {
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
