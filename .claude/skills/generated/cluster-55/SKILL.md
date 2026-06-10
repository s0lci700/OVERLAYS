---
name: cluster-55
description: "Skill for the Cluster_55 area of OVERLAYS. 8 symbols across 1 files."
---

# Cluster_55

8 symbols | 1 files | Cohesion: 67%

## When to Use

- Working with code in `tools/`
- Understanding how walkDir, formatFindings, resolveImport work
- Modifying cluster_55-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/src/detect-antipatterns.mjs` | walkDir, formatFindings, resolveImport, buildImportGraph, detectFrameworkConfig (+3) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `walkDir` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3077 |
| `formatFindings` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3094 |
| `resolveImport` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3138 |
| `buildImportGraph` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3154 |
| `detectFrameworkConfig` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3218 |
| `confirm` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3291 |
| `printUsage` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3303 |
| `main` | Function | `tools/impeccable/src/detect-antipatterns.mjs` | 3326 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → NormalizeColorForCheck` | cross_community | 6 |
| `Main → IsNeutralColor` | cross_community | 6 |
| `Main → ExtractStyleBlocks` | cross_community | 5 |
| `Main → ExtractCSSinJS` | cross_community | 5 |
| `Main → IsFullPage` | cross_community | 5 |
| `Main → ResolveVar` | cross_community | 5 |
| `Main → GetAP` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_42 | 3 calls |
| Assets | 2 calls |
| Cluster_49 | 1 calls |
| Components | 1 calls |

## How to Explore

1. `gitnexus_context({name: "walkDir"})` — see callers and callees
2. `gitnexus_query({query: "cluster_55"})` — find related execution flows
3. Read key files listed above for implementation details
