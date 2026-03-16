/**
 * generate-tokens-studio.js
 *
 * Converts design/tokens.json → figma-tokens-studio.json
 * in the Tokens Studio for Figma format (W3C-inspired).
 *
 * Usage:
 *   bun run scripts/generate-tokens-studio.js
 *
 * Output:
 *   scripts/figma-tokens-studio.json  ← import this file in Tokens Studio plugin
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dir, "../design/tokens.json");
const OUTPUT_PATH = resolve(__dir, "figma-tokens-studio.json");

const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf-8"));

/** Strip leading -- from CSS custom property name */
const key = (cssVar) => cssVar.replace(/^--/, "");

/** Strip px suffix */
const px = (v) => v.replace("px", "").trim();

// ---------------------------------------------------------------------------
// Build token sets
// ---------------------------------------------------------------------------

const global = {};

// ── Colors ──────────────────────────────────────────────────────────────────
global.colors = {};
for (const [cssVar, token] of Object.entries(tokens.colors)) {
  global.colors[key(cssVar)] = {
    value: token.value,
    type: "color",
    description: token.description,
  };
}

// ── HP States ────────────────────────────────────────────────────────────────
global.hp = {};
for (const [cssVar, token] of Object.entries(tokens.hp)) {
  global.hp[key(cssVar)] = {
    value: token.value,
    type: "color",
    description: token.description,
  };
}

// ── Spacing ──────────────────────────────────────────────────────────────────
global.spacing = {};
for (const [cssVar, token] of Object.entries(tokens.spacing)) {
  global.spacing[key(cssVar)] = {
    value: px(token.value),
    type: "spacing",
    description: token.description,
  };
}

// ── Radii ────────────────────────────────────────────────────────────────────
global.borderRadius = {};
for (const [cssVar, token] of Object.entries(tokens.radii)) {
  global.borderRadius[key(cssVar)] = {
    value: px(token.value),
    type: "borderRadius",
    description: token.description,
  };
}

// ── Alpha ────────────────────────────────────────────────────────────────────
global.opacity = {};
for (const [cssVar, token] of Object.entries(tokens.alpha)) {
  global.opacity[key(cssVar)] = {
    value: String(Math.round(parseFloat(token.value) * 100)) + "%",
    type: "opacity",
    description: token.description,
  };
}

// ── Typography ───────────────────────────────────────────────────────────────
global.fontFamilies = {};
for (const [cssVar, token] of Object.entries(tokens.typography)) {
  // Extract first font name (before first comma), strip quotes
  const firstFont = token.value.split(",")[0].replace(/['"]/g, "").trim();
  global.fontFamilies[key(cssVar)] = {
    value: firstFont,
    type: "fontFamilies",
    description: token.description,
  };
}

// ── Motion ───────────────────────────────────────────────────────────────────
global.motion = {};
for (const [cssVar, token] of Object.entries(tokens.motion)) {
  global.motion[key(cssVar)] = {
    value: token.value,
    type: "other",
    description: token.description,
  };
}

// ── Shadows ──────────────────────────────────────────────────────────────────
// Tokens Studio boxShadow type expects: x, y, blur, spread, color, type
function parseShadow(cssValue) {
  // e.g. "4px 4px 0px rgba(255, 255, 255, 0.05)"  or  "3px 3px 0px #ff4d6a"
  const m = cssValue.match(/^(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(-?[\d.]+)px)?\s+(.+)$/);
  if (!m) return { value: cssValue, type: "other" };
  const [, x, y, blur, spread, color] = m;
  return {
    value: {
      x: x,
      y: y,
      blur: blur,
      spread: spread || "0",
      color: color.trim(),
      type: "dropShadow",
    },
    type: "boxShadow",
  };
}

global.shadows = {};
for (const [cssVar, token] of Object.entries(tokens.shadows)) {
  const parsed = parseShadow(token.value);
  global.shadows[key(cssVar)] = {
    ...parsed,
    description: token.description,
  };
}

// ── Z-Index ──────────────────────────────────────────────────────────────────
global.zIndex = {};
for (const [cssVar, token] of Object.entries(tokens.zIndex)) {
  global.zIndex[key(cssVar)] = {
    value: token.value,
    type: "other",
    description: token.description,
  };
}

// ── Overlay Gradients ─────────────────────────────────────────────────────────
global.gradients = {};
for (const [cssVar, token] of Object.entries(tokens.overlayGradients)) {
  global.gradients[key(cssVar)] = {
    value: token.value,
    type: "other",
    description: token.description,
  };
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const output = {
  global,
  $metadata: {
    tokenSetOrder: ["global"],
  },
};

writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
console.log(`✓ Written: ${OUTPUT_PATH}`);
console.log(`  Token groups: ${Object.keys(global).join(", ")}`);
