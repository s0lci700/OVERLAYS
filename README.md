# DADOS & RISAS 🎲

**Real-time production system for D&D streaming campaigns.**

Control characters, hit points, and dice rolls from your phone. OBS overlays update instantly — no refresh, no delay, no plugins.

![Status](https://img.shields.io/badge/status-MVP%20COMPLETE-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20Svelte%205%20%2B%20PocketBase-blue)
![Package Manager](https://img.shields.io/badge/package%20manager-Bun-orange)

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
| **Backend** | Node.js 18+, Express, Socket.io 4.8 |
| **Database** | PocketBase (SQLite) |
| **Frontend** | Svelte 5, Vite 7, Tailwind CSS 4 |
| **Runtime** | Bun (recommended) |
| **Overlays** | Vanilla HTML/CSS/JS |

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
- `node server.js`: Starts only the Express server (requires PocketBase to be running).

### Control Panel (`/control-panel`)
- `bun run dev`: Starts the Vite development server.
- `bun run dev:auto`: Detects local IP, updates `.env`, and starts Vite with `--host`.
- `bun run build`: Builds the production bundle.
- `bun run test`: Runs Vitest unit tests.
- `bun run storybook`: Starts Storybook for component development.

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
├── server.js            # Express + Socket.io backend
├── pocketbase.exe       # PocketBase binary
├── data/                # Data access modules (characters, rolls)
├── public/              # OBS overlays (Vanilla JS/CSS)
│   ├── overlay-hp.html  # HP tracking overlay
│   ├── overlay-dice.html # Dice roll popup overlay
│   └── ...
├── control-panel/       # Svelte 5 Control Panel
│   ├── src/routes/      # App pages (Live, Setup, DM)
│   ├── src/lib/         # Components and stores
│   └── ...
├── scripts/             # Utility scripts (IP detection, seeding)
├── tests/               # Backend and E2E tests
└── docs/                # Detailed technical documentation
```

---

## 🧪 Testing

- **Frontend**: Vitest for unit/component testing.
  ```bash
  cd control-panel && bun test
  ```
- **Backend**: Sanity check script.
  ```bash
  node tests/backend-sanity.js
  ```

---

## ⚖️ License

This project is for internal use / pitch demonstration. Refer to the `LICENSE` file if present or contact the team for details.

---

<div align="center">
Built with 🎲 for D&D and streaming.
</div>
