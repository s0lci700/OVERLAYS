---
layout: home

hero:
  name: "Dados & Risas"
  text: "D&D Session Management"
  tagline: Real-time OBS overlays, REST API, and Socket.io — built with Node.js + Svelte 5
  actions:
    - theme: brand
      text: Architecture →
      link: /ARCHITECTURE
    - theme: alt
      text: REST API (Swagger UI)
      link: http://localhost:3000/api-docs

features:
  - icon: ⚡
    title: Real-time with Socket.io
    details: Every HP change, condition, resource update, and dice roll is broadcast instantly to all connected clients — control panel and OBS overlays alike.
  - icon: 🎲
    title: Full REST API
    details: Annotated with OpenAPI 3.0. Browse the interactive Swagger UI at /api-docs or download the raw spec at /api-docs.json.
  - icon: 🎨
    title: Design Token Pipeline
    details: Single source of truth in design/tokens.json. Run `bun run generate:tokens` to regenerate CSS for both the Svelte app and vanilla JS overlays.
  - icon: 🧪
    title: Tested
    details: Playwright E2E tests covering HP flows, dice rolling, and socket connections. k6 stress tests for the API and control panel.
---

## Quick Start

```bash
# Install dependencies
bun install
cd control-panel && bun install

# Configure LAN IPs
bun run setup-ip

# Start server (port 3000)
bun server.js

# Start control panel (port 5173)
cd control-panel && bun run dev -- --host
```

Then open:

| URL | What it is |
|-----|-----------|
| `http://localhost:3000` | Landing page with OBS URLs |
| `http://localhost:3000/api-docs` | **Interactive API docs (Swagger UI)** |
| `http://localhost:3000/api-docs.json` | Raw OpenAPI 3.0 spec |
| `http://localhost:5173` | Svelte control panel |
| `http://localhost:3000/theme-editor/` | Live theme editor |

## API at a Glance

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/characters` | List all characters |
| `POST` | `/api/characters` | Create character |
| `PUT` | `/api/characters/:id` | Update character fields |
| `DELETE` | `/api/characters/:id` | Delete character |
| `PUT` | `/api/characters/:id/hp` | Update HP (clamped 0–hp_max) |
| `PUT` | `/api/characters/:id/photo` | Update photo (≤ 2 MB) |
| `POST` | `/api/characters/:id/conditions` | Add condition |
| `DELETE` | `/api/characters/:id/conditions/:condId` | Remove condition |
| `PUT` | `/api/characters/:id/resources/:rid` | Update resource pool |
| `POST` | `/api/characters/:id/rest` | Short/long rest |
| `POST` | `/api/rolls` | Log dice roll |

See the full [API Structure](./API-STRUCTURE) or browse the [interactive Swagger UI](http://localhost:3000/api-docs).
