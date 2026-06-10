---
name: TableRelay — Dados & Risas
description: Real-time D&D show production system. Stage control, Cast companion, and OBS overlays.
colors:
  canvas: '#000000'
  card-surface: '#0d0d0d'
  elevated-surface: '#1a1a1a'
  primary-text: '#ffffff'
  muted-text: '#888888'
  border-subtle: '#333333'
  amber-chrome: '#c8944a'
  arcane-signal: '#00d4e8'
  critical-scarlet: '#ff4d6a'
  fate-purple: '#500df5'
  hp-healthy: '#22c55e'
  hp-injured: '#f59e0b'
  hp-critical: '#ff4d6a'
typography:
  display:
    fontFamily: 'Space Grotesk, system-ui, sans-serif'
    fontWeight: 700
    letterSpacing: '0.08em'
  title:
    fontFamily: 'Noto Serif, Georgia, serif'
    fontWeight: 700
    letterSpacing: '0'
  label:
    fontFamily: 'Space Grotesk, system-ui, sans-serif'
    fontWeight: 700
    fontSize: '11px'
    letterSpacing: '0.08em'
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontWeight: 400
    fontSize: '14px'
    lineHeight: 1.5
  mono:
    fontFamily: 'JetBrains Mono, Courier New, monospace'
    fontWeight: 700
    letterSpacing: '0'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
  pill: '999px'
spacing:
  half: '2px'
  1: '4px'
  2: '8px'
  3: '12px'
  4: '16px'
  6: '24px'
  8: '32px'
  12: '48px'
components:
  button-primary:
    backgroundColor: '{colors.amber-chrome}'
    textColor: '{colors.canvas}'
    rounded: '{rounded.sm}'
    padding: '8px 16px'
  button-primary-hover:
    backgroundColor: '#d4a05c'
    textColor: '{colors.canvas}'
    rounded: '{rounded.sm}'
    padding: '8px 16px'
  button-destructive:
    backgroundColor: 'transparent'
    textColor: '{colors.critical-scarlet}'
    rounded: '{rounded.sm}'
    padding: '8px 16px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.primary-text}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  card-base:
    backgroundColor: '{colors.card-surface}'
    textColor: '{colors.primary-text}'
    rounded: '{rounded.md}'
    padding: '16px'
  input-field:
    backgroundColor: '{colors.elevated-surface}'
    textColor: '{colors.primary-text}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  condition-pill:
    backgroundColor: '{colors.elevated-surface}'
    textColor: '{colors.muted-text}'
    rounded: '{rounded.pill}'
    padding: '4px 8px'
  condition-pill-active:
    backgroundColor: '{colors.critical-scarlet}'
    textColor: '{colors.primary-text}'
    rounded: '{rounded.pill}'
    padding: '4px 8px'
---

# Design System: TableRelay — Dados & Risas

## 1. Overview

**Creative North Star: "The Arcane Cockpit"**

TableRelay is a production control system that never forgets it serves a story. The interface is built like mission control — dense, legible, immediately responsive — wrapped in the grammar of an arcane manuscript. Amber chrome reads like aged brass fittings on a ship's instrument panel. Absolute black is not void but depth: every surface is a lens into the game beneath. The hex-clip geometry is not decorative; it marks the boundary between operator space and character space, every portrait a contained sigil.

The system has three registers in one visual language. Stage (operators) is a cockpit: maximum information density, high-contrast labels, actions that answer without warmup. Cast (players) is a companion: the same data layer, quieter, mobile-first, readable at a glance from a tablet mid-game. Audience (OBS overlays) is pure signal: no chrome, only meaningful data in streaming-optimized layouts, composited over absolute black for OBS chroma keying.

This system explicitly rejects the fantasy-software aesthetic of D&D Beyond and Roll20 — no parchment, no stock swords, no cluttered icon overload, no "digital dungeon" ornamental chrome. It equally rejects the generic SaaS aesthetic of Linear or Notion clones — no rounded-everything, no neutral-gray surfaces, no Geist-font whitespace overload. And it rejects neon-on-black streamer UI — the RGB chaos where everything glows at once and nothing means anything. In this system, glow is a semantic signal, not a decorative style.

**Key Characteristics:**

- Absolute-black canvas (#000000) — OBS transparency-ready on all overlay routes
- Amber chrome as structural skeleton, not highlight — present everywhere, never signaling
- Pixel-art offset shadows (3–4px, zero blur radius) — tactile without being soft
- Hex-clip geometry for all portrait elements — never circular, never rectangular
- Cyan glows only on live/active/healing state; red only on damage or critical threat
- Spanish localization throughout: VIT, CA, FUE, DES, CON, INT, SAB, CAR

## 2. Colors: The Cockpit Palette

A four-color semantic system on an absolute-black canvas. Each accent is a signal; none are decoration.

### Primary

- **Amber Chrome** (#c8944a): The structural skeleton — navigation labels, section headers, tab indicators, focus rings, permanent chrome. Present on every screen as the connective tissue. Never used for live-state signaling.

### Secondary

- **Arcane Signal** (#00d4e8): Live state, active socket connections, healing events, connected indicators. Applied with a cyan glow (`0 0 8px rgba(0, 212, 232, 0.5)`) when representing active state. When nothing is live, cyan is absent.

### Tertiary

- **Critical Scarlet** (#ff4d6a): Damage events, critical HP state (<25%), destructive actions, active threat conditions. The only color in the system that pulses — the HP bar animation at critical health.
- **Fate Purple** (#500df5): Dice interface only. The d20 highlight, dice result displays, probability indicators. Prohibited outside the dice surface.

### Neutral

- **Canvas Black** (#000000): Global app background. OBS-transparent for all overlay routes. True black — not tinted, not lifted.
- **Card Surface** (#0d0d0d): Card and panel surfaces — barely lifted from canvas to create structural separation without brightness.
- **Elevated Surface** (#1a1a1a): Inputs, popovers, modals, sidebar panels — the topmost static layer.
- **Primary Text** (#ffffff): All primary readable content.
- **Muted Text** (#888888): Secondary labels, helper copy, metadata, inactive state.
- **Border Subtle** (#333333): Dividers, inactive borders, structural separation between sections.

### HP Semantic Palette

- **Healthy** (#22c55e, gradient from #15803d): HP bar fill above 50% health.
- **Injured** (#f59e0b, gradient from #b45309): HP bar fill at 25–50% health.
- **Critical** (#ff4d6a, gradient from #991b1b): HP bar fill below 25% health. Pulses.

### Named Rules

**The Earned Glow Rule.** Nothing glows at rest. Cyan glow signals live/active state. Red signals damage or critical threat. Amber is structural — never illuminated. If a glow appears where it does not represent live connection or active damage, it is wrong.

**The Three-Signal Rule.** Amber = structure (always present). Cyan = live (when active). Red = threat (when occurring). Purple = dice (when rolling). These four colors carry the entire semantic load. Do not introduce a fifth.

## 3. Typography: The Data Hierarchy

**Display Font:** Space Grotesk (system-ui fallback)
**Title Font:** Noto Serif (Georgia fallback)
**Data Font:** JetBrains Mono (Courier New fallback)
**Script Font:** Dancing Script (brand ampersand only — not a UI font)
**Body Font:** system-ui / -apple-system

**Character:** Space Grotesk is the cockpit voice — geometric, compressed, authoritative. Noto Serif is the lore voice — character names carry weight and fiction in it. JetBrains Mono is the data voice — every number on screen renders monospace so columns stay aligned naturally across any card layout.

### Hierarchy

- **Display** (Space Grotesk, 700, uppercase, tracking 0.08em): Section labels, tab headers, operator navigation, major headings. Always uppercase. This is cockpit instrumentation labeling — it does not whisper.
- **Title** (Noto Serif, 700, 18–24px, tracking 0): Character names and page titles. The only serif in the system. Used specifically to signal "this names a person or place in the fiction." One context, one font.
- **Label** (Space Grotesk, 700, 11px, uppercase, tracking 0.08em): Data field labels (VIT, CA, FUE, DES), condition names, slot labels, form field names. Maximum contrast with the mono values they prefix.
- **Body** (system-ui, 400, 14px, line-height 1.5): Form copy, help text, descriptions, modal body. Cap at 65ch.
- **Data/Mono** (JetBrains Mono, 700, 16–24px): HP values, AC, dice results, numeric stat values. Monospace enforces column alignment without layout hacks.

### Named Rules

**The Mono-First Data Rule.** Every numeric value rendered on screen — HP, AC, spell slots, initiative, dice results — uses JetBrains Mono 700. No exceptions. A number in Space Grotesk or system-ui is a mistake.

**The Serif Signals Fiction Rule.** Noto Serif appears in exactly one context: naming characters and page titles. A serif in a button, label, or data field is a design error.

## 4. Elevation

This system is **flat by default with pixel-art offset shadows.** There are no soft ambient shadows, no Gaussian blurs, no depth illusions from diffusion. Depth is conveyed through surface color stepping (canvas → card surface → elevated surface), not shadow softness.

When shadows appear, they are hard-edge pixel-art style: a 3–4px solid color offset at zero blur radius. The shadow color is the semantic signal. A red shadow on a button means danger; it is not "adding visual depth."

### Shadow Vocabulary

- **Card Default** (`4px 4px 0px rgba(255, 255, 255, 0.05)`): Subtle white offset on card surfaces. Present at rest. Creates tangibility without lifting surfaces off the canvas.
- **Amber Accent** (`3px 3px 0px rgba(200, 148, 74, 0.4)`): Hover state on primary amber buttons.
- **Red Accent** (`3px 3px 0px #ff4d6a`): Destructive buttons and critical-state interactive elements.
- **Cyan Accent** (`3px 3px 0px #00d4e8`): Live/active state when extra emphasis is needed beyond the glow.
- **Purple Accent** (`4px 4px 0px #500df5`): Dice interface elements and d20 highlights.

### Named Rules

**The Pixel-Art Shadow Rule.** Zero blur on all accent shadows. Hard edge, fixed offset, semantic color. Blur means soft; this system is not soft. `box-shadow: 0 4px 16px rgba(0,0,0,0.5)` is not a TableRelay shadow.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to interaction state or semantic role. Never apply a shadow to make something "pop" without a semantic reason.

## 5. Components

Controls feel **arcane and considered** — every action has weight. Interactive surfaces answer quickly but do not feel lightweight or casual. The system is built for operators who know what they're doing; controls communicate intent, not friendliness.

### Buttons

- **Shape:** Square with minimal rounding (4px radius). The near-square corner signals precision, not warmth.
- **Primary:** Amber Chrome fill (#c8944a), black label text, uppercase Space Grotesk 700. Hover lifts to #d4a05c plus amber pixel-art shadow.
- **Hover / Focus:** `background: #d4a05c` + `box-shadow: 3px 3px 0px rgba(200, 148, 74, 0.4)`. Focus ring: `outline: 2px solid #c8944a` at 2px offset.
- **Destructive:** Transparent background, Critical Scarlet text + 1px scarlet border (40% opacity). Hover adds red pixel-art shadow and a 8% scarlet fill.
- **Ghost:** Transparent, white text, no border. Hover adds `background: rgba(255,255,255,0.05)`. Used for secondary actions within a surface.

### Condition Pills / Chips

Character conditions render as compact pills. Inactive: dark elevated surface, muted text. Active: the condition's assigned color (Critical Scarlet for most threats, Amber Chrome for restrained/cursed, Arcane Signal for buffs). Shape is full pill radius (999px). Rendered inline within character cards in tight horizontal wraps.

- **Inactive:** `background: #1a1a1a`, `color: #888`, `padding: 4px 8px`, `border-radius: 999px`
- **Active:** `background: [condition color]`, `color: #fff`

### Cards / Containers

The base card is barely lifted from canvas (#0d0d0d on #000000). The structural separation comes from the white-opacity pixel shadow, not from color contrast. Cards use 8px radius. Internal gap scales by surface: Stage uses 12px (density), Cast uses 16px (touch targets).

- **Corner Style:** Gently rounded (8px radius)
- **Background:** Card Surface (#0d0d0d)
- **Shadow:** `4px 4px 0px rgba(255, 255, 255, 0.05)`
- **Border:** None at rest; Border Subtle (#333333) only for separators and form inputs
- **Internal Padding:** 12px (Stage density) / 16px (Cast mobile)

### Inputs / Fields

Inputs use Elevated Surface (#1a1a1a) — one step above the card they sit in. Stroke at rest is Border Subtle (#333333). Focus shifts stroke to Amber Chrome with a matching amber focus ring. Error state shifts both stroke and label to Critical Scarlet.

- **Style:** Elevated surface background, 1px border-subtle stroke, 4px radius
- **Focus:** `border-color: #c8944a` + `box-shadow: 0 0 0 2px rgba(200, 148, 74, 0.25)`
- **Error:** `border-color: #ff4d6a`, label color shifts to critical-scarlet
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`

### Navigation

Bottom tab navigation (Cast, mobile-first). Sidebar panel navigation (Stage, desktop). Both: Space Grotesk 700 uppercase labels, Amber Chrome active indicator, Border Subtle for inactive items. Hover lifts background to Elevated Surface — no underlines.

### Hex-Clip Portrait (Signature Component)

All character portraits render through a hexagonal clip path. Never circular, never rectangular. The clip polygon is tight on portrait images: `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`.

Three size variants based on surface context:

- **SM** (clipped within 10%–90% flat zone): Compact, for character strips and lists
- **MD** (5%–95%): Default card portrait — the primary character representation
- **LG** (2%–98%): Hero/focus context — overlay focus views and creation form preview

The hex frame carries Amber Chrome border in Cast surfaces. In OBS overlays, the frame color tracks the character's HP state (healthy/injured/critical).

### HP Bar (Signature Component)

Animated fill bar with three semantic gradient states. Width transitions on `cubic-bezier(0.4, 0, 0.2, 1)` over 400ms — smooth deceleration. Track background is Border Subtle (#333333). At critical (<25%), the fill pulses at 1.5s ease-in-out.

- **Track:** `background: #333333`, `border-radius: 999px`
- **Healthy:** `linear-gradient(90deg, #15803d, #22c55e)`
- **Injured:** `linear-gradient(90deg, #b45309, #f59e0b)`
- **Critical:** `linear-gradient(90deg, #991b1b, #ff4d6a)` + pulse animation

## 6. Do's and Don'ts

### Do:

- **Do** use `#000000` as the global canvas. It is OBS-transparent and the design depends on true black — not near-black, not tinted.
- **Do** render all numeric values (HP, AC, stats, dice results) in JetBrains Mono 700. Columns must align naturally across character cards without layout hacks.
- **Do** use Amber Chrome (#c8944a) as structural chrome — navigation, labels, focus rings, section headers. It should be present on every screen as the skeleton.
- **Do** apply Arcane Signal (#00d4e8) only to live/active/healing state. If nothing is live, cyan should not appear.
- **Do** use hex-clip geometry for all portrait images: `clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`. Never `border-radius: 50%` on a character portrait.
- **Do** use pixel-art offset shadows (0 blur, 3–4px offset, semantic color) as the only shadow form. The shadow color is the signal.
- **Do** label all TTRPG fields in Spanish: VIT, CA, FUE, DES, CON, INT, SAB, CAR. No English field labels on Cast or Audience surfaces.
- **Do** respect the HP semantic palette: green = healthy, amber = injured, red = critical. These are not stylistic choices — they are gameplay signals.

### Don't:

- **Don't** use generic SaaS aesthetics — neutral-gray surfaces, rounded-everything, Geist font, whitespace overload. This is a show control system, not a productivity tool.
- **Don't** reference D&D Beyond or Roll20 patterns — no stock fantasy parchment imagery, no cluttered icon overload, no "digital dungeon" ornamental chrome.
- **Don't** apply neon-on-black streamer UI patterns — no RGB chaos, no glow-everywhere gradients, no Twitch-template aesthetics. Glows in this system mean something specific; random glows destroy the signal system.
- **Don't** use AI slop dashboard patterns — hero metrics, gradient-fill cards, sparklines-as-decoration, glassmorphism as a theme. The hex-clip geometry and amber/cyan/red palette are intentional signals, not atmosphere.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, list items, or callouts.
- **Don't** use gradient text (`background-clip: text` with a gradient background). Text is always a solid color.
- **Don't** use Gaussian or soft-blur shadows. `box-shadow: 0 4px 16px rgba(...)` is not a TableRelay shadow — it signals a different, softer design language.
- **Don't** apply glow without a semantic reason. Cyan glow = live connection. Red glow = threat state. Decorative glows negate the signal system entirely.
- **Don't** use circular portrait crops (`border-radius: 50%`). Every character portrait is hex-clipped.
- **Don't** use English for TTRPG field labels on any player-facing surface (Cast or Audience). Always Spanish.
