---
name: assets
description: "Skill for the Assets area of OVERLAYS. 63 symbols across 6 files."
---

# Assets

63 symbols | 6 files | Cohesion: 77%

## When to Use

- Working with code in `docs/`
- Understanding how getSpotlightBackdrop, updateSpotlightClipPath, showSpotlight work
- Modifying assets-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `docs/api/assets/main.js` | constructor, filterChanged, showPage, scrollToHash, updateIndexVisibility (+48) |
| `tools/impeccable/src/detect-antipatterns.mjs` | getSpotlightBackdrop, updateSpotlightClipPath, showSpotlight |
| `tools/impeccable/src/detect-antipatterns-browser.js` | getSpotlightBackdrop, updateSpotlightClipPath, showSpotlight |
| `docs/api/assets/icons.js` | addIcons, updateUseElements |
| `tools/impeccable/public/app.js` | onCopied |
| `tools/impeccable/public/js/components/glass-terminal.js` | setupStackTabs |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getSpotlightBackdrop` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1723 |
| `updateSpotlightClipPath` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1732 |
| `showSpotlight` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1749 |
| `getSpotlightBackdrop` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1735 |
| `updateSpotlightClipPath` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1744 |
| `showSpotlight` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1761 |
| `onCopied` | Function | `tools/impeccable/public/app.js` | 185 |
| `$e` | Function | `docs/api/assets/main.js` | 5 |
| `ht` | Function | `docs/api/assets/main.js` | 5 |
| `n` | Function | `docs/api/assets/main.js` | 5 |
| `pt` | Function | `docs/api/assets/main.js` | 5 |
| `Ve` | Function | `docs/api/assets/main.js` | 5 |
| `ft` | Function | `docs/api/assets/main.js` | 5 |
| `je` | Function | `docs/api/assets/main.js` | 5 |
| `mt` | Function | `docs/api/assets/main.js` | 5 |
| `gt` | Function | `docs/api/assets/main.js` | 5 |
| `setupStackTabs` | Function | `tools/impeccable/public/js/components/glass-terminal.js` | 577 |
| `it` | Function | `docs/api/assets/main.js` | 3 |
| `st` | Function | `docs/api/assets/main.js` | 3 |
| `xe` | Function | `docs/api/assets/main.js` | 3 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandlePortMessage → Toggle` | cross_community | 5 |
| `Ot → Toggle` | cross_community | 5 |
| `RenderTerminalLayout → Toggle` | cross_community | 5 |
| `Re → Toggle` | cross_community | 5 |
| `SetupFisheyeList → Toggle` | cross_community | 5 |
| `HandleValueChange → Toggle` | cross_community | 5 |
| `Ve → Toggle` | cross_community | 5 |
| `Constructor → Toggle` | cross_community | 4 |
| `RenderGallery → Toggle` | cross_community | 4 |
| `Init → Toggle` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Js | 1 calls |

## How to Explore

1. `gitnexus_context({name: "getSpotlightBackdrop"})` — see callers and callees
2. `gitnexus_query({query: "assets"})` — find related execution flows
3. Read key files listed above for implementation details
