## The four layers

OVERLAYS organises components into four concentric layers, from most general to most specific.

### ui/ — Low-level primitives

`control-panel/src/lib/components/ui/`

Reusable across the entire project and across surfaces. Wraps `bits-ui` primitives, adds project styling, exposes a clean API. Has no knowledge of characters, dice, or sessions.

Examples: `Button`, `Badge`, `Dialog`, `Tooltip`, `Input`

### shared/ — Cross-surface presentational

`control-panel/src/lib/components/shared/` (if it exists)

Components that know about domain concepts (e.g., displaying a character name) but are used on multiple surfaces. No write logic — no REST calls, no socket emits.

### stage/ — Operator feature components

`control-panel/src/lib/components/stage/`

Components specific to the stage surface. Contain write logic: HP adjustment buttons, condition toggles, dice roll triggers. Composed from `ui/` primitives.

Examples: `CharacterCard`, `HpControl`, `DiceRoller`

### cast/ — DM & player components

`control-panel/src/lib/components/cast/`

Components specific to the DM or player surfaces. May have different read/write tradeoffs than stage.

### Routes — Composition layer

Routes should compose feature components, not reach down to `ui/` primitives directly. A route's job is layout and data wiring, not detailed markup.

```
routes/live/characters/+page.svelte
  └── <CharacterList>        ← stage/
       └── <CharacterCard>   ← stage/
            └── <HpBar>      ← stage/ or shared/
                 └── <Badge> ← ui/
```

## Decision guide

| Question | Answer |
|----------|--------|
| Does it know about characters/dice/sessions? | If no → `ui/` |
| Is it used on stage AND cast? | `shared/` |
| Is it stage-only with write logic? | `stage/` |
| Is it cast/DM-only? | `cast/` |
| Is it one-off for a single route? | Component file alongside the route |
