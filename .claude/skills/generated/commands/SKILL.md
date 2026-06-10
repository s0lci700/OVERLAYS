---
name: commands
description: "Skill for the Commands area of OVERLAYS. 17 symbols across 5 files."
---

# Commands

17 symbols | 5 files | Cohesion: 85%

## When to Use

- Working with code in `tools/`
- Understanding how setupCommandDemoToggles, initCommandDemo, renderCommandDemo work
- Modifying commands-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/public/js/demos/commands/overdrive.js` | init, buildSignaturePaths, makePath, bez, computeLengths (+5) |
| `tools/impeccable/public/js/demo-toggles.js` | setupCommandDemoToggles, handleCommandDemoToggle |
| `tools/impeccable/public/js/demo-renderer.js` | initCommandDemo, renderCommandDemo |
| `tools/impeccable/public/js/components/glass-terminal.js` | renderMobileLayout, setupMobileInteractions |
| `tools/impeccable/public/js/demos/commands/index.js` | getCommandDemo |

## Entry Points

Start here when exploring this area:

- **`setupCommandDemoToggles`** (Function) — `tools/impeccable/public/js/demo-toggles.js:40`
- **`initCommandDemo`** (Function) — `tools/impeccable/public/js/demo-renderer.js:11`
- **`renderCommandDemo`** (Function) — `tools/impeccable/public/js/demo-renderer.js:23`
- **`buildSignaturePaths`** (Function) — `tools/impeccable/public/js/demos/commands/overdrive.js:50`
- **`makePath`** (Function) — `tools/impeccable/public/js/demos/commands/overdrive.js:51`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setupCommandDemoToggles` | Function | `tools/impeccable/public/js/demo-toggles.js` | 40 |
| `initCommandDemo` | Function | `tools/impeccable/public/js/demo-renderer.js` | 11 |
| `renderCommandDemo` | Function | `tools/impeccable/public/js/demo-renderer.js` | 23 |
| `buildSignaturePaths` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 50 |
| `makePath` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 51 |
| `bez` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 53 |
| `computeLengths` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 113 |
| `getCommandDemo` | Function | `tools/impeccable/public/js/demos/commands/index.js` | 44 |
| `posAtStroke` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 129 |
| `drawBurnTrail` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 157 |
| `strokeSmooth` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 161 |
| `emitSparks` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 185 |
| `draw` | Function | `tools/impeccable/public/js/demos/commands/overdrive.js` | 197 |
| `init` | Method | `tools/impeccable/public/js/demos/commands/overdrive.js` | 24 |
| `handleCommandDemoToggle` | Function | `tools/impeccable/public/js/demo-toggles.js` | 137 |
| `renderMobileLayout` | Function | `tools/impeccable/public/js/components/glass-terminal.js` | 466 |
| `setupMobileInteractions` | Function | `tools/impeccable/public/js/components/glass-terminal.js` | 515 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SetupFisheyeList → MakePath` | cross_community | 8 |
| `SetupFisheyeList → Bez` | cross_community | 8 |
| `SetupFisheyeList → ComputeLengths` | cross_community | 7 |
| `RenderDesktopLayout → MakePath` | cross_community | 6 |
| `SetupFisheyeList → GetCommandDemo` | cross_community | 6 |
| `RenderTerminalLayout → RecalcSkewOffset` | cross_community | 5 |
| `RenderTerminalLayout → GetCommandDemo` | cross_community | 5 |
| `RenderTerminalLayout → Toggle` | cross_community | 5 |
| `RenderDesktopLayout → ComputeLengths` | cross_community | 5 |
| `SetupMobileInteractions → MakePath` | intra_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Js | 1 calls |
| Effects | 1 calls |
| Assets | 1 calls |
| Components | 1 calls |

## How to Explore

1. `gitnexus_context({name: "setupCommandDemoToggles"})` — see callers and callees
2. `gitnexus_query({query: "commands"})` — find related execution flows
3. Read key files listed above for implementation details
