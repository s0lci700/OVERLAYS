---
name: cluster-36
description: "Skill for the Cluster_36 area of OVERLAYS. 12 symbols across 1 files."
---

# Cluster_36

12 symbols | 1 files | Cohesion: 63%

## When to Use

- Working with code in `tools/`
- Understanding how isBrandFontOnOwnDomain, checkMotion, checkHtmlPatterns work
- Modifying cluster_36-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/src/detect-antipatterns.mjs` | isBrandFontOnOwnDomain, checkMotion, checkHtmlPatterns, checkElementMotionDOM, checkPageQualityFromDoc (+7) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `isBrandFontOnOwnDomain` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 74 |
| `checkMotion` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 609 |
| `checkHtmlPatterns` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 683 |
| `checkElementMotionDOM` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 960 |
| `checkPageQualityFromDoc` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1227 |
| `checkPageQualityDOM` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1248 |
| `checkElementMotion` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1348 |
| `checkTypography` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 1367 |
| `showPageBanner` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 2023 |
| `printSummary` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 2208 |
| `scan` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 2227 |
| `_ruleOk` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 2234 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Scan → IsNeutralColor` | cross_community | 4 |
| `Scan → RelativeLuminance` | cross_community | 4 |
| `Scan → HasChroma` | cross_community | 4 |
| `Scan → ColorToHex` | cross_community | 4 |
| `Scan → ParseRgb` | cross_community | 4 |
| `Scan → IsEmojiOnlyText` | cross_community | 3 |
| `Scan → CheckMotion` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_38 | 3 calls |
| Assets | 1 calls |
| Cluster_37 | 1 calls |
| Cluster_39 | 1 calls |
| Cluster_41 | 1 calls |
| Cluster_46 | 1 calls |
| Cluster_40 | 1 calls |
| Cluster_48 | 1 calls |

## How to Explore

1. `gitnexus_context({name: "isBrandFontOnOwnDomain"})` — see callers and callees
2. `gitnexus_query({query: "cluster_36"})` — find related execution flows
3. Read key files listed above for implementation details
