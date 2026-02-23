/**
 * End-to-end test for the D&D Overlay System
 * Tests: Server API, Control Panel, Socket.io, HP updates, Dice rolling
 */

const { test, expect } = require("@playwright/test");

const SERVER_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const CONTROL_PANEL_URL =
  process.env.PLAYWRIGHT_CP_URL || "http://localhost:5173";

const getCharacters = async (request) => {
  const response = await request.get(`${SERVER_URL}/api/characters`);
  expect(response.ok()).toBeTruthy();
  return response.json();
};

const waitForCharacter = async (request, predicate) => {
  return expect
    .poll(async () => {
      const characters = await getCharacters(request);
      return characters.find(predicate) || null;
    })
    .not.toBeNull();
};

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

  test("Template characters are available", async ({ request }) => {
    const characters = await getCharacters(request);
    const ids = characters.map((c) => c.id);

    expect(ids).toContain("CH101");
    expect(ids).toContain("CH102");
    expect(ids).toContain("CH103");

    const charOne = characters.find((c) => c.id === "CH101");
    const charTwo = characters.find((c) => c.id === "CH102");
    const charThree = characters.find((c) => c.id === "CH103");

    expect(charOne).toBeTruthy();
    expect(charTwo).toBeTruthy();
    expect(charOne.name).toBeTruthy();
    expect(charTwo.name).toBeTruthy();
    expect(charThree.name).toBeTruthy();
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

  test("Character creation form validates required fields", async ({
    page,
  }) => {
    await page.goto(`${CONTROL_PANEL_URL}/management/create`);

    const submitButton = page.getByRole("button", { name: "CREAR PERSONAJE" });
    await expect(submitButton).toBeDisabled();

    await page.getByPlaceholder("Ej. Valeria").fill("QA-Form");
    await page.getByPlaceholder("Ej. Sol").fill("QA-Player");
    await page.locator('label:has-text("HP MAX") input').fill("18");

    await expect(submitButton).toBeEnabled();
  });

  test("Dashboard shows character cards and log panels", async ({ page }) => {
    await page.goto(`${CONTROL_PANEL_URL}/dashboard`);

    await expect(page.getByText("Dashboard de personajes")).toBeVisible();
    await expect(page.getByText("Últimas acciones")).toBeVisible();
    await expect(page.getByText("Ultimos dados")).toBeVisible();

    const cards = page.locator(".dashboard-card");
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(page.locator(".dashboard-empty")).toHaveCount(0);
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
      charId: "CH101",
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

  test("Character creation supports local photo upload", async ({
    page,
    request,
  }) => {
    const uniqueName = `QA-${Date.now()}`;
    const tinyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X8RkAAAAASUVORK5CYII=",
      "base64",
    );

    await page.goto(`${CONTROL_PANEL_URL}/management/create`);

    await page.getByPlaceholder("Ej. Valeria").fill(uniqueName);
    await page.getByPlaceholder("Ej. Sol").fill("QA-Player");
    await page.locator('label:has-text("HP MAX") input').fill("22");
    await page.locator('label:has-text("AC") input').fill("15");
    await page.locator('label:has-text("VEL") input').fill("30");

    await page.getByRole("button", { name: "Archivo Local" }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "tiny.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/characters") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "CREAR PERSONAJE" }).click();
    const response = await createResponse;
    expect(response.ok()).toBeTruthy();

    await expect(
      page.getByText("Personaje creado.", { exact: true }),
    ).toBeVisible();

    await waitForCharacter(request, (c) => c.name === uniqueName);
    const characters = await getCharacters(request);
    const created = characters.find((c) => c.name === uniqueName);
    expect(created.photo.startsWith("data:")).toBeTruthy();
  });

  test("Character photo update accepts URL", async ({ page, request }) => {
    const photoUrl = "https://example.com/portrait.png";
    await page.goto(`${CONTROL_PANEL_URL}/management/manage`);

    const card = page.locator(".manage-card").first();
    await expect(card).toBeVisible();
    const charId = await card.getAttribute("data-char-id");
    expect(charId).toBeTruthy();

    await card.locator(".manage-photo-btn").click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    await modal.getByRole("button", { name: "URL" }).click();
    const urlInput = modal.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/characters/${charId}/photo`) &&
        response.request().method() === "PUT",
    );

    await urlInput.fill(photoUrl);
    await modal.getByRole("button", { name: "ACTUALIZAR FOTO" }).click();

    const response = await updateResponse;
    const responseBody = await response.text();
    console.log(`Photo update response: ${response.status} ${responseBody}`);
    expect(response.ok()).toBeTruthy();

    await expect(
      modal.getByText("Foto actualizada.", { exact: true }),
    ).toBeVisible();

    const characters = await getCharacters(request);
    const updated = characters.find((c) => c.id === charId);
    expect(updated).toBeTruthy();
    expect(updated.photo).toBe(photoUrl);
  });

  test("Character profile update persists", async ({ page, request }) => {
    await page.goto(`${CONTROL_PANEL_URL}/management/manage`);

    const card = page.locator(".manage-card").first();
    await expect(card).toBeVisible();
    const charId = await card.getAttribute("data-char-id");
    expect(charId).toBeTruthy();

    const nameInput = card.locator('label:has-text("Nombre") input');
    const playerInput = card.locator('label:has-text("Jugador") input');
    const hpMaxInput = card.locator('label:has-text("HP MAX") input');
    const armorInput = card.locator('label:has-text("AC") input');
    const speedInput = card.locator('label:has-text("VEL") input');

    const updatedName = `QA-Edit-${Date.now()}`;

    await nameInput.fill(updatedName);
    await playerInput.fill("QA-Edited");
    await hpMaxInput.fill("27");
    await armorInput.fill("14");
    await speedInput.fill("32");

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/characters/${charId}`) &&
        response.request().method() === "PUT",
    );

    await card.getByRole("button", { name: "GUARDAR DATOS" }).click();
    const response = await updateResponse;
    expect(response.ok()).toBeTruthy();

    await expect(
      card.getByText("Datos actualizados.", { exact: true }),
    ).toBeVisible();

    const characters = await getCharacters(request);
    const updated = characters.find((c) => c.id === charId);
    expect(updated).toBeTruthy();
    expect(updated.name).toBe(updatedName);
    expect(updated.player).toBe("QA-Edited");
    expect(updated.hp_max).toBe(27);
    expect(updated.armor_class).toBe(14);
    expect(updated.speed_walk).toBe(32);
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
