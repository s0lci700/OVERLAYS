/**
 * Simple hash-based router for DADOS & RISAS control panel.
 * Syncs app state with URL hash for persistence across reloads.
 *
 * URL patterns:
 * - #/control/characters
 * - #/control/dice
 * - #/management/create
 * - #/management/manage
 */

/**
 * Parse hash and return { page, tab }
 * Defaults to control/characters if hash is invalid or empty.
 */
export function parseHash() {
  const hash = window.location.hash.slice(1); // Remove leading #
  const parts = hash.split("/").filter(Boolean); // Split and remove empty parts

  const page = parts[0] === "management" ? "management" : "control";
  let tab = parts[1] || "";

  // Validate tab for the page
  if (page === "control") {
    tab = tab === "dice" ? "dice" : "characters";
  } else if (page === "management") {
    tab = tab === "manage" ? "manage" : "create";
  }

  return { page, tab };
}

/**
 * Generate hash from page and tab.
 */
export function generateHash(page, tab) {
  return `#/${page}/${tab}`;
}

/**
 * Update browser URL without navigation.
 */
export function updateHash(page, tab) {
  const hash = generateHash(page, tab);
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", hash);
  }
}

/**
 * Listen for hash changes (e.g., browser back/forward).
 * Callback receives { page, tab }
 */
export function onHashChange(callback) {
  const handler = () => callback(parseHash());
  window.addEventListener("hashchange", handler);

  // Return unsubscribe function
  return () => window.removeEventListener("hashchange", handler);
}
