/**
 * optimize-assets.ts
 *
 * Resizes and converts character avatar PNGs to WebP.
 * Source:  assets/img/*.png  (repo root)
 * Output:  control-panel/src/lib/assets/img/*.webp  (Vite-managed)
 *
 * Usage: bun run optimize-assets
 */

import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const REPO_ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const SRC_DIR = join(REPO_ROOT, "assets", "img");
const OUT_DIR = join(REPO_ROOT, "control-panel", "src", "lib", "assets", "img");

const MAX_SIZE = 256;  // px — 3× the 76px display size, retina-safe
const QUALITY = 85;    // WebP quality (0–100)

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter(
    (f) => extname(f).toLowerCase() === ".png"
  );

  if (files.length === 0) {
    console.log("No PNG files found in", SRC_DIR);
    return;
  }

  console.log(`Found ${files.length} PNG(s) — resizing to ${MAX_SIZE}×${MAX_SIZE} max, WebP q${QUALITY}\n`);

  for (const file of files) {
    const srcPath = join(SRC_DIR, file);
    const outName = basename(file, ".png") + ".webp";
    const outPath = join(OUT_DIR, outName);

    const meta = await sharp(srcPath).metadata();
    const originalKB = Math.round((await Bun.file(srcPath).arrayBuffer()).byteLength / 1024);

    await sharp(srcPath)
      .resize(MAX_SIZE, MAX_SIZE, {
        fit: "inside",        // preserve aspect ratio, never upscale beyond MAX_SIZE
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    const outputKB = Math.round((await Bun.file(outPath).arrayBuffer()).byteLength / 1024);
    const saving = Math.round((1 - outputKB / originalKB) * 100);

    console.log(`  ${file}`);
    console.log(`    ${meta.width}×${meta.height} PNG  ${originalKB} KB  →  ${MAX_SIZE}px WebP  ${outputKB} KB  (−${saving}%)`);
    console.log(`    → ${outPath}`);
  }

  console.log("\nDone. Import from $lib/assets/img/*.webp in your components.");
}

run().catch((err) => {
  console.error("optimize-assets failed:", err);
  process.exit(1);
});
