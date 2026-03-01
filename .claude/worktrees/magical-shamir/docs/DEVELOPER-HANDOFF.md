# Developer Handoff — Dados & Risas Overlay System
**Date:** 2026-02-25 | **Status:** MVP — production-ready core, active development

---

## Project At a Glance

A real-time D&D production tool for streaming. A Game Master runs the control panel on their phone during a session; all HP changes, dice rolls, and condition updates instantly appear on OBS overlays visible to the stream.

**Live demo:** `localhost:3000` (shows all overlay URLs for OBS setup after `npm run dev`)
**Repo:** `github.com/s0lci700/OVERLAYS` (private, `v1.0.0-pitch` tag = demo-ready state)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Control panel | Svelte 5 (runes) + SvelteKit |
| Build | Vite |
| Real-time | Socket.io (client) |
| Backend | Node.js + Express + Socket.io (server) |
| OBS overlays | Vanilla HTML/CSS/JS (browser sources) |
| Animation | anime.js v4 |
| Data | In-memory on server; Socket.io broadcasts to all clients |

**Svelte version note:** This project uses Svelte 5 runes syntax exclusively. All state is `$state()`, `$derived()`, `$effect()`, `$props()`. Do not mix legacy `writable()` stores with runes in the same component — use the `$` store accessor where stores are still in use (e.g., `$characters`).

---

## Running the Project

```bash
# Start backend (runs on port 3001)
cd server/
npm install
node server.js

# Start control panel (runs on port 5173 in dev, 3000 in preview)
cd control-panel/
npm install
npm run dev
```

OBS browser source URLs (shown on the landing page):
- `http://[LAN-IP]:3001/overlay-hp.html`
- `http://[LAN-IP]:3001/overlay-dice.html`
- `http://[LAN-IP]:3001/overlay-conditions.html`

---

## Project Structure

```
OVERLAYS/
├── server/                     ← Node.js + Express + Socket.io backend
│   ├── server.js               ← Main server file
│   └── package.json
├── control-panel/              ← SvelteKit frontend
│   ├── src/
│   │   ├── app.css             ← ALL design tokens + shared base classes
│   │   ├── routes/             ← SvelteKit file-based routing
│   │   │   ├── +layout.svelte  ← Root shell (header, nav, sidebar)
│   │   │   ├── control/
│   │   │   │   ├── characters/ ← HP management
│   │   │   │   └── dice/       ← Dice roller
│   │   │   ├── dashboard/      ← Activity log + analytics
│   │   │   └── management/
│   │   │       ├── create/     ← Character creation
│   │   │       └── manage/     ← Character list / edit / delete
│   │   └── lib/
│   │       ├── socket.js       ← Socket.io singleton + shared stores
│   │       ├── CharacterCard.svelte/.css
│   │       ├── CharacterBulkControls.svelte/.css
│   │       ├── CharacterCreationForm.svelte/.css
│   │       ├── CharacterManagement.svelte/.css
│   │       ├── Dashboard.css
│   │       ├── DashboardCard.svelte/.css
│   │       ├── DiceRoller.svelte/.css
│   │       ├── Modal.svelte
│   │       ├── MultiSelect.svelte/.css
│   │       └── PhotoSourcePicker.svelte/.css
│   └── vite.config.js
└── public/                     ← Static files served by Express
    ├── tokens.css              ← Overlay token subset (keep in sync with app.css)
    ├── overlay-hp.html
    ├── overlay-dice.html
    └── overlay-conditions.html
```

---

## Design System Quick Reference

**All tokens:** `src/app.css` `:root` block. Never hardcode colors, spacing, or shadows.

### Key tokens

```css
--red: #FF4D6A;          /* damage / conditions / critical */
--cyan: #00D4E8;         /* healing / focus / connection */
--purple: rgba(80,13,245,1);  /* d20 / magic */

--black: #0A0A0A;        /* page bg */
--black-card: #111111;   /* card surface */
--black-elevated: #1A1A1A;   /* inputs, hp-track, elevated surfaces */
--white: #F0F0F0;        /* primary text */
--grey: #888888;         /* secondary / labels */

--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-pill: 999px;
--t-fast: 120ms ease; --t-normal: 220ms ease;
```

### Shared base classes (in `app.css`)

| Class | Purpose |
|-------|---------|
| `.card-base` | Dark card surface — all card components extend this |
| `.btn-base` | Button foundation — damage, heal, rest, dice buttons extend this |
| `.label-caps` | Small uppercase label (use in template, don't re-implement locally) |
| `.selector` | Styled `<select>` wrapper |
| `.selection-pills` | Multi-value pill display |
| `.skip-to-content` | A11y skip link (already in root layout) |
| `.characters-grid` | Responsive CSS-columns layout for card grid |

### State modifier convention

Use `is-` prefix for all boolean states:

```css
.char-card.is-critical    /* HP ≤ 30% */
.char-card.is-selected    /* Checkbox checked */
.hp-cur.is-critical       /* HP number turns red */
.roll-result.is-crit      /* Natural 20 */
.roll-result.is-fail      /* Natural 1 */
```

---

## Component API Reference

### CharacterCard

**Props:** `character` (object) — the full character data object from the `$characters` store.

**Key reactive state:**
- `hpPercent` — derived: `(character.hp / character.hp_max) * 100`
- `hpClass` — derived: `'hp--healthy'` | `'hp--injured'` | `'hp--critical'`

**Events emitted via Socket.io:**
- `hp-update` — when damage/heal applied
- `rest` — when short/long rest triggered
- `condition-remove` — when a condition pill is dismissed

**Animation:** anime.js hit flash on `.hit-flash` when HP decreases. Import: `import { animate } from "animejs"`.

**CSS hook points:**

| Selector | State |
|----------|-------|
| `.char-card.is-critical` | HP ≤ 30% — red border |
| `.char-card.is-selected` | Checkbox checked — cyan border |
| `.char-card.collapsed` | Card body hidden (⚠ normalize to `.is-collapsed`) |
| `.char-card-exit-wrap.is-dragging` | During drag-to-reorder |
| `.hp-fill.hp--healthy/injured/critical` | Bar color state |
| `.card-toast` | Inline error message |

---

### DiceRoller

**Props:** None — reads `$characters` and `$lastRoll` from shared stores.

**Roll flow:**
1. User taps die button → `rollDice(sides)` called
2. Random value generated, POSTed to `POST /api/rolls`
3. Server broadcasts `roll-result` event via Socket.io
4. All connected clients (control panel + overlays) receive the result
5. `$lastRoll` store updates → animation triggers via `$effect`

**Animation:** anime.js elastic bounce on `.roll-number`. Import: `import anime from "animejs/lib/anime.es.js"` (⚠ normalize to same import as CharacterCard).

**CSS hook points:**

| Selector | State |
|----------|-------|
| `.roll-result.is-crit` | Natural 20 |
| `.roll-result.is-fail` | Natural 1 |
| `.roll-number.is-crit` | Number turns yellow/gold |
| `.roll-number.is-fail` | Number turns red |
| `.roll-label.is-crit` | Shows "¡CRÍTICO!" |
| `.roll-label.is-fail` | Shows "¡PIFIA!" |

---

### Modal

**Props:** `open` (boolean, bindable) — controls visibility.

**Known issue:** No focus trap. Keyboard users can Tab outside the modal. Fix: use `showModal()` on the underlying `<dialog>` element, or replace with shadcn-svelte Dialog (see `SHADCN-MIGRATION.md`).

---

### MultiSelect

**Props:**
- `options` — `Array<{ value: string, label: string, disabled?: boolean }>`
- `selected` — `string[]` (bindable, array of selected values)
- `rows` — number of visible rows (CSS `--ms-rows` variable, default 4)
- `placeholder` — shown when no options match

**Usage:**
```svelte
<MultiSelect
  {options}
  bind:selected={myValues}
  rows={5}
/>
```

**CSS custom property:** `--ms-rows` on `.multiselect` controls visible height.

**Known gap:** No keyboard navigation (arrow keys, Home/End). Fix: see Phase 2b in `SHADCN-MIGRATION.md`.

---

### PhotoSourcePicker

**Props:**
- `value` — current photo URL (bindable)
- `compact` — boolean, enables dense layout mode

**Sources:** "Preset" (choose from predefined portraits), "URL" (paste link), "Local" (file upload / drag-and-drop).

**Known issue:** `role="tablist"` on source segment control but children are plain `<button>` elements without `role="tab"`. Screen readers announce 0 tabs.

---

## Socket.io Events Reference

### Server → All Clients

| Event | Payload | Description |
|-------|---------|-------------|
| `initial-data` | `{ characters: Character[] }` | Sent on connection with full state |
| `character-updated` | `Character` | Single character state changed |
| `roll-result` | `RollResult` | Dice roll broadcast to all |
| `characters-updated` | `Character[]` | Full character list refresh |

### Client → Server (REST API)

| Endpoint | Method | Payload | Description |
|----------|--------|---------|-------------|
| `/api/rolls` | POST | `{ charId, result, modifier, sides }` | Submit a roll |
| `/api/characters` | GET | — | Fetch all characters |
| `/api/characters` | POST | `Character` | Create character |
| `/api/characters/:id` | PATCH | `Partial<Character>` | Update HP/conditions/resources |
| `/api/characters/:id` | DELETE | — | Delete character |

---

## Data Model

### Character

```typescript
interface Character {
  id: string;             // UUID
  name: string;
  player: string;
  class: string;
  level: number;
  hp: number;             // Current HP
  hp_max: number;         // Maximum HP
  ac: number;             // Armor Class
  speed: number;          // Movement speed (ft)
  photo?: string;         // Avatar URL or base64
  conditions: string[];   // Active condition names
  resources: Resource[];
}

interface Resource {
  name: string;           // e.g., "Hechizos Nv.1"
  pool_max: number;       // Total pips
  pool_used: number;      // Used pips
  reset_on: 'long_rest' | 'short_rest' | 'turn' | 'dm';
}
```

---

## OBS Setup

1. Start the server (`node server.js`)
2. Open `http://localhost:3000` — the landing page auto-detects your LAN IP and shows ready-to-paste overlay URLs
3. In OBS: Add Browser Source → paste URL → set 1920×1080, transparent background
4. Repeat for each of the 3 overlays

**Overlays share tokens from `public/tokens.css`.** If you change brand colors, update both `app.css` and `tokens.css`. (A build script to auto-sync these is tracked as a P3 improvement.)

---

## Known Issues & Priorities

### Fix immediately (P0)

1. **Cyan mismatch in level pills** — `CharacterCard.css` and `CharacterManagement.css` use `rgba(0,212,255,...)` (wrong blue channel). Replace with `var(--cyan-dim)` / `var(--cyan)`. ~5 minutes.

2. **Spanish diacriticals** — "Seleccion" → "Selección", "Dano" → "Daño", "Ultimas" → "Últimas". ~10 minutes.

### Fix before production (P1)

3. **Modal focus trap** — Replace `<dialog open>` with `showModal()` or shadcn Dialog. Users can Tab outside the modal currently.

4. **`role="tablist"` in PhotoSourcePicker** — Add `role="tab"`, `aria-selected`, `aria-controls` to segment control buttons.

5. **No loading state on API calls** — `updateHp()` and `rollDice()` don't disable buttons during fetch. Add `let loading = $state(false)` and `disabled={loading}`.

6. **d20 button not full-width** — Should be `grid-column: 1 / -1` in `.dice-grid`.

7. **Sidebar navigation** — `window.location.pathname = "..."` causes full reload. Replace with SvelteKit `goto()` from `$app/navigation`.

### Tracked improvements (P2)

8. **tokens.css sync** — Shadow values in `public/tokens.css` differ from `app.css`. Manual sync needed (or add a build script).

9. **anime.js dual import** — CharacterCard uses `import { animate } from "animejs"`, DiceRoller uses `import anime from "animejs/lib/anime.es.js"`. Standardize.

10. **`.char-card.collapsed`** — Should be `.is-collapsed` to match the `is-` state convention.

---

## Accessibility Checklist (for next developer)

- [ ] Add focus trap to Modal (P1)
- [ ] Fix `role="tablist"` in PhotoSourcePicker (P1)
- [ ] Add `aria-live="polite"` to dashboard log and HP update regions
- [ ] Add `aria-invalid` + `aria-describedby` to form validation errors
- [ ] Verify heading hierarchy: exactly one `<h1>` per page
- [ ] Add emoji icon alt text in bottom nav (`aria-hidden="true"` on icons, ensure `.nav-label` is the accessible name)

---

## Testing the Pitch Demo

The `v1.0.0-pitch` tag is the demo-ready state. To run the demo:

1. `git checkout v1.0.0-pitch`
2. `npm run dev` in `control-panel/`
3. `node server.js` in `server/`
4. Demo characters are: Hector (Fighter), Luis (Bard), Marcelo (Cleric), Cynthia (Warlock/Tiefling)
5. Demo script: apply damage → watch HP bar animate → roll d20 → get critical → show the overlay on screen

**Demo avoids:** The CharacterCreationForm and CharacterManagement routes — these have the multi-select UX issues and are not polished for demo.

---

*Handoff document prepared 2026-02-25*
