# Design System

> Visual language reference for DADOS & RISAS control panel and overlays.

---

## Color Palette

### Core Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--red` | `#FF4D6A` | Primary action, damage, critical HP, conditions |
| `--cyan` | `#00D4E8` | Accent, healing, connection status, dice crit |
| `--purple` | `#500DF5` | Dice/d20 highlight, scrollbar |

### Dim Variants (12% opacity backgrounds)

| Token | Value | Usage |
|---|---|---|
| `--red-dim` | `rgba(255, 77, 106, 0.12)` | Damage button background |
| `--cyan-dim` | `rgba(0, 212, 232, 0.12)` | Heal button background |
| `--purple-dim` | `rgba(80, 13, 245, 0.12)` | d20 button hover |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--black` | `#000000` | Page background |
| `--black-card` | `#0D0D0D` | Card backgrounds |
| `--black-elevated` | `#1A1A1A` | Elevated surfaces (inputs, steppers) |
| `--white` | `#FFFFFF` | Primary text |
| `--grey` | `#888888` | Secondary text, labels |
| `--grey-dim` | `#333333` | Borders, dividers |

### HP Health States

| Token | Hex | Threshold | Visual |
|---|---|---|---|
| `--hp-healthy` | `#22C55E` | >60% HP | Green gradient + glow |
| `--hp-injured` | `#F59E0B` | 30–60% HP | Orange gradient + glow |
| `--hp-critical` | `#FF4D6A` | <30% HP | Red gradient + pulse animation |

HP bar gradients go from a darker shade to the token color:
- Healthy: `#15803D → #22C55E`
- Injured: `#B45309 → #F59E0B`
- Critical: `#991B1B → #FF4D6A`

---

## Typography

### Font Stack

| Token | Family | Weight | Usage |
|---|---|---|---|
| `--font-display` | Bebas Neue | 400 | Headings, labels, brand, nav tabs |
| `--font-script` | Dancing Script | 700 | Brand ampersand ("& Risas") |
| `--font-mono` | JetBrains Mono | 400, 700 | Numbers, HP, dice results, code |
| `--font-ui` | system-ui | — | Body text, form elements |

### Utility Classes

| Class | Effect |
|---|---|
| `.font-display` | `font-family: var(--font-display)` |
| `.font-mono` | `font-family: var(--font-mono)` |
| `.font-script` | `font-family: var(--font-script)` |
| `.label-caps` | Small caps label (Bebas Neue, 0.8rem, grey, uppercase, 0.12em spacing) |
| `.mono-num` | Bold monospace number (JetBrains Mono 700) |
| `.sr-only` | Screen-reader only (visually hidden) |

---

## Spacing Scale

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Stepper buttons |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-pill` | 999px | HP bars, condition pills, scrollbar |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `4px 4px 0px rgba(255,255,255,0.05)` | Card base |
| `--shadow-red` | `3px 3px 0px #FF4D6A` | Damage button hover |
| `--shadow-cyan` | `3px 3px 0px #00D4E8` | Heal button hover, dice result |
| `--shadow-purple` | `4px 4px 0px #500DF5` | d20 button, dice button hover |

The offset shadow style (no blur, solid color) creates a retro/comic
aesthetic consistent with the D&D theme.

---

## Transitions

| Token | Value | Usage |
|---|---|---|
| `--t-fast` | `150ms ease` | Button hover/active, color changes |
| `--t-normal` | `250ms ease` | Connection dot, HP bar color |
| `--t-spring` | `280ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce effects (available, not yet used) |

---

## Shared Component Bases

### `.card-base`
Base card container used by CharacterCard:
- Background: `--black-card`
- Border: 1px `--grey-dim`
- Radius: `--radius-lg`
- Shadow: `--shadow-card`
- Flex column, gap `--space-3`, padding `--space-4`

### `.btn-base`
Base button used by damage/heal/rest buttons:
- Font: Bebas Neue, 1.1rem, 0.04em spacing
- Radius: `--radius-md`
- Min-height: 52px
- Border: 1px solid
- Active state: translates 3px right+down, removes shadow (press effect)

### CharacterCard component + styles
The control panel imports `control-panel/src/lib/CharacterCard.css` directly inside `CharacterCard.svelte`, so every class listed below maps one-to-one with the markup in the same file:
- `.char-card` and `.hit-flash` wrap the `<article>` and damage overlay that the script animates via `hitFlashEl`.
- `.char-header`, `.char-identity`, `.char-name`, and `.char-player` match the header block that renders the character and player names.
- `.hp-track` and `.hp-fill` control the progress bar: `CharacterCard.svelte` derives `hpPercent`/`hpClass` and applies `hp--healthy`, `hp--injured`, or `hp--critical` to trigger the gradients and pulse defined in CSS.
- `.char-controls`, `.btn-damage`, `.btn-heal`, `.stepper-cluster`, `.stepper`, and `.amount-input` describe the damage/heal controls at the bottom of the card.
- `.char-stats`, `.stat-item`, `.stat-label`, `.stat-value`, and `.stat-divider` cover the AC/speed row.
- `.conditions-row` and `.condition-pill` style removable condition pills rendered via `{#each character.conditions}`.
- `.resources-section`, `.resource-row`, `.resource-label`, `.resource-pips`, and the `.pip` variants (e.g., `.pip--long_rest`, `.pip--short_rest`, `.pip--filled`) describe the resource pools, while `.rest-buttons` and `.btn-rest` handle the short/long rest interface.

Keeping these class names aligned enables the component to toggle classes via Svelte bindings (e.g., `class:is-critical`, `class:critical`, and `class="{hpClass}"`) while the CSS file centralizes colors, animations, and responsive spacing.

---

## App Shell Layout

```
┌─────────────────────────────────────────┐
│ .app-header                              │
│   .brand-wordmark   .header-meta         │
│   "DADOS & Risas"   ● 2                  │
├─────────────────────────────────────────┤
│ .app-main                                │
│   (scrollable content area)              │
│                                          │
│   .tab-panel                             │
│     CharacterCard / DiceRoller /         │
│     Dashboard                            │
│                                          │
├─────────────────────────────────────────┤
│ .bottom-nav                              │
│   ⚔ PERSONAJES  ⬡ DADOS  ⧉ DASHBOARD  │
└─────────────────────────────────────────┘
```

- Header: fixed top, brand + connection indicator + character count
- Main: flex-1, scrollable, padding `--space-4`
- Nav: fixed bottom, 3 equal tabs with icon + label
- Active tab: red border-top + red text + subtle red background

---

## Animations

### Control Panel (anime.js)

| Animation | Where | Effect |
|---|---|---|
| Damage flash | CharacterCard | Red overlay fades from 0.5→0 opacity (700ms) |
| Dice result slide | DiceRoller | Container slides up + fades in (200ms) |
| Dice number bounce | DiceRoller | Scale 0.3→1 with elastic easing (450ms) |
| Tab transition | App.svelte | `fadeUp` keyframe: opacity 0→1, translateY 6px→0 |

### OBS Overlays (anime.js + CSS)

| Animation | Where | Effect |
|---|---|---|
| HP bar transition | overlay-hp.css | Width 0.5s cubic-bezier, color 0.3s ease |
| Critical pulse | overlay-hp.css | Opacity 1→0.6→1, 1.5s infinite |
| Status fade | overlay-hp.css | fadeInOut keyframe (2s) |
| Dice card pop | overlay-dice.html | Fade in + slide up 500ms, number elastic bounce 600ms |
| Dice auto-hide | overlay-dice.html | Fade out + slide up after 4s (500ms) |

---

## Resource Pip Colors

Pips are color-coded by recharge type to help DMs quickly identify which
resources are restored by different rest types:

| Recharge Type | Border Color | Filled Color | Glow |
|---|---|---|---|
| `LONG_REST` | `--red` | `--red` | Red glow |
| `SHORT_REST` | `--cyan` | `--cyan` | Cyan glow |
| `TURN` | `--grey` | `--grey` | None |
| `DM` | `--grey` | `--grey` | None |

---

## OBS Overlay Specifics

Both overlays share these constraints:
- Canvas: 1920×1080 pixels (matching OBS Browser Source dimensions)
- Background: `transparent` (required for OBS compositing)
- Fonts: loaded from Google Fonts CDN (Bebas Neue, JetBrains Mono)
- Socket.io: loaded from CDN v4.8.3
- anime.js: loaded from CDN v3.2.1

### HP Overlay positioning
- Container: absolute top-right (`top: 50px, right: 50px`)
- Cards stacked vertically with 20px gap
- Min-width: 360px per card

### Dice Overlay positioning
- Container: fixed bottom-center (`bottom: 80px`)
- Centered with negative margin-left offset
- Min-width: 320px card

---

## shadcn-svelte Component Library

The control panel includes [shadcn-svelte](https://shadcn-svelte.com) components integrated with the brand design tokens.

### Setup

shadcn-svelte is configured with:
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js` needed)
- **bits-ui** headless primitives
- **clsx** + **tailwind-merge** via the `cn()` utility

### Using Components

```svelte
<script>
  import { Button, Badge, Card, CardContent } from '$lib/components/ui';
</script>

<!-- Buttons map to brand colors via CSS variables -->
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Damage</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>

<!-- Badges for status indicators -->
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Critical</Badge>
<Badge variant="outline">Outline</Badge>

<!-- Cards -->
<Card>
  <CardContent>Content here</CardContent>
</Card>
```

### Available Components

| Component | File | Description |
|---|---|---|
| `Button` | `ui/button.svelte` | Action button, 6 variants, 4 sizes |
| `Badge` | `ui/badge.svelte` | Status indicator pill |
| `Card` | `ui/card.svelte` | Container with brand border |
| `CardHeader` | `ui/card-header.svelte` | Card top section |
| `CardTitle` | `ui/card-title.svelte` | Card heading |
| `CardDescription` | `ui/card-description.svelte` | Card subtitle |
| `CardContent` | `ui/card-content.svelte` | Card body content |
| `CardFooter` | `ui/card-footer.svelte` | Card bottom section |
| `Input` | `ui/input.svelte` | Text input field |
| `Label` | `ui/label.svelte` | Accessible form label |
| `Separator` | `ui/separator.svelte` | Horizontal or vertical divider |

### Color Mapping

The shadcn CSS variables are mapped to the brand palette:

| shadcn token | Brand mapping |
|---|---|
| `--primary` | `--red` (#FF4D6A) |
| `--accent` | `--cyan` (#00D4E8) |
| `--background` | `--black` (#000000) |
| `--card` | `--black-card` (#0D0D0D) |
| `--border` | `--grey-dim` (#333333) |
| `--muted-foreground` | `--grey` (#888888) |

### Adding More Components

Use the `cn()` utility for Tailwind class merging:

```js
import { cn } from '$lib/utils.js';

// In component script:
let { class: className = '' } = $props();
const styles = cn('base-classes', conditionalClass && 'applied-class', className);
```

To add more components from the shadcn-svelte registry, follow the patterns
in `src/lib/components/ui/` and reference the design tokens listed above.
