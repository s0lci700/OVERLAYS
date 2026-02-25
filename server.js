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

// Returns the server's LAN IP and port so the landing page (public/index.html)
// can dynamically render correct URLs for OBS setup and the control panel.
app.get("/api/info", (req, res) => {
  res.json({ ip: getMainIP(), port: PORT });
});

// ── Characters ──────────────────────────────────────────────

// Return the full character roster, including HP, resources, and conditions.
app.get("/api/characters", (req, res) => {
  res.status(200).json(characterModule.getAll());
});

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
