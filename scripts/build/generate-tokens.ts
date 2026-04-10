#!/usr/bin/env bun
/**
 * generate-tokens.ts
 * ==================
 * Reads design/tokens.json and writes two CSS output files:
 *
 *   1. control-panel/src/generated-tokens.css  — full token set for the Svelte app
 *   2. public/tokens.css                        — subset used by OBS overlay HTML files
 *
 * Usage:
 *   bun run generate:tokens
 *   bun scripts/generate-tokens.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ── Load canonical token source ──────────────────────────────────────────────

const ROOT = join(import.meta.dir, "..");
const tokensPath = join(ROOT, "design", "tokens.json");

interface TokenEntry {
  value: string;
  description?: string;
}
type TokenGroup = Record<string, TokenEntry>;
interface TokensFile {
  meta: { name: string; version: string; description: string };
  colors: TokenGroup;
  hp: TokenGroup;
  typography: TokenGroup;
  spacing: TokenGroup;
  radii: TokenGroup;
  shadows: TokenGroup;
  motion: TokenGroup;
  alpha: TokenGroup;
  zIndex: TokenGroup;
  overlayGradients: TokenGroup;
}

let tokens: TokensFile;
try {
  tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`❌  Failed to read or parse ${tokensPath}: ${msg}`);
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupToCSS(group: TokenGroup, indent = "  "): string {
  return Object.entries(group)
    .map(([name, entry]) => {
      const comment = entry.description ? ` /* ${entry.description} */` : "";
      return `${indent}${name}: ${entry.value};${comment}`;
    })
    .join("\n");
}

function buildRootBlock(groups: TokenGroup[], header?: string): string {
  const lines: string[] = [];
  if (header) lines.push(header, "");
  lines.push(":root {");
  for (const group of groups) {
    lines.push(groupToCSS(group));
  }
  lines.push("}");
  return lines.join("\n");
}

// ── 1. Control-panel generated-tokens.css ────────────────────────────────────

const cpHeader = `/**
 * GENERATED — do not edit by hand.
 * Source: design/tokens.json
 * Regenerate: bun run generate:tokens
 *
 * ${tokens.meta.name} v${tokens.meta.version}
 * ${tokens.meta.description}
 */`;

const cpCSS =
  buildRootBlock(
    [
      tokens.colors,
      tokens.hp,
      tokens.typography,
      tokens.spacing,
      tokens.radii,
      tokens.shadows,
      tokens.motion,
      tokens.alpha,
      tokens.zIndex,
    ],
    cpHeader,
  ) + "\n";

const cpOutPath = join(ROOT, "control-panel", "src", "generated-tokens.css");
try {
  writeFileSync(cpOutPath, cpCSS, "utf-8");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`❌  Failed to write ${cpOutPath}: ${msg}`);
  process.exit(1);
}
console.log(`✅  Wrote ${cpOutPath}`);

// ── 2. public/tokens.css (overlay subset) ────────────────────────────────────

const overlayHeader = `/**
 * GENERATED — do not edit by hand.
 * Source: design/tokens.json
 * Regenerate: bun run generate:tokens
 *
 * Shared Design Tokens — ${tokens.meta.name}
 * Single source of truth for brand colors, fonts, spacing, and shadows.
 * Imported by OBS overlay HTML files.
 */`;

// Overlay CSS includes a curated subset plus the gradient shorthands
const overlayCSS =
  buildRootBlock(
    [
      tokens.colors,
      tokens.hp,
      tokens.overlayGradients,
      tokens.typography,
      tokens.shadows,
      tokens.radii,
    ],
    overlayHeader,
  ) + "\n";

const overlayOutPath = join(ROOT, "public", "tokens.css");
try {
  writeFileSync(overlayOutPath, overlayCSS, "utf-8");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`❌  Failed to write ${overlayOutPath}: ${msg}`);
  process.exit(1);
}
console.log(`✅  Wrote ${overlayOutPath}`);

console.log("🎨  Token generation complete.");
