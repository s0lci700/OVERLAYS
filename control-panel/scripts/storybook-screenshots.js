const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const playwright = require("playwright");

async function main() {
  const storiesUrl = "http://localhost:6006/stories.json";
  console.log("Fetching stories list...", storiesUrl);
  const res = await fetch(storiesUrl).catch((e) => {
    console.error("Failed to fetch stories.json", e);
    process.exit(1);
  });
  if (!res.ok) {
    console.error("stories.json returned", res.status);
    process.exit(1);
  }
  const data = await res.json();
  const stories = Object.values(data.stories || {});

  // Names to capture (match either title or name)
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
      await page.waitForTimeout(300); // small delay to allow animations
      await page.screenshot({ path: file, fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log("Screenshots saved to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
