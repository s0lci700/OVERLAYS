## Function type expressions

A function type describes what a function accepts and returns:

```typescript
// Type alias for a function that takes a string and returns void
type Logger = (message: string) => void;

// Usage:
const log: Logger = (msg) => console.log(msg);
```

## Typing callbacks as props

In Svelte 5, callback props are typed as function types in the props interface:

```typescript
interface Props {
  onconfirm: () => void;
  onselect: (id: string) => void;
  onhpchange: (delta: number) => Promise<void>;
}
```

The caller must pass a function matching that signature exactly.

## Return type annotations

Explicit return types document intent and catch errors:

```typescript
function findCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}

// TypeScript will error if you return a wrong type
```

## Generic functions

Generics let one function work with multiple types while staying type-safe:

```typescript
// T is a type parameter — resolved at each call site
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const char = first(characters);  // TypeScript infers: Character | undefined
const tag = first(['hp', 'mp']);  // TypeScript infers: string | undefined
```

## Void vs undefined

`void` means "the return value should be ignored". `undefined` means "the function explicitly returns undefined". Use `void` for callbacks where the return value doesn't matter — it's more permissive.
