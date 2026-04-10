# TableRelay — Brainstorm Ideas

All ideas generated via `/dual-brainstorm` sessions. Status reflects the last Critic review.
Open GitHub issues for anything marked **ship now** or **ship next**.

---

## Session 1 — General Product (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Character Death Portraits** | At 0 HP: 1.2s desaturation. On revive: 2.5s radial color bloom from center. CSS filter transition on overlay, zero operator input. |
| ✅ ship now | **Roll Prophecy** | Operator marks a roll Consequential → overlay enters charged visual state. Operator-controlled hold button (not a timer). Auto-release after 3min with soft fade. Pairs with Pre-Announce Beat. |
| ✅ ship now | **Condition Lore Cards** | When condition applied → 5s overlay card with D&D 5e rules text. Cache full conditions list at session-start (never live API call). Source: dnd5eapi.co. |
| 🔧 ship next | **Moment Machine** | Rolls ≥18 or ≤3 trigger cinematic overlay freeze-frame. Needs: combat-only gate, operator suppress button, 90s cooldown between fires, OBS perf test for particle system. |
| 🔧 ship next | **Green Room Feed** | Private Socket.io channel DM → individual player's Cast surface. v1: pre-authored notes from Prep export, tap to fire. Free-text is v2. |
| 🔧 design first | **Tension Barometer** | Ambient overlay tracks encounter heat. Needs decay curve (heat fades in 45s if not reinforced), operator-configurable weights, subtle vignette (not a full red bleed), min 2 simultaneous heat events to activate. |
| 📦 backlog | **Session Heartbeat Export** | "Spotify Wrapped for D&D" — HP arcs, roll distribution, condition timeline as a shareable image. First step: log structured time-series data to PocketBase. Image renderer is a separate sprint. |
| 💡 new | **Ambient Silence Detector** | No socket events for 90s → operator sees a "dead air" pulse indicator on Stage. Zero OBS footprint. ~1hr build. |
| 💡 new | **Consequence Preview** | DM pre-sets stakes from a fixed dropdown (Miss = prone, Fail = lose spell slot, etc.) before the roll. On failure: overlay flashes consequence for 3s. No free-text, no API calls. |
| 💡 new | **Last Words Buffer** | At 0 HP, DM has a 10s window to type ≤60 chars that appear beneath the death portrait. If nothing typed, overlay fires without it. Pre-authorable from Prep export. |

---

## Session 2 — Dice Rolling UI/UX (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **rollType field** | Controlled enum dropdown (not free text): `Ability Check \| Saving Throw \| Attack Roll \| Skill Check \| Death Save \| Initiative \| Custom`. Drives overlay skin mapping automatically. |
| ✅ ship now | **Failure Taxonomy** | Store `dc` as nullable int in `logRoll`. Overlay renders "MISSED BY 3" vs "FUMBLED (−8 under DC)". Add `gap_display: full \| minimal \| off` operator toggle. |
| ✅ ship now | **Void Roll (offline fallback)** | Client-side roll queue in localStorage. Queued rolls carry `shortId` for dedup. Stage HUD shows "N ROLLS QUEUED" badge. Drains on reconnect. **Non-negotiable — log corruption is silent without this.** |
| ✅ ship now | **Pre-Announce Beat** | Two-phase: operator declares roll (character + type + DC) → overlay shows pending for 2–3s → result fires. Hold button (not timer) so DM controls reveal. State machine: `PENDING → ANNOUNCED → RESOLVED`. |
| 🔧 ship next | **Exploding Roll Chains** | Store `roll_sequence` as JSON array (`[3, 18]`) not just final int. Overlay has "dice rolling" hold state + manual REVEAL CHAIN operator trigger. Prevents spoiling result on-stream. |
| 🔧 ship next | **Roll Type → Overlay Skin Mapping** | Each rollType triggers a different visual: Crit = screen flash, Death Save = slow burn, Skill = portrait badge, Initiative = leaderboard. Skin flash needs operator off-switch. Unmapped types fall back to neutral parchment theme. |
| 🔧 ship next | **Roll Streak / Pattern Surface** | LogPanel derived layer (not PocketBase): detects 3 failed saves in a row, two nat-1s in same combat, player who hasn't rolled above 10. Dismissible callouts. Surface between turns only. |
| 🔧 ship next | **Roll Ownership Disambiguation** | Add `roller` as nullable free-text field (not FK) to `logRoll`. Defaults to character name. Enables DM secret rolls, group checks, guest players. Streak attribution goes to player, not character. |
| 🔧 descope | **Contextual Autocomplete on Intake Form** | Tap character card on Stage pre-selects character in form (v1). Smart DC prediction (e.g. Concentration Check DC = half damage taken) is v2 after roll history accumulates. |

---

## Session 3 — DM Panel (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Condition remove from SessionCard** | Tap condition badge → `DELETE /characters/:id/conditions/:id`. Badge animates out (scale→0, 150ms). No confirm dialog — reversible by re-adding. Backend handler already exists. |
| ✅ ship now | **Condition palette into SessionBar confirm row** | Replace free-text condition input with always-expanded pill grid (14 standard 5e conditions). Multiple conditions selectable before confirming. Avoids long-press gesture collision. |
| ✅ ship now | **Quick dice intake auto-defaults** | When turn advances, `rollerId` auto-sets to active combatant, `rollType` resets to "attack". DM only confirms. |
| 🔧 ship next | **Hold-to-advance end turn** | Hold active combatant chip 600ms → progress ring fills → `POST /encounter/next-turn`. Releasing early cancels. Replaces "Siguiente" tap button. Prevents mis-tap during narration. |
| 🔧 ship next | **Contextual action prediction** | `$derived` `suggestedAction` computed in `+page.svelte` (low HP → heal, condition present → remove). Passed as prop to SessionBar. Shown as muted pill. Gated on `!pendingAction`. |
| 🔧 medium | **NPC scratch cards** | Name, HP stepper, AC, condition palette, one note. Session-only in `encounter.ts` memory. New `npc_updated` socket event. Extend `OverlayTurnOrder` with optional `enemies` array (`name, hp_current, hp_max, conditions`). Opens as bottom sheet from initiative strip chip tap. |
| 🔧 medium | **Combat log accumulator** | In-memory per-encounter tally in `encounter.ts`: damage/healing per character, conditions applied, KOs, rounds. Serializes on `endEncounter`. JSON export first; shareable card is Phase 3. |
| 🔧 large | **Initiative persistence** | Move `combatants`, `activeIndex`, `round` to server-side `encounter.ts`. `nextTurn` becomes a REST endpoint. Countdown ring stays as client-only UI ornament. |
| ❌ deferred | **Dramatic HP reveal mode** | Two-phase server write needed (`pendingHp` field + `/hp/reveal` endpoint). Simpler substitute: DM waits to tap Confirm. Revisit after initiative persistence ships. |

---

## Session 4 — Anime.js + Svelte 5 Motion Suite (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Tweened State Pattern** | Use Svelte 5 `$state` proxy to interpolate numbers (HP 100 → 45). Essential for "Digital Grimoire" feel. Prevents "cheap" jumping of stats. |
| ✅ ship now | **Timeline Sync Protocol** | Socket payloads include `startTime`. Client calls `timeline.seek(Date.now() - startTime)` to sync multi-stage animations across clients. |
| ✅ ship now | **use:motion Action** | Svelte 5 action wrapping Anime.js. MUST return `destroy` calling `anime.remove(node)` to prevent memory leaks. Handles reactive interruptions. |
| 🔧 ship next | **3D "Grimoire Flip"** | `rotateY` CSS transitions driven by Anime.js for panel switching (Inventory → Spells). High-impact for Cast layer (mobile). |
| 🔧 ship next | **Optimized SVG Morphing** | Limit path points to <50. Use fixed-duration tweens (not reactive) to protect OBS frame times in Audience layer. |
| ❌ cut | **Canvas Particle Engine** | Too complex. Stick to DOM/SVG for better accessibility and faster development. |

---

## Session 5 — Gemini-TableRelay UX Suite (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Echo-Tags** | O(1) Stage filtering via metadata tags on socket broadcasts. Essential for operator speed. |
| ✅ ship now | **Soul-Bond** | Visual condition signatures (Stunned=grayscale, Burning=flicker) via Svelte 5 snippets. |
| ✅ ship now | **Kinetic Shiver** | 2px CSS jitter pulse for tactile feedback on all devices (iOS fallback for haptics). |
| 🔧 ship next | **Blood-Ink** | High-impact SVG/CSS filters on HP drop >25%. Needs OBS perf profiling. |
| 🔧 ship next | **Whisper (Draft State)** | NL commands via Gemini Skill, but strictly as a "Draft" for operator confirmation. |
| ❌ cut | **Direct NL-to-API** | Too risky for live production. High probability of catastrophic interpretation errors. |

---

## Session 6 — Google AI Integration Suite (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Scribe's Ghost (Worker)** | Async sidecar queue that listens to broadcasts and formats JSON into bullet points via Gemini Flash. No latency impact on main loop. |
| ✅ ship now | **Chronologist's Ink (UI)** | Stage-layer "Drafting Table" for operator review/edit of logs before synthesis into public Lore. |
| 🔧 ship next | **Portrait of Nameless** | Imagen API integration for NPC portraits. Needs cost-analysis and "Style-Lock" prompt refinement. |
| ❌ cut | **Narrative Tension Predictor** | Too subjective. Operators need deterministic speed, not AI-driven "predictions" during live shows. |

---

## Session 7 — Visual Asset Creation (2026-04-04)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Alchemical Icons** | Hybrid library: Core conditions (Stunned, Poisoned) use pre-rendered 18th-century "medical sketch" SVGs. Rare/custom conditions trigger lazy Imagen background generation. |
| ✅ ship now | **Ink-Bleed Engine** | High-performance manifestation effect using a 32-frame sprite-sheet alpha mask. Zero CPU overhead for OBS/mobile. Turns "loading" into a narrative beat. |
| ✅ ship now | **Vellum UI Wear** | Real-time "page damage" (charring, frost, blood) using composited CSS `inset box-shadow` layers and radial gradients driven by damage type. |
| ✅ ship now | **Optimistic Stage Proxy** | Svelte 5 `$state` proxy for operators. Visual feedback is instant on-click; REST/Socket sync happens in background. Fixes "laggy" feel during live combat. |
| 🔧 ship next | **Somatic Sigil Drawing** | Real-time SVG path "stroke-drawing" for spells. School-specific occult geometry (Necromancy=bone, Evocation=sharp ink). |
| 🔧 ship next | **JSON Patching (Sync)** | Differential socket broadcasts (RFC 6902) to minimize mobile bandwidth. Only send deltas (e.g. `hp_current: 45`) instead of full records. |

---

## Session 8 — 3D-to-SVG & Morphing Assets (2026-04-06)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Blender-to-SVG Dice Outlines** | Render all dice faces (d4–d20) in Blender as black wireframe outlines. Convert to optimized SVGs. Enables complex "3D-like" animations in Audience layer with zero WebGL overhead. |
| ✅ ship now | **Morphing Polyhedral Loader** | CSS/SVG transition that morphs the loader icon between d20 → d12 → d10 → d8 → d6 → d4 shapes in a continuous loop. Uses SVG path interpolation for fluid "Digital Grimoire" loading state. |
| 💡 new | **Isometric Tumble Paths** | Pre-rendered SVG paths of a d20 tumbling; CSS `offset-path` drives the "roll" on the overlay. |
| 💡 new | **School-Specific Morphing** | Loader morphs into school-specific shapes (d8 for Evocation, d4 for Necromancy) during spell-cast delays. |
| 💡 new | **Grimoire Page-Turn Transitions** | 3D-rendered "bending page" outlines used as SVG masks for layer-to-layer transitions. |
| 💡 new | **The Dice Ghost** | 5% opacity 3D-SVG wireframe that "orbits" the active character's avatar on Stage as a "ready" state. |
| 💡 new | **Side-Step Transition** | UI "slides" through a 3D-rendered SVG wireframe of a d12 during view-switching. |

---

## 🧠 System-Wide Learnings

Core architectural patterns that emerged across sessions:

### 1. The "Pro Critic" Inversion
- **Visionary**: Gemini 1.5 Flash (Volume, speed, bold fluency).
- **Critic**: Gemini 1.5 Pro (Precision, data model implications, architectural consistency).
- **Why**: The ideator needs volume; the quality gate needs intelligence. The stronger model earns its cost by catching subtle show-floor failure modes.

### 2. Empirical Refutation
- **Rule**: The Critic only runs code (`run_shell_command`) when the Visionary makes an explicit implementability claim.
- **Goal**: Kill bad ideas with evidence (compiler/linter errors) instead of rhetoric, without turning brainstorms into debugging sessions.

### 3. Operator Control > Timers
- Every proposed "timer" has been replaced by an operator-controlled "hold" or "release".
- The system must sync with the DM's narration, not force a pace.

### 4. Reactive State Proxies
- Mutating global stores directly is a "shallow" pattern.
- Deep modules use `$state` proxies to interpolate transitions (Anime.js) before projecting to the UI.
`n---`n`n## Session 9 — VS Code DX Suite (2026-04-08)`n`n| Status | Idea | Notes |`n|---|---|---|`n| ✅ ship now | **Protocol Shield** | Static validation of socket strings against `shared/contracts/events.ts`. Prevents typos in real-time loops. |`n| ✅ ship now | **Cross-Layer Jump** | Gutter icons to jump from `socket.emit` (backend) to `socket.on` (surfaces) and vice versa. |`n| ✅ ship now | **Mobile Mirror (QR)** | Status bar QR code generator for the `setup-ip` network URL. Instant phone testing for Cast layer. |`n| ✅ ship now | **Runtime Sync Auditor** | Background listener that flags DB writes (PocketBase) missing a corresponding socket broadcast. |`n| 🔧 ship next | **Rune-Flame Decorators** | Visual orange pulse on Svelte 5 runes updating >10x/sec. Identifies \"broadcast storms\" in IDE. |`n| 🔧 ship next | **PocketBase Live-Grid** | CodeLens \"Peek\" showing the top 5 records of a collection directly above its code reference. |`n| 📦 backlog | **Sidecar Preview** | Pinned panel that reloads the Svelte Audience/Cast layer on save. |`n| 📦 backlog | **Bundle-HUD** | Status bar indicator for Audience layer Gzip size (+/- delta since last commit). |`n| ❌ rejected | **Perf-Ghost Overlay** | 10% opacity code overlay. Rejected by Critic as a high-friction UX trap. |
`n---`n`n## Session 10 — TableRelay DX Infrastructure (2026-04-08)`n`n| Status | Idea | Notes |`n|---|---|---|`n| ✅ ship now | **The Relay-CLI (tr)** | Single Bun-based binary to orchestrate PB, Backend, and Surfaces with a unified dashboard. |`n| ✅ ship now | **LAN Tunnel (tr share)** | Integrated Cloudflare/Localtunnel for instant remote feedback on specific layers. |`n| ✅ ship now | **JSON Snapshot (tr snap)** | Captures live CharacterLiveState to `lib/mocks/live-state.json` for Storybook/Vitest repros. |`n| ✅ ship now | **Voice-to-TODO** | Gemini-powered mobile bug reporting (Cast layer) that attaches current state + screenshot. |`n| 🔧 ship next | **Resilience Lab*** | Socket/DB failure simulation (Chaos-D20) gated behind a `--chaos` flag for pre-show stress tests. |`n| 🔧 ship next | **Contract Linter** | Real-time warning in `tr dev` if PocketBase schema differs from `@contracts`. |`n| 💡 new | **Socket Profiler** | CLI/IDE view of event frequency and payload byte-size to detect \"Broadcast Storms\". |
`n---`n`n## Session 11 — Socket Profiler (tr prof) (2026-04-08)`n`n| Status | Idea | Notes |`n|---|---|---|`n| ✅ ship now | **tr prof watch** | Real-time \"Oscilloscope\" for socket traffic with green-highlighted byte diffs. |`n| ✅ ship now | **tr prof record** | Time-travel debugging: Record combat sessions to `.prof` files for local playback. |`n| ✅ ship now | **Desync-Detector** | Diagnostic tool that flags >100ms gaps between DB writes and Socket broadcasts. |`n| 🔧 ship next | **tr prof suggest** | AI-generated Svelte 5 optimization snippets (JSON Patching / Partial Updates). |`n| 🔧 ship next | **Ghost-Client** | Simulated browser instances that report memory leaks in the Audience overlay. |`n| 📦 backlog | **tr prof bench** | Throttled load simulation (3G/Low-CPU) for mobile-first testing. |`n| ❌ cut | **tr prof map** | Live Mermaid.js diagram generation. (Static docs are sufficient). |

---

## Session 12 — VS Code Extension: Orientation Layer (2026-04-08)

| Status | Idea | Notes |
|---|---|---|
| ✅ ship now | **Color-Coded Folders (Material Icon Theme)** | Zero-build: `material-icon-theme.folders.associations` in `.vscode/settings.json`. Maps `(stage)` → purple (brand primary), `(cast)` → amber (`#C8944A`), `(audience)`/`overlays` → cyan (`#00D4E8`), `backend` → server icon, `contracts` → types icon. Committed to repo — shared instantly with any contributor. Colors match existing design tokens. |
| ✅ ship now | **M2 Dead Import Blocker** | DiagnosticsProvider: error-level squiggle on any `$server/data/*` import found in frontend files. Prevents the Node crypto / browser bundle crash. Static regex — zero runtime cost. |
| ✅ ship now | **M1 Legacy .js Gutter** | Gutter icon + warning diagnostic on any `import ... from '.*\.js'` in `.ts`/`.svelte` files. Quick-fix offered: "Rename to .ts". Catches Phase 1 legacy files before they spread. |
| ✅ ship now | **V1 Surface Badge** | FileDecorationProvider: badge + ThemeColor per surface (S=Stage/yellow, A=Audience/blue, C=Cast/green, B=Backend/purple). Shows in file explorer and editor tabs. Eliminates the "where am I?" disorientation. |
| 🔧 ship next | **V2 Mutation CodeLens** | CodeLens on `.svelte` files: scans for `fetch(` (REST/legacy) vs `socket.emit(` (Phase 2). Shows "Phase 1 — REST" or "Phase 2 — Socket" inline. Lets dev see the mutation pattern without reading the logic. |
| 🔧 ship next | **V4 Socket Event Hover Dossier** | HoverProvider on socket event string literals (e.g. `'hp_updated'`): resolves the import chain to show payload type from `@contracts/events.ts` inline. Critic fix: import-resolved (not grep), so it works with aliases. |
| 🔧 ship next | **V5 Schema Drift Linter** | Static diff: parse `migrate-collections.ts` field list vs `records.ts` types. Warning diagnostic if a field exists in one but not the other. Catches schema/contract drift before PocketBase rejects writes. |
| 🔧 ship next | **V3 Reveal Surface Route Folder** | Quick Pick (`Ctrl+Shift+T`) groups files by surface first, then by route/component. Critic fix: tree-based, not flat list — prevents scroll fatigue with 284+ components. |
| 🔧 backlog | **V6 OBS Overlay Simulator** | WebviewPanel that renders overlay components with static fixture data (no live socket needed). Critic fix: static fixtures only — no iframe. Useful for design iteration without OBS. |
| 🔧 backlog | **V7 Component Count Status Bar** | Status bar item showing component count in `lib/components/shared/` with configurable warning threshold. Addresses the "284 components" growth problem. Low build cost; useful for tracking shared UI kit growth. |
