/**
 * k6 Control-Panel Load Test
 *
 * Targets the Vite dev server (default: http://localhost:5173).
 * Override via env var:  BASE_URL_CP=http://my-host:5173 k6 run stress/control-panel.js
 *
 * Stages:
 *   smoke  — 1 VU for 15 s  (quick sanity check)
 *   ramp   — up to 10 VUs over 30 s, hold 1 min, then ramp down
 *
 * Reports:
 *   stress-results/cp-summary.json  — machine-readable summary
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL_CP || "http://localhost:5173";

const cpErrors = new Counter("cp_errors");

export const options = {
  stages: [
    { duration: "15s", target: 1 },  // smoke
    { duration: "30s", target: 10 }, // ramp up
    { duration: "60s", target: 10 }, // hold
    { duration: "15s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],      // < 5 % errors
    http_req_duration: ["p(95)<1000"],  // 95 % under 1 s (Vite dev server is slower)
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)"],
};

export function handleSummary(data) {
  return {
    "stress-results/cp-summary.json": JSON.stringify(data, null, 2),
  };
}

export default function () {
  // 1. GET / — main app shell
  const rootRes = http.get(`${BASE_URL}/`);
  check(rootRes, {
    "GET / — status 200": (r) => r.status === 200,
    "GET / — returns HTML": (r) =>
      r.headers["Content-Type"] !== undefined &&
      r.headers["Content-Type"].includes("text/html"),
  }) || cpErrors.add(1);

  // 2. GET /control/characters — control panel route
  const cpRes = http.get(`${BASE_URL}/control/characters`);
  check(cpRes, {
    "GET /control/characters — status 200": (r) => r.status === 200,
  }) || cpErrors.add(1);

  sleep(1);
}
