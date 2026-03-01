/**
 * k6 API Load Test
 *
 * Targets the Express API server (default: http://localhost:3000).
 * Override via env var:  BASE_URL_API=http://my-server:3000 k6 run stress/api.js
 *
 * Stages:
 *   smoke  — 1 VU for 15 s  (quick sanity check)
 *   ramp   — up to 20 VUs over 30 s, hold 1 min, then ramp down
 *
 * Reports:
 *   stress-results/api-summary.json  — machine-readable summary
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL_API || "http://localhost:3000";

// Custom metrics
const hpUpdateDuration = new Trend("hp_update_duration", true);
const rollDuration = new Trend("roll_duration", true);
const apiErrors = new Counter("api_errors");

export const options = {
  stages: [
    { duration: "15s", target: 1 },  // smoke
    { duration: "30s", target: 20 }, // ramp up
    { duration: "60s", target: 20 }, // hold
    { duration: "15s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],          // < 5 % errors
    http_req_duration: ["p(95)<500"],        // 95 % of requests under 500 ms
    hp_update_duration: ["p(95)<600"],
    roll_duration: ["p(95)<600"],
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)"],
};

export function handleSummary(data) {
  return {
    "stress-results/api-summary.json": JSON.stringify(data, null, 2),
  };
}

export default function () {
  // 1. GET /api/characters
  const charsRes = http.get(`${BASE_URL}/api/characters`);
  check(charsRes, {
    "GET /api/characters — status 200": (r) => r.status === 200,
    "GET /api/characters — returns array": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
  }) || apiErrors.add(1);

  // 2. PUT /api/characters/CH101/hp
  const hp = Math.floor(Math.random() * 12) + 1;
  const hpStart = Date.now();
  const hpRes = http.put(
    `${BASE_URL}/api/characters/CH101/hp`,
    JSON.stringify({ hp_current: hp }),
    { headers: { "Content-Type": "application/json" } },
  );
  hpUpdateDuration.add(Date.now() - hpStart);
  check(hpRes, {
    "PUT /hp — status 200": (r) => r.status === 200,
  }) || apiErrors.add(1);

  // 3. POST /api/rolls
  const rollStart = Date.now();
  const rollRes = http.post(
    `${BASE_URL}/api/rolls`,
    JSON.stringify({
      charId: "CH101",
      result: Math.floor(Math.random() * 20) + 1,
      sides: 20,
      modifier: 0,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
  rollDuration.add(Date.now() - rollStart);
  check(rollRes, {
    "POST /api/rolls — status 200": (r) => r.status === 200,
  }) || apiErrors.add(1);

  sleep(1);
}
