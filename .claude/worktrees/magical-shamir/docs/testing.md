# Testing Guide

This document explains how to run the full test suite (Playwright E2E) and the k6 stress/load tests locally and in CI.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 + | [nodejs.org](https://nodejs.org) |
| k6 | latest | [Installation Guide](https://grafana.com/docs/k6/latest/set-up/install-k6/) |

Install project dependencies:

```bash
# Root (backend)
npm install

# Control panel (frontend)
cd control-panel && npm install
```

---

## Running Tests Locally

### 1 — Start the services

You need both the Express API server and the Vite dev server running before executing any tests.

**Terminal 1 — Express API:**
```bash
node server.js
# → Listening on http://localhost:3000
```

**Terminal 2 — Control panel (Vite dev server):**
```bash
cd control-panel
npm run dev -- --host
# → http://localhost:5173
```

---

### 2 — End-to-end tests (Playwright)

```bash
npm run test:e2e
```

Playwright launches a headless Chromium browser, exercises the control panel and server API, and checks:
- character list and data structure
- HP update flow
- dice rolling
- socket connection
- overlay HTML files

Screenshots are saved to `test-*.png` and full traces to `test-results/` on failure.

**Environment variables:**

| Variable | Default | Description |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | Express API base URL |
| `PLAYWRIGHT_CP_URL` | `http://localhost:5173` | Control panel base URL |

Example override:
```bash
PLAYWRIGHT_BASE_URL=http://192.168.1.10:3000 PLAYWRIGHT_CP_URL=http://192.168.1.10:5173 npm run test:e2e
```

---

### 3 — Stress / load tests (k6)

> Make sure the services are already running (step 1).

**API stress test only:**
```bash
npm run stress:api
```

**Control-panel stress test only:**
```bash
npm run stress:cp
```

**Both stress tests in sequence:**
```bash
npm run stress
```

**E2E + stress (full suite):**
```bash
npm run test:full
```

**Environment variables:**

| Variable | Default | Description |
|---|---|---|
| `BASE_URL_API` | `http://localhost:3000` | Express API base URL for k6 |
| `BASE_URL_CP` | `http://localhost:5173` | Control-panel base URL for k6 |

Example override:
```bash
BASE_URL_API=http://192.168.1.10:3000 npm run stress:api
```

#### Smoke-only run (fast — 1 VU × 15 s)

The scripts include a smoke stage at the start. To run just the smoke stage without the full stress ramp, pass k6 options directly:

```bash
k6 run --stage 15s:1 stress/api.js
```

---

## Stress Test Details

### `stress/api.js`

Exercises the three core API endpoints used by the control panel:

| Request | Threshold |
|---|---|
| `GET /api/characters` | p95 < 500 ms |
| `PUT /api/characters/CH101/hp` | p95 < 600 ms |
| `POST /api/rolls` | p95 < 600 ms |

Stages:
```
smoke   1 VU  ×  15 s
ramp  → 20 VUs over 30 s
hold   20 VUs  ×  60 s
ramp  →  0 VUs over 15 s
```

### `stress/control-panel.js`

Exercises the Vite dev server:

| Request | Threshold |
|---|---|
| `GET /` | p95 < 1 000 ms |
| `GET /control/characters` | p95 < 1 000 ms |

Stages:
```
smoke   1 VU  ×  15 s
ramp  → 10 VUs over 30 s
hold   10 VUs  ×  60 s
ramp  →  0 VUs over 15 s
```

---

## Reports and Artifacts

After each run k6 writes a JSON summary to:

| Script | Output file |
|---|---|
| `stress/api.js` | `stress-results/api-summary.json` |
| `stress/control-panel.js` | `stress-results/cp-summary.json` |

The JSON contains the full metric tree (counters, trends, rates). Key fields to look at:

```jsonc
{
  "metrics": {
    "http_req_duration": {
      "values": {
        "avg": 12.3,
        "p(90)": 45.1,
        "p(95)": 62.4,   // compare against thresholds
        "max": 340.0
      }
    },
    "http_req_failed": {
      "values": { "rate": 0.002 }  // error rate; must stay < 0.05
    },
    "api_errors": {
      "values": { "count": 0 }
    }
  }
}
```

Pass / fail is determined by the `thresholds` block at the top of each script and is printed to the terminal at the end of the run.

---

## CI Workflow

The workflow `.github/workflows/full-test-and-stress.yml` runs on:
- Every push to `main` or `copilot/**` branches
- Pull requests targeting `main`
- Manual dispatch (`workflow_dispatch`) with an optional `stress_duration` input

Steps:
1. Install Node 20, root deps, control-panel deps
2. Install Playwright browsers
3. Install k6 (via Grafana apt repository)
4. Start Express server and Vite dev server in the background
5. Wait for both services to be ready
6. Run Playwright tests
7. Run k6 API stress test
8. Run k6 control-panel stress test
9. Upload artifacts:
   - `playwright-results` — test screenshots and traces
   - `stress-results` — JSON summaries for both k6 scripts

Artifacts are retained for **7 days** and can be downloaded from the GitHub Actions run summary page.
