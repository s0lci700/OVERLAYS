import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a photo path to a full URL or data URL
 * @param {string} photoPath - The photo path from character data
 * @param {string} serverUrl - Base server URL for relative paths
 * @param {string} charId - Character ID for fallback generation
 * @returns {string} Full URL or data URL for the photo
 */
export function resolvePhotoSrc(photoPath = "", serverUrl = "", charId = "") {
  // If no photo path, return a data URL placeholder or server placeholder
  if (!photoPath) {
    return `${serverUrl}/assets/img/placeholder.png`;
  }

  // Already a full URL or data URL
  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:") ||
    photoPath.startsWith("blob:")
  ) {
    return photoPath;
  }

  // Relative path — combine with server URL
  if (photoPath.startsWith("/")) {
    return `${serverUrl}${photoPath}`;
  }

  return `${serverUrl}/${photoPath.replace(/^\/+/, "")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
