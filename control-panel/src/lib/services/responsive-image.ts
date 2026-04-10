/**
 * responsive-image.ts
 * 
 * Helper to generate srcset strings for responsive character portraits
 * served from static/assets/img/
 */

/**
 * Generate srcset for a character portrait URL
 * 
 * @param photoUrl - Base photo URL like "/assets/img/barbarian.png"
 * @returns srcset string for 1x and 2x displays, or undefined if not a generated webp
 * 
 * @example
 * generateSrcset("/assets/img/barbarian.png")
 * // → "/assets/img/barbarian-256.webp 1x, /assets/img/barbarian-512.webp 2x"
 */
export function generateSrcset(photoUrl: string | null | undefined): string | undefined {
  if (!photoUrl) return undefined;
  
  // Only generate srcset for static assets (not external URLs)
  if (!photoUrl.startsWith('/assets/img/')) return undefined;
  
  // Extract filename without extension
  const filename = photoUrl.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  if (!filename) return undefined;
  
  // Generate responsive srcset
  return `/assets/img/${filename}-256.webp 1x, /assets/img/${filename}-512.webp 2x`;
}

/**
 * Get the base src for a portrait (256px version for 1x displays)
 * 
 * @param photoUrl - Base photo URL
 * @returns Optimized 256px webp URL, or original if not optimizable
 */
export function getOptimizedSrc(photoUrl: string | null | undefined): string | undefined {
  if (!photoUrl) return undefined;
  
  if (!photoUrl.startsWith('/assets/img/')) return photoUrl;
  
  const filename = photoUrl.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  if (!filename) return photoUrl;
  
  return `/assets/img/${filename}-256.webp`;
}
