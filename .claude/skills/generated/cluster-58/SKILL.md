---
name: cluster-58
description: "Skill for the Cluster_58 area of OVERLAYS. 12 symbols across 1 files."
---

# Cluster_58

12 symbols | 1 files | Cohesion: 63%

## When to Use

- Working with code in `tools/`
- Understanding how isBrandFontOnOwnDomain, checkMotion, checkHtmlPatterns work
- Modifying cluster_58-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/src/detect-antipatterns-browser.js` | isBrandFontOnOwnDomain, checkMotion, checkHtmlPatterns, checkElementMotionDOM, checkPageQualityFromDoc (+7) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `isBrandFontOnOwnDomain` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 86 |
| `checkMotion` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 621 |
| `checkHtmlPatterns` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 695 |
| `checkElementMotionDOM` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 972 |
| `checkPageQualityFromDoc` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1239 |
| `checkPageQualityDOM` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1260 |
| `checkElementMotion` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1360 |
| `checkTypography` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 1379 |
| `showPageBanner` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 2035 |
| `printSummary` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 2220 |
| `scan` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 2239 |
| `_ruleOk` | Function | `tools/impeccable/src/detect-antipatterns-browser.js` | 2246 |

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
| Cluster_60 | 3 calls |
| Assets | 1 calls |
| Cluster_59 | 1 calls |
| Cluster_61 | 1 calls |
| Cluster_63 | 1 calls |
| Cluster_67 | 1 calls |
| Cluster_62 | 1 calls |
| Cluster_69 | 1 calls |

## How to Explore

1. `gitnexus_context({name: "isBrandFontOnOwnDomain"})` — see callers and callees
2. `gitnexus_query({query: "cluster_58"})` — find related execution flows
3. Read key files listed above for implementation details
