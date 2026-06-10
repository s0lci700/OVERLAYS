---
name: setup
description: "Skill for the Setup area of OVERLAYS. 21 symbols across 6 files."
---

# Setup

21 symbols | 6 files | Cohesion: 95%

## When to Use

- Working with code in `scripts/`
- Understanding how exists, connect, JSONToCharacter work
- Modifying setup-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `scripts/setup/seed-full-demo.js` | connect, isEmpty, getIds, sessionsData, partyData (+2) |
| `scripts/setup/seed.js` | exists, connect, JSONToCharacter, main |
| `tools/impeccable/extension/devtools/panel.js` | getPort, postToPort, setHoveredItem |
| `scripts/setup/setup-ip.js` | parseEnv, serializeEnv, upsertEnvKeys |
| `scripts/setup/seed-demo-data.js` | connect, isEmpty, main |
| `tools/impeccable/extension/devtools/devtools.js` | connectLifecycle |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `exists` | Function | `scripts/setup/seed.js` | 6 |
| `connect` | Function | `scripts/setup/seed.js` | 10 |
| `JSONToCharacter` | Function | `scripts/setup/seed.js` | 16 |
| `main` | Function | `scripts/setup/seed.js` | 45 |
| `getPort` | Function | `tools/impeccable/extension/devtools/panel.js` | 18 |
| `postToPort` | Function | `tools/impeccable/extension/devtools/panel.js` | 25 |
| `setHoveredItem` | Function | `tools/impeccable/extension/devtools/panel.js` | 370 |
| `connectLifecycle` | Function | `tools/impeccable/extension/devtools/devtools.js` | 25 |
| `connect` | Function | `scripts/setup/seed-full-demo.js` | 17 |
| `isEmpty` | Function | `scripts/setup/seed-full-demo.js` | 21 |
| `getIds` | Function | `scripts/setup/seed-full-demo.js` | 25 |
| `sessionsData` | Function | `scripts/setup/seed-full-demo.js` | 148 |
| `partyData` | Function | `scripts/setup/seed-full-demo.js` | 188 |
| `encounterData` | Function | `scripts/setup/seed-full-demo.js` | 195 |
| `main` | Function | `scripts/setup/seed-full-demo.js` | 213 |
| `parseEnv` | Function | `scripts/setup/setup-ip.js` | 63 |
| `serializeEnv` | Function | `scripts/setup/setup-ip.js` | 93 |
| `upsertEnvKeys` | Function | `scripts/setup/setup-ip.js` | 114 |
| `connect` | Function | `scripts/setup/seed-demo-data.js` | 10 |
| `isEmpty` | Function | `scripts/setup/seed-demo-data.js` | 14 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandlePortMessage → Connect` | cross_community | 5 |

## How to Explore

1. `gitnexus_context({name: "exists"})` — see callers and callees
2. `gitnexus_query({query: "setup"})` — find related execution flows
3. Read key files listed above for implementation details
