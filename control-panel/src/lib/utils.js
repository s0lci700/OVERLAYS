import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Canonical list of bundled portrait assets.
 * Used by PhotoSourcePicker (preset options) and DashboardCard (random fallback).
 * Add new portraits here and they will appear everywhere automatically.
 * @type {Array<{label: string, value: string}>}
 */
export const PHOTO_ASSETS = [
  { label: "Aleatorio", value: "" },
  { label: "Barbarian", value: "/assets/img/barbarian.png" },
  { label: "Elf", value: "/assets/img/elf.png" },
  { label: "Wizard", value: "/assets/img/wizard.png" },
  { label: "Thiefling", value: "/assets/img/thiefling.png" },
  { label: "Dwarf", value: "/assets/img/dwarf.png" },
];

/**
 * Resolve a character photo path to a usable URL.
 * Handles empty paths, absolute URLs, data URIs, blob URLs, and server-relative paths.
 * @param {string} photoPath - The photo value stored on the character
 * @param {string} serverUrl - Base server URL (e.g. "http://localhost:3000")
 * @returns {string} Full URL or data URI ready for use in an <img src>
 */
export function resolvePhotoSrc(photoPath = "", serverUrl = "") {
  if (!photoPath) {
    return `${serverUrl}/assets/img/placeholder.png`;
  }

  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:") ||
    photoPath.startsWith("blob:")
  ) {
    return photoPath;
  }

  if (photoPath.startsWith("/")) {
    return `${serverUrl}${photoPath}`;
  }

  return `${serverUrl}/${photoPath.replace(/^\/+/, "")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
