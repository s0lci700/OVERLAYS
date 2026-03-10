## Union types (`|`)

A union type means "this OR that". Common in OVERLAYS for status and section fields.

```typescript
type Section = 'typescript' | 'svelte5' | 'architecture' | 'patterns';
type ProgressStatus = 'not-started' | 'in-progress' | 'reviewed' | 'solid';

// Used in a function parameter:
function filter(section: Section | null) { ... }
```

## Optional fields (`?`)

A `?` after a field name means the field may not exist at all (i.e., its type is `T | undefined`).

```typescript
type Source = {
  label: string;
  url?: string;    // may be absent
  path?: string;   // may be absent
};
```

## Type aliases

`type` gives a name to any type expression:

```typescript
type Slug = string;
type TopicMap = Record<string, Topic>;
type Handler = (event: MouseEvent) => void;
```

## Utility types

TypeScript ships built-in transformers that derive new types from existing ones:

```typescript
// Pick only certain fields
type TopicSummary = Pick<Topic, 'slug' | 'title' | 'summary'>;

// Make all fields optional (useful for partial updates)
type PartialTopic = Partial<Topic>;

// Make all fields required
type RequiredSource = Required<Source>;

// Key → value map
type StatusMap = Record<string, ProgressStatus>;
```

## `interface` vs `type`

Both define object shapes. In OVERLAYS, prefer `interface` for extension-heavy shapes and `type` for unions and aliases. The practical difference is small — consistency matters more than the choice.

```typescript
interface Topic { slug: string; title: string; }
type Section = 'typescript' | 'svelte5';  // type wins for unions
```
