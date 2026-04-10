/**
 * optimize-assets.ts
 *
 * Resizes and converts character avatar PNGs to WebP at multiple sizes.
 * Source:  assets/img/*.png  (repo root)
 * Output:  assets/img/*.webp  (repo root - served by Express)
 *          control-panel/src/lib/assets/img/*.webp  (Vite imports for fallbacks)
 *
 * Usage: bun run optimize-assets
 */

import sharp from "sharp";
import Bun from "bun";
import { readdir, mkdir, copyFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const REPO_ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const SRC_DIR = join(REPO_ROOT, "assets", "img");
const STATIC_DIR = SRC_DIR;  // Output to same folder (repo root assets/img/)
const LIB_DIR = join(REPO_ROOT, "control-panel", "src", "lib", "assets", "img");

// Generate multiple sizes for responsive images
const SIZES = [128, 256, 512];  // Small, medium, large (retina-safe)
const QUALITY = 90;    // WebP quality (0–100) — increased for better gradients

async function run() {
  await mkdir(STATIC_DIR, { recursive: true });
  await mkdir(LIB_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter(
    (f) => extname(f).toLowerCase() === ".png"
  );

  if (files.length === 0) {
    console.log("No PNG files found in", SRC_DIR);
    return;
  }

  console.log(`Found ${files.length} PNG(s) — generating ${SIZES.join(', ')}px sizes, WebP q${QUALITY}\n`);

  for (const file of files) {
    const srcPath = join(SRC_DIR, file);
    const baseName = basename(file, ".png");
    const meta = await sharp(srcPath).metadata();
    const originalKB = Math.round((await Bun.file(srcPath).arrayBuffer()).byteLength / 1024);

    console.log(`  ${file} (${meta.width}×${meta.height}, ${originalKB} KB)`);

    let totalSaved = 0;

    for (const size of SIZES) {
      const outName = `${baseName}-${size}.webp`;
      const staticPath = join(STATIC_DIR, outName);
      const libPath = join(LIB_DIR, outName);

      await sharp(srcPath)
        .resize(size, size, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toFile(staticPath);

      // Copy to lib folder for Vite imports (fallbacks only)
      await copyFile(staticPath, libPath);

      const outputKB = Math.round((await Bun.file(staticPath).arrayBuffer()).byteLength / 1024);
      totalSaved += originalKB - outputKB;

      console.log(`    → ${size}px: ${outputKB} KB`);
    }

    console.log(`    Served from: ${STATIC_DIR} (via Express)`);
    console.log(`    Fallback imports: ${LIB_DIR}`);
    console.log(`    Total saved: ${totalSaved} KB\n`);
  }

  console.log("✅ Done! Images available via:");
  console.log("  • Express static: http://localhost:3000/assets/img/*.webp");
  console.log("  • Vite imports: $lib/assets/img/*.webp (fallbacks only)");
}

run().catch((err) => {
  console.error("optimize-assets failed:", err);
  process.exit(1);
});
