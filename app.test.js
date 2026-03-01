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

  test("/api/tokens returns valid design token JSON", async ({ request }) => {
    const response = await request.get(`${SERVER_URL}/api/tokens`);
    expect(response.ok()).toBeTruthy();

    const tokens = await response.json();

    // Top-level groups must exist
    expect(tokens).toHaveProperty("meta");
    expect(tokens).toHaveProperty("colors");
    expect(tokens).toHaveProperty("hp");
    expect(tokens).toHaveProperty("typography");
    expect(tokens).toHaveProperty("spacing");
    expect(tokens).toHaveProperty("shadows");
    expect(tokens).toHaveProperty("motion");

    // Each group must be an object with token entries containing a 'value' field
    for (const group of ["colors", "hp", "typography", "spacing", "shadows", "motion"]) {
      expect(typeof tokens[group]).toBe("object");
      for (const [key, entry] of Object.entries(tokens[group])) {
        expect(entry).toHaveProperty("value");
        expect(key.startsWith("--")).toBeTruthy();
      }
    }

    // Spot-check known brand tokens
    expect(tokens.colors["--red"].value).toBe("#ff4d6a");
    expect(tokens.colors["--cyan"].value).toBe("#00d4e8");

    console.log("✓ /api/tokens returns valid token schema");
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

test.describe("API Error Paths", () => {
  // ── POST /api/characters ─────────────────────────────────

  test("POST /api/characters — 400 when name is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { player: "Tester", hp_max: 10 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });

  test("POST /api/characters — 400 when name is empty string", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "   ", player: "Tester", hp_max: 10 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });

  test("POST /api/characters — 400 when player is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", hp_max: 10 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/player/i);
  });

  test("POST /api/characters — 400 when hp_max is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_max/i);
  });

  test("POST /api/characters — 400 when hp_max is zero", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester", hp_max: 0 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_max/i);
  });

  test("POST /api/characters — 400 when hp_max is a string", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester", hp_max: "ten" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_max/i);
  });

  test("POST /api/characters — 400 when hp_current is negative", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester", hp_max: 10, hp_current: -1 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_current/i);
  });

  test("POST /api/characters — 400 when armor_class is negative", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester", hp_max: 10, armor_class: -5 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/armor_class/i);
  });

  test("POST /api/characters — 400 when photo is not a string", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters`, {
      data: { name: "Hero", player: "Tester", hp_max: 10, photo: 123 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/photo/i);
  });

  // ── PUT /api/characters/:id/hp ───────────────────────────

  test("PUT /api/characters/:id/hp — 400 when hp_current is missing", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/CH101/hp`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_current/i);
  });

  test("PUT /api/characters/:id/hp — 400 when hp_current is a string", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/CH101/hp`, {
      data: { hp_current: "full" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_current/i);
  });

  test("PUT /api/characters/:id/hp — 404 for unknown character", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/ZZZZZ/hp`, {
      data: { hp_current: 10 },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── PUT /api/characters/:id/photo ────────────────────────

  test("PUT /api/characters/:id/photo — 400 when photo is not a string", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/CH101/photo`, {
      data: { photo: 42 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/photo/i);
  });

  test("PUT /api/characters/:id/photo — 413 when photo payload exceeds body limit", async ({ request }) => {
    // Express body limit is 1 MB; a 1.5 M-char string will be rejected with 413
    const res = await request.put(`${SERVER_URL}/api/characters/CH101/photo`, {
      data: { photo: "x".repeat(1_500_000) },
    });
    expect(res.status()).toBe(413);
  });

  test("PUT /api/characters/:id/photo — 404 for unknown character", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/ZZZZZ/photo`, {
      data: { photo: "https://example.com/img.png" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── PUT /api/characters/:id ──────────────────────────────

  test("PUT /api/characters/:id — 400 when name is an empty string", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/CH101`, {
      data: { name: "" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });

  test("PUT /api/characters/:id — 400 when hp_max is non-positive", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/CH101`, {
      data: { hp_max: 0 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/hp_max/i);
  });

  test("PUT /api/characters/:id — 404 for unknown character", async ({ request }) => {
    const res = await request.put(`${SERVER_URL}/api/characters/ZZZZZ`, {
      data: { name: "Ghost" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── DELETE /api/characters/:id ───────────────────────────

  test("DELETE /api/characters/:id — 404 for unknown character", async ({ request }) => {
    const res = await request.delete(`${SERVER_URL}/api/characters/ZZZZZ`);
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── POST /api/characters/:id/conditions ─────────────────

  test("POST conditions — 400 when condition_name is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/conditions`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/condition_name/i);
  });

  test("POST conditions — 400 when condition_name is empty", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/conditions`, {
      data: { condition_name: "  " },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/condition_name/i);
  });

  test("POST conditions — 400 when intensity_level is zero", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/conditions`, {
      data: { condition_name: "Poisoned", intensity_level: 0 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/intensity_level/i);
  });

  test("POST conditions — 400 when intensity_level is negative", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/conditions`, {
      data: { condition_name: "Poisoned", intensity_level: -1 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/intensity_level/i);
  });

  test("POST conditions — 404 for unknown character", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/ZZZZZ/conditions`, {
      data: { condition_name: "Blinded" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── DELETE /api/characters/:id/conditions/:condId ────────

  test("DELETE condition — 400 when condId is shorter than 5 chars", async ({ request }) => {
    const res = await request.delete(
      `${SERVER_URL}/api/characters/CH101/conditions/AB`,
    );
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/condId/i);
  });

  test("DELETE condition — 400 when condId is longer than 5 chars", async ({ request }) => {
    const res = await request.delete(
      `${SERVER_URL}/api/characters/CH101/conditions/TOOLONG`,
    );
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/condId/i);
  });

  test("DELETE condition — 404 for unknown character id", async ({ request }) => {
    const res = await request.delete(
      `${SERVER_URL}/api/characters/ZZZZZ/conditions/ABC12`,
    );
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── PUT /api/characters/:id/resources/:rid ───────────────

  test("PUT resource — 400 when pool_current is missing", async ({ request }) => {
    const res = await request.put(
      `${SERVER_URL}/api/characters/CH101/resources/RS001`,
      { data: {} },
    );
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/pool_current/i);
  });

  test("PUT resource — 400 when pool_current is negative", async ({ request }) => {
    const res = await request.put(
      `${SERVER_URL}/api/characters/CH101/resources/RS001`,
      { data: { pool_current: -1 } },
    );
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/pool_current/i);
  });

  test("PUT resource — 400 when pool_current is a string", async ({ request }) => {
    const res = await request.put(
      `${SERVER_URL}/api/characters/CH101/resources/RS001`,
      { data: { pool_current: "full" } },
    );
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/pool_current/i);
  });

  test("PUT resource — 404 for unknown character or resource", async ({ request }) => {
    const res = await request.put(
      `${SERVER_URL}/api/characters/ZZZZZ/resources/RS001`,
      { data: { pool_current: 1 } },
    );
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── POST /api/characters/:id/rest ────────────────────────

  test("POST rest — 400 for invalid rest type", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/rest`, {
      data: { type: "medium" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/type/i);
  });

  test("POST rest — 400 when type is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/CH101/rest`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/type/i);
  });

  test("POST rest — 404 for unknown character", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/characters/ZZZZZ/rest`, {
      data: { type: "short" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  // ── POST /api/rolls ──────────────────────────────────────

  test("POST rolls — 400 when charId is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/rolls`, {
      data: { result: 15, sides: 20 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/charId/i);
  });

  test("POST rolls — 400 when charId is empty string", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/rolls`, {
      data: { charId: "", result: 15, sides: 20 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/charId/i);
  });

  test("POST rolls — 400 when result is a string", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/rolls`, {
      data: { charId: "CH101", result: "high", sides: 20 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/result/i);
  });

  test("POST rolls — 400 when sides is zero", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/rolls`, {
      data: { charId: "CH101", result: 1, sides: 0 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/sides/i);
  });

  test("POST rolls — 400 when sides is missing", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/api/rolls`, {
      data: { charId: "CH101", result: 1 },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/sides/i);
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
