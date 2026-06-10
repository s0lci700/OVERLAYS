---
name: transformers
description: "Skill for the Transformers area of OVERLAYS. 9 symbols across 3 files."
---

# Transformers

9 symbols | 3 files | Cohesion: 58%

## When to Use

- Working with code in `tools/`
- Understanding how cleanDir, prefixSkillReferences, replacePlaceholders work
- Modifying transformers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `tools/impeccable/scripts/lib/utils.js` | cleanDir, prefixSkillReferences, escapeRegex, replacePlaceholders, ensureDir (+2) |
| `tools/impeccable/scripts/lib/transformers/shared.js` | transformProvider |
| `tools/impeccable/scripts/lib/transformers/factory.js` | createTransformer |

## Entry Points

Start here when exploring this area:

- **`cleanDir`** (Function) — `tools/impeccable/scripts/lib/utils.js:200`
- **`prefixSkillReferences`** (Function) — `tools/impeccable/scripts/lib/utils.js:391`
- **`replacePlaceholders`** (Function) — `tools/impeccable/scripts/lib/utils.js:428`
- **`transformProvider`** (Function) — `tools/impeccable/scripts/lib/transformers/shared.js:16`
- **`ensureDir`** (Function) — `tools/impeccable/scripts/lib/utils.js:191`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cleanDir` | Function | `tools/impeccable/scripts/lib/utils.js` | 200 |
| `prefixSkillReferences` | Function | `tools/impeccable/scripts/lib/utils.js` | 391 |
| `replacePlaceholders` | Function | `tools/impeccable/scripts/lib/utils.js` | 428 |
| `transformProvider` | Function | `tools/impeccable/scripts/lib/transformers/shared.js` | 16 |
| `ensureDir` | Function | `tools/impeccable/scripts/lib/utils.js` | 191 |
| `writeFile` | Function | `tools/impeccable/scripts/lib/utils.js` | 209 |
| `generateYamlFrontmatter` | Function | `tools/impeccable/scripts/lib/utils.js` | 461 |
| `createTransformer` | Function | `tools/impeccable/scripts/lib/transformers/factory.js` | 47 |
| `escapeRegex` | Function | `tools/impeccable/scripts/lib/utils.js` | 418 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `TransformProvider → EscapeRegex` | intra_community | 3 |
| `CreateTransformer → EscapeRegex` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "cleanDir"})` — see callers and callees
2. `gitnexus_query({query: "transformers"})` — find related execution flows
3. Read key files listed above for implementation details
