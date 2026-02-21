/**
 * Minimal Express + Socket.io backend that drives the control panel and OBS overlays.
 * All state lives in memory for this pitch demo, so restarting the server resets the data.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = http.createServer(app);
// Configure via .env: PORT (default 3000) and CONTROL_PANEL_ORIGIN (default http://localhost:5173).
const PORT = parseInt(process.env.PORT || "3000", 10);
const CONTROL_PANEL_ORIGIN = process.env.CONTROL_PANEL_ORIGIN || "http://localhost:5173";
const characterModule = require("./data/characters");
const rollsModule = require("./data/rolls");

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
});

// Parse JSON payloads from the control panel and allow requests from any origin.
app.use(cors({ origin: "*" }));
app.use(express.json());

// Landing
// Simple health check used during the demo to verify the API is reachable.
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

// ── Characters ──────────────────────────────────────────────

// Return the full character roster, including HP, resources, and conditions.
app.get("/api/characters", (req, res) => {
  res.status(200).json(characterModule.getAll());
});

// Clamp HP changes within bounds and broadcast the update so overlays can redraw.
app.put("/api/characters/:id/hp", (req, res) => {
  const charId = req.params.id;
  const { hp_current } = req.body;
  if (hp_current === undefined || typeof hp_current !== "number" || !Number.isFinite(hp_current)) {
    return res.status(400).json({ error: "hp_current must be a finite number" });
  }
  const character = characterModule.updateHp(charId, hp_current);
  if (!character) return res.status(404).json({ error: "Character not found" });
  io.emit("hp_updated", { character, hp_current: character.hp_current });
  return res.status(200).json(character);
});

// ── Conditions ───────────────────────────────────────────────

// Manage status conditions and keep every client aware of additions and removals.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!UUID_RE.test(req.params.condId))
    return res.status(400).json({ error: "condId must be a valid UUID" });
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

// ── Resources ────────────────────────────────────────────────

// Update limited resources (rage, ki, etc.) and broadcast the refreshed pool.
app.put("/api/characters/:id/resources/:rid", (req, res) => {
  const { pool_current } = req.body;
  if (pool_current === undefined)
    return res.status(400).json({ error: "pool_current required" });
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
