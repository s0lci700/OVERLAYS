# Environment & Networking

This project uses .env files plus optional query parameters to keep all clients
(control panel and OBS overlays) pointed at the same backend server.

## Quick setup (recommended)

```bash
bun run setup-ip
```

This script auto-detects your local IPv4 address and writes:

- .env (root)
- control-panel/.env

## Root .env

| Key                  | Purpose                           | Example                  |
| -------------------- | --------------------------------- | ------------------------ |
| PORT                 | Backend server port               | 3000                     |
| CONTROL_PANEL_ORIGIN | CORS origin for the control panel | http://192.168.1.83:5173 |
| CHARACTERS_TEMPLATE  | Seed template from data/          | template-characters      |

## Control panel .env

| Key             | Purpose                 | Example                  |
| --------------- | ----------------------- | ------------------------ |
| VITE_SERVER_URL | Backend server base URL | http://192.168.1.83:3000 |
| VITE_PORT       | Vite dev server port    | 5173                     |

## OBS overlay server URL

Overlays default to http://localhost:3000. To connect them to a LAN IP, append
`?server=` to the SvelteKit overlay URL in OBS:

```
http://192.168.1.83:5173/persistent/hp?server=http://192.168.1.83:3000
http://192.168.1.83:5173/moments/dice?server=http://192.168.1.83:3000
http://192.168.1.83:5173/persistent/conditions?server=http://192.168.1.83:3000
```

## Railway deployment

The server auto-seeds PocketBase on first boot. After a successful PocketBase
authentication, `server.js` calls `seedIfEmpty()` which checks whether any
characters exist and, if not, creates them from `data/template-characters.json`.

This means **no separate seed step is required** in the Railway start command.
The start command stays:

```
bun server.js
```

### Production service URLs

| Service    | URL                                              |
| ---------- | ------------------------------------------------ |
| Server     | https://overlays-production-2a9d.up.railway.app  |
| PocketBase | https://db-production-4bc8.up.railway.app        |

### Required Railway environment variables

**Backend service (`overlays-production-2a9d`):**

| Key                  | Value                                            |
| -------------------- | ------------------------------------------------ |
| POCKETBASE_URL       | https://db-production-4bc8.up.railway.app        |
| PB_MAIL              | *(PocketBase superuser email)*                   |
| PB_PASS              | *(PocketBase superuser password)*                |
| PORT                 | *(set automatically by Railway)*                 |
| CONTROL_PANEL_ORIGIN | *(full URL of the deployed control panel)*       |

**Control panel service:**

| Key             | Value                                                    |
| --------------- | -------------------------------------------------------- |
| VITE_SERVER_URL | https://overlays-production-2a9d.up.railway.app          |

> `seedIfEmpty()` is idempotent — safe to run on every redeploy.

## Manual IP lookup

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig | grep inet
```
