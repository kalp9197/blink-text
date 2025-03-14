import { formatDistanceToNow, format } from "date-fns";

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid date";
  }
};

/**
 * Format a date in a human-readable format (e.g., "Sep 12, 2023 at 3:45 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  // Return placeholder if date is missing or invalid
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return format(dateObj, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Calculate time remaining until a date
 */
export const getTimeRemaining = (
  expiryDate: Date | string
): { days: number; hours: number; minutes: number; seconds: number } => {
  try {
    const expiryTime = new Date(expiryDate).getTime();

    // Check if expiry date is valid
    if (isNaN(expiryTime)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const total = expiryTime - new Date().getTime();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
};

/**
 * Format time remaining in a human-readable format
 */
export const formatTimeRemaining = (expiryDate: Date | string): string => {
  if (!expiryDate) return "No expiration set";

  try {
    // Check if date is valid
    const expiryTime = new Date(expiryDate).getTime();
    if (isNaN(expiryTime)) {
      return "Invalid expiration";
    }

    const { days, hours, minutes } = getTimeRemaining(expiryDate);

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    // If time has expired
    if (days <= 0 && hours <= 0 && minutes <= 0) {
      return "Expired";
    }

    return `${minutes}m remaining`;
  } catch (error) {
    console.error("Error formatting time remaining:", error);
    return "Invalid expiration";
  }
};
