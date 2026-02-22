# Control Panel — DADOS & RISAS

Mobile-first SvelteKit 5 interface for managing D&D sessions in real-time.

## Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **SvelteKit** with file-based routing
- **Vite 7** for dev server and HMR
- **socket.io-client** for real-time sync
- **anime.js** for damage flash and dice animations

## Running

```bash
npm install            # first time only
npm run dev -- --host  # exposes on LAN for phone access
```

For automatic IP configuration, use:

```bash
npm run dev:auto
```

Requires the backend server running on port 3000 (or `VITE_SERVER_URL`).
Configure `control-panel/.env` to point at the backend server URL.

## Routes

| Route                   | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `/control/characters`   | HP management, conditions, resources         |
| `/control/dice`         | Dice roller                                  |
| `/management/create`    | Character creation form                      |
| `/management/manage`    | Photo/data editing + bulk controls           |
| `/dashboard`            | Live read-only dashboard (TV/monitor view)   |

## Components

| Component              | File                                  | Purpose                                             |
| ---------------------- | ------------------------------------- | --------------------------------------------------- |
| Layout shell           | `src/routes/+layout.svelte`           | App header, sidebar, and navigation                 |
| CharacterCard          | `src/lib/CharacterCard.svelte`        | HP management, conditions, resources, rest          |
| CharacterCreationForm  | `src/lib/CharacterCreationForm.svelte`| New character creation form                         |
| CharacterManagement    | `src/lib/CharacterManagement.svelte`  | Photo/data editing, bulk controls                   |
| PhotoSourcePicker      | `src/lib/PhotoSourcePicker.svelte`    | URL / file-upload photo picker                      |
| DashboardCard          | `src/lib/DashboardCard.svelte`        | Per-character tile for dashboard view               |
| DiceRoller             | `src/lib/DiceRoller.svelte`           | d4–d20 roller with modifier and result animation    |

## Stores

| Store            | File                | Type     | Content                                      |
| ---------------- | ------------------- | -------- | -------------------------------------------- |
| `characters`     | `socket.js`         | writable | Character array, updated by Socket.io events |
| `lastRoll`       | `socket.js`         | writable | Most recent dice roll result                 |
| `history`        | `dashboardStore.js` | writable | Activity log (max 40 entries)                |
| `pendingActions` | `dashboardStore.js` | writable | Optimistic UI action queue                   |
| `isSyncing`      | `dashboardStore.js` | derived  | True when actions are pending                |
| `currentRole`    | `dashboardStore.js` | writable | "player" / "dm" / "spectator"                |

## Styling

Global design tokens and shared bases live in `src/app.css`. Component-specific styles are in separate `.css` files alongside each `.svelte` file. See `docs/DESIGN-SYSTEM.md` for the full token reference.
