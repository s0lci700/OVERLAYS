---
name: devtools
description: "Skill for the Devtools area of OVERLAYS. 24 symbols across 2 files."
---

# Devtools

24 symbols | 2 files | Cohesion: 87%

## When to Use

- Working with code in `tools/`
- Understanding how handlePortMessage, updateToggleButton, showScanning work
- Modifying devtools-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/extension/devtools/panel.js` | handlePortMessage, updateToggleButton, showScanning, copyToClipboard, renderFindings (+13) |
| `tools/impeccable/extension/devtools/sidebar.js` | getPort, refreshForCurrentSelection, renderEmpty, renderNoFindings, render (+1) |

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handlePortMessage` | Function | `tools/impeccable/extension/devtools/panel.js` | 165 |
| `updateToggleButton` | Function | `tools/impeccable/extension/devtools/panel.js` | 210 |
| `showScanning` | Function | `tools/impeccable/extension/devtools/panel.js` | 215 |
| `copyToClipboard` | Function | `tools/impeccable/extension/devtools/panel.js` | 345 |
| `renderFindings` | Function | `tools/impeccable/extension/devtools/panel.js` | 391 |
| `inspectElement` | Function | `tools/impeccable/extension/devtools/panel.js` | 502 |
| `escapeHtml` | Function | `tools/impeccable/extension/devtools/panel.js` | 512 |
| `getPort` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 16 |
| `refreshForCurrentSelection` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 32 |
| `renderEmpty` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 68 |
| `renderNoFindings` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 72 |
| `render` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 76 |
| `escapeHtml` | Function | `tools/impeccable/extension/devtools/sidebar.js` | 98 |
| `initSettings` | Function | `tools/impeccable/extension/devtools/panel.js` | 51 |
| `initAutoScanControl` | Function | `tools/impeccable/extension/devtools/panel.js` | 70 |
| `initLineLengthControl` | Function | `tools/impeccable/extension/devtools/panel.js` | 85 |
| `initSpotlightBlurToggle` | Function | `tools/impeccable/extension/devtools/panel.js` | 101 |
| `renderSettings` | Function | `tools/impeccable/extension/devtools/panel.js` | 111 |
| `toggleRule` | Function | `tools/impeccable/extension/devtools/panel.js` | 154 |
| `fixSkillFor` | Function | `tools/impeccable/extension/devtools/panel.js` | 255 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandlePortMessage → Connect` | cross_community | 5 |
| `HandlePortMessage → Toggle` | cross_community | 5 |
| `HandlePortMessage → EscapeHtml` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Setup | 2 calls |
| Assets | 2 calls |
| Js | 1 calls |

## How to Explore

1. `gitnexus_context({name: "handlePortMessage"})` — see callers and callees
2. `gitnexus_query({query: "devtools"})` — find related execution flows
3. Read key files listed above for implementation details
