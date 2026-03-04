# Showbiz Production Audit — Dados & Risas
**Assessed against broadcast streaming standards + ESDH Producciones requirements**
*March 2026 — Current State Assessment*

---

## Executive Summary

Dados & Risas has a technically solid broadcast foundation — real-time WebSocket delivery, transparent overlays at 1920×1080, and animated feedback for the moments that matter. However, it currently operates as a **functional prototype**, not a production system. It is missing the brand personality ESDH is known for, has no failsafe against live disruptions, and lacks the "spectacle moments" that make streaming highlights clip-worthy. The gap between "it works" and "it's an ESDH show" is real and addressable.

---

## ✅ What's Working — Production Strengths

### 1. Core Broadcast Pipeline Is Solid
The architecture (`Control Panel → Node.js → Socket.io → OBS Browser Sources`) is the correct pattern for live streaming overlays. Sub-100ms latency from DM input to screen is **broadcast-grade** for a live stream. This is not a small thing — many competitor tools use polling, which causes visible lag. This system doesn't.

### 2. 1920×1080 Transparent Overlays — Correctly Spec'd
All three overlays are coded for `1920×1080` with `background: transparent`. This is the exact spec OBS Browser Sources require. No re-scaling needed. They stack cleanly in the OBS scene.

### 3. HP Bar State Is Visually Communicative
The three-state HP bar (green → orange → red pulse) communicates character health status **without text**. A viewer watching at a glance reads it instantly. The pulsing animation on critical is a genuine broadcast-quality UX decision.

### 4. Nat 20 / Nat 1 Are Showstopper Moments
Full-screen flash + giant result + `¡CRÍTICO!` / `¡PIFIA!` text is the right instinct. These are the clips that end up on Twitter. The animated entrance with elastic bounce on the number is a production quality detail.

### 5. Auto-Show/Hide on Conditions Overlay
The conditions overlay fading in only when relevant and fading out when clear is textbook broadcast design — don't clutter the frame when there's nothing to say.

### 6. `?server=` Query Parameter Architecture
Overlays read their server URL from a query parameter rather than hardcoded IPs. This is correct for a mobile/LAN production environment where the server IP changes per session. Good operator hygiene.

### 7. Theme Editor Exists
A live `theme-editor/index.html` is available. For a production context where a designer or technical director needs to tweak the look without touching code — this is a genuine operational asset.

---

## 🚨 Critical Issues — Blocking Production Use

### CRITICAL 1: Stateless Overlays — Zero Recovery from Disruption
**Problem:** If the OBS browser source refreshes mid-stream (which OBS does during scene transitions with "refresh when active" enabled), the overlay loads blank and waits for the next Socket.io event to populate. In a 2-hour session, a character at 8 HP can show full green bars for 20 minutes while the audience watches.

**Production impact:** Incorrect HP info on screen is confusing at best, story-breaking at worst.

**Fix required:** Overlays must fetch `/api/characters` via HTTP on load to hydrate themselves before Socket.io events arrive. The `initialData` event fires only once on connect — it does not handle mid-session reconnects after a browser source refresh.

---

### CRITICAL 2: ESDH Yellow (`#FFD200`) Is Absent From the Design System
**Problem:** The [ESDH Brand Guidelines](./ESDH-BRAND-GUIDELINES.md) explicitly define `#FFD200` as the **primary brand color** for success states, Nat 20 highlights, and logo accents. The current system uses **cyan (`#00D4E8`)** for Nat 20 and all success/positive states.

**Production impact:** When this runs on an ESDH stream, it will look like a generic overlay, not an ESDH production. A Nat 20 for Héctor should flash ESDH Yellow, not a generic teal.

**Fix required:** Add `--yellow: #FFD200` to `design/tokens.json`, regenerate tokens (`bun run generate:tokens`), and wire Nat 20 flash to use yellow glow instead of cyan.

---

### CRITICAL 3: No DM Authentication — Anyone on the LAN Can Destroy a Live Session
**Problem:** `CORS: "*"` + no API key means any device on the same WiFi network can call `DELETE /api/characters/CH101` and wipe a character mid-broadcast.

**Production impact:** At a venue, a public WiFi network, or even an audience member with network access could accidentally or maliciously kill the session.

**Fix required:** Minimum — a shared secret API key header required for all `POST/PUT/DELETE` operations. The DM control panel sends it automatically; external requests don't have it.

---

## ⚠️ High Priority Issues

### HIGH 1: Nat 20 Has No Sound Hook
ESDH uses Stream Decks to trigger SFX instantly to punctuate moments (see [ESDH Research Report](./ESDH-RESEARCH-REPORT.md)). The current Nat 20 visual is good but there is no audio event, no sound file playback, and no hook for a sound designer to attach to.

**Fix:** Add an optional `audio_cue` field to the `dice_rolled` Socket.io payload. Overlays can play a short MP3 from `/assets/sfx/`. The DM or producer selects which sound per roll type.

---

### HIGH 2: Dice Rolls Have No Context — "18" Means Nothing
A roll of 18 appears on screen with no label for what it was for. Attack roll? Stealth? Persuasion? The audience has no idea.

**Current payload:** `{ charId, result, sides, modifier }`
**Missing:** `{ reason: "Ataque vs. Dragón", skill: "Athletics" }`

A roll banner reading **"SIGRID — PERSUASIÓN — 18"** tells a story. "18" does not. This is the single highest-leverage UX improvement for viewer comprehension.

---

### HIGH 3: Condition Badges Are Text-Only — No Icons
The [ESDH Brand Guidelines](./ESDH-BRAND-GUIDELINES.md) call for **"Sticker-style" graphics (bold white outlines) for conditions**. Current implementation: uppercase text pills. For streaming, `ENVENENADO` as a red text pill reads as low production value. BG3 uses icons. D&D Beyond uses icons. Viewers expect icons.

**Fix:** Replace or augment condition text badges with an SVG/PNG icon set. Priority icons: Poisoned, Stunned, Blinded, Frightened, Prone, Concentration. Text fallback remains for custom conditions.

---

### HIGH 4: No "Turn Transition" Announcement Overlay
The Brand Guidelines call for turn transitions to feel like "Breaking News / Último Minuto banners." Currently there is **zero visual on-screen indication of whose turn it is**. The `InitiativeStrip` component is being built in the control panel, but there is no corresponding `overlay-initiative.html`.

**Production impact:** For a combat-heavy D&D stream, viewers cannot follow the battle without the DM narrating every transition.

---

### HIGH 5: The `/dashboard` Route Is Not Viewer-Ready
The dashboard exists but is DM-facing only. There is no publicly shareable URL that viewers can use as a "Party Inspector" (as recommended in the [BG3 Comparison Report](./BG3-COMPARISON-REPORT.md)). This is a missed community engagement opportunity specific to ESDH's Uh Lalá audience model.

---

## 🟡 Medium Priority

### MEDIUM 1: Character Portrait Fallback Is Two-Letter Initials
When no photo is uploaded, the HP overlay shows a circle with "AB" (initials). For a professional stream, this looks unfinished. A branded silhouette SVG keyed to character class (sword, shield, skull, staff) is a one-time art asset that permanently elevates overlay quality.

### MEDIUM 2: Conditions Overlay Caps at 3 Badges Per Character
The `overlay-hp.html` shows a max of 3 condition badges then "+N more." In a high-condition scenario (Stunned + Poisoned + Restrained + Concentration), the fourth condition is hidden. Hidden information erodes viewer trust and comprehension.

### MEDIUM 3: HP Damage Has No Impact Flash
The Brand Guidelines call for "Juicy" HP changes — the bar shouldn't just shrink, it should shake and flash red. The dice overlay has a screen flash. The HP overlay's bar animates width smoothly but has **no damage impact feedback**. A hit should feel like a hit.

### MEDIUM 4: Depleted Resources Not Visible on HP Overlay
The conditions overlay shows depleted resources (`RABIA ✗`), but the HP overlay — the primary always-visible overlay — shows nothing about resource state. A viewer watching the HP overlay has no idea Sigrid has no Rage uses left.

### MEDIUM 5: Fonts Load From Google CDN
Overlays load `Bebas Neue` and `JetBrains Mono` from `fonts.googleapis.com`. On a local network without internet access (venue WiFi, isolated broadcast rig), fonts fail silently and fall back to `Impact`/`Courier New`.

**Fix:** Self-host font files in `/assets/fonts/` and reference them via `@font-face` in the overlay CSS.

### MEDIUM 6: No Session Start Ceremony
There is no visual ceremony for starting a session. A brief branded reveal animation when the session begins is purely a production value item but signals to the audience "the show is starting."

---

## 🔵 ESDH Brand Alignment Gaps

| Guideline | Current State | Gap |
|-----------|--------------|-----|
| ESDH Yellow `#FFD200` as primary success color | ❌ Not in tokens | Nat 20 flashes cyan, not ESDH yellow |
| Chilean "modismos" in UI labels | ⚠️ Partial | `¡CRÍTICO!` / `¡PIFIA!` exist; damage/heal labels are generic |
| Sticker-style condition icons | ❌ Missing | Text pills only |
| "Snappy" animations (fast, high-impact) | ✅ Present | anime.js timing is correct |
| Screen shake on damage | ❌ Missing | Smooth bar transition only |
| `show_sticker` Socket event | ❌ Not implemented | No meme/sticker popup system |
| Community supporter highlights | ❌ Not implemented | No viewer tier integration |
| Stream Deck / SFX trigger support | ❌ No audio hook | Pure visual system |

---

## 📋 Documentation Gaps

1. **No operator runsheet** — There is no single "CÓMO USAR ESTO EN EL SHOW" document that a production assistant can follow without understanding the code. Setup steps are scattered across `README.md` and `docs/ENVIRONMENT.md`.

2. **No OBS scene template** — No downloadable `.json` OBS scene collection with all three browser sources pre-configured, positioned, and named correctly. This is the #1 onboarding friction for non-technical crew.

3. **No emergency procedures guide** — What does the operator do if the server crashes mid-session? If the overlay goes blank? If a character's HP is wrong on screen? These are live show scenarios with no documented recovery procedure.

4. **ESDH brand guidelines not enforced in code** — `docs/ESDH-BRAND-GUIDELINES.md` exists but `design/tokens.json` does not contain `--yellow: #FFD200`. The guideline is written but not implemented.

---

## Prioritized Next Steps

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🚨 | Add state hydration on overlay load (HTTP fetch `/api/characters`) | Low | Critical broadcast reliability |
| 🚨 | Add `--yellow: #FFD200` to `design/tokens.json`, regenerate, wire Nat 20 | Low | Brand alignment |
| 🚨 | Add API key auth for all write operations | Medium | Production security |
| ⚠️ | Add `reason`/`skill` field to dice roll payload + show on overlay | Low | Narrative clarity |
| ⚠️ | Build `overlay-initiative.html` | Medium | Turn flow visibility |
| ⚠️ | Add `audio_cue` field + SFX playback hook to dice overlay | Medium | ESDH show energy |
| ⚠️ | Replace condition text badges with icon set | Medium | Visual production value |
| ⚠️ | Self-host fonts in `/assets/fonts/` | Low | Venue/offline reliability |
| 🟡 | Add HP damage flash + shake animation to `overlay-hp.html` | Low | "Juicy" feel |
| 🟡 | Create OBS scene template `.json` | Low | Operator onboarding |
| 🟡 | Write single-page operator runsheet (`docs/OPERATOR-RUNSHEET.md`) | Low | Production independence |

---

## Related Documents

- [ESDH Brand Guidelines](./ESDH-BRAND-GUIDELINES.md)
- [ESDH Research Report](./ESDH-RESEARCH-REPORT.md)
- [BG3 Comparison Report](./BG3-COMPARISON-REPORT.md)
- [Architecture](./ARCHITECTURE.md)
- [Socket Events](./SOCKET-EVENTS.md)
- [Design System](./DESIGN-SYSTEM.md)
