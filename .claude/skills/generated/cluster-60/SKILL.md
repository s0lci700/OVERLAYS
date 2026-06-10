---
name: cluster-60
description: "Skill for the Cluster_60 area of OVERLAYS. 16 symbols across 1 files."
---

# Cluster_60

16 symbols | 1 files | Cohesion: 84%

## When to Use

- Working with code in `tools/`
- Understanding how parseRgb, relativeLuminance, contrastRatio work
- Modifying cluster_60-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/src/detect-antipatterns-browser.js` | parseRgb, relativeLuminance, contrastRatio, parseGradientColors, hasChroma (+11) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `parseRgb` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 371 |
| `relativeLuminance` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 378 |
| `contrastRatio` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 385 |
| `parseGradientColors` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 391 |
| `hasChroma` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 409 |
| `getHue` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 414 |
| `colorToHex` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 427 |
| `checkColors` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 473 |
| `checkGlow` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 659 |
| `resolveBackground` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 827 |
| `resolveGradientStops` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 870 |
| `checkElementColorsDOM` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 912 |
| `checkElementGlowDOM` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 985 |
| `checkElementAIPaletteDOM` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1014 |
| `checkElementColors` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1302 |
| `checkElementGlow` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1370 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Scan → RelativeLuminance` | cross_community | 4 |
| `Scan → HasChroma` | cross_community | 4 |
| `Scan → ColorToHex` | cross_community | 4 |
| `Scan → ParseRgb` | cross_community | 4 |
| `CheckElementColors → RelativeLuminance` | intra_community | 4 |
| `CheckElementColors → ParseRgb` | intra_community | 4 |
| `CheckElementColorsDOM → RelativeLuminance` | intra_community | 4 |
| `Scan → IsEmojiOnlyText` | cross_community | 3 |
| `CheckElementAIPaletteDOM → ParseRgb` | intra_community | 3 |
| `CheckElementColors → HasChroma` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_61 | 2 calls |

## How to Explore

1. `gitnexus_context({name: "parseRgb"})` — see callers and callees
2. `gitnexus_query({query: "cluster_60"})` — find related execution flows
3. Read key files listed above for implementation details
