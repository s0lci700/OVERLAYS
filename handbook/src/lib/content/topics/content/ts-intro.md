## Why TypeScript?

OVERLAYS passes character data through many layers: PocketBase → `server.js` → Socket.io → Svelte stores → component props. Without types, a renamed field like `hp_current` → `hp` silently breaks everything downstream. TypeScript makes the contract explicit.

## Reading type annotations

Types appear after colons. They describe _what values are allowed_.

```typescript
let name: string = 'Thorin';
let hp: number = 45;
let conditions: string[] = ['poisoned', 'prone'];
let active: boolean = true;
```

## Object types

An object type describes the shape of a value — what fields it has and what types they hold.

```typescript
type Character = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  conditions: string[];
};
```

## Type inference

TypeScript often infers types from values — you don't need to annotate everything:

```typescript
const name = 'Thorin';     // inferred: string
const hp = 45;             // inferred: number
const ids = ['CH101'];     // inferred: string[]
```

When inference works, prefer it. When a type would be unclear to readers, annotate explicitly.

## Where to look in OVERLAYS

- `control-panel/src/app.d.ts` — global SvelteKit type augmentations
- Component `$props()` — prop types defined inline or via imported types
- `data/characters.js` — currently plain JS; types are inferred from usage
