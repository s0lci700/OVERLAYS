#!/usr/bin/env bun
/**
 * start-demo.js — single command to spin up the full DADOS & RISAS stack.
 * Usage: bun scripts/start-demo.js
 *
 * Starts PocketBase → waits for health → starts server → waits for API → opens browser.
 */

import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dir, "..");
const PB_EXE = join(ROOT, "pocketbase.exe");
const OPEN_URL = "http://localhost:5173/session";
const SERVER_URL = "http://localhost:3000/api/characters";
const PB_HEALTH = "http://localhost:8090/api/health";

async function waitFor(url, label, maxMs = 15000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) { console.log(`✅ ${label} ready`); return; }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} did not become ready within ${maxMs}ms`);
}

async function main() {
  console.log("🎲 DADOS & RISAS — demo start\n");

  // 1. Start PocketBase (if not already running)
  let pbReady = false;
  try {
    const r = await fetch(PB_HEALTH);
    if (r.ok) { pbReady = true; console.log("ℹ️  PocketBase already running"); }
  } catch {}

  if (!pbReady) {
    if (!existsSync(PB_EXE)) {
      console.error("❌ pocketbase.exe not found in project root");
      process.exit(1);
    }

    // ─── Dynamic Host Detection ───────────────────────────────────────────
    const PANEL_ENV = join(ROOT, "control-panel", ".env");
    let pbBind = "127.0.0.1:8090";
    if (existsSync(PANEL_ENV)) {
      const envContent = readFileSync(PANEL_ENV, "utf8");
      const match = envContent.match(/VITE_POCKETBASE_URL=http:\/\/([^:/]+)/);
      if (match) {
        const host = match[1];
        if (host !== "localhost" && host !== "127.0.0.1") {
          pbBind = `0.0.0.0:8090`; // Bind to all if configured for LAN/Mobile
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    console.log(`▶  Starting PocketBase on ${pbBind}…`);
    const pb = spawn(PB_EXE, ["serve", `--http=${pbBind}`], { cwd: ROOT, stdio: "ignore", detached: true });
    pb.unref();
    await waitFor(PB_HEALTH, "PocketBase");
  }

  // 2. Start backend server (if not already running)
  let serverReady = false;
  try {
    const r = await fetch(SERVER_URL);
    if (r.ok) { serverReady = true; console.log("ℹ️  Server already running"); }
  } catch {}

  if (!serverReady) {
    console.log("▶  Starting server.js…");
    const srv = spawn("bun", ["server.js"], { cwd: ROOT, stdio: "ignore", detached: true });
    srv.unref();
    await waitFor(SERVER_URL, "Server");
  }

  // 3. Open control panel in default browser
  console.log(`\n🌐 Opening ${OPEN_URL}`);
  const openCmd = process.platform === "win32" ? "start" : "open";
  spawn(openCmd, [OPEN_URL], { shell: true, stdio: "ignore" });

  console.log("\n🟢 Stack is up:");
  console.log(`   PocketBase  → http://localhost:8090/_/`);
  console.log(`   API server  → http://localhost:3000`);
  console.log(`   Control panel → http://localhost:5173 (Vite must be running separately)`);
  console.log(`   DM Panel      → ${OPEN_URL}`);
  console.log("\n💡 If Vite isn't running: cd control-panel && bun run dev -- --host");
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
