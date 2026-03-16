/**
 * figma-push-tokens.js
 *
 * Pushes design/tokens.json into a Figma file as Variables via the
 * Figma Variables REST API (Beta).
 *
 * Usage:
 *   FIGMA_TOKEN=figd_... FIGMA_FILE_KEY=Abc123 bun run scripts/figma-push-tokens.js
 *
 * Or add FIGMA_TOKEN and FIGMA_FILE_KEY to .env and just run:
 *   bun run scripts/figma-push-tokens.js
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dir = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dir, "../design/tokens.json");

// Support .env loading via Bun's built-in dotenv
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN) throw new Error("Missing FIGMA_TOKEN env var");
if (!FIGMA_FILE_KEY) throw new Error("Missing FIGMA_FILE_KEY env var");

const API_BASE = "https://api.figma.com/v1";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a CSS hex color to Figma RGBA (0-1 range) */
function hexToFigmaColor(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return { r, g, b, a: 1 };
}

/** Parse rgba(r,g,b,a) string to Figma RGBA (0-1 range) */
function rgbaToFigmaColor(str) {
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: parseFloat(m[1]) / 255,
    g: parseFloat(m[2]) / 255,
    b: parseFloat(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

/** Parse a CSS color value to Figma color, or null if unparseable */
function parseCSSColor(value) {
  const v = value.trim();
  if (v.startsWith("#")) return hexToFigmaColor(v);
  if (v.startsWith("rgba") || v.startsWith("rgb")) return rgbaToFigmaColor(v);
  return null;
}

/** Strip "px" and parse as float */
function parsePx(value) {
  return parseFloat(String(value).replace("px", ""));
}

/** Build a safe Figma variable name from a CSS custom property name */
function varName(cssKey) {
  return cssKey.replace(/^--/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function figmaPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Figma API error:", JSON.stringify(json, null, 2));
    throw new Error(`Figma API ${res.status}: ${json.message || JSON.stringify(json)}`);
  }
  return json;
}

// ---------------------------------------------------------------------------
// Build the Variables payload
// ---------------------------------------------------------------------------

/**
 * Each call to this function creates ONE variable collection with ONE mode ("Default")
 * and pushes all provided variables into it.
 *
 * @param {string} collectionName
 * @param {{ name: string, type: "COLOR"|"FLOAT"|"STRING", value: any }[]} variables
 */
async function pushCollection(collectionName, variables) {
  console.log(`\n→ Creating collection: "${collectionName}" (${variables.length} variables)`);

  // Generate temporary IDs (Figma requires temp IDs that start with a specific pattern)
  const collectionTempId = `collection_${collectionName.replace(/\s+/g, "_").toLowerCase()}`;
  const modeTempId = `mode_default_${collectionTempId}`;

  const variableEntries = variables.map((v, i) => ({
    action: "CREATE",
    id: `var_${collectionTempId}_${i}`,
    name: v.name,
    variableCollectionId: collectionTempId,
    resolvedType: v.type,
    description: v.description || "",
  }));

  const modeValues = {};
  variables.forEach((v, i) => {
    const varId = `var_${collectionTempId}_${i}`;
    if (v.type === "COLOR") {
      modeValues[varId] = { [modeTempId]: { type: "FLOAT", resolvedType: "COLOR", value: v.value } };
      // COLOR type needs special value format
      modeValues[varId] = { [modeTempId]: v.value };
    } else {
      modeValues[varId] = { [modeTempId]: v.value };
    }
  });

  const payload = {
    variableCollections: [
      {
        action: "CREATE",
        id: collectionTempId,
        name: collectionName,
        initialModeId: modeTempId,
      },
    ],
    variableModes: [
      {
        action: "UPDATE",
        id: modeTempId,
        name: "Default",
        variableCollectionId: collectionTempId,
      },
    ],
    variables: variableEntries,
    variableModeValues: variables.map((v, i) => ({
      variableId: `var_${collectionTempId}_${i}`,
      modeId: modeTempId,
      value: v.value,
    })),
  };

  const result = await figmaPost(`/files/${FIGMA_FILE_KEY}/variables`, payload);
  const created = result.meta?.variables ? Object.keys(result.meta.variables).length : "?";
  console.log(`  ✓ Created ${created} variables in "${collectionName}"`);
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Dados & Risas — Figma Token Push");
  console.log(`File: ${FIGMA_FILE_KEY}`);
  console.log("─".repeat(50));

  const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf-8"));

  // ── 1. Brand Colors ──────────────────────────────────────────────────────
  const colorVars = Object.entries(tokens.colors).map(([key, token]) => ({
    name: varName(key),
    type: "COLOR",
    description: token.description,
    value: parseCSSColor(token.value),
  })).filter((v) => v.value !== null);

  // ── 2. HP States ──────────────────────────────────────────────────────────
  const hpVars = Object.entries(tokens.hp).map(([key, token]) => ({
    name: varName(key),
    type: "COLOR",
    description: token.description,
    value: parseCSSColor(token.value),
  })).filter((v) => v.value !== null);

  // ── 3. Spacing ────────────────────────────────────────────────────────────
  const spacingVars = Object.entries(tokens.spacing).map(([key, token]) => ({
    name: varName(key),
    type: "FLOAT",
    description: token.description,
    value: parsePx(token.value),
  }));

  // ── 4. Radii ──────────────────────────────────────────────────────────────
  const radiiVars = Object.entries(tokens.radii).map(([key, token]) => ({
    name: varName(key),
    type: "FLOAT",
    description: token.description,
    value: parsePx(token.value),
  }));

  // ── 5. Alpha ──────────────────────────────────────────────────────────────
  const alphaVars = Object.entries(tokens.alpha).map(([key, token]) => ({
    name: varName(key),
    type: "FLOAT",
    description: token.description,
    value: parseFloat(token.value),
  }));

  // ── 6. Z-Index ────────────────────────────────────────────────────────────
  const zVars = Object.entries(tokens.zIndex).map(([key, token]) => ({
    name: varName(key),
    type: "FLOAT",
    description: token.description,
    value: parseFloat(token.value),
  }));

  // ── 7. Typography ─────────────────────────────────────────────────────────
  const typographyVars = Object.entries(tokens.typography).map(([key, token]) => ({
    name: varName(key),
    type: "STRING",
    description: token.description,
    value: token.value,
  }));

  // ── 8. Motion ─────────────────────────────────────────────────────────────
  const motionVars = Object.entries(tokens.motion).map(([key, token]) => ({
    name: varName(key),
    type: "STRING",
    description: token.description,
    value: token.value,
  }));

  // ── 9. Shadows ────────────────────────────────────────────────────────────
  const shadowVars = Object.entries(tokens.shadows).map(([key, token]) => ({
    name: varName(key),
    type: "STRING",
    description: token.description,
    value: token.value,
  }));

  // ── 10. Overlay Gradients ─────────────────────────────────────────────────
  const gradientVars = Object.entries(tokens.overlayGradients).map(([key, token]) => ({
    name: varName(key),
    type: "STRING",
    description: token.description,
    value: token.value,
  }));

  // ── Push all collections ──────────────────────────────────────────────────
  await pushCollection("Brand / Colors", colorVars);
  await pushCollection("HP States", hpVars);
  await pushCollection("Spacing", spacingVars);
  await pushCollection("Radii", radiiVars);
  await pushCollection("Alpha", alphaVars);
  await pushCollection("Z-Index", zVars);
  await pushCollection("Typography", typographyVars);
  await pushCollection("Motion", motionVars);
  await pushCollection("Shadows", shadowVars);
  await pushCollection("Overlay Gradients", gradientVars);

  console.log("\n" + "─".repeat(50));
  console.log("✓ All token collections pushed to Figma.");
  console.log(`  Open: https://www.figma.com/file/${FIGMA_FILE_KEY}`);
}

main().catch((err) => {
  console.error("\n✗ Fatal:", err.message);
  process.exit(1);
});
