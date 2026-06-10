---
name: cluster-38
description: "Skill for the Cluster_38 area of OVERLAYS. 16 symbols across 1 files."
---

# Cluster_38

16 symbols | 1 files | Cohesion: 84%

## When to Use

- Working with code in `tools/`
- Understanding how parseRgb, relativeLuminance, contrastRatio work
- Modifying cluster_38-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/src/detect-antipatterns.mjs` | parseRgb, relativeLuminance, contrastRatio, parseGradientColors, hasChroma (+11) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `parseRgb` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 359 |
| `relativeLuminance` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 366 |
| `contrastRatio` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 373 |
| `parseGradientColors` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 379 |
| `hasChroma` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 397 |
| `getHue` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 402 |
| `colorToHex` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 415 |
| `checkColors` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 461 |
| `checkGlow` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 647 |
| `resolveBackground` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 815 |
| `resolveGradientStops` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 858 |
| `checkElementColorsDOM` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 900 |
| `checkElementGlowDOM` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 973 |
| `checkElementAIPaletteDOM` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1002 |
| `checkElementColors` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1290 |
| `checkElementGlow` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1358 |

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
| Cluster_39 | 2 calls |

## How to Explore

1. `gitnexus_context({name: "parseRgb"})` — see callers and callees
2. `gitnexus_query({query: "cluster_38"})` — find related execution flows
3. Read key files listed above for implementation details
