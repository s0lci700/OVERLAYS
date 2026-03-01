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
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const httpServer = http.createServer(app);
// Configure via .env: PORT (default 3000) and CONTROL_PANEL_ORIGIN (default http://localhost:5173).
const PORT = parseInt(process.env.PORT || "3000", 10);
const CONTROL_PANEL_ORIGIN =
  process.env.CONTROL_PANEL_ORIGIN || "http://localhost:5173";
const characterModule = require("./data/characters");
const rollsModule = require("./data/rolls");

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

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dados & Risas API",
      version: "1.0.0",
      description:
        "REST API for the real-time D&D session management system. All mutations are broadcast via Socket.io to all connected clients.",
      contact: { name: "GitHub", url: "https://github.com/s0lci700/OVERLAYS" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
    ],
    tags: [
      { name: "Characters", description: "Character roster CRUD" },
      { name: "Conditions", description: "Status condition management" },
      { name: "Resources", description: "Limited resource pools" },
      { name: "Rest", description: "Short/long rest mechanics" },
      { name: "Rolls", description: "Dice roll log" },
      { name: "System", description: "Server info and design tokens" },
    ],
    components: {
      schemas: {
        ClassPrimary: {
          type: "object",
          properties: {
            name: { type: "string", example: "Barbarian" },
            level: { type: "integer", example: 5 },
            subclass: { type: "string", example: "Berserker" },
          },
        },
        Background: {
          type: "object",
          properties: {
            name: { type: "string" },
            feat: { type: "string" },
            skill_proficiencies: { type: "array", items: { type: "string" } },
            tool_proficiency: { type: "string" },
          },
        },
        Species: {
          type: "object",
          properties: {
            name: { type: "string" },
            size: { type: "string" },
            speed_walk: { type: "integer" },
            traits: { type: "array", items: { type: "string" } },
          },
        },
        AbilityScores: {
          type: "object",
          properties: {
            str: { type: "integer", default: 10 },
            dex: { type: "integer", default: 10 },
            con: { type: "integer", default: 10 },
            int: { type: "integer", default: 10 },
            wis: { type: "integer", default: 10 },
            cha: { type: "integer", default: 10 },
          },
        },
        Condition: {
          type: "object",
          properties: {
            id: { type: "string", example: "AB12C", description: "5-char alphanumeric" },
            condition_name: { type: "string", example: "Frightened" },
            intensity_level: { type: "integer", default: 1, minimum: 1 },
            applied_at: { type: "string", format: "date-time" },
          },
          required: ["id", "condition_name"],
        },
        Resource: {
          type: "object",
          properties: {
            id: { type: "string", example: "R1A2B" },
            name: { type: "string", example: "Rage" },
            pool_max: { type: "integer", example: 3 },
            pool_current: { type: "integer", example: 2 },
            recharge: {
              type: "string",
              enum: ["SHORT_REST", "LONG_REST", "TURN", "DM"],
            },
          },
          required: ["id", "name", "pool_max", "pool_current", "recharge"],
        },
        Character: {
          type: "object",
          properties: {
            id: { type: "string", example: "CH101" },
            name: { type: "string", example: "Thorin Ironforge" },
            player: { type: "string", example: "Alice" },
            hp_current: { type: "integer", example: 30 },
            hp_max: { type: "integer", example: 45 },
            hp_temp: { type: "integer", default: 0 },
            armor_class: { type: "integer", example: 16 },
            speed_walk: { type: "integer", example: 25 },
            class_primary: { $ref: "#/components/schemas/ClassPrimary" },
            background: { $ref: "#/components/schemas/Background" },
            species: { $ref: "#/components/schemas/Species" },
            languages: { type: "array", items: { type: "string" } },
            alignment: { type: "string", example: "Neutral Good" },
            ability_scores: { $ref: "#/components/schemas/AbilityScores" },
            conditions: {
              type: "array",
              items: { $ref: "#/components/schemas/Condition" },
            },
            resources: {
              type: "array",
              items: { $ref: "#/components/schemas/Resource" },
            },
            photo: { type: "string", description: "URL or base64 data URI" },
          },
          required: ["id", "name", "player", "hp_current", "hp_max"],
        },
        RollRecord: {
          type: "object",
          properties: {
            id: { type: "string", example: "R9XY1" },
            charId: { type: "string", example: "CH101" },
            characterName: { type: "string", example: "Thorin Ironforge" },
            result: { type: "integer", example: 18, description: "Raw die face result" },
            modifier: { type: "integer", example: 3 },
            rollResult: { type: "integer", example: 21, description: "result + modifier" },
            sides: { type: "integer", example: 20 },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
          required: ["error"],
        },
      },
    },
  },
  apis: ["./server.js"],
});

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

// Allow the Svelte control panel and OBS overlay browser sources to connect from different ports.
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Emit the latest characters and rolls snapshot to every client that connects.
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  socket.emit("initialData", {
    characters: characterModule.getAll(),
    rolls: rollsModule.getAll(),
  });
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

// Parse JSON payloads from the control panel and allow requests from any origin.
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Serve the OBS overlays and landing page over the network.
// OBS Browser Sources can now use http://IP:3000/overlay-hp.html instead of a local file path,
// making the demo work on any machine on the LAN without file system access.
app.use(express.static(path.join(__dirname, "public")));

// Interactive OpenAPI docs (Swagger UI) and raw JSON spec.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Dados & Risas — API Docs",
}));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     tags: [System]
 *     summary: Server LAN info
 *     description: Returns the server's local IP, port, and control-panel URL so the landing page can build correct OBS URLs.
 *     responses:
 *       200:
 *         description: Server info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ip:   { type: string, example: "192.168.1.83" }
 *                 port: { type: integer, example: 3000 }
 *                 controlPanelUrl: { type: string, example: "http://192.168.1.83:5173" }
 */
// Returns the server's LAN IP and port so the landing page (public/index.html)
// can dynamically render correct URLs for OBS setup and the control panel.
app.get("/api/info", (req, res) => {
  res.json({ ip: getMainIP(), port: PORT, controlPanelUrl: CONTROL_PANEL_ORIGIN });
});

/**
 * @swagger
 * /api/tokens:
 *   get:
 *     tags: [System]
 *     summary: Design tokens
 *     description: Returns the canonical `design/tokens.json` (CSS variable source of truth). Consumed by the live theme editor.
 *     responses:
 *       200:
 *         description: Token map object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Token file not readable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
      .json({ error: "Could not read design tokens.", details: err.message });
  }
});

// ── Characters ──────────────────────────────────────────────

/**
 * @swagger
 * /api/characters:
 *   get:
 *     tags: [Characters]
 *     summary: List all characters
 *     description: Returns the full in-memory roster including HP, conditions, and resources.
 *     responses:
 *       200:
 *         description: Array of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Character' }
 */
// Return the full character roster, including HP, resources, and conditions.
app.get("/api/characters", (req, res) => {
  res.status(200).json(characterModule.getAll());
});

/**
 * @swagger
 * /api/characters:
 *   post:
 *     tags: [Characters]
 *     summary: Create a character
 *     description: Creates a new character, assigns a short ID and a fallback photo, then broadcasts `character_created` via Socket.io.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, player, hp_max]
 *             properties:
 *               name:         { type: string, example: "Thorin Ironforge" }
 *               player:       { type: string, example: "Alice" }
 *               hp_max:       { type: integer, example: 45 }
 *               hp_current:   { type: integer, example: 45, description: "Defaults to hp_max" }
 *               armor_class:  { type: integer, example: 16, default: 10 }
 *               speed_walk:   { type: integer, example: 25, default: 30 }
 *               photo:        { type: string, description: "URL or base64 data URI" }
 *               class_primary:
 *                 $ref: '#/components/schemas/ClassPrimary'
 *               background:
 *                 $ref: '#/components/schemas/Background'
 *               species:
 *                 $ref: '#/components/schemas/Species'
 *               languages:    { type: array, items: { type: string } }
 *               alignment:    { type: string, example: "Neutral Good" }
 *     responses:
 *       201:
 *         description: Created character
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Character' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Create a new character and broadcast so all connected clients can append it.
app.post("/api/characters", (req, res) => {
  const {
    name,
    player,
    hp_max,
    hp_current,
    armor_class,
    speed_walk,
    photo,
    class_primary,
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
    return res.status(400).json({ error: "player must be a non-empty string" });
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

  const character = characterModule.createCharacter({
    name: name.trim(),
    player: player.trim(),
    hp_max,
    hp_current,
    armor_class,
    speed_walk,
    photo,
    class_primary,
    background,
    species,
    languages,
    alignment,
    proficiencies,
    equipment,
  });

  io.emit("character_created", { character });
  return res.status(201).json(character);
});

/**
 * @swagger
 * /api/characters/{id}/hp:
 *   put:
 *     tags: [Characters]
 *     summary: Update HP
 *     description: Sets `hp_current` clamped to `[0, hp_max]`. Broadcasts `hp_updated`. Used by the HP bars in OBS overlays.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Character ID (e.g. "CH101")
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hp_current]
 *             properties:
 *               hp_current: { type: integer, example: 30 }
 *     responses:
 *       200:
 *         description: Updated character
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Character' }
 *       400:
 *         description: Invalid hp_current
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Clamp HP changes within bounds and broadcast the update so overlays can redraw.
app.put("/api/characters/:id/hp", (req, res) => {
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
  const character = characterModule.updateHp(charId, hp_current);
  if (!character) return res.status(404).json({ error: "Character not found" });
  io.emit("hp_updated", { character, hp_current: character.hp_current });
  return res.status(200).json(character);
});

/**
 * @swagger
 * /api/characters/{id}/photo:
 *   put:
 *     tags: [Characters]
 *     summary: Update character photo
 *     description: Replaces the character photo with a URL or base64 data URI (max 2 MB). Broadcasts `character_updated`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, description: "URL or base64 data URI ≤ 2 MB" }
 *     responses:
 *       200:
 *         description: Updated character
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Character' }
 *       400:
 *         description: photo must be a string
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       413:
 *         description: Photo payload too large (> 2 MB)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Update a character photo and broadcast changes to all clients.
app.put("/api/characters/:id/photo", (req, res) => {
  const { photo } = req.body;

  if (photo !== undefined && typeof photo !== "string") {
    return res.status(400).json({ error: "photo must be a string" });
  }

  if (typeof photo === "string" && photo.length > 2000000) {
    return res.status(413).json({ error: "photo payload is too large" });
  }

  const character = characterModule.updatePhoto(req.params.id, photo);
  if (!character) return res.status(404).json({ error: "Character not found" });

  io.emit("character_updated", { character });
  return res.status(200).json(character);
});

/**
 * @swagger
 * /api/characters/{id}:
 *   put:
 *     tags: [Characters]
 *     summary: Update character fields
 *     description: Partial update of any editable character fields. Broadcasts `character_updated`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:         { type: string }
 *               player:       { type: string }
 *               hp_max:       { type: integer }
 *               hp_current:   { type: integer }
 *               armor_class:  { type: integer }
 *               speed_walk:   { type: integer }
 *               alignment:    { type: string }
 *               languages:    { type: array, items: { type: string } }
 *               class_primary:  { $ref: '#/components/schemas/ClassPrimary' }
 *               background:     { $ref: '#/components/schemas/Background' }
 *               species:        { $ref: '#/components/schemas/Species' }
 *     responses:
 *       200:
 *         description: Updated character
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Character' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Characters]
 *     summary: Delete a character
 *     description: Permanently removes the character from the in-memory store. Broadcasts `character_deleted`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Update editable character fields and broadcast changes to all clients.
app.put("/api/characters/:id", (req, res) => {
  const updates = {};
  const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string" || req.body.name.trim() === "") {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
    updates.name = req.body.name;
  }

  if (req.body.player !== undefined) {
    if (typeof req.body.player !== "string" || req.body.player.trim() === "") {
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
        error: "hp_current must be a finite number greater than or equal to 0",
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
        error: "armor_class must be a finite number greater than or equal to 0",
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
        error: "speed_walk must be a finite number greater than or equal to 0",
      });
    }
    updates.speed_walk = req.body.speed_walk;
  }

  if (req.body.class_primary !== undefined) {
    if (!isPlainObject(req.body.class_primary)) {
      return res.status(400).json({ error: "class_primary must be an object" });
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
      return res.status(400).json({ error: "proficiencies must be an object" });
    }
    updates.proficiencies = req.body.proficiencies;
  }

  if (req.body.equipment !== undefined) {
    if (!isPlainObject(req.body.equipment)) {
      return res.status(400).json({ error: "equipment must be an object" });
    }
    updates.equipment = req.body.equipment;
  }

  const character = characterModule.updateCharacterData(req.params.id, updates);
  if (!character) return res.status(404).json({ error: "Character not found" });

  io.emit("character_updated", { character });
  return res.status(200).json(character);
});

// ── Conditions ───────────────────────────────────────────────

/**
 * @swagger
 * /api/characters/{id}/conditions:
 *   post:
 *     tags: [Conditions]
 *     summary: Add a condition
 *     description: Appends a status condition with a unique 5-char ID. Broadcasts `condition_added`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [condition_name]
 *             properties:
 *               condition_name:  { type: string, example: "Frightened" }
 *               intensity_level: { type: integer, default: 1, minimum: 1 }
 *     responses:
 *       201:
 *         description: Created condition
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Condition' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 * /api/characters/{id}/conditions/{condId}:
 *   delete:
 *     tags: [Conditions]
 *     summary: Remove a condition
 *     description: Removes the condition by its 5-char ID. Broadcasts `condition_removed`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Character ID
 *       - in: path
 *         name: condId
 *         required: true
 *         schema: { type: string, pattern: '^[A-Z0-9]{5}$' }
 *         description: Condition ID (5-char alphanumeric)
 *     responses:
 *       200:
 *         description: Removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *       400:
 *         description: Invalid condId format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character or condition not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Manage status conditions and keep every client aware of additions and removals.
const SHORT_ID_RE = /^[A-Z0-9]{5}$/i;

app.post("/api/characters/:id/conditions", (req, res) => {
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
  const character = characterModule.addCondition(req.params.id, {
    condition_name,
    intensity_level,
  });
  if (!character) return res.status(404).json({ error: "Character not found" });
  const condition = character.conditions[character.conditions.length - 1];
  io.emit("condition_added", { charId: req.params.id, condition });
  console.log(`Condition added: ${condition_name} → ${req.params.id}`);
  return res.status(201).json(condition);
});

app.delete("/api/characters/:id/conditions/:condId", (req, res) => {
  if (!SHORT_ID_RE.test(req.params.condId))
    return res.status(400).json({ error: "condId must be 5 chars" });
  const character = characterModule.removeCondition(
    req.params.id,
    req.params.condId,
  );
  if (!character)
    return res.status(404).json({ error: "Character or condition not found" });
  io.emit("condition_removed", {
    charId: req.params.id,
    conditionId: req.params.condId,
  });
  console.log(`Condition removed: ${req.params.condId} from ${req.params.id}`);
  return res.status(200).json({ ok: true });
});

// Delete a character permanently and broadcast the removal to all clients.
app.delete("/api/characters/:id", (req, res) => {
  const removed = characterModule.removeCharacter(req.params.id);
  if (!removed)
    return res.status(404).json({ error: "Character not found" });
  io.emit("character_deleted", { charId: req.params.id });
  console.log(`Character deleted: ${req.params.id}`);
  return res.status(200).json({ ok: true });
});

// ── Resources ────────────────────────────────────────────────

/**
 * @swagger
 * /api/characters/{id}/resources/{rid}:
 *   put:
 *     tags: [Resources]
 *     summary: Update a resource pool
 *     description: Sets `pool_current` (clamped to `[0, pool_max]`) for a limited-use resource such as Rage or Ki. Broadcasts `resource_updated`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Character ID
 *       - in: path
 *         name: rid
 *         required: true
 *         schema: { type: string }
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pool_current]
 *             properties:
 *               pool_current: { type: integer, minimum: 0, example: 2 }
 *     responses:
 *       200:
 *         description: Updated resource
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Resource' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character or resource not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Update limited resources (rage, ki, etc.) and broadcast the refreshed pool.
app.put("/api/characters/:id/resources/:rid", (req, res) => {
  const { pool_current } = req.body;
  if (pool_current === undefined || pool_current === null)
    return res.status(400).json({ error: "pool_current required" });
  if (typeof pool_current !== "number" || !Number.isFinite(pool_current))
    return res.status(400).json({ error: "pool_current must be a number" });
  if (pool_current < 0)
    return res.status(400).json({ error: "pool_current must be >= 0" });
  const resource = characterModule.updateResource(
    req.params.id,
    req.params.rid,
    pool_current,
  );
  if (!resource)
    return res.status(404).json({ error: "Character or resource not found" });
  io.emit("resource_updated", { charId: req.params.id, resource });
  return res.status(200).json(resource);
});

// ── Rest ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/characters/{id}/rest:
 *   post:
 *     tags: [Rest]
 *     summary: Take a rest
 *     description: |
 *       Refills resource pools based on rest type:
 *       - **short** — restores resources with `recharge: "SHORT_REST"`
 *       - **long** — restores resources with `recharge: "SHORT_REST"` or `"LONG_REST"`
 *
 *       Broadcasts `rest_taken` with the list of restored resource names.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [short, long]
 *                 example: short
 *     responses:
 *       200:
 *         description: Restored resource names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restored:
 *                   type: array
 *                   items: { type: string }
 *                   example: ["Rage", "Ki"]
 *       400:
 *         description: Invalid rest type
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Handle short/long rests to refill resource pools and broadcast atomic updates.
app.post("/api/characters/:id/rest", (req, res) => {
  const { type } = req.body;
  if (!["short", "long"].includes(type)) {
    return res.status(400).json({ error: 'type must be "short" or "long"' });
  }
  const result = characterModule.restoreResources(req.params.id, type);
  if (!result) return res.status(404).json({ error: "Character not found" });
  io.emit("rest_taken", {
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

// ── Rolls ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/rolls:
 *   post:
 *     tags: [Rolls]
 *     summary: Log a dice roll
 *     description: Stores a dice roll in the in-memory log and broadcasts `dice_rolled` so `overlay-dice.html` can animate the result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [charId, result, sides]
 *             properties:
 *               charId:   { type: string, example: "CH101", description: "Character ID performing the roll" }
 *               result:   { type: integer, example: 18, description: "Raw die face result (before modifier)" }
 *               sides:    { type: integer, minimum: 1, example: 20, description: "Die type (e.g. 20 for d20)" }
 *               modifier: { type: integer, example: 3, default: 0 }
 *     responses:
 *       201:
 *         description: Stored roll record
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RollRecord' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
// Record dice rolls and emit the results so the overlays can animate them.
const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);
app.post("/api/rolls", (req, res) => {
  const { charId, result, sides } = req.body;
  if (charId == null || charId === "")
    return res.status(400).json({ error: "charId required" });
  if (!isFiniteNumber(result))
    return res.status(400).json({ error: "result must be a finite number" });
  if (!isFiniteNumber(sides) || sides < 1)
    return res.status(400).json({ error: "sides must be a positive number" });
  const modifier = req.body.modifier ?? 0;
  const characterName =
    characterModule.getCharacterName(req.body.charId) || "Unknown";

  const rollRecord = rollsModule.logRoll({
    charId,
    characterName,
    result,
    modifier,
    sides,
  });
  io.emit("dice_rolled", {
    ...rollRecord,
  });
  console.log("Roll received:", characterName, req.body);
  return res.status(201).json(rollRecord);
});
