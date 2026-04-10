# DADOS & RISAS 🎲

**Real-time production system for D&D streaming campaigns.**

Control characters, hit points, and dice rolls from your phone. OBS overlays update instantly — no refresh, no delay, no plugins.

![Status](https://img.shields.io/badge/status-Phase%201%20in%20progress-blue)
![Stack](https://img.shields.io/badge/stack-Bun%20%2B%20Svelte%205%20%2B%20PocketBase-blue)
![Language](https://img.shields.io/badge/language-TypeScript-3178c6)

---

## 🚀 Overview

DADOS & RISAS is a lightweight, low-latency toolkit designed for DMs and players to manage game state that reflects live on stream.

- **Real-time Sync**: Uses Socket.io for sub-100ms updates.
- **Mobile-First**: Control panel designed to be used from a smartphone.
- **PocketBase Backend**: Persistent storage for characters and roll history using SQLite.
- **Svelte 5 Frontend**: Modern, reactive interface for the DM and players.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Bun + Express + Socket.io 4.8, TypeScript |
| **Database** | PocketBase (SQLite) |
| **Frontend** | Svelte 5, SvelteKit, Vite 7 |
| **Runtime** | Bun |
| **Overlays** | SvelteKit `(audience)` routes — listen-only, OBS Browser Source |
| **Component dev** | Storybook 10 + Vitest |

---

## 📋 Requirements

- **Bun** (preferred) or Node.js 18+
- **PocketBase** (`pocketbase.exe` included in root)
- **OBS Studio** (for displaying overlays)

---

## ⏱️ Quick Start

### 1. Install Dependencies
```bash
# Install root dependencies
bun install

# Install control panel dependencies
cd control-panel
bun install
```

### 2. Configure Environment
Copy the example environment files:
```bash
cp .env.example .env
cd control-panel
cp .env.example .env
```

### 3. Start the Stack
The easiest way to start everything is using the demo script:
```bash
# From the root directory
bun run start-demo
```
This script starts PocketBase and the Backend server.

**Note**: You still need to run the Vite development server for the control panel:
```bash
cd control-panel
bun run dev -- --host
```

---

## 📜 Scripts

### Root Project
- `bun run start-demo`: Starts PocketBase and the Express server.
- `bun run stop-demo`: Stops the running demo processes.
- `bun server.ts`: Starts only the backend server (requires PocketBase running).
- `bun run build`: Type-check with `tsc --noEmit` (Bun runs `.ts` natively).
- `bun scripts/setup-ip.js`: Auto-detect LAN IP and write `.env` files for mobile access.

### Control Panel (`/control-panel`)

- `bun run dev -- --host`: Starts Vite dev server (accessible on LAN).
- `bun run build`: Builds the production bundle.
- `bun run test`: Runs Vitest unit tests.
- `bun run storybook`: Starts Storybook on port 6006.
- `bun run build-storybook`: Builds static Storybook bundle.

---

## 🌐 Environment Variables

### Backend (`.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Express server port |
| `CONTROL_PANEL_ORIGIN` | `http://localhost:5173` | CORS allowed origin |
| `POCKETBASE_URL` | `http://127.0.0.1:8090` | Connection string for PocketBase |
| `PB_MAIL` | - | PocketBase admin email |
| `PB_PASS` | - | PocketBase admin password |

### Control Panel (`control-panel/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_SERVER_URL` | `http://localhost:3000` | Backend API URL |
| `VITE_PORT` | `5173` | Vite server port |

---

## 📁 Project Structure

```text
OVERLAYS/
├── server.ts                  # Thin entry point — Express + Socket.io init
├── backend/                # Backend modules
│   ├── handlers/              # REST handlers (characters, encounter, overlay, rolls, misc)
│   ├── socket/                # Socket.io init, broadcast, event stubs
│   └── state/                 # In-memory encounter + scene state
├── data/                      # PocketBase CRUD modules (characters, rolls)
├── pocketbase.exe             # PocketBase binary
├── control-panel/             # SvelteKit control panel (Svelte 5)
│   ├── src/routes/            # Route groups: (stage), (cast), (audience)
│   ├── src/lib/components/    # UI components + OBS overlays
│   ├── src/lib/services/      # pocketbase.ts, socket.ts, broadcast/, errors.ts
│   ├── src/lib/contracts/     # Shared TypeScript interfaces
│   ├── src/lib/mocks/         # Storybook + test fixture data
│   └── .storybook/            # Storybook config and theme
├── scripts/                   # IP detection, seeding
├── docs/                      # Technical documentation
└── tsconfig.json              # TypeScript config (type-check only; Bun runs .ts natively)
```

---

## 🧪 Testing

- **Frontend unit tests**: Vitest — `cd control-panel && bun test`
- **Type checking**: `bun run build` at root (`tsc --noEmit`)
- **Component dev**: Storybook at `:6006` — `cd control-panel && bun run storybook`

---

## 📚 Documentation

| File | Contents |
| :--- | :--- |
| `docs/INDEX.md` | Fast file map — entry points, routes, services |
| `docs/API.md` | REST endpoints + frontend services reference |
| `docs/ARCHITECTURE.md` | Data flows, module map, design decisions |
| `docs/SOCKET-EVENTS.md` | Complete Socket.io event payloads |
| `docs/ENVIRONMENT.md` | `.env` setup, LAN IP configuration |
| `docs/DESIGN-SYSTEM.md` | CSS tokens, typography, component style guide |
| `control-panel/.storybook/README.md` | Story writing guide and mock data strategy |

---

## ⚖️ License

This project is for internal use / pitch demonstration. Refer to the `LICENSE` file if present or contact the team for details.

---

<div align="center">
Built with 🎲 for D&D and streaming.
</div>
