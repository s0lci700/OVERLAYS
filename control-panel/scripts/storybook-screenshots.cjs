const fs = require("fs");
const path = require("path");
const playwright = require("playwright");

(async function main() {
  const storiesUrl = "http://127.0.0.1:6006/stories.json";
  console.log("Fetching stories list via Playwright...", storiesUrl);
  const browserForFetch = await playwright.chromium.launch();
  const pageForFetch = await browserForFetch.newPage({
    viewport: { width: 800, height: 600 },
  });
  const maxAttempts = 20;
  let data = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pageForFetch.goto("http://127.0.0.1:6006", {
        waitUntil: "networkidle",
        timeout: 5000,
      });
      data = await pageForFetch.evaluate(async (url) => {
        try {
          const r = await fetch(url);
          if (!r.ok) return null;
          return await r.json();
        } catch (e) {
          return null;
        }
      }, storiesUrl);
      if (data) break;
    } catch (e) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  await browserForFetch.close();
  if (!data) {
    console.error("Failed to fetch stories.json after retries");
    process.exit(1);
  }
  const stories = Object.values(data.stories || {});

  const targets = [
    "CharacterBulkControls",
    "AlertDialog",
    "PhotoSourcePicker",
    "Dialog",
  ];

  const matches = stories.filter((s) => {
    const combined = `${s.title} ${s.name}`;
    return targets.some((t) => combined.includes(t));
  });

  if (matches.length === 0) {
    console.error(
      "No matching stories found. Available stories count:",
      stories.length,
    );
    process.exit(1);
  }

  const outDir = path.join(
    process.cwd(),
    "..",
    "..",
    "tests-log",
    "storybook-screenshots",
  );
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await playwright.chromium.launch();
  try {
    for (const s of matches) {
      const id = s.id;
      const url = `http://localhost:6006/iframe.html?id=${encodeURIComponent(id)}`;
      const file = path.join(outDir, `${id.replace(/[:/]/g, "_")}.png`);
      console.log("Capturing", url, "->", file);
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      await page.screenshot({ path: file, fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log("Screenshots saved to", outDir);
})();
