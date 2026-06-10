---
name: scripts
description: "Skill for the Scripts area of OVERLAYS. 61 symbols across 10 files."
---

# Scripts

61 symbols | 10 files | Cohesion: 93%

## When to Use

- Working with code in `tools/`
- Understanding how generateSubPages, slugify, renderMarkdown work
- Modifying scripts-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/scripts/build-sub-pages.js` | escapeHtml, renderSkillDemo, renderSkillDetail, renderDocsSidebar, renderSkillsOverviewMain (+10) |
| `scripts/export-to-notion.js` | sleep, notionFetch, createPage, appendBlocks, searchPagesByQuery (+8) |
| `tools/impeccable/scripts/build.js` | generateCounts, validateNoEmDashes, scan, validateSiteHeader, copyDirSync (+6) |
| `pocketbase-explorer/scripts/pb_explorer.ts` | authenticate, listCollections, getCollectionSchema, queryCollection, run |
| `scripts/notion-sync.mjs` | notionRequest, milestoneToStatus, createTask, closeTask |
| `scripts/generate-sprint.mjs` | getLabel, formatIssue, formatClosedIssue |
| `tools/impeccable/scripts/screenshot-antipatterns.js` | screenshotAntipatterns, checkServer, main |
| `tools/impeccable/scripts/generate-og-image.js` | getCommandCount, getExtensionDataUrl, generateOgImage |
| `tools/impeccable/scripts/lib/render-markdown.js` | slugify, renderMarkdown |
| `tools/impeccable/scripts/lib/zip.js` | createProviderZip, createAllZips |

## Entry Points

Start here when exploring this area:

- **`generateSubPages`** (Function) — `tools/impeccable/scripts/build-sub-pages.js:610`
- **`slugify`** (Function) — `tools/impeccable/scripts/lib/render-markdown.js:20`
- **`renderMarkdown`** (Function) — `tools/impeccable/scripts/lib/render-markdown.js:135`
- **`createProviderZip`** (Function) — `tools/impeccable/scripts/lib/zip.js:18`
- **`createAllZips`** (Function) — `tools/impeccable/scripts/lib/zip.js:56`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `generateSubPages` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 610 |
| `slugify` | Function | `tools/impeccable/scripts/lib/render-markdown.js` | 20 |
| `renderMarkdown` | Function | `tools/impeccable/scripts/lib/render-markdown.js` | 135 |
| `createProviderZip` | Function | `tools/impeccable/scripts/lib/zip.js` | 18 |
| `createAllZips` | Function | `tools/impeccable/scripts/lib/zip.js` | 56 |
| `escapeHtml` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 26 |
| `renderSkillDemo` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 39 |
| `renderSkillDetail` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 67 |
| `renderDocsSidebar` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 159 |
| `renderSkillsOverviewMain` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 245 |
| `wrapInDocsLayout` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 299 |
| `groupRulesBySection` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 313 |
| `renderAntiPatternsSidebar` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 362 |
| `renderRuleCard` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 392 |
| `escapeAttr` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 418 |
| `renderTutorialsIndexMain` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 425 |
| `renderVisualModeMain` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 462 |
| `renderTutorialDetail` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 533 |
| `renderAntiPatternsMain` | Function | `tools/impeccable/scripts/build-sub-pages.js` | 552 |
| `generateCounts` | Function | `tools/impeccable/scripts/build.js` | 28 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Build → ParseFrontmatter` | cross_community | 5 |
| `Build → LoadCommandDemos` | cross_community | 4 |
| `Build → ReadAntipatternRules` | cross_community | 4 |
| `Build → EscapeHtml` | cross_community | 4 |
| `Build → ApplyActiveNav` | cross_community | 4 |
| `Build → ReadHeaderPartial` | cross_community | 4 |
| `Build → EscapeHtml` | cross_community | 4 |
| `Build → EscapeAttr` | cross_community | 4 |
| `Main → NotionFetch` | intra_community | 4 |
| `RenderSkillDetail → Slugify` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_101 | 2 calls |
| Server | 2 calls |
| Assets | 1 calls |
| Transformers | 1 calls |
| Cluster_105 | 1 calls |
| Cluster_106 | 1 calls |

## How to Explore

1. `gitnexus_context({name: "generateSubPages"})` — see callers and callees
2. `gitnexus_query({query: "scripts"})` — find related execution flows
3. Read key files listed above for implementation details
