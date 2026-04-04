import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/**
 * Resolve a photo path to a full URL or data URL
 * @param {string} photoPath - The photo path from character data
 * @param {string} serverUrl - Base server URL for relative paths
 * @returns {string | null} Full URL, or null if no photo path provided
 */
export function resolvePhotoSrc(photoPath = '', serverUrl = '') {
	if (!photoPath) return null;
	if (
		photoPath.startsWith('http://') ||
		photoPath.startsWith('https://') ||
		photoPath.startsWith('data:') ||
		photoPath.startsWith('blob:')
	) {
		return photoPath;
	}
	if (photoPath.startsWith('/')) {
		return `${serverUrl}${photoPath}`;
	}
	return `${serverUrl}/${photoPath.replace(/^\/+/, '')}`;
}
