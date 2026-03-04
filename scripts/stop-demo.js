#!/usr/bin/env bun
/*
 * stop-demo.js — stop demo servers started by `scripts/start-demo.js`
 * Usage:
 *   bun scripts/stop-demo.js        # kills processes listening on common demo ports
 *   bun scripts/stop-demo.js --by-name  # additionally kills by executable name (pocketbase.exe, bun)
 */

import { execSync } from "child_process";

const PORTS = [8090, 3000, 5173, 6006];
const BY_NAME = process.argv.includes("--by-name");
const platform = process.platform;

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (e) {
    return "";
  }
}

function killPids(pids) {
  for (const pid of pids) {
    if (!pid) continue;
    try {
      if (platform === "win32") {
        console.log(`Killing PID ${pid} (Windows)`);
        execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      } else {
        console.log(`Killing PID ${pid}`);
        execSync(`kill -9 ${pid}`, { stdio: "inherit" });
      }
    } catch (e) {
      console.error(`Failed to kill ${pid}: ${e.message}`);
    }
  }
}

function pidsForPort(port) {
  if (platform === "win32") {
    const out = safeExec(`netstat -ano | findstr :${port}`);
    if (!out) return [];
    const lines = out.split(/\r?\n/).filter(Boolean);
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    return Array.from(pids);
  } else {
    const out = safeExec(`lsof -ti :${port}`);
    if (!out) return [];
    return out.split(/\r?\n/).filter(Boolean);
  }
}

function killByProcessNameWin(name) {
  try {
    console.log(`Attempting taskkill /IM ${name}`);
    execSync(`taskkill /IM ${name} /F`, { stdio: "inherit" });
  } catch (e) {
    // ignore
  }
}

function killByProcessNameUnix(pattern) {
  try {
    console.log(`Attempting pkill -f ${pattern}`);
    execSync(`pkill -f ${pattern}`, { stdio: "inherit" });
  } catch (e) {
    // ignore
  }
}

function main() {
  console.log("Stopping demo services (ports: " + PORTS.join(",") + ")\n");

  let any = false;
  for (const port of PORTS) {
    const pids = pidsForPort(port);
    if (pids.length) {
      any = true;
      console.log(`Found PIDs on port ${port}: ${pids.join(", ")}`);
      killPids(pids);
    } else {
      console.log(`No listeners found on port ${port}`);
    }
  }

  if (!any) console.log("No processes found on known demo ports.");

  if (BY_NAME) {
    console.log("\nAlso attempting name-based termination (requested via --by-name)\n");
    if (platform === "win32") {
      killByProcessNameWin("pocketbase.exe");
      killByProcessNameWin("bun.exe");
      killByProcessNameWin("bun");
    } else {
      killByProcessNameUnix("pocketbase");
      killByProcessNameUnix("bun");
    }
  }

  console.log("\nDone.");
}

main();
