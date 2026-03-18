/**
 * App-wide configuration constants.
 * Import SERVER_URL from here instead of socket.js when you only need
 * the server base URL (e.g. for photo resolution) and have no socket dependency.
 */
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
