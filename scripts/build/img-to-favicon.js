#!/usr/bin/env node
/**
 * Image to Favicon Generator
 * 
 * Converts an input image to multiple favicon formats:
 * - favicon.ico (multi-size: 16x16, 32x32, 48x48)
 * - favicon.svg (for modern browsers)
 * - PNG versions: 16x16, 32x32, 180x180 (Apple), 192x192, 512x512 (PWA)
 * 
 * Usage:
 *   bun scripts/img-to-favicon.js <input-image> [output-dir]
 * 
 * Examples:
 *   bun scripts/img-to-favicon.js logo.png
 *   bun scripts/img-to-favicon.js logo.svg control-panel/static
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Favicon sizes to generate
const FAVICON_SIZES = {
  ico: [16, 32, 48],
  png: [16, 32, 180, 192, 512],
};

/**
 * Generate PNG favicons at various sizes
 */
async function generatePngFavicons(inputPath, outputDir) {
  console.log('📐 Generating PNG favicons...');
  
  for (const size of FAVICON_SIZES.png) {
    const outputPath = join(outputDir, `favicon-${size}x${size}.png`);
    
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ ${size}x${size} → ${outputPath}`);
  }
  
  // Create apple-touch-icon.png (180x180)
  const appleTouchPath = join(outputDir, 'apple-touch-icon.png');
  await sharp(inputPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(appleTouchPath);
  
  console.log(`  ✓ Apple touch icon → ${appleTouchPath}`);
}

/**
 * Generate .ico file (multi-size)
 */
async function generateIcoFavicon(inputPath, outputDir) {
  console.log('🖼️  Generating favicon.ico...');
  
  // Generate PNGs for .ico file
  const icoBuffers = await Promise.all(
    FAVICON_SIZES.ico.map(size =>
      sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()
    )
  );
  
  // Create .ico file header and data
  const icoPath = join(outputDir, 'favicon.ico');
  const icoData = createIcoFile(icoBuffers, FAVICON_SIZES.ico);
  writeFileSync(icoPath, icoData);
  
  console.log(`  ✓ Multi-size ICO → ${icoPath}`);
}

/**
 * Create .ico file from PNG buffers
 * Based on ICO file format specification
 */
function createIcoFile(pngBuffers, sizes) {
  const imageCount = pngBuffers.length;
  
  // ICO Header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // Reserved (must be 0)
  header.writeUInt16LE(1, 2);      // Type (1 = ICO)
  header.writeUInt16LE(imageCount, 4); // Number of images
  
  // Calculate image directory entries (16 bytes each)
  const directory = Buffer.alloc(16 * imageCount);
  let offset = 6 + (16 * imageCount); // Start after header + directory
  
  pngBuffers.forEach((pngBuffer, i) => {
    const size = sizes[i];
    const pos = i * 16;
    
    directory.writeUInt8(size === 256 ? 0 : size, pos + 0);  // Width
    directory.writeUInt8(size === 256 ? 0 : size, pos + 1);  // Height
    directory.writeUInt8(0, pos + 2);                        // Color palette
    directory.writeUInt8(0, pos + 3);                        // Reserved
    directory.writeUInt16LE(1, pos + 4);                     // Color planes
    directory.writeUInt16LE(32, pos + 6);                    // Bits per pixel
    directory.writeUInt32LE(pngBuffer.length, pos + 8);      // Image size
    directory.writeUInt32LE(offset, pos + 12);               // Image offset
    
    offset += pngBuffer.length;
  });
  
  // Combine header, directory, and image data
  return Buffer.concat([header, directory, ...pngBuffers]);
}

/**
 * Copy or generate SVG favicon
 */
async function generateSvgFavicon(inputPath, outputDir) {
  const ext = extname(inputPath).toLowerCase();
  const svgPath = join(outputDir, 'favicon.svg');
  
  if (ext === '.svg') {
    console.log('📄 Copying SVG favicon...');
    const svgContent = readFileSync(inputPath, 'utf-8');
    writeFileSync(svgPath, svgContent);
    console.log(`  ✓ SVG copied → ${svgPath}`);
  } else {
    console.log('⏭️  Skipping SVG (input is not SVG format)');
  }
}

/**
 * Generate HTML snippet for favicon links
 */
function generateHtmlSnippet(outputDir) {
  const snippet = `
<!-- Favicon Links (add to your <head> section) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">
<link rel="manifest" href="/site.webmanifest">
`.trim();

  const snippetPath = join(outputDir, 'favicon-snippet.html');
  writeFileSync(snippetPath, snippet);
  
  console.log('\n📋 HTML snippet saved → ' + snippetPath);
  console.log('\nAdd this to your <head> section:');
  console.log(snippet);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
🎨 Image to Favicon Generator

Usage:
  bun scripts/img-to-favicon.js <input-image> [output-dir]

Arguments:
  input-image   Source image (PNG, JPG, SVG, etc.)
  output-dir    Output directory (default: control-panel/static)

Examples:
  bun scripts/img-to-favicon.js logo.png
  bun scripts/img-to-favicon.js logo.svg control-panel/static
  bun scripts/img-to-favicon.js assets/icon.png public/

Generates:
  - favicon.ico (16x16, 32x32, 48x48)
  - favicon.svg (if input is SVG)
  - favicon-16x16.png
  - favicon-32x32.png
  - favicon-180x180.png (Apple touch icon)
  - favicon-192x192.png (PWA)
  - favicon-512x512.png (PWA)
  - apple-touch-icon.png
  - favicon-snippet.html (HTML template)
`);
    process.exit(0);
  }
  
  const inputPath = resolve(args[0]);
  const defaultOutputDir = resolve(__dirname, '..', 'control-panel', 'static');
  const outputDir = args[1] ? resolve(args[1]) : defaultOutputDir;
  
  console.log(`\n🎨 Generating favicons from: ${inputPath}`);
  console.log(`📁 Output directory: ${outputDir}\n`);
  
  // Create output directory if it doesn't exist
  mkdirSync(outputDir, { recursive: true });
  
  try {
    // Generate all favicon formats
    await generatePngFavicons(inputPath, outputDir);
    await generateIcoFavicon(inputPath, outputDir);
    await generateSvgFavicon(inputPath, outputDir);
    generateHtmlSnippet(outputDir);
    
    console.log('\n✨ Favicon generation complete!\n');
  } catch (error) {
    console.error('\n❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

main();
