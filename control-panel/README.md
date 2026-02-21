# Control Panel — DADOS & RISAS

Mobile-first Svelte 5 interface for managing D&D sessions in real-time.

## Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **Vite 7** for dev server and HMR
- **socket.io-client** for real-time sync
- **anime.js** for damage flash and dice animations

## Running

```bash
npm install          # first time only
npm run dev -- --host  # exposes on LAN for phone access
```

Requires the backend server running on port 3000. Update the IP in `src/lib/socket.js` to match your machine.

## Components

| Component | File | Purpose |
|---|---|---|
| App | `src/App.svelte` | Root shell: header, tab navigation, content routing |
| CharacterCard | `src/lib/CharacterCard.svelte` | HP management, conditions, resources, rest |
| DiceRoller | `src/lib/DiceRoller.svelte` | d4–d20 roller with modifier and result animation |

## Stores

| Store | File | Type | Content |
|---|---|---|---|
| `characters` | `socket.js` | writable | Character array, updated by Socket.io events |
| `lastRoll` | `socket.js` | writable | Most recent dice roll result |
| `history` | `dashboardStore.js` | writable | Activity log (max 40 entries) |
| `pendingActions` | `dashboardStore.js` | writable | Optimistic UI action queue |
| `isSyncing` | `dashboardStore.js` | derived | True when actions are pending |
| `currentRole` | `dashboardStore.js` | writable | "player" / "dm" / "spectator" |

## Styling

Global design tokens and shared bases live in `src/app.css`. Component-specific styles are in separate `.css` files alongside each `.svelte` file. See `docs/DESIGN-SYSTEM.md` for the full token reference.
