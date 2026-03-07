/**
 * Minimal Express + Socket.io backend that drives the control panel and OBS overlays.
 * All state lives in memory for this pitch demo, so restarting the server resets the data.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const os = require("os");
const path = require("path");
const { Server } = require("socket.io");
const app = express();
const httpServer = http.createServer(app);
// Configure via .env: PORT (default 3000) and CONTROL_PANEL_ORIGIN (default http://localhost:5173).
const PORT = parseInt(process.env.PORT || "3000", 10);
const CONTROL_PANEL_ORIGIN =
  process.env.CONTROL_PANEL_ORIGIN || "http://localhost:5173";
const characterModule = require("./data/characters");
const rollsModule = require("./data/rolls");
const PocketBase = require("pocketbase/cjs");
const pb = new PocketBase(
  process.env.POCKETBASE_URL || "http://127.0.0.1:8090",
);
const PB_SUPERUSERS = "_superusers";

async function connectToPocketBase() {
  if (!pb) {
    console.error("❌ PocketBase client (pb) is not initialized.");
    return false;
  }
  const { PB_MAIL, PB_PASS } = process.env;
  if (!PB_MAIL || !PB_PASS) {
    console.error("❌ Missing PB_MAIL or PB_PASS environment variables.");
    return false;
  }

  const maxRetries = 5;
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      const authData = await pb.collection(PB_SUPERUSERS).authWithPassword(PB_MAIL, PB_PASS);

      if (!authData || !authData.token || !authData.record) {
        throw new Error("Invalid auth response from PocketBase");
      }

      // PocketBase SDK auto-persist only works in browser environments;
      // in Node.js/CJS the token must be saved explicitly.
      pb.authStore.save(authData.token, authData.record);

      console.log("✅ Connected to PocketBase");
      return true;
    } catch (err) {
      lastError = err;
      retries++;

      // Non-retriable: wrong credentials
      const status = err?.response?.status ?? err?.status;
      if (status === 401 || status === 403) {
        console.error("❌ PocketBase authentication failed (non-retriable):", err.message || err);
        break;
      }

      if (retries < maxRetries) {
        // Exponential backoff capped at 16s: 1s, 2s, 4s, 8s, 16s (plus 0–1s jitter)
        const base = Math.min(16000, Math.pow(2, retries - 1) * 1000);
        const jitter = Math.floor(Math.random() * 1000);
        const delay = base + jitter;
        console.warn(
          `⚠️  PocketBase connection failed (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(
    "❌ Failed to connect to PocketBase after",
    maxRetries,
    "attempts:",
    lastError?.message || lastError
  );
  return false;
}

/**
 * Ensures the PocketBase auth store is valid. Tries a lightweight token
 * refresh first; if that fails (e.g. token already expired) it falls back
 * to a full re-authentication.  Safe to call at any time.
 * @returns {Promise<boolean>}
 */
async function ensureAuth() {
  if (pb.authStore.isValid) {
    try {
      await pb.collection(PB_SUPERUSERS).authRefresh();
      return true;
    } catch {
      // Only fall back to full re-auth if the token is now actually invalid.
      // A transient network/5xx error during refresh doesn't invalidate the
      // existing token, so we can continue using it as-is.
      if (pb.authStore.isValid) {
        return true;
      }
    }
  }
  console.warn("[server] Auth store invalid or refresh failed — re-authenticating with PocketBase...");
  return connectToPocketBase();
}

async function seedIfEmpty() {
  if (!pb.authStore.isValid) {
    console.warn("⚠️  Cannot seed: PocketBase not connected. Skipping seed stage.");
    return;
  }

  console.log("\n━━━ SEEDING DATABASE ━━━");

  // ── Stage 1: Characters (core bootstrap) ───────────────────────────────
  try {
    const charCount = (await pb.collection("characters").getList(1, 1)).totalItems;
    if (charCount > 0) {
      console.log("✅ characters: already populated (" + charCount + " records)");
    } else {
      const templates = require("./data/template-characters.json");
      for (const char of templates) {
        await pb.collection("characters").create(char);
      }
      console.log(`✅ characters: seeded ${templates.length} records`);
    }
  } catch (err) {
    console.error("❌ characters seed failed:", err.message);
  }

  // ── Stage 2: NPC data (demo context) ───────────────────────────────────
  try {
    const npcTemplateCount = (await pb.collection("npc_templates").getList(1, 1)).totalItems;
    const npcInstanceCount = (await pb.collection("npc_instances").getList(1, 1)).totalItems;
    const conditionCount = (await pb.collection("conditions_library").getList(1, 1)).totalItems;

    if (npcTemplateCount > 0 && npcInstanceCount > 0 && conditionCount > 0) {
      console.log(
        `✅ npc data: already populated (templates: ${npcTemplateCount}, instances: ${npcInstanceCount}, conditions: ${conditionCount})`
      );
    } else {
      const npcTemplates = [
        { name: "Goblin", cr: "1/4", hp_max: 7, armor_class: 15, ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 }, resistances: {} },
        { name: "Goblin Boss", cr: "1", hp_max: 21, armor_class: 17, ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 8, cha: 10 }, resistances: {} },
        { name: "Giant Rat", cr: "1/8", hp_max: 7, armor_class: 12, ability_scores: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 }, resistances: {} },
      ];
      const npcInstances = [
        { display_name: "Skarrik the Pickaxe", hp_current: 21, conditions: [] },
        { display_name: "Gnash", hp_current: 7, conditions: [] },
        { display_name: "Wort", hp_current: 4, conditions: ["Frightened"] },
        { display_name: "Tunnel Crawler", hp_current: 7, conditions: [] },
      ];
      const conditions = [
        { name: "Frightened", type: "debuff", mech_effects: { note: "Disadvantage on ability checks and attack rolls while source of fear is in line of sight." }, duration_type: "concentration", is_stackable: "false" },
        { name: "Poisoned", type: "debuff", mech_effects: { note: "Disadvantage on attack rolls and ability checks." }, duration_type: "timed", is_stackable: "false" },
        { name: "Prone", type: "debuff", mech_effects: { note: "Attack rolls against creature have advantage if within 5ft. Own attacks have disadvantage." }, duration_type: "until_action", is_stackable: "false" },
        { name: "Blinded", type: "debuff", mech_effects: { note: "Fails ability checks requiring sight. Attacks have advantage against it; its attacks have disadvantage." }, duration_type: "timed", is_stackable: "false" },
        { name: "Restrained", type: "debuff", mech_effects: { note: "Speed becomes 0. Attacks have advantage. Own attacks and Dex saves have disadvantage." }, duration_type: "until_action", is_stackable: "false" },
        { name: "Stunned", type: "debuff", mech_effects: { note: "Incapacitated. Fails Str/Dex saves. Attacks have advantage." }, duration_type: "timed", is_stackable: "false" },
      ];

      if (npcTemplateCount === 0) {
        for (const t of npcTemplates) {
          await pb.collection("npc_templates").create(t);
        }
      }
      if (npcInstanceCount === 0) {
        for (const n of npcInstances) {
          await pb.collection("npc_instances").create(n);
        }
      }
      if (conditionCount === 0) {
        for (const c of conditions) {
          await pb.collection("conditions_library").create(c);
        }
      }
      console.log(`✅ npc data: seeded (templates: ${npcTemplates.length}, instances: ${npcInstances.length}, conditions: ${conditions.length})`);
    }
  } catch (err) {
    console.error("❌ npc data seed failed:", err.message);
  }

  // ── Stage 3: Full campaign context (optional) ───────────────────────────
  try {
    const campaignCount = (await pb.collection("campaigns").getList(1, 1)).totalItems;
    const sessionCount = (await pb.collection("sessions").getList(1, 1)).totalItems;
    const abilityCount = (await pb.collection("abilities").getList(1, 1)).totalItems;
    const partyCount = (await pb.collection("party").getList(1, 1)).totalItems;
    const encounterCount = (await pb.collection("encounters").getList(1, 1)).totalItems;

    if (campaignCount > 0 && sessionCount > 0 && abilityCount > 0) {
      console.log(
        `✅ campaign data: already populated (campaigns: ${campaignCount}, sessions: ${sessionCount}, abilities: ${abilityCount})`
      );
    } else {
      // Only seed if characters exist
      const charIds = (await pb.collection("characters").getList(1, 500)).items.map((c) => c.id);
      if (charIds.length === 0) {
        console.log("⏭️  campaign data: skipped (no characters found, seed that first)");
      } else {
        const campaign = { name: "La Mina del Susurro Roto", setting: "Forgotten Realms — Sword Coast frontier", status: "active", party_level: "1", dm_notes: "Session 3 — Amber Cavern assault" };
        const createdCampaign = await pb.collection("campaigns").create(campaign);

        const sessions = [
          { campaign_id: createdCampaign.id, session_number: "1", date_played: "2026-02-17", session_log: "Party met at The Stumped Ox tavern", highlights: [] },
          { campaign_id: createdCampaign.id, session_number: "2", date_played: "2026-02-24", session_log: "Explored Eastern Tunnels", highlights: [] },
          { campaign_id: createdCampaign.id, session_number: "3", date_played: "2026-03-03", session_log: "Amber Cavern assault in progress", highlights: [] },
        ];

        if (sessionCount === 0) {
          for (const s of sessions) {
            await pb.collection("sessions").create(s);
          }
        }

        if (abilityCount === 0) {
          const abilities = [
            { name: "Sneak Attack", type: "class_feature", action_cost: "none", resource_cost: {}, target: "single_enemy", effects: {}, concentration: "false" },
            { name: "Eldritch Blast", type: "cantrip", action_cost: "action", resource_cost: {}, target: "single_enemy", effects: {}, concentration: "false" },
            { name: "Rage", type: "class_feature", action_cost: "bonus_action", resource_cost: {}, target: "self", effects: {}, concentration: "false" },
            { name: "Action Surge", type: "class_feature", action_cost: "none", resource_cost: {}, target: "self", effects: {}, concentration: "false" },
            { name: "Cure Wounds", type: "spell_1st", action_cost: "action", resource_cost: {}, target: "single_ally", effects: {}, concentration: "false" },
          ];
          for (const a of abilities) {
            await pb.collection("abilities").create(a);
          }
        }

        if (partyCount === 0) {
          await pb.collection("party").create({ campaign_id: createdCampaign.id, characters_ids: charIds, inspiration_pool: 1 });
        }

        if (encounterCount === 0) {
          await pb.collection("encounters").create({
            campaign_id: createdCampaign.id,
            status: "active",
            round: 4,
            turn_index: "2",
            combat_order: [
              { name: "Skarrik the Pickaxe", type: "enemy", initiative: 14 },
              { name: "HECTOR", type: "player", initiative: 10 },
              { name: "MARCELO", type: "player", initiative: 8 },
            ],
          });
        }

        console.log(`✅ campaign data: seeded (campaign: 1, sessions: ${sessions.length}, abilities: ${5})`);
      }
    }
  } catch (err) {
    console.error("❌ campaign data seed failed:", err.message);
  }

  console.log("━━━ SEEDING COMPLETE ━━━\n");
}

async function main() {
  const connected = await connectToPocketBase();
  await seedIfEmpty();

  // Proactively refresh the PocketBase auth token to keep it alive.
  // Superuser JWTs have a finite TTL; without this the auth store silently
  // expires and every socket connection returns empty data.
  //
  // If startup auth failed, use a shorter 5-minute retry interval until we
  // first connect; then switch to the normal 23-hour refresh cadence.
  const REAUTH_INTERVAL_MS = 23 * 60 * 60 * 1000;
  const RETRY_INTERVAL_MS = 5 * 60 * 1000;

  let refreshTimer;

  function scheduleRefresh(intervalMs) {
    refreshTimer = setTimeout(async () => {
      console.log("[server] PocketBase token refresh...");
      const ok = await ensureAuth();
      if (!ok) {
        console.error("[server] ❌ Token refresh failed. Retrying in 5 minutes...");
        scheduleRefresh(RETRY_INTERVAL_MS);
      } else {
        scheduleRefresh(REAUTH_INTERVAL_MS);
      }
    }, intervalMs);
    if (refreshTimer.unref) refreshTimer.unref();
  }

  scheduleRefresh(connected ? REAUTH_INTERVAL_MS : RETRY_INTERVAL_MS);

  // Cache design tokens at startup; /api/tokens reads from this in-memory cache (no per-request I/O).
  const fs = require("fs");

  let cachedTokens = null;
  try {
    cachedTokens = JSON.parse(
      fs.readFileSync(path.join(__dirname, "design", "tokens.json"), "utf-8"),
    );
  } catch (err) {
    console.warn("⚠️  Could not preload design/tokens.json:", err.message);
  }

  function getMainIP() {
    const interfaces = os.networkInterfaces();
    for (const [, addresses] of Object.entries(interfaces)) {
      for (const addressInfo of addresses) {
        if (addressInfo.family === "IPv4" && !addressInfo.internal) {
          return addressInfo.address;
        }
      }
    }
    return "127.0.0.1";
  }

  // Allow the Svelte control panel and OBS overlay browser sources to connect.
  // Build a CORS allow-list: the configured control-panel origin + the server's own origin
  // (so overlays served from the same host:port can also connect via Socket.io).
  const allowedOrigins = [
    CONTROL_PANEL_ORIGIN,
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
  ];
  const serverIP = getMainIP();
  if (serverIP !== "127.0.0.1") {
    allowedOrigins.push(`http://${serverIP}:${PORT}`);
  }

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
    },
  });

  // ── JSONL Sidecar Logger ───────────────────────────────────────────────────
  let syncStartTime = null;
  const SIDECAR_PATH = path.join(__dirname, "logs", "sidecar.jsonl");
  fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });

  function logEvent(event, summary = {}) {
    const ts_abs = Date.now();
    const entry = JSON.stringify({
      event,
      ts_abs,
      ts_rel: syncStartTime != null ? ts_abs - syncStartTime : null,
      ...summary,
    });
    fs.appendFile(SIDECAR_PATH, entry + "\n", () => {});
  }

  function broadcast(event, data) {
    io.emit(event, data);
    const { character, characters: _c, rolls: _r, ...rest } = data || {};
    logEvent(event, {
      ...(character ? { charId: character.id, charName: character.name } : {}),
      ...rest,
    });
  }

  // ── In-memory encounter / scene / focus state ───────────────────────────────
  let encounterState = {
    active: false,
    round: 0,
    currentTurnIndex: 0,
    participants: [],
  };
  let sceneState = { title: "", subtitle: "", visible: false };
  let focusedChar = null;

  // Emit the latest characters and rolls snapshot to every client that connects.
  io.on("connection", async (socket) => {
    console.log("A user connected: " + socket.id);
    try {
      if (!pb.authStore.isValid) {
        const ok = await ensureAuth();
        if (!ok) {
          console.warn("[server] PocketBase connection not valid. Auth store invalid.");
          socket.emit("initialData", { characters: [], rolls: [], encounter: encounterState, scene: sceneState, focusedChar });
          return;
        }
      }
      const characters = await characterModule.getAll(pb);
      const rolls = await rollsModule.getAll(pb);
      socket.emit("initialData", { characters, rolls, encounter: encounterState, scene: sceneState, focusedChar });
    } catch (err) {
      console.error(
        "[server] Failed to load initial data from PocketBase:",
        err.status || err.message || err,
      );
      // Emit a safe fallback so clients don't hang — overlays/control panel can handle empty lists.
      socket.emit("initialData", { characters: [], rolls: [], encounter: encounterState, scene: sceneState, focusedChar });
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const mainIP = getMainIP();
    console.log(`[server] Local URL: http://localhost:${PORT}`);
    console.log(`[server] Network URL: http://${mainIP}:${PORT}`);
    console.log(`[server] Control panel origin: ${CONTROL_PANEL_ORIGIN}`);
  });

  httpServer.on("error", (error) => {
    if (!error || !error.code) {
      console.error("[server] Failed to start due to an unknown error.");
      process.exit(1);
    }

    if (error.code === "EADDRINUSE") {
      console.error(`[server] Port ${PORT} is already in use.`);
      console.error(
        "[server] Stop the other process using this port, or run with a different PORT (e.g. PORT=3001).",
      );
      process.exit(1);
    }

    if (error.code === "EACCES") {
      console.error(
        `[server] Permission denied while trying to use port ${PORT}.`,
      );
      console.error("[server] Try a non-privileged port such as 3000 or 3001.");
      process.exit(1);
    }

    console.error(`[server] Startup error (${error.code}): ${error.message}`);
    process.exit(1);
  });

  // Parse JSON payloads from the control panel; restrict CORS to known origins.
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/assets", express.static(path.join(__dirname, "assets")));

  // Serve the OBS overlays and landing page over the network.
  // OBS Browser Sources can now use http://IP:3000/overlay-hp.html instead of a local file path,
  // making the demo work on any machine on the LAN without file system access.
  app.use(express.static(path.join(__dirname, "public")));

  // Returns the server's LAN IP and port so the landing page (public/index.html)
  // can dynamically render correct URLs for OBS setup and the control panel.
  app.get("/api/info", (req, res) => {
    res.json({
      ip: getMainIP(),
      port: PORT,
      controlPanelUrl: CONTROL_PANEL_ORIGIN,
    });
  });

  // Returns the canonical design tokens JSON from design/tokens.json.
  // Consumed by the live theme editor webtool at /theme-editor/index.html.
  app.get("/api/tokens", (req, res) => {
    if (cachedTokens) return res.json(cachedTokens);
    // Fallback: try a fresh read if startup load failed.
    try {
      cachedTokens = JSON.parse(
        fs.readFileSync(path.join(__dirname, "design", "tokens.json"), "utf-8"),
      );
      res.json(cachedTokens);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Could not read design tokens." });
    }
  });

  // ── Characters ──────────────────────────────────────────────

  // Return the full character roster, including HP, resources, and conditions.
  app.get("/api/characters", async (req, res) => {
    try {
      const chars = await characterModule.getAll(pb);
      res.status(200).json(chars);
    } catch (err) {
      console.error(
        "[server] /api/characters failed to read from PocketBase:",
        err.message || err,
      );
      res
        .status(500)
        .json({ error: "Could not read characters from PocketBase." });
    }
  });

  // Create a new character and broadcast so all connected clients can append it.
  app.post("/api/characters", async (req, res) => {
    const {
      campaign_id,
      name,
      player,
      hp_current,
      hp_max,
      hp_temp,
      ability_scores,
      turn_state,
      death_state,
      armor_class,
      speed_walk,
      entity_type,
      visible_to_players,
      class_primary,
      conditions,
      resources,
      photo,
      background,
      species,
      languages,
      alignment,
      proficiencies,
      equipment,
    } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }

    if (typeof player !== "string" || player.trim() === "") {
      return res
        .status(400)
        .json({ error: "player must be a non-empty string" });
    }

    if (typeof hp_max !== "number" || !Number.isFinite(hp_max) || hp_max <= 0) {
      return res
        .status(400)
        .json({ error: "hp_max must be a positive finite number" });
    }

    if (
      hp_current !== undefined &&
      (typeof hp_current !== "number" ||
        !Number.isFinite(hp_current) ||
        hp_current < 0)
    ) {
      return res.status(400).json({
        error: "hp_current must be a finite number greater than or equal to 0",
      });
    }

    if (
      armor_class !== undefined &&
      (typeof armor_class !== "number" ||
        !Number.isFinite(armor_class) ||
        armor_class < 0)
    ) {
      return res.status(400).json({
        error: "armor_class must be a finite number greater than or equal to 0",
      });
    }

    if (
      speed_walk !== undefined &&
      (typeof speed_walk !== "number" ||
        !Number.isFinite(speed_walk) ||
        speed_walk < 0)
    ) {
      return res.status(400).json({
        error: "speed_walk must be a finite number greater than or equal to 0",
      });
    }

    if (photo !== undefined && typeof photo !== "string") {
      return res.status(400).json({ error: "photo must be a string" });
    }

    const character = await characterModule.createCharacter(pb, {
      campaign_id,
      name,
      player,
      hp_current,
      hp_max,
      hp_temp,
      ability_scores,
      turn_state,
      death_state,
      armor_class,
      speed_walk,
      entity_type,
      visible_to_players,
      class_primary,
      conditions,
      resources,
      photo,
      background,
      species,
      languages,
      alignment,
      proficiencies,
      equipment,
    });

    broadcast("character_created", { character });
    return res.status(201).json(character);
  });

  // Clamp HP changes within bounds and broadcast the update so overlays can redraw.
  app.put("/api/characters/:id/hp", async (req, res) => {
    const charId = req.params.id;
    const { hp_current } = req.body;
    if (
      hp_current === undefined ||
      typeof hp_current !== "number" ||
      !Number.isFinite(hp_current)
    ) {
      return res
        .status(400)
        .json({ error: "hp_current must be a finite number" });
    }
    let character;
    try {
      character = await characterModule.updateHp(pb, charId, hp_current);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }
    if (!character) return res.status(404).json({ error: "Character not found" });
    broadcast("hp_updated", { character, hp_current: character.hp_current });
    return res.status(200).json(character);
  });

  // Update a character photo and broadcast changes to all clients.
  app.put("/api/characters/:id/photo", async (req, res) => {
    const { photo } = req.body;

    if (photo !== undefined && typeof photo !== "string") {
      return res.status(400).json({ error: "photo must be a string" });
    }

    if (typeof photo === "string" && photo.length > 2000000) {
      return res.status(413).json({ error: "photo payload is too large" });
    }

    let character;
    try {
      character = await characterModule.updatePhoto(pb, req.params.id, photo);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }

    broadcast("character_updated", { character });
    return res.status(200).json(character);
  });

  // Update editable character fieldsand broadcast changes to all clients.
  app.put("/api/characters/:id", async (req, res) => {
    const updates = {};
    const isPlainObject = (value) =>
      value !== null && typeof value === "object" && !Array.isArray(value);

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || req.body.name.trim() === "") {
        return res
          .status(400)
          .json({ error: "name must be a non-empty string" });
      }
      updates.name = req.body.name;
    }

    if (req.body.player !== undefined) {
      if (
        typeof req.body.player !== "string" ||
        req.body.player.trim() === ""
      ) {
        return res
          .status(400)
          .json({ error: "player must be a non-empty string" });
      }
      updates.player = req.body.player;
    }

    if (req.body.hp_max !== undefined) {
      if (
        typeof req.body.hp_max !== "number" ||
        !Number.isFinite(req.body.hp_max) ||
        req.body.hp_max <= 0
      ) {
        return res
          .status(400)
          .json({ error: "hp_max must be a positive finite number" });
      }
      updates.hp_max = req.body.hp_max;
    }

    if (req.body.hp_current !== undefined) {
      if (
        typeof req.body.hp_current !== "number" ||
        !Number.isFinite(req.body.hp_current) ||
        req.body.hp_current < 0
      ) {
        return res.status(400).json({
          error:
            "hp_current must be a finite number greater than or equal to 0",
        });
      }
      updates.hp_current = req.body.hp_current;
    }

    if (req.body.armor_class !== undefined) {
      if (
        typeof req.body.armor_class !== "number" ||
        !Number.isFinite(req.body.armor_class) ||
        req.body.armor_class < 0
      ) {
        return res.status(400).json({
          error:
            "armor_class must be a finite number greater than or equal to 0",
        });
      }
      updates.armor_class = req.body.armor_class;
    }

    if (req.body.speed_walk !== undefined) {
      if (
        typeof req.body.speed_walk !== "number" ||
        !Number.isFinite(req.body.speed_walk) ||
        req.body.speed_walk < 0
      ) {
        return res.status(400).json({
          error:
            "speed_walk must be a finite number greater than or equal to 0",
        });
      }
      updates.speed_walk = req.body.speed_walk;
    }

    if (req.body.class_primary !== undefined) {
      if (!isPlainObject(req.body.class_primary)) {
        return res
          .status(400)
          .json({ error: "class_primary must be an object" });
      }
      updates.class_primary = req.body.class_primary;
    }

    if (req.body.background !== undefined) {
      if (!isPlainObject(req.body.background)) {
        return res.status(400).json({ error: "background must be an object" });
      }
      updates.background = req.body.background;
    }

    if (req.body.species !== undefined) {
      if (!isPlainObject(req.body.species)) {
        return res.status(400).json({ error: "species must be an object" });
      }
      updates.species = req.body.species;
    }

    if (req.body.languages !== undefined) {
      if (!Array.isArray(req.body.languages)) {
        return res.status(400).json({ error: "languages must be an array" });
      }
      updates.languages = req.body.languages;
    }

    if (req.body.alignment !== undefined) {
      if (typeof req.body.alignment !== "string") {
        return res.status(400).json({ error: "alignment must be a string" });
      }
      updates.alignment = req.body.alignment;
    }

    if (req.body.proficiencies !== undefined) {
      if (!isPlainObject(req.body.proficiencies)) {
        return res
          .status(400)
          .json({ error: "proficiencies must be an object" });
      }
      updates.proficiencies = req.body.proficiencies;
    }

    if (req.body.equipment !== undefined) {
      if (!isPlainObject(req.body.equipment)) {
        return res.status(400).json({ error: "equipment must be an object" });
      }
      updates.equipment = req.body.equipment;
    }

    let character;
    try {
      character = await characterModule.updateCharacterData(pb, req.params.id, updates);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }

    broadcast("character_updated", { character });
    return res.status(200).json(character);
  });

  // ── Conditions ───────────────────────────────────────────────

  // Manage status conditions and keep every client aware of additions and removals.
  const SHORT_ID_RE = /^[A-Z0-9]{5}$/i;

  app.post("/api/characters/:id/conditions", async (req, res) => {
    const { condition_name, intensity_level } = req.body;
    if (typeof condition_name !== "string" || condition_name.trim() === "")
      return res
        .status(400)
        .json({ error: "condition_name must be a non-empty string" });
    if (
      intensity_level !== undefined &&
      (typeof intensity_level !== "number" || intensity_level <= 0)
    )
      return res
        .status(400)
        .json({ error: "intensity_level must be a positive number" });
    let character;
    try {
      character = await characterModule.addCondition(pb, req.params.id, {
        condition_name,
        intensity_level,
      });
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }
    const condition = character.conditions[character.conditions.length - 1];
    broadcast("condition_added", { charId: req.params.id, condition });
    console.log(`Condition added: ${condition_name} → ${req.params.id}`);
    return res.status(201).json(condition);
  });

  app.delete("/api/characters/:id/conditions/:condId", async (req, res) => {
    if (!SHORT_ID_RE.test(req.params.condId))
      return res.status(400).json({ error: "condId must be 5 chars" });
    try {
      await characterModule.removeCondition(pb, req.params.id, req.params.condId);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character or condition not found" });
      throw err;
    }
    broadcast("condition_removed", {
      charId: req.params.id,
      conditionId: req.params.condId,
    });
    console.log(
      `Condition removed: ${req.params.condId} from ${req.params.id}`,
    );
    return res.status(200).json({ ok: true });
  });

  // Delete a character permanently and broadcast the removal to all clients.
  app.delete("/api/characters/:id", async (req, res) => {
    try {
      await characterModule.removeCharacter(pb, req.params.id);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }
    broadcast("character_deleted", { charId: req.params.id });
    console.log(`Character deleted: ${req.params.id}`);
    return res.status(200).json({ ok: true });
  });

  // ── Resources ────────────────────────────────────────────────

  // Update limited resources (rage, ki, etc.) and broadcast the refreshed pool.
  app.put("/api/characters/:id/resources/:rid", async (req, res) => {
    const { pool_current } = req.body;
    if (pool_current === undefined || pool_current === null)
      return res.status(400).json({ error: "pool_current required" });
    if (typeof pool_current !== "number" || !Number.isFinite(pool_current))
      return res.status(400).json({ error: "pool_current must be a number" });
    if (pool_current < 0)
      return res.status(400).json({ error: "pool_current must be >= 0" });
    let resource;
    try {
      resource = await characterModule.updateResource(
        pb,
        req.params.id,
        req.params.rid,
        pool_current,
      );
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character or resource not found" });
      throw err;
    }
    broadcast("resource_updated", { charId: req.params.id, resource });
    return res.status(200).json(resource);
  });

  // ── Rest ────────────────────────────────────────────────────

  // Handle short/long rests to refill resource pools and broadcast atomic updates.
  app.post("/api/characters/:id/rest", async (req, res) => {
    const { type } = req.body;
    if (!["short", "long"].includes(type)) {
      return res.status(400).json({ error: 'type must be "short" or "long"' });
    }
    let result;
    try {
      result = await characterModule.restoreResources(pb, req.params.id, type);
    } catch (err) {
      if (err?.status === 404) return res.status(404).json({ error: "Character not found" });
      throw err;
    }
    broadcast("rest_taken", {
      charId: req.params.id,
      type,
      restored: result.restored,
      character: result.character,
    });
    console.log(
      `Rest taken: ${type} → ${req.params.id}, restored: ${result.restored.join(", ")}`,
    );
    return res.status(200).json({ restored: result.restored });
  });

  // ── Transaction ─────────────────────────────────────────────────────────────

  // Atomic bulk HP update (e.g. AOE damage to the whole party).
  // Body: { updates: [{ charId, hp_current }] }
  app.post("/api/characters/batch/hp", async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0)
      return res.status(400).json({ error: "updates must be a non-empty array" });

    const results = [];
    const errors = [];

    await Promise.all(
      updates.map(async ({ charId, hp_current }) => {
        if (charId == null || charId === "") {
          errors.push({ charId, error: "charId required" });
          return;
        }
        if (typeof hp_current !== "number" || !Number.isFinite(hp_current)) {
          errors.push({ charId, error: "hp_current must be a finite number" });
          return;
        }
        try {
          const character = await characterModule.updateHp(pb, charId, hp_current);
          if (character) {
            results.push(character);
            broadcast("hp_updated", { character, hp_current: character.hp_current });
          } else {
            errors.push({ charId, error: "Character not found" });
          }
        } catch (err) {
          errors.push({ charId, error: err?.message || "Unknown error" });
        }
      })
    );

    return res.status(errors.length && !results.length ? 400 : 200).json({ results, errors });
  });

  // ── Encounter ──────────────────────────────────────────────────────────────

  app.get("/api/encounter", (req, res) => res.json(encounterState));

  // Start a new encounter. Body: { participants: [{ charId, initiative }] }
  app.post("/api/encounter/start", async (req, res) => {
    const { participants } = req.body;
    if (!Array.isArray(participants) || participants.length === 0)
      return res.status(400).json({ error: "participants must be a non-empty array" });

    const chars = await characterModule.getAll(pb);
    const charMap = Object.fromEntries(chars.map((c) => [c.id, c]));
    const sorted = participants
      .filter((p) => charMap[p.charId])
      .map((p) => ({
        charId: p.charId,
        name: charMap[p.charId].name,
        photo: charMap[p.charId].photo || null,
        class_primary: charMap[p.charId].class_primary || null,
        hp_current: charMap[p.charId].hp_current,
        hp_max: charMap[p.charId].hp_max,
        initiative: Number(p.initiative) || 0,
      }))
      .sort((a, b) => b.initiative - a.initiative);

    if (sorted.length === 0)
      return res.status(400).json({ error: "No valid participants found" });

    encounterState = { active: true, round: 1, currentTurnIndex: 0, participants: sorted };
    broadcast("encounter_started", encounterState);
    return res.status(200).json(encounterState);
  });

  // Advance to the next turn (wraps round on overflow).
  app.post("/api/encounter/next-turn", (req, res) => {
    if (!encounterState.active)
      return res.status(400).json({ error: "No active encounter" });

    let next = encounterState.currentTurnIndex + 1;
    let round = encounterState.round;
    if (next >= encounterState.participants.length) {
      next = 0;
      round += 1;
    }
    encounterState = { ...encounterState, currentTurnIndex: next, round };
    broadcast("turn_advanced", {
      currentTurnIndex: encounterState.currentTurnIndex,
      currentParticipant: encounterState.participants[encounterState.currentTurnIndex],
      round: encounterState.round,
    });
    return res.status(200).json(encounterState);
  });

  // End the current encounter.
  app.post("/api/encounter/end", (req, res) => {
    encounterState = { active: false, round: 0, currentTurnIndex: 0, participants: [] };
    broadcast("encounter_ended", {});
    return res.status(200).json({ ok: true });
  });

  // ── Scene ───────────────────────────────────────────────────────────────────

  app.get("/api/scene", (req, res) => res.json(sceneState));

  // Body: { title, subtitle?, visible? }
  app.post("/api/scene/change", (req, res) => {
    const { title, subtitle = "", visible = true } = req.body;
    if (typeof title !== "string" || title.trim() === "")
      return res.status(400).json({ error: "title must be a non-empty string" });
    sceneState = { title, subtitle, visible };
    broadcast("scene_changed", sceneState);
    return res.status(200).json(sceneState);
  });

  // ── Character Focus ─────────────────────────────────────────────────────────

  // Body: { charId } — pass null/empty string to unfocus.
  app.post("/api/character-focus", async (req, res) => {
    const { charId } = req.body;
    if (charId == null) return res.status(400).json({ error: "charId required" });

    if (charId === "") {
      focusedChar = null;
      broadcast("character_unfocused", {});
      return res.status(200).json({ focused: null });
    }

    const char = await characterModule.findById(pb, charId);
    if (!char) return res.status(404).json({ error: "Character not found" });

    focusedChar = char;
    broadcast("character_focused", { character: char });
    return res.status(200).json({ focused: char });
  });

  // ── Sync Start ──────────────────────────────────────────────────────────────

  // Mark the recording start point — sets SYNC_START timestamp anchor for sidecar log.
  app.post("/api/sync-start", (req, res) => {
    syncStartTime = Date.now();
    logEvent("SYNC_START", { ts_abs: syncStartTime });
    io.emit("sync_start", { ts_abs: syncStartTime });
    return res.status(200).json({ ts_abs: syncStartTime });
  });

  // ── Overlay Broadcast Events ─────────────────────────────────

  app.post("/api/announce", (req, res) => {
    const { type, title, body, image, duration } = req.body;
    if (!type || !title) return res.status(400).json({ error: "type and title are required" });
    broadcast("announce", { type, title, body: body ?? null, image: image ?? null, duration: duration ?? null });
    return res.status(200).json({ ok: true });
  });

  app.post("/api/level-up", async (req, res) => {
    const { charId, newLevel, className } = req.body;
    if (!charId || !newLevel) return res.status(400).json({ error: "charId and newLevel required" });
    broadcast("level_up", { charId, newLevel, className: className ?? "" });
    return res.status(200).json({ ok: true });
  });

  app.post("/api/player-down", (req, res) => {
    const { charId, isDead } = req.body;
    if (!charId) return res.status(400).json({ error: "charId required" });
    broadcast("player_down", { charId, isDead: isDead === true });
    return res.status(200).json({ ok: true });
  });

  app.post("/api/lower-third", (req, res) => {
    const { characterName, playerName, duration } = req.body;
    if (!characterName) return res.status(400).json({ error: "characterName required" });
    broadcast("lower_third", { characterName, playerName: playerName ?? "", duration: duration ?? 5000 });
    return res.status(200).json({ ok: true });
  });

  // ── Rolls ────────────────────────────────────────────────────

  // Record dice rolls and emit the results so the overlays can animate them.
  const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);
  app.post("/api/rolls", async (req, res) => {
    const { charId, result, sides } = req.body;
    if (charId == null || charId === "")
      return res.status(400).json({ error: "charId required" });
    if (!isFiniteNumber(result))
      return res.status(400).json({ error: "result must be a finite number" });
    if (!isFiniteNumber(sides) || sides < 1)
      return res.status(400).json({ error: "sides must be a positive number" });
    const modifier = req.body.modifier ?? 0;
    const characterName =
      (await characterModule.getCharacterName(pb, req.body.charId)) ||
      "Unknown";

    const rollRecord = await rollsModule.logRoll(pb, {
      charId,
      characterName,
      result,
      modifier,
      sides,
    });
    broadcast("dice_rolled", {
      ...rollRecord,
    });
    console.log("Roll received:", characterName, req.body);
    return res.status(201).json(rollRecord);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
