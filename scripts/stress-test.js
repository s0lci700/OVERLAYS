#!/usr/bin/env node
/**
 * Stress-test script for the D&D Overlay API.
 *
 * Exercises every endpoint (characters, HP, conditions, resources, rest,
 * dice rolls) against all 5 in-memory characters with configurable
 * concurrency and iteration counts, then prints a summary report.
 *
 * Usage:
 *   node scripts/stress-test.js [options]
 *
 * Options (all optional, defaults in brackets):
 *   --url   <base>    Server base URL            [http://localhost:3000]
 *   --rounds <n>      HP/roll repetitions per character [20]
 *   --concurrency <n> Max parallel requests in a batch  [5]
 *
 * No external npm packages required – only the built-in `http` / `https`
 * modules are used.
 */

"use strict";

const http = require("http");
const https = require("https");
const { URL } = require("url");

// ── CLI arg parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] !== undefined) return args[idx + 1];
  return defaultValue;
}

const BASE_URL = getArg("--url", process.env.SERVER_URL || "http://localhost:3000");

// Validate BASE_URL early so we get a clear error instead of a runtime crash.
try {
  new URL(BASE_URL);
} catch {
  console.error(`Invalid --url or SERVER_URL value: "${BASE_URL}"`);
  process.exit(1);
}

const ROUNDS_RAW = getArg("--rounds", "20");
const CONCURRENCY_RAW = getArg("--concurrency", "5");

function parsePositiveInt(flagName, rawValue) {
  const value = parseInt(rawValue, 10);
  if (!Number.isFinite(value) || value < 1) {
    console.error(
      `Invalid value for ${flagName}: "${rawValue}". Expected a positive integer >= 1.`
    );
    process.exit(1);
  }
  return value;
}

const ROUNDS = parsePositiveInt("--rounds", ROUNDS_RAW);
const CONCURRENCY = parsePositiveInt("--concurrency", CONCURRENCY_RAW);

// ── D&D 5e reference data ───────────────────────────────────────────────────

/** Standard D&D 5e conditions (SRD p. 290-295) */
const DND_CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhaustion",
];

/** Die sizes used in 5e */
const DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];

// ── HTTP helper ─────────────────────────────────────────────────────────────

/**
 * Minimal promise-based HTTP request (no fetch / axios needed).
 * @param {"GET"|"PUT"|"POST"|"DELETE"} method
 * @param {string} path
 * @param {object|null} body
 * @returns {Promise<{status: number, body: any, ms: number}>}
 */
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const lib = url.protocol === "https:" ? https : http;
    const payload = body !== null ? JSON.stringify(body) : null;
    const start = Date.now();

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    };

    const req = lib.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        const ms = Date.now() - start;
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({ status: res.statusCode, body: parsed, ms });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Stats tracker ───────────────────────────────────────────────────────────

class Stats {
  constructor(label) {
    this.label = label;
    this.pass = 0;
    this.fail = 0;
    this.times = [];
  }

  record(ok, ms) {
    if (ok) this.pass++;
    else this.fail++;
    this.times.push(ms);
  }

  /** Accumulate another Stats object's results into this one. */
  merge(other) {
    this.pass += other.pass;
    this.fail += other.fail;
    this.times.push(...other.times);
  }

  get total() {
    return this.pass + this.fail;
  }
  get avgMs() {
    return this.times.length
      ? Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length)
      : 0;
  }
  get minMs() {
    return this.times.length ? Math.min(...this.times) : 0;
  }
  get maxMs() {
    return this.times.length ? Math.max(...this.times) : 0;
  }
}

// ── Batch executor ──────────────────────────────────────────────────────────

/**
 * Run `tasks` (array of async functions) with at most `limit` in-flight at
 * once.  Returns an array of { ok, ms } objects in the same order.
 */
async function runBatch(tasks, limit) {
  const results = new Array(tasks.length);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      const start = Date.now();
      try {
        const res = await tasks[i]();
        results[i] = { ok: res.status >= 200 && res.status < 300, ms: res.ms, status: res.status };
      } catch (err) {
        results[i] = { ok: false, ms: Date.now() - start, error: err.message };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Utility ─────────────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Test phases ─────────────────────────────────────────────────────────────

async function phase_getCharacters(stats) {
  process.stdout.write("  GET /api/characters … ");
  const res = await request("GET", "/api/characters");
  const ok = res.status === 200 && Array.isArray(res.body) && res.body.length >= 5;
  stats.record(ok, res.ms);
  if (!ok) {
    console.log(`FAIL (status ${res.status}, count ${Array.isArray(res.body) ? res.body.length : "?"})`);
    return null;
  }
  console.log(`OK  (${res.body.length} characters, ${res.ms} ms)`);
  return res.body;
}

async function phase_hpUpdates(characters, stats) {
  console.log(`\n  HP updates – ${ROUNDS} rounds × ${characters.length} characters`);
  const tasks = [];
  for (let r = 0; r < ROUNDS; r++) {
    for (const char of characters) {
      const hp = randInt(1, char.hp_max);
      tasks.push(() => request("PUT", `/api/characters/${char.id}/hp`, { hp_current: hp }));
    }
  }
  const results = await runBatch(tasks, CONCURRENCY);
  results.forEach(({ ok, ms }) => stats.record(ok, ms));
  const pass = results.filter((r) => r.ok).length;
  console.log(`  → ${pass}/${results.length} passed`);
}

async function phase_hpEdgeCases(characters, stats) {
  console.log("\n  HP edge-cases (clamp: over-max, zero, negative)");
  const edgeCases = [
    { hp_current: 9999 },   // should clamp to hp_max
    { hp_current: 0 },      // valid – knocked out
    { hp_current: -10 },    // should clamp to 0
    { hp_current: 1 },      // valid
    { hp_current: 0.5 },    // fractional – finite number, accepted and clamped to valid range
  ];
  const tasks = [];
  for (const char of characters) {
    for (const body of edgeCases) {
      tasks.push(() => request("PUT", `/api/characters/${char.id}/hp`, body));
    }
  }
  const results = await runBatch(tasks, CONCURRENCY);
  // All should succeed (2xx) because the server clamps values
  results.forEach(({ ok, ms }) => stats.record(ok, ms));
  const pass = results.filter((r) => r.ok).length;
  console.log(`  → ${pass}/${results.length} passed`);
}

async function phase_conditions(characters, stats) {
  console.log("\n  Conditions – add & remove on every character");
  const addedConditions = {}; // charId → conditionId[]

  // Add 3 random conditions per character
  const addTasks = [];
  for (const char of characters) {
    addedConditions[char.id] = [];
    const picked = new Set();
    while (picked.size < 3) picked.add(rand(DND_CONDITIONS));
    for (const cname of picked) {
      addTasks.push(async () => {
        const res = await request("POST", `/api/characters/${char.id}/conditions`, {
          condition_name: cname,
          intensity_level: randInt(1, 3),
        });
        if (res.status === 201 && res.body && res.body.id) {
          addedConditions[char.id].push(res.body.id);
        }
        return res;
      });
    }
  }
  const addResults = await runBatch(addTasks, CONCURRENCY);
  addResults.forEach(({ ok, ms }) => stats.record(ok, ms));
  console.log(`  → added: ${addResults.filter((r) => r.ok).length}/${addResults.length} passed`);

  // Remove all added conditions
  const delTasks = [];
  for (const char of characters) {
    for (const condId of addedConditions[char.id]) {
      delTasks.push(() =>
        request("DELETE", `/api/characters/${char.id}/conditions/${condId}`),
      );
    }
  }
  if (delTasks.length > 0) {
    const delResults = await runBatch(delTasks, CONCURRENCY);
    delResults.forEach(({ ok, ms }) => stats.record(ok, ms));
    console.log(`  → removed: ${delResults.filter((r) => r.ok).length}/${delResults.length} passed`);
  }
}

async function phase_resources(characters, stats) {
  console.log("\n  Resources – spend and recover each pool");
  // Each character's resources are updated sequentially (spend → half → max) to
  // guarantee ordering; characters themselves run concurrently up to CONCURRENCY.
  const characterTasks = characters.map((char) => async () => {
    for (const resource of char.resources) {
      const steps = [0, Math.ceil(resource.pool_max / 2), resource.pool_max];
      for (const pool_current of steps) {
        const res = await request(
          "PUT",
          `/api/characters/${char.id}/resources/${resource.id}`,
          { pool_current },
        );
        stats.record(res.status >= 200 && res.status < 300, res.ms);
      }
    }
    // runBatch expects each task to return a result object; return a sentinel.
    return { status: 200, ms: 0 };
  });
  await runBatch(characterTasks, CONCURRENCY);
  console.log(`  → ${stats.pass}/${stats.total} passed`);
}

async function phase_rests(characters, stats) {
  console.log("\n  Rests – short and long for each character");
  const tasks = [];
  for (const char of characters) {
    tasks.push(() =>
      request("POST", `/api/characters/${char.id}/rest`, { type: "short" }),
    );
    tasks.push(() =>
      request("POST", `/api/characters/${char.id}/rest`, { type: "long" }),
    );
  }
  const results = await runBatch(tasks, CONCURRENCY);
  results.forEach(({ ok, ms }) => stats.record(ok, ms));
  console.log(`  → ${results.filter((r) => r.ok).length}/${results.length} passed`);
}

async function phase_rolls(characters, stats) {
  console.log(`\n  Dice rolls – ${ROUNDS} rounds × ${characters.length} characters`);
  const tasks = [];
  for (let r = 0; r < ROUNDS; r++) {
    for (const char of characters) {
      const sides = rand(DIE_SIZES);
      const result = randInt(1, sides);
      const modifier = randInt(-5, 10); // typical D&D modifier range
      tasks.push(() =>
        request("POST", "/api/rolls", {
          charId: char.id,
          result,
          sides,
          modifier,
        }),
      );
    }
  }
  const results = await runBatch(tasks, CONCURRENCY);
  results.forEach(({ ok, ms }) => stats.record(ok, ms));
  console.log(`  → ${results.filter((r) => r.ok).length}/${results.length} passed`);
}

async function phase_invalidRequests(stats) {
  console.log("\n  Validation – invalid payloads should return 400/404");
  const cases = [
    // HP with non-numeric value
    { p: () => request("PUT", "/api/characters/char1/hp", { hp_current: "max" }), want: 400 },
    // HP with missing body field
    { p: () => request("PUT", "/api/characters/char1/hp", {}), want: 400 },
    // HP on unknown character
    { p: () => request("PUT", "/api/characters/char999/hp", { hp_current: 10 }), want: 404 },
    // Condition with empty name
    { p: () => request("POST", "/api/characters/char1/conditions", { condition_name: "" }), want: 400 },
    // Roll missing sides
    { p: () => request("POST", "/api/rolls", { charId: "char1", result: 10 }), want: 400 },
    // Roll with sides = 0
    { p: () => request("POST", "/api/rolls", { charId: "char1", result: 1, sides: 0 }), want: 400 },
    // Rest with bad type
    { p: () => request("POST", "/api/characters/char1/rest", { type: "nap" }), want: 400 },
    // Delete condition with invalid UUID
    { p: () => request("DELETE", "/api/characters/char1/conditions/not-a-uuid"), want: 400 },
  ];
  let pass = 0;
  for (const { p, want } of cases) {
    const res = await p();
    const ok = res.status === want;
    if (ok) pass++;
    else {
      console.log(`    ✗ expected ${want}, got ${res.status}`);
    }
    stats.record(ok, res.ms);
  }
  console.log(`  → ${pass}/${cases.length} passed`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║   D&D Overlay API — Stress Test Script     ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`  Base URL    : ${BASE_URL}`);
  console.log(`  Rounds/char : ${ROUNDS}`);
  console.log(`  Concurrency : ${CONCURRENCY}`);
  console.log("");

  const globalStats = new Stats("TOTAL");

  // ── Phase 0: Health check ──
  console.log("── Phase 0: Health check ─────────────────────");
  const healthRes = await request("GET", "/");
  const healthOk = healthRes.status === 200;
  globalStats.record(healthOk, healthRes.ms);
  if (!healthOk) {
    console.error(`  FAIL: server not reachable at ${BASE_URL} (status ${healthRes.status})`);
    console.error("  Make sure the server is running: node server.js");
    process.exit(1);
  }
  console.log(`  GET /  → ${healthRes.status} (${healthRes.ms} ms) ✓\n`);

  // ── Phase 1: Fetch characters ──
  console.log("── Phase 1: Fetch characters ──────────────────");
  const charStats = new Stats("GET /api/characters");
  const characters = await phase_getCharacters(charStats);
  globalStats.merge(charStats);
  if (!characters) {
    console.error("\n  Cannot proceed without characters. Exiting.");
    process.exit(1);
  }

  // ── Phase 2: HP updates ──
  console.log("\n── Phase 2: HP updates ────────────────────────");
  const hpStats = new Stats("PUT /hp");
  await phase_hpUpdates(characters, hpStats);
  await phase_hpEdgeCases(characters, hpStats);
  globalStats.merge(hpStats);

  // ── Phase 3: Conditions ──
  console.log("\n── Phase 3: Conditions ────────────────────────");
  const condStats = new Stats("POST+DELETE /conditions");
  await phase_conditions(characters, condStats);
  globalStats.merge(condStats);

  // ── Phase 4: Resources ──
  console.log("\n── Phase 4: Resources ─────────────────────────");
  const resStats = new Stats("PUT /resources");
  await phase_resources(characters, resStats);
  globalStats.merge(resStats);

  // ── Phase 5: Rests ──
  console.log("\n── Phase 5: Rests ─────────────────────────────");
  const restStats = new Stats("POST /rest");
  await phase_rests(characters, restStats);
  globalStats.merge(restStats);

  // ── Phase 6: Dice rolls ──
  console.log("\n── Phase 6: Dice rolls ────────────────────────");
  const rollStats = new Stats("POST /rolls");
  await phase_rolls(characters, rollStats);
  globalStats.merge(rollStats);

  // ── Phase 7: Validation / error paths ──
  console.log("\n── Phase 7: Input validation ──────────────────");
  const errStats = new Stats("4xx responses");
  await phase_invalidRequests(errStats);
  globalStats.merge(errStats);

  // ── Summary ──
  const allStats = [
    { label: "GET  /api/characters", s: charStats },
    { label: "PUT  /api/characters/:id/hp", s: hpStats },
    { label: "POST/DEL conditions", s: condStats },
    { label: "PUT  resources", s: resStats },
    { label: "POST /rest", s: restStats },
    { label: "POST /api/rolls", s: rollStats },
    { label: "Validation (4xx)", s: errStats },
  ];

  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  RESULTS SUMMARY                                                 ║");
  console.log("╠══════════════════════════╦══════╦══════╦════════╦════════╦════════╣");
  console.log("║  Endpoint                ║  OK  ║ FAIL ║ TOTAL  ║  AVG   ║  MAX   ║");
  const tableRow = (label, s) =>
    `║  ${label.padEnd(24)} ║ ${String(s.pass).padStart(4)} ║ ${String(s.fail).padStart(4)} ║ ${String(s.total).padStart(6)} ║ ${String(s.avgMs + "ms").padStart(6)} ║ ${String(s.maxMs + "ms").padStart(6)} ║`;

  console.log("╠══════════════════════════╬══════╬══════╬════════╬════════╬════════╣");
  for (const { label, s } of allStats) {
    console.log(tableRow(label, s));
  }
  console.log("╠══════════════════════════╬══════╬══════╬════════╬════════╬════════╣");
  console.log(tableRow("TOTAL", globalStats));
  console.log("╚══════════════════════════╩══════╩══════╩════════╩════════╩════════╝");

  const failRate = globalStats.total > 0 ? globalStats.fail / globalStats.total : 0;
  if (failRate > 0.05) {
    console.log(`\n  ⚠  Failure rate ${(failRate * 100).toFixed(1)}% exceeds 5% threshold.`);
    process.exit(1);
  } else {
    console.log(`\n  ✓  All phases passed (failure rate ${(failRate * 100).toFixed(1)}%).`);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
