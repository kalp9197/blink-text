/**
 * String utility functions for text manipulation
 */

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str The string to truncate
 * @param maxLength Maximum length before truncating
 * @returns The truncated string
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

/**
 * Strips HTML tags from a string
 * @param html HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
};
