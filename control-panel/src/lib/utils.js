import { clsx, } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

const FALLBACK_PHOTOS = [
  "/assets/img/barbarian.png",
  "/assets/img/elf.png",
  "/assets/img/wizard.png",
];

/**
 * Resolve a character photo path to an absolute URL.
 * - Absolute URLs (http/https/data/blob) are returned as-is.
 * - Server-relative paths are prefixed with serverUrl.
 * - Null/empty paths fall back to a deterministic preset based on charId hash
 *   (so the same character always gets the same fallback avatar).
 *
 * @param {string|null} photoPath
 * @param {string} serverUrl   — e.g. SERVER_URL from socket.js
 * @param {string} [charId]    — optional, used for deterministic fallback
 */
export function resolvePhotoSrc(photoPath, serverUrl, charId) {
  if (!photoPath) {
    const index = charId
      ? Math.abs(
          [...charId].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0),
        ) % FALLBACK_PHOTOS.length
      : 0;
    return `${serverUrl}${FALLBACK_PHOTOS[index]}`;
  }
  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:") ||
    photoPath.startsWith("blob:")
  ) {
    return photoPath;
  }
  if (photoPath.startsWith("/")) return `${serverUrl}${photoPath}`;
  return `${serverUrl}/${photoPath.replace(/^\/+/, "")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any