# Product

## Register

product

## Users

**Stream Operators (Stage):** Power users at a desktop during live recording. Task: real-time game state management — HP adjustments, roll logging, condition tracking, reveal queue. Context: high-stress, time-pressured, zero tolerance for friction. Primary task on any screen: change a value and trust the broadcast updated.

**Players (Cast):** Mobile-first users at the table during play. Task: character sheet reference and live resource tracking (HP, spell slots, conditions). Context: in-scene, one thumb, low bandwidth for UI complexity. Primary task: read their own state at a glance.

**Audience / OBS:** Purely reactive, listen-only. Not a UI user — a broadcast consumer. Overlays must read at streaming resolution under OBS compression with no interaction required.

## Product Purpose

TableRelay (formerly OVERLAYS) is a D&D comedy show production system for _Dados & Risas_. It coordinates real-time game state across three surfaces during live recording sessions: Stage (operator write authority), Cast (player read + safe fields), and Audience (OBS overlays). PocketBase is the source of truth; Socket.io broadcasts keep all clients in sync without polling. Success looks like an operator making a change and every surface — including a live stream — reflecting it within a second, with zero manual refresh.

## Brand Personality

- **Voice & Tone:** Professional, technical, immersive, and mystical. The tool should feel like something that belongs backstage at a high-budget production — not a weekend project, not a generic web app.
- **3-Word Personality:** Digital. Grimoire. Production-grade.
- **Emotional Goals:** Empowerment for operators (they are in control), immersion for players (they're living in the world), and "magical data" clarity for the audience (the numbers feel alive).

## Anti-references

- **Generic SaaS (Linear / Notion clones):** Neutral-gray surfaces, rounded-everything, Geist font, whitespace overload. This is a show control system, not a productivity tool.
- **D&D Beyond / Roll20:** Cluttered tabletop web apps, stock fantasy parchment imagery, dated UX patterns, icon overload. The "digital dungeon" aesthetic is a trap.
- **Neon-on-black streamer UI:** Twitch overlay templates — RGB chaos, glow everywhere, no hierarchy, no information priority. Glows must be earned by meaning, not applied as decoration.
- **AI slop dashboards:** Hero metrics, gradient cards, sparklines-as-decoration, glassmorphism as a theme. The hex-clip geometry and amber/cyan/red palette must be intentional, not atmospheric.

## Design Principles

1. **Glanceability first.** In a live session, operators cannot study the UI — they scan it. Maximum contrast between live data (data fonts, cyan) and structural chrome (amber labels). If it takes more than one beat to read, it's wrong.
2. **Rhythmic density.** TTRPG data is inherently dense. Pack it tightly using standardized gap tokens, not boxy card wrappers. The goal is a cockpit, not a checklist.
3. **Immersive utility.** Every control — including destructive ones — must feel part of the "Digital Grimoire" universe. Hex-clips, amber chrome, absolute-black backgrounds. If it looks like it could be a Stripe dashboard, start over.
4. **Earned glow.** Cyan glows signal live/active state. Red signals damage or critical. Amber is permanent chrome. Nothing glows by default. Glow is a semantic signal, not decoration.
5. **Adaptive context.** Stage is high-speed desktop with precise pointer. Cast is thumb-driven mobile during active play. The same data layer, two completely different interaction models.

## Accessibility & Inclusion

- Target: WCAG AA (4.5:1 contrast minimum, keyboard navigable, focus-managed).
- Audience overlays exempt from keyboard/focus requirements — they are display-only.
- Note: dark-mode-only with high-contrast accent palette; already favorable for readability. Verify contrast on amber-on-black and cyan-on-black values specifically.
