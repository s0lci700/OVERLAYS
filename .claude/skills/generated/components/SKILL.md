---
name: components
description: "Skill for the Components area of OVERLAYS. 45 symbols across 12 files."
---

# Components

45 symbols | 12 files | Cohesion: 80%

## When to Use

- Working with code in `tools/`
- Understanding how initAnchorScroll, initHashTracking, initScrollReveal work
- Modifying components-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/public/js/components/glass-terminal.js` | initGlassTerminal, initSpreadDemo, goToSpread, activate, isMobile (+12) |
| `tools/impeccable/public/js/components/framework-viz.js` | PeriodicTable, initFrameworkViz, showTooltip, toArray, hideTooltip (+7) |
| `tools/impeccable/public/js/components/art-gallery.js` | renderGallery, renderFrame, renderComingSoonVisual, formatName, setupInteractions |
| `tools/impeccable/public/js/utils/scroll.js` | initAnchorScroll, initHashTracking |
| `tools/impeccable/public/js/components/section-nav.js` | initSectionNav, updateNav |
| `tools/impeccable/public/app.js` | init |
| `tools/impeccable/public/js/utils/reveal.js` | initScrollReveal |
| `tools/impeccable/public/js/components/foundation-grid.js` | initFoundationGrid |
| `tools/impeccable/src/detect-antipatterns.mjs` | isPortListening |
| `tools/impeccable/src/detect-antipatterns-browser.js` | isPortListening |

## Entry Points

Start here when exploring this area:

- **`initAnchorScroll`** (Function) — `tools/impeccable/public/js/utils/scroll.js:1`
- **`initHashTracking`** (Function) — `tools/impeccable/public/js/utils/scroll.js:16`
- **`initScrollReveal`** (Function) — `tools/impeccable/public/js/utils/reveal.js:2`
- **`initSectionNav`** (Function) — `tools/impeccable/public/js/components/section-nav.js:5`
- **`updateNav`** (Function) — `tools/impeccable/public/js/components/section-nav.js:19`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PeriodicTable` | Class | `tools/impeccable/public/js/components/framework-viz.js` | 69 |
| `initAnchorScroll` | Function | `tools/impeccable/public/js/utils/scroll.js` | 1 |
| `initHashTracking` | Function | `tools/impeccable/public/js/utils/scroll.js` | 16 |
| `initScrollReveal` | Function | `tools/impeccable/public/js/utils/reveal.js` | 2 |
| `initSectionNav` | Function | `tools/impeccable/public/js/components/section-nav.js` | 5 |
| `updateNav` | Function | `tools/impeccable/public/js/components/section-nav.js` | 19 |
| `initGlassTerminal` | Function | `tools/impeccable/public/js/components/glass-terminal.js` | 15 |
| `initFrameworkViz` | Function | `tools/impeccable/public/js/components/framework-viz.js` | 361 |
| `initFoundationGrid` | Function | `tools/impeccable/public/js/components/foundation-grid.js` | 3 |
| `setupDemoTabs` | Function | `tools/impeccable/public/js/demo-renderer.js` | 195 |
| `renderGallery` | Function | `tools/impeccable/public/js/components/art-gallery.js` | 8 |
| `renderTerminalLayout` | Function | `tools/impeccable/public/js/components/glass-terminal.js` | 19 |
| `toArray` | Function | `tools/impeccable/public/js/components/framework-viz.js` | 123 |
| `activate` | Function | `tools/impeccable/public/js/components/framework-viz.js` | 304 |
| `deactivate` | Function | `tools/impeccable/public/js/components/framework-viz.js` | 316 |
| `destroy` | Method | `tools/impeccable/public/js/effects/split-compare.js` | 198 |
| `showTooltip` | Method | `tools/impeccable/public/js/components/framework-viz.js` | 119 |
| `hideTooltip` | Method | `tools/impeccable/public/js/components/framework-viz.js` | 181 |
| `createElement` | Method | `tools/impeccable/public/js/components/framework-viz.js` | 219 |
| `constructor` | Method | `tools/impeccable/public/js/components/framework-viz.js` | 70 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SetupFisheyeList → MakePath` | cross_community | 8 |
| `SetupFisheyeList → Bez` | cross_community | 8 |
| `SetupFisheyeList → RetriggerAnimations` | cross_community | 7 |
| `SetupFisheyeList → ComputeLengths` | cross_community | 7 |
| `RenderDesktopLayout → MakePath` | cross_community | 6 |
| `SetupFisheyeList → GetCommandDemo` | cross_community | 6 |
| `SetupFisheyeList → RecalcSkewOffset` | cross_community | 6 |
| `Init → RetriggerAnimations` | cross_community | 5 |
| `RenderTerminalLayout → RecalcSkewOffset` | cross_community | 5 |
| `RenderTerminalLayout → GetCommandDemo` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Assets | 6 calls |
| Commands | 3 calls |
| Effects | 2 calls |
| Js | 2 calls |
| Public | 1 calls |

## How to Explore

1. `gitnexus_context({name: "initAnchorScroll"})` — see callers and callees
2. `gitnexus_query({query: "components"})` — find related execution flows
3. Read key files listed above for implementation details
