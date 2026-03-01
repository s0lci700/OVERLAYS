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
`?server=` to the local file URL in OBS:

```
overlay-hp.html?server=http://192.168.1.83:3000
overlay-dice.html?server=http://192.168.1.83:3000
```

## Manual IP lookup

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig | grep inet
```
