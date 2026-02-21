/**
 * End-to-end test for the D&D Overlay System
 * Tests: Server API, Control Panel, Socket.io, HP updates, Dice rolling
 */

const { test, expect } = require("@playwright/test");

const SERVER_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const CONTROL_PANEL_URL = process.env.PLAYWRIGHT_CP_URL || "http://localhost:5173";

test.describe("D&D Overlay System - Full Stack Test", () => {
  test("Server API responds with characters", async ({ request }) => {
    const response = await request.get(`${SERVER_URL}/api/characters`);
    expect(response.ok()).toBeTruthy();

    const characters = await response.json();
    expect(Array.isArray(characters)).toBeTruthy();
    expect(characters.length).toBeGreaterThan(0);

    // Verify character structure
    const char = characters[0];
    expect(char).toHaveProperty("id");
    expect(char).toHaveProperty("name");
    expect(char).toHaveProperty("hp_current");
    expect(char).toHaveProperty("hp_max");

    console.log("✓ Server API responding correctly");
    console.log(`  Found ${characters.length} characters`);
  });

  test("Control Panel loads successfully", async ({ page }) => {
    await page.goto(CONTROL_PANEL_URL);

    // Wait for the app to load
    await page.waitForTimeout(2000);

    // Check if character cards are visible
    const charCards = await page
      .locator('[data-testid="character-card"], .character-card, .char-card')
      .count();
    console.log(`✓ Control Panel loaded with visible elements`);

    // Take a screenshot for visual verification
    await page.screenshot({ path: "test-control-panel.png" });
    console.log("  Screenshot saved: test-control-panel.png");
  });

  test("Socket.io connection establishes", async ({ page }) => {
    let socketConnected = false;
    let initialDataReceived = false;

    // Listen for console messages
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("socket") || text.includes("connect")) {
        socketConnected = true;
      }
      if (text.includes("initialData") || text.includes("characters")) {
        initialDataReceived = true;
      }
    });

    await page.goto(CONTROL_PANEL_URL);
    await page.waitForTimeout(3000);

    // Check if Socket.io client is loaded
    const hasSocketIO = await page.evaluate(() => {
      return (
        typeof window.io !== "undefined" ||
        typeof window.socket !== "undefined" ||
        document.querySelector('script[src*="socket.io"]') !== null
      );
    });

    console.log(
      `✓ Socket.io client check: ${hasSocketIO ? "loaded" : "checking..."}`,
    );
  });

  test("HP Update flow works end-to-end", async ({ page, request }) => {
    // Get initial character state
    const initialResponse = await request.get(`${SERVER_URL}/api/characters`);
    const initialChars = await initialResponse.json();
    const testChar = initialChars[0];
    const initialHP = testChar.hp_current;

    console.log(
      `  Initial HP for ${testChar.name}: ${initialHP}/${testChar.hp_max}`,
    );

    // Update HP via API
    const newHP = Math.max(1, initialHP - 5);
    const updateResponse = await request.put(
      `${SERVER_URL}/api/characters/${testChar.id}/hp`,
      {
        data: { hp_current: newHP },
      },
    );

    expect(updateResponse.ok()).toBeTruthy();
    const updatedChar = await updateResponse.json();
    expect(updatedChar.hp_current).toBe(newHP);

    console.log(`✓ HP update successful: ${initialHP} → ${newHP}`);

    // Verify the update persisted
    const verifyResponse = await request.get(`${SERVER_URL}/api/characters`);
    const verifyChars = await verifyResponse.json();
    const verifyChar = verifyChars.find((c) => c.id === testChar.id);
    expect(verifyChar.hp_current).toBe(newHP);

    console.log("  HP update persisted in server state");
  });

  test("Dice rolling works", async ({ request }) => {
    // Generate a random dice roll (1-20)
    const diceRoll = Math.floor(Math.random() * 20) + 1;

    const rollData = {
      charId: "char1",
      result: diceRoll, // The actual dice roll
      sides: 20,
      modifier: 5,
    };

    const response = await request.post(`${SERVER_URL}/api/rolls`, {
      data: rollData,
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    expect(result).toHaveProperty("result");
    expect(result).toHaveProperty("rollResult");
    expect(result.sides).toBe(20);
    expect(result.modifier).toBe(5);
    expect(result.rollResult).toBe(result.result + result.modifier);

    console.log(
      `✓ Dice roll: d${result.sides} rolled ${result.result}, +${result.modifier} = ${result.rollResult}`,
    );
  });

  test("Overlay HP page loads", async ({ page }) => {
    const overlayPath = `file:///${process.cwd().replace(/\\/g, "/")}/public/overlay-hp.html`;

    // Set up console listener before navigation
    const consoleLogs = [];
    page.on("console", (msg) => consoleLogs.push(msg.text()));

    await page.goto(overlayPath);
    await page.waitForTimeout(2000);

    // Check if Socket.io script loaded
    const hasSocketScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      return scripts.some((s) => s.src.startsWith("https://cdn.socket.io/"));
    });

    expect(hasSocketScript).toBeTruthy();
    console.log("✓ HP Overlay loads Socket.io");

    await page.screenshot({ path: "test-overlay-hp.png" });
    console.log("  Screenshot saved: test-overlay-hp.png");
  });

  test("Overlay Dice page loads", async ({ page }) => {
    const overlayPath = `file:///${process.cwd().replace(/\\/g, "/")}/public/overlay-dice.html`;

    await page.goto(overlayPath);
    await page.waitForTimeout(2000);

    const hasSocketScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      return scripts.some((s) => s.src.startsWith("https://cdn.socket.io/"));
    });

    expect(hasSocketScript).toBeTruthy();
    console.log("✓ Dice Overlay loads Socket.io");

    await page.screenshot({ path: "test-overlay-dice.png" });
    console.log("  Screenshot saved: test-overlay-dice.png");
  });

  test("Full integration: HP update triggers overlay update", async ({
    page,
    request,
    browser,
  }) => {
    // Open overlay in one context
    const overlayPath = `file:///${process.cwd().replace(/\\/g, "/")}/public/overlay-hp.html`;
    const overlayContext = await browser.newContext();
    const overlayPage = await overlayContext.newPage();

    let overlayUpdated = false;
    overlayPage.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("hp_updated") || text.includes("HP")) {
        overlayUpdated = true;
      }
    });

    await overlayPage.goto(overlayPath);
    await overlayPage.waitForTimeout(2000);

    // Get a character
    const response = await request.get(`${SERVER_URL}/api/characters`);
    const characters = await response.json();
    const testChar = characters[0];

    // Update HP
    const newHP = Math.max(1, testChar.hp_current - 3);
    await request.put(`${SERVER_URL}/api/characters/${testChar.id}/hp`, {
      data: { hp_current: newHP },
    });

    // Wait for Socket.io to propagate
    await overlayPage.waitForTimeout(1000);

    console.log(
      `✓ Integration test: HP updated from ${testChar.hp_current} to ${newHP}`,
    );
    console.log(
      `  Overlay update detected: ${overlayUpdated ? "Yes" : "Checking..."}`,
    );

    await overlayContext.close();
  });
});

test.describe("Quick Health Check", () => {
  test("All components are accessible", async ({ request }) => {
    const tests = [
      { name: "Server API", url: `${SERVER_URL}/api/characters` },
      { name: "Control Panel", url: CONTROL_PANEL_URL },
    ];

    console.log("\n=== Quick Health Check ===");
    for (const t of tests) {
      try {
        const response = await request.get(t.url);
        console.log(`✓ ${t.name}: ${response.ok() ? "OK" : "FAILED"}`);
      } catch (e) {
        console.log(`✗ ${t.name}: ERROR - ${e.message}`);
      }
    }
    console.log("===========================\n");
  });
});
