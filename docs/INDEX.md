# Project Index

Quick navigation guide for developers and LLMs. Start here for file locations,
entry points, and how the system hangs together.

## Primary entry points

- Backend server: server.js
- OBS overlays: public/overlay-hp.html, public/overlay-dice.html
- Control panel app: control-panel/src/main.js

## Key directories

- data/ In-memory state modules (characters, rolls, helpers)
- public/ OBS overlay HTML/CSS assets
- control-panel/ Svelte control panel source and build output
- scripts/ Local tooling (setup-ip.js)
- docs/ Architecture, events, design system, environment guide

## Configuration

- Root .env.example Backend defaults (PORT, CONTROL_PANEL_ORIGIN)
- control-panel/.env.example Frontend defaults (VITE_SERVER_URL, VITE_PORT)
- docs/ENVIRONMENT.md IP setup + overlay query parameter usage

## Core flows

- HP update: control panel -> PUT /api/characters/:id/hp -> hp_updated event
- Dice roll: control panel -> POST /api/rolls -> dice_rolled event
- Overlays: listen only; they never send requests

## Socket.io contract

- Full event list: docs/SOCKET-EVENTS.md
- Socket client store: control-panel/src/lib/socket.js

## Control panel UI

- Shell + layout: control-panel/src/routes/+layout.svelte
- Character card: control-panel/src/lib/CharacterCard.svelte
- Dice roller: control-panel/src/lib/DiceRoller.svelte
- Character creation: control-panel/src/lib/CharacterCreationForm.svelte
- Character management: control-panel/src/lib/CharacterManagement.svelte
- Photo picker: control-panel/src/lib/PhotoSourcePicker.svelte
- Dashboard card: control-panel/src/lib/DashboardCard.svelte

## Overlay UI

- HP overlay styles: public/overlay-hp.css
- Dice overlay styles: public/overlay-dice.css

## Common tasks

- Auto-configure IPs: bun run setup-ip
- Run backend: bun server.js
- Run control panel: cd control-panel && bun run dev -- --host
- Control panel auto IP: cd control-panel && bun run dev:auto

## Testing

- Playwright E2E: app.test.js (uses PLAYWRIGHT_BASE_URL / PLAYWRIGHT_CP_URL)
- Manual API calls: test.http

## Generated / do-not-edit

- control-panel/build/
- control-panel/.svelte-kit/

## See also

- docs/ARCHITECTURE.md for deeper architecture and data flow
- docs/DESIGN-SYSTEM.md for UI tokens and component mapping
- docs/CHARACTER-CREATION-PLAN.md for the 2024 creation flow plan
- docs/character-options.template.json for placeholder selection lists
- README.md for setup and demo script
