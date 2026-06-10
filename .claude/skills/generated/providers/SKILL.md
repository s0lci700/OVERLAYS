---
name: providers
description: "Skill for the Providers area of OVERLAYS. 13 symbols across 6 files."
---

# Providers

13 symbols | 6 files | Cohesion: 100%

## When to Use

- Working with code in `tools/`
- Understanding how activate, updateStatus, detectSurface work
- Modifying providers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/tablerelay-vscode/src/providers/crossLayerJump.ts` | CrossLayerJumpProvider, registerCrossLayerJump, buildConstantMap, provideCodeLenses |
| `tools/tablerelay-vscode/src/providers/deadImportBlocker.ts` | isFrontendFile, lint, registerDeadImportBlocker |
| `tools/tablerelay-vscode/src/extension.ts` | activate, updateStatus |
| `tools/tablerelay-vscode/src/providers/surfaceBadge.ts` | SurfaceBadgeProvider, provideFileDecoration |
| `tools/tablerelay-vscode/src/utils/surfaceDetect.ts` | detectSurface |
| `tools/tablerelay-vscode/src/providers/socketHoverDossier.ts` | SocketHoverDossierProvider |

## Entry Points

Start here when exploring this area:

- **`activate`** (Function) — `tools/tablerelay-vscode/src/extension.ts:52`
- **`updateStatus`** (Function) — `tools/tablerelay-vscode/src/extension.ts:82`
- **`detectSurface`** (Function) — `tools/tablerelay-vscode/src/utils/surfaceDetect.ts:2`
- **`registerDeadImportBlocker`** (Function) — `tools/tablerelay-vscode/src/providers/deadImportBlocker.ts:45`
- **`registerCrossLayerJump`** (Function) — `tools/tablerelay-vscode/src/providers/crossLayerJump.ts:108`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `SurfaceBadgeProvider` | Class | `tools/tablerelay-vscode/src/providers/surfaceBadge.ts` | 17 |
| `SocketHoverDossierProvider` | Class | `tools/tablerelay-vscode/src/providers/socketHoverDossier.ts` | 109 |
| `activate` | Function | `tools/tablerelay-vscode/src/extension.ts` | 52 |
| `updateStatus` | Function | `tools/tablerelay-vscode/src/extension.ts` | 82 |
| `detectSurface` | Function | `tools/tablerelay-vscode/src/utils/surfaceDetect.ts` | 2 |
| `registerDeadImportBlocker` | Function | `tools/tablerelay-vscode/src/providers/deadImportBlocker.ts` | 45 |
| `registerCrossLayerJump` | Function | `tools/tablerelay-vscode/src/providers/crossLayerJump.ts` | 108 |
| `provideFileDecoration` | Method | `tools/tablerelay-vscode/src/providers/surfaceBadge.ts` | 18 |
| `CrossLayerJumpProvider` | Class | `tools/tablerelay-vscode/src/providers/crossLayerJump.ts` | 39 |
| `isFrontendFile` | Function | `tools/tablerelay-vscode/src/providers/deadImportBlocker.ts` | 12 |
| `lint` | Function | `tools/tablerelay-vscode/src/providers/deadImportBlocker.ts` | 17 |
| `buildConstantMap` | Function | `tools/tablerelay-vscode/src/providers/crossLayerJump.ts` | 28 |
| `provideCodeLenses` | Method | `tools/tablerelay-vscode/src/providers/crossLayerJump.ts` | 40 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Activate → IsFrontendFile` | intra_community | 4 |
| `Activate → CrossLayerJumpProvider` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "activate"})` — see callers and callees
2. `gitnexus_query({query: "providers"})` — find related execution flows
3. Read key files listed above for implementation details
