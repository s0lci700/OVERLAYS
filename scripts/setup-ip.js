#!/usr/bin/env node
/**
 * setup-ip.js
 * -----------
 * Auto-detects the machine's local network IP address and writes the correct
 * server URL into the .env files consumed by the backend and Svelte control
 * panel, so the project works on any network without manual edits.
 *
 * Writes:
 *   <repo-root>/.env              – PORT, CONTROL_PANEL_ORIGIN
 *   control-panel/.env            – VITE_SERVER_URL, VITE_PORT
 *
 * Run standalone:  node scripts/setup-ip.js
 * Run via npm:     npm start  (see package.json)
 */

"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");

// ─── Constants ────────────────────────────────────────────────────────────────

const serverPort = parseInt(process.env.PORT || "3000", 10);
const controlPanelPort = parseInt(process.env.VITE_PORT || "5173", 10);

const ROOT_DIR = path.resolve(__dirname, "..");
const ROOT_ENV = path.join(ROOT_DIR, ".env");
const PANEL_ENV = path.join(ROOT_DIR, "control-panel", ".env");

// ─── IP Detection ─────────────────────────────────────────────────────────────

/**
 * Returns the first non-internal IPv4 address found on a "real" network
 * interface (e.g. eth0, en0, wlan0).  Falls back to 127.0.0.1 when the
 * machine has no active LAN/WiFi connection (e.g. pure CI environments).
 *
 * @returns {string} IPv4 address string
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const [, addresses] of Object.entries(interfaces)) {
    for (const addr of addresses) {
      if (addr.family === "IPv4" && !addr.internal) {
        console.log(`[setup-ip] Detected local IP address: ${addr.address}`);
        return addr.address;
      }
    }
  }
  return "127.0.0.1";
}

// ─── .env Helpers ─────────────────────────────────────────────────────────────

/**
 * Parses a .env file into a key→value map.  Lines that are blank or start
 * with '#' are preserved as-is under the special key "__comment__<n>".
 *
 * @param {string} filePath
 * @returns {Map<string, string>}  ordered map of KEY → raw-value or comment line
 */
function parseEnv(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  let commentIndex = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      map.set(`__comment__${commentIndex++}`, line);
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      map.set(`__comment__${commentIndex++}`, line);
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1); // preserve spacing/quotes in value
    map.set(key, value);
  }
  return map;
}

/**
 * Serialises the ordered map back to a .env file string.
 *
 * @param {Map<string, string>} map
 * @returns {string}
 */
function serializeEnv(map) {
  const lines = [];
  for (const [key, value] of map.entries()) {
    if (key.startsWith("__comment__")) {
      lines.push(value);
    } else {
      lines.push(`${key}=${value}`);
    }
  }
  // Ensure the file ends with a newline
  return lines.join("\n").trimEnd() + "\n";
}

/**
 * Upserts multiple keys in a .env file in a single read→write pass.
 * If the file does not yet exist it is created from the corresponding
 * .env.example when available.
 *
 * @param {string} filePath          - Absolute path to the .env file
 * @param {Record<string, string>} updates - Key/value pairs to set
 */
function upsertEnvKeys(filePath, updates) {
  // Seed from .env.example if the target file doesn't exist yet or is empty
  const shouldSeedFromExample =
    !fs.existsSync(filePath) ||
    (fs.existsSync(filePath) &&
      fs.readFileSync(filePath, "utf8").trim() === "");

  if (shouldSeedFromExample) {
    const examplePath = filePath.replace(/\.env$/, ".env.example");
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, filePath);
    }
  }

  const map = parseEnv(filePath);
  for (const [key, value] of Object.entries(updates)) {
    map.set(key, value);
  }
  fs.writeFileSync(filePath, serializeEnv(map), "utf8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const mainIP = getLocalIP();
const serverUrl = `http://${mainIP}:${serverPort}`;
const controlPanelUrl = `http://${mainIP}:${controlPanelPort}`;

console.log(`[setup-ip] mainIP           → ${mainIP}`);
console.log(`[setup-ip] serverPort       → ${serverPort}`);
console.log(`[setup-ip] controlPanelPort → ${controlPanelPort}`);
console.log(`[setup-ip] serverUrl        → ${serverUrl}`);
console.log(`[setup-ip] controlPanelUrl  → ${controlPanelUrl}`);

// Update root .env (single read→write)
upsertEnvKeys(ROOT_ENV, {
  PORT: String(serverPort),
  CONTROL_PANEL_ORIGIN: controlPanelUrl,
});
console.log(`[setup-ip] Updated ${ROOT_ENV}`);

// Update control-panel .env (single read→write)
upsertEnvKeys(PANEL_ENV, {
  VITE_SERVER_URL: serverUrl,
  VITE_PORT: String(controlPanelPort),
});
console.log(`[setup-ip] Updated ${PANEL_ENV}`);
