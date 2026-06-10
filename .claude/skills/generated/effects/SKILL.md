---
name: effects
description: "Skill for the Effects area of OVERLAYS. 19 symbols across 3 files."
---

# Effects

19 symbols | 3 files | Cohesion: 93%

## When to Use

- Working with code in `tools/`
- Understanding how initSplitCompare, recalcSkewOffset, updateSplit work
- Modifying effects-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/public/js/effects/split-compare.js` | initSplitCompare, recalcSkewOffset, updateSplit, retriggerAnimations, animate (+7) |
| `tools/impeccable/public/js/effects/liquid-canvas.js` | initHeroEffect, Point, update, resize, initGrid (+1) |
| `tools/impeccable/public/js/components/lens.js` | initLensEffect |

## Entry Points

Start here when exploring this area:

- **`initSplitCompare`** (Function) — `tools/impeccable/public/js/effects/split-compare.js:9`
- **`recalcSkewOffset`** (Function) — `tools/impeccable/public/js/effects/split-compare.js:28`
- **`updateSplit`** (Function) — `tools/impeccable/public/js/effects/split-compare.js:50`
- **`retriggerAnimations`** (Function) — `tools/impeccable/public/js/effects/split-compare.js:69`
- **`animate`** (Function) — `tools/impeccable/public/js/effects/split-compare.js:96`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Point` | Class | `tools/impeccable/public/js/effects/liquid-canvas.js` | 22 |
| `initSplitCompare` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 9 |
| `recalcSkewOffset` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 28 |
| `updateSplit` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 50 |
| `retriggerAnimations` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 69 |
| `animate` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 96 |
| `initAllSplitCompare` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 218 |
| `initLensEffect` | Function | `tools/impeccable/public/js/components/lens.js` | 2 |
| `startAnimation` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 109 |
| `handleMouseLeave` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 119 |
| `handleMouseMove` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 125 |
| `handleTouchEnd` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 147 |
| `handleTouchMove` | Function | `tools/impeccable/public/js/effects/split-compare.js` | 154 |
| `initHeroEffect` | Function | `tools/impeccable/public/js/effects/liquid-canvas.js` | 0 |
| `resize` | Function | `tools/impeccable/public/js/effects/liquid-canvas.js` | 60 |
| `initGrid` | Function | `tools/impeccable/public/js/effects/liquid-canvas.js` | 72 |
| `draw` | Function | `tools/impeccable/public/js/effects/liquid-canvas.js` | 87 |
| `setPosition` | Method | `tools/impeccable/public/js/effects/split-compare.js` | 208 |
| `update` | Method | `tools/impeccable/public/js/effects/liquid-canvas.js` | 32 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SetupFisheyeList → RetriggerAnimations` | cross_community | 7 |
| `SetupFisheyeList → RecalcSkewOffset` | cross_community | 6 |
| `Init → RetriggerAnimations` | cross_community | 5 |
| `RenderTerminalLayout → RecalcSkewOffset` | cross_community | 5 |
| `RenderDesktopLayout → RetriggerAnimations` | cross_community | 5 |
| `Init → RecalcSkewOffset` | cross_community | 4 |
| `InitHeroEffect → Point` | intra_community | 4 |
| `SetupMobileInteractions → RetriggerAnimations` | cross_community | 4 |
| `InitAllSplitCompare → RetriggerAnimations` | intra_community | 4 |
| `InitHeroEffect → Update` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "initSplitCompare"})` — see callers and callees
2. `gitnexus_query({query: "effects"})` — find related execution flows
3. Read key files listed above for implementation details
