---
name: cluster-99
description: "Skill for the Cluster_99 area of OVERLAYS. 10 symbols across 2 files."
---

# Cluster_99

10 symbols | 2 files | Cohesion: 95%

## When to Use

- Working with code in `tools/`
- Understanding how isValidId, isAllowedFileProvider, isAllowedBundleProvider work
- Modifying cluster_99-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/server/lib/validation.js` | isValidId, isAllowedFileProvider, isAllowedBundleProvider, isAllowedType, sanitizeFilename |
| `tools/impeccable/server/lib/api-handlers.js` | readFileContent, getCommandSource, getFilePath, handleFileDownload, handleBundleDownload |

## Entry Points

Start here when exploring this area:

- **`isValidId`** (Function) — `tools/impeccable/server/lib/validation.js:16`
- **`isAllowedFileProvider`** (Function) — `tools/impeccable/server/lib/validation.js:24`
- **`isAllowedBundleProvider`** (Function) — `tools/impeccable/server/lib/validation.js:28`
- **`isAllowedType`** (Function) — `tools/impeccable/server/lib/validation.js:32`
- **`sanitizeFilename`** (Function) — `tools/impeccable/server/lib/validation.js:37`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `isValidId` | Function | `tools/impeccable/server/lib/validation.js` | 16 |
| `isAllowedFileProvider` | Function | `tools/impeccable/server/lib/validation.js` | 24 |
| `isAllowedBundleProvider` | Function | `tools/impeccable/server/lib/validation.js` | 28 |
| `isAllowedType` | Function | `tools/impeccable/server/lib/validation.js` | 32 |
| `sanitizeFilename` | Function | `tools/impeccable/server/lib/validation.js` | 37 |
| `getCommandSource` | Function | `tools/impeccable/server/lib/api-handlers.js` | 56 |
| `getFilePath` | Function | `tools/impeccable/server/lib/api-handlers.js` | 76 |
| `handleFileDownload` | Function | `tools/impeccable/server/lib/api-handlers.js` | 90 |
| `handleBundleDownload` | Function | `tools/impeccable/server/lib/api-handlers.js` | 139 |
| `readFileContent` | Function | `tools/impeccable/server/lib/api-handlers.js` | 20 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `GET → ReadFileContent` | cross_community | 4 |

## How to Explore

1. `gitnexus_context({name: "isValidId"})` — see callers and callees
2. `gitnexus_query({query: "cluster_99"})` — find related execution flows
3. Read key files listed above for implementation details
