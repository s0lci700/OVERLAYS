import type { Topic, Section } from '$lib/types/content';

export const allTopics: Topic[] = [
	// ─── TypeScript ───────────────────────────────────────────────────────────
	{
		slug: 'ts-intro',
		title: 'Intro to TypeScript for OVERLAYS',
		section: 'typescript',
		order: 1,
		summary: 'Why TypeScript matters in this codebase and how to start reading type annotations.',
		tags: ['typescript', 'basics'],
		repoFiles: ['control-panel/src/app.d.ts', 'handbook/src/lib/types/content.ts'],
		repoDirs: ['control-panel/src/lib/'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript Handbook — The Basics',
				url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html'
			},
			{
				type: 'repo',
				label: 'Global type augmentations',
				path: 'control-panel/src/app.d.ts'
			}
		],
		content: `## Why TypeScript?

OVERLAYS passes character data through many layers: PocketBase → \`server.js\` → Socket.io → Svelte stores → component props. Without types, a renamed field like \`hp_current\` → \`hp\` silently breaks everything downstream. TypeScript makes the contract explicit.

## Reading type annotations

Types appear after colons. They describe _what values are allowed_.

\`\`\`typescript
let name: string = 'Thorin';
let hp: number = 45;
let conditions: string[] = ['poisoned', 'prone'];
let active: boolean = true;
\`\`\`

## Object types

An object type describes the shape of a value — what fields it has and what types they hold.

\`\`\`typescript
type Character = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  conditions: string[];
};
\`\`\`

## Type inference

TypeScript often infers types from values — you don't need to annotate everything:

\`\`\`typescript
const name = 'Thorin';     // inferred: string
const hp = 45;             // inferred: number
const ids = ['CH101'];     // inferred: string[]
\`\`\`

When inference works, prefer it. When a type would be unclear to readers, annotate explicitly.

## Where to look in OVERLAYS

- \`control-panel/src/app.d.ts\` — global SvelteKit type augmentations
- Component \`$props()\` — prop types defined inline or via imported types
- \`data/characters.js\` — currently plain JS; types are inferred from usage`
	},

	{
		slug: 'ts-syntax',
		title: 'Reading TypeScript Syntax',
		section: 'typescript',
		order: 2,
		summary: 'Unions, intersections, utility types, and type aliases — the syntax you\'ll see daily.',
		tags: ['typescript', 'syntax', 'union', 'utility-types'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript — Everyday Types',
				url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'
			},
			{
				type: 'docs',
				label: 'TypeScript — Utility Types',
				url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html'
			}
		],
		content: `## Union types (\`|\`)

A union type means "this OR that". Common in OVERLAYS for status and section fields.

\`\`\`typescript
type Section = 'typescript' | 'svelte5' | 'architecture' | 'patterns';
type ProgressStatus = 'not-started' | 'in-progress' | 'reviewed' | 'solid';

// Used in a function parameter:
function filter(section: Section | null) { ... }
\`\`\`

## Optional fields (\`?\`)

A \`?\` after a field name means the field may not exist at all (i.e., its type is \`T | undefined\`).

\`\`\`typescript
type Source = {
  label: string;
  url?: string;    // may be absent
  path?: string;   // may be absent
};
\`\`\`

## Type aliases

\`type\` gives a name to any type expression:

\`\`\`typescript
type Slug = string;
type TopicMap = Record<string, Topic>;
type Handler = (event: MouseEvent) => void;
\`\`\`

## Utility types

TypeScript ships built-in transformers that derive new types from existing ones:

\`\`\`typescript
// Pick only certain fields
type TopicSummary = Pick<Topic, 'slug' | 'title' | 'summary'>;

// Make all fields optional (useful for partial updates)
type PartialTopic = Partial<Topic>;

// Make all fields required
type RequiredSource = Required<Source>;

// Key → value map
type StatusMap = Record<string, ProgressStatus>;
\`\`\`

## \`interface\` vs \`type\`

Both define object shapes. In OVERLAYS, prefer \`interface\` for extension-heavy shapes and \`type\` for unions and aliases. The practical difference is small — consistency matters more than the choice.

\`\`\`typescript
interface Topic { slug: string; title: string; }
type Section = 'typescript' | 'svelte5';  // type wins for unions
\`\`\``
	},

	{
		slug: 'ts-functions',
		title: 'Functions as Values',
		section: 'typescript',
		order: 3,
		summary: 'Functions are first-class values in JavaScript and TypeScript — type them like anything else.',
		tags: ['typescript', 'functions', 'callbacks'],
		repoFiles: ['data/characters.js', 'control-panel/src/lib/stores/socket.js'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript — More on Functions',
				url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html'
			}
		],
		content: `## Functions as first-class values

In JavaScript and TypeScript, functions are values. You can assign them to variables, pass them as arguments, and return them from other functions.

\`\`\`typescript
// A function stored in a variable
const greet = (name: string): string => \`Hello, \${name}!\`;

// Passed as an argument (callback)
const names = ['Thorin', 'Gimli'];
names.forEach((n) => console.log(greet(n)));
\`\`\`

## Callbacks in OVERLAYS

The control panel sends REST requests and uses callback-style Socket.io event handlers:

\`\`\`typescript
// socket.js — subscribing to an event
socket.on('hp_updated', (data: { id: string; hp: number }) => {
  characters.update((chars) =>
    chars.map((c) => (c.id === data.id ? { ...c, hp: data.hp } : c))
  );
});
\`\`\`

The arrow function \`(data) => { ... }\` is a value passed _into_ \`socket.on\`. TypeScript checks that its parameter matches what the event emits.

## Async functions

All PocketBase wrappers in \`data/characters.js\` are async — they return \`Promise<T>\`:

\`\`\`typescript
async function updateHp(pb: PocketBase, id: string, hp: number): Promise<void> {
  await pb.collection('characters').update(id, { hp });
}
\`\`\`

\`await\` pauses until the Promise resolves. Without \`await\`, you get a pending Promise, not the result.

## The spread operator with objects

Functions in OVERLAYS frequently create new objects via spread rather than mutating:

\`\`\`typescript
// Do this (immutable update):
chars.map((c) => c.id === id ? { ...c, hp: newHp } : c)

// Avoid (mutation):
chars.find((c) => c.id === id)!.hp = newHp;
\`\`\``
	},

	{
		slug: 'ts-function-types',
		title: 'Function Types',
		section: 'typescript',
		order: 4,
		summary: 'How to write and read the type of a function — parameter types, return types, and signatures.',
		tags: ['typescript', 'function-types', 'generics'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript — Function Types',
				url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions'
			}
		],
		content: `## Function type expressions

A function type describes what a function accepts and returns:

\`\`\`typescript
// Type alias for a function that takes a string and returns void
type Logger = (message: string) => void;

// Usage:
const log: Logger = (msg) => console.log(msg);
\`\`\`

## Typing callbacks as props

In Svelte 5, callback props are typed as function types in the props interface:

\`\`\`typescript
interface Props {
  onconfirm: () => void;
  onselect: (id: string) => void;
  onhpchange: (delta: number) => Promise<void>;
}
\`\`\`

The caller must pass a function matching that signature exactly.

## Return type annotations

Explicit return types document intent and catch errors:

\`\`\`typescript
function findCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}

// TypeScript will error if you return a wrong type
\`\`\`

## Generic functions

Generics let one function work with multiple types while staying type-safe:

\`\`\`typescript
// T is a type parameter — resolved at each call site
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const char = first(characters);  // TypeScript infers: Character | undefined
const tag = first(['hp', 'mp']);  // TypeScript infers: string | undefined
\`\`\`

## Void vs undefined

\`void\` means "the return value should be ignored". \`undefined\` means "the function explicitly returns undefined". Use \`void\` for callbacks where the return value doesn't matter — it's more permissive.`
	},

	// ─── Svelte 5 ─────────────────────────────────────────────────────────────
	{
		slug: 'svelte5-props',
		title: 'Svelte 5 Props with $props()',
		section: 'svelte5',
		order: 5,
		summary: 'How $props() replaces export let, typed props, and default values in Svelte 5.',
		tags: ['svelte5', 'props', 'runes'],
		repoFiles: [
			'control-panel/src/lib/components/ui/',
			'control-panel/src/lib/components/stage/'
		],
		sources: [
			{
				type: 'docs',
				label: 'Svelte 5 — $props',
				url: 'https://svelte.dev/docs/svelte/$props'
			}
		],
		content: `## From \`export let\` to \`$props()\`

Svelte 4 used \`export let\` to declare props. Svelte 5 uses the \`$props()\` rune, which returns all props as a destructured object.

\`\`\`svelte
<!-- Svelte 4 -->
<script>
  export let name;
  export let hp = 100;
</script>

<!-- Svelte 5 -->
<script lang="ts">
  let { name, hp = 100 } = $props();
</script>
\`\`\`

## Typed props

Define an interface and pass it as the generic argument:

\`\`\`svelte
<script lang="ts">
  interface Props {
    name: string;
    hp: number;
    maxHp?: number;
    class?: string;
  }

  let { name, hp, maxHp = hp, class: className = '' }: Props = $props();
</script>
\`\`\`

Note: \`class\` is a reserved keyword — destructure it as \`class: className\`.

## Spread props

When a component wraps a native element, spread remaining props through with \`...rest\`:

\`\`\`svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    label: string;
  }

  let { label, ...rest }: Props = $props();
</script>

<button {...rest}>{label}</button>
\`\`\`

## Children (default slot equivalent)

The special \`children\` prop holds nested content — it's a Snippet (covered in the next topic):

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="card">
  {@render children()}
</div>
\`\`\``
	},

	{
		slug: 'svelte5-callbacks-snippets',
		title: 'Callback Props vs Snippets',
		section: 'svelte5',
		order: 6,
		summary: 'When to use callback function props vs Snippets for content injection in Svelte 5.',
		tags: ['svelte5', 'snippets', 'callbacks', 'runes'],
		sources: [
			{
				type: 'docs',
				label: 'Svelte 5 — Snippets',
				url: 'https://svelte.dev/docs/svelte/snippet'
			},
			{
				type: 'docs',
				label: 'Svelte 5 — {@render}',
				url: 'https://svelte.dev/docs/svelte/@render'
			}
		],
		content: `## Callback props — for actions

Use a callback prop when the parent needs to _react to something_ the child does:

\`\`\`svelte
<!-- Parent -->
<CharacterCard
  character={c}
  onhpchange={(delta) => updateHp(c.id, delta)}
  ondelete={() => deleteCharacter(c.id)}
/>

<!-- CharacterCard.svelte -->
<script lang="ts">
  interface Props {
    character: Character;
    onhpchange: (delta: number) => void;
    ondelete: () => void;
  }
  let { character, onhpchange, ondelete }: Props = $props();
</script>
\`\`\`

## Snippets — for content projection

Use a Snippet when the parent wants to inject _markup_ into a child component. This replaces named slots from Svelte 4.

\`\`\`svelte
<!-- Parent -->
<Card>
  {#snippet header()}
    <h2>{character.name}</h2>
  {/snippet}
  <p>HP: {character.hp}</p>
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header?: Snippet;
    children: Snippet;
  }
  let { header, children }: Props = $props();
</script>

<div class="card">
  {#if header}
    <div class="card-header">{@render header()}</div>
  {/if}
  <div class="card-body">{@render children()}</div>
</div>
\`\`\`

## Decision guide

| Need | Use |
|------|-----|
| Parent reacts to child event | Callback prop |
| Parent injects markup into child | Snippet |
| Simple conditional content | Snippet with \`{#if snippet}\` guard |
| Event + data back to parent | Callback with typed parameter |

In OVERLAYS, the stage components (HP controls, dice roller) use callback props heavily. Layout wrappers use Snippets for content slots.`
	},

	{
		slug: 'svelte5-derived',
		title: 'Intro to $derived',
		section: 'svelte5',
		order: 7,
		summary: 'Computing reactive values from state with $derived, and side effects with $effect.',
		tags: ['svelte5', 'derived', 'effect', 'reactivity', 'runes'],
		repoFiles: ['control-panel/src/lib/stores/socket.js'],
		sources: [
			{
				type: 'docs',
				label: 'Svelte 5 — $derived',
				url: 'https://svelte.dev/docs/svelte/$derived'
			},
			{
				type: 'docs',
				label: 'Svelte 5 — $effect',
				url: 'https://svelte.dev/docs/svelte/$effect'
			}
		],
		content: `## $state — raw reactive values

\`$state\` holds a value and makes it reactive. When it changes, anything that depends on it re-renders.

\`\`\`svelte
<script lang="ts">
  let hp = $state(45);
  let name = $state('Thorin');
</script>

<p>{name} has {hp} HP</p>
<button onclick={() => hp -= 5}>Take 5 damage</button>
\`\`\`

## $derived — computed values

\`$derived\` computes a value from other reactive state. It auto-updates whenever its dependencies change — no manual subscription needed.

\`\`\`svelte
<script lang="ts">
  let hp = $state(45);
  let maxHp = $state(80);

  let hpPercent = $derived(Math.round((hp / maxHp) * 100));
  let isCritical = $derived(hpPercent <= 20);
  let statusLabel = $derived(isCritical ? 'Critical' : hp < maxHp ? 'Wounded' : 'Full');
</script>

<div class="bar" style:width="{hpPercent}%" class:is-critical={isCritical}></div>
<span>{statusLabel}</span>
\`\`\`

## $derived.by — for complex derivations

When the derived value needs more than one expression, use \`$derived.by\`:

\`\`\`svelte
let sortedCharacters = $derived.by(() => {
  return [...characters]
    .filter((c) => c.active)
    .sort((a, b) => b.hp - a.hp);
});
\`\`\`

## $effect — side effects

\`$effect\` runs when reactive values it reads change. Use sparingly — mostly for DOM manipulation and external integrations.

\`\`\`svelte
$effect(() => {
  if (isCritical) {
    // Trigger anime.js flash animation
    animate(element, { background: ['#ff0000', 'transparent'] });
  }
});
\`\`\`

> **Rule of thumb:** Prefer \`$derived\` for computed values. Reach for \`$effect\` only when you need to _do something_ outside Svelte's rendering — DOM mutations, animation triggers, or logging.`
	},

	// ─── Architecture ─────────────────────────────────────────────────────────
	{
		slug: 'contracts-boundaries',
		title: 'Contracts and Boundaries',
		section: 'architecture',
		order: 8,
		summary: 'What a contract is, why boundaries matter, and how OVERLAYS enforces them.',
		tags: ['architecture', 'contracts', 'boundaries', 'separation-of-concerns'],
		repoFiles: ['server.js', 'data/characters.js', 'control-panel/src/lib/stores/socket.js'],
		sources: [
			{
				type: 'arch',
				label: 'OVERLAYS Architecture doc',
				path: 'docs/ARCHITECTURE.md'
			},
			{
				type: 'arch',
				label: 'Socket events reference',
				path: 'docs/SOCKET-EVENTS.md'
			}
		],
		content: `## What is a contract?

A contract is the agreed-upon shape of data passed between two parts of a system. When both sides agree, they can evolve independently without breaking each other.

In TypeScript, interfaces and type aliases _are_ contracts:

\`\`\`typescript
// This is a contract between server.js and all clients
type HpUpdatedPayload = {
  id: string;
  hp: number;
};

// server.js emits it:
io.emit('hp_updated', { id, hp });

// socket.js consumes it:
socket.on('hp_updated', (data: HpUpdatedPayload) => { ... });
\`\`\`

## Why boundaries matter

Without clear boundaries, every layer becomes aware of every other layer. A change in PocketBase's field names cascades into component templates. OVERLAYS avoids this with clear handoff points:

\`\`\`
PocketBase  →  data/characters.js  →  server.js  →  Socket.io  →  socket.js store  →  Svelte components
\`\`\`

Each arrow is a boundary. \`data/characters.js\` owns the PocketBase shape. Components never query PocketBase directly.

## Separation of concerns in OVERLAYS

| Layer | Responsibility |
|-------|----------------|
| \`data/characters.js\` | PocketBase CRUD; translate DB → domain objects |
| \`server.js\` | Orchestrate actions; broadcast socket events |
| \`socket.js\` | Maintain shared client state; emit from store |
| Svelte components | Render state; fire user-triggered actions |
| Overlays (audience/) | Passive rendering only — never write |

## The overlay rule

Overlays are a hard boundary: they **only receive** socket events. They never send REST requests or emit socket messages. This keeps them simple, composable, and crash-safe during live sessions.`
	},

	{
		slug: 'overlays-architecture',
		title: 'OVERLAYS Frontend Architecture Overview',
		section: 'architecture',
		order: 9,
		summary: 'How the full frontend stack fits together: SvelteKit, Socket.io, PocketBase, and OBS.',
		tags: ['architecture', 'sveltekit', 'socket-io', 'pocketbase'],
		repoFiles: ['server.js', 'control-panel/src/lib/stores/socket.js'],
		repoDirs: [
			'control-panel/src/routes/',
			'control-panel/src/lib/components/'
		],
		sources: [
			{
				type: 'arch',
				label: 'OVERLAYS Architecture doc',
				path: 'docs/ARCHITECTURE.md'
			},
			{
				type: 'arch',
				label: 'Socket events reference',
				path: 'docs/SOCKET-EVENTS.md'
			}
		],
		content: `## The three surfaces

OVERLAYS has three distinct surfaces, each with a different role:

**Stage (operator-facing)** — \`/live/characters\`, \`/live/dice\`, \`/setup/*\`
The main write authority. Operators manage HP, conditions, dice rolls, and character data. Every user action goes: component → REST fetch → server.js → PocketBase → socket broadcast → all clients update.

**Cast (DM & player-facing)** — \`/dm\`, \`/players/[id]\`
Read-heavy with some writes (initiative, session cards). Composed from shared and feature components.

**Audience (overlays)** — \`/persistent/*\`, \`/moments/*\`, \`/show/*\`
Passive. Rendered in OBS browser sources at 1920×1080. Receive socket events only — never send requests.

## Data flow

\`\`\`
User action (component)
  → REST fetch to server.js
  → PocketBase update (via data/characters.js)
  → io.emit() broadcast to ALL clients
  → socket.js store update ($characters, $lastRoll)
  → Svelte reactivity re-renders all subscribed components
  → Overlays also receive the event and update their DOM
\`\`\`

## Socket.io as the broadcast bus

Every state change goes through Socket.io. This means overlays, the control panel, and any connected device all stay in sync without polling.

\`\`\`javascript
// server.js — single broadcast, all clients update
io.emit('hp_updated', { id, hp, maxHp });
\`\`\`

## PocketBase as persistent state

PocketBase (SQLite under the hood) is the source of truth. On each new Socket.io connection, the server sends \`initialData\` — the full character roster and recent rolls fetched live from PocketBase.

## Key files to read first

| File | Why |
|------|-----|
| \`server.js\` | All Express routes and Socket.io event handlers |
| \`data/characters.js\` | PocketBase CRUD wrappers |
| \`control-panel/src/lib/stores/socket.js\` | Shared client state |
| \`control-panel/src/routes/(stage)/live/characters/\` | Main operator surface |`
	},

	// ─── Patterns ─────────────────────────────────────────────────────────────
	{
		slug: 'component-placement',
		title: 'Component Placement in OVERLAYS',
		section: 'patterns',
		order: 10,
		summary: 'Which folder a component belongs in: ui/, shared/, stage/, cast/, or routes.',
		tags: ['patterns', 'components', 'architecture', 'folder-structure'],
		repoDirs: [
			'control-panel/src/lib/components/ui/',
			'control-panel/src/lib/components/stage/',
			'control-panel/src/lib/components/cast/',
			'control-panel/src/routes/'
		],
		sources: [
			{
				type: 'arch',
				label: 'OVERLAYS component model',
				note: 'Described in CLAUDE.md and docs/ARCHITECTURE.md',
				path: 'docs/ARCHITECTURE.md'
			}
		],
		content: `## The four layers

OVERLAYS organises components into four concentric layers, from most general to most specific.

### ui/ — Low-level primitives

\`control-panel/src/lib/components/ui/\`

Reusable across the entire project and across surfaces. Wraps \`bits-ui\` primitives, adds project styling, exposes a clean API. Has no knowledge of characters, dice, or sessions.

Examples: \`Button\`, \`Badge\`, \`Dialog\`, \`Tooltip\`, \`Input\`

### shared/ — Cross-surface presentational

\`control-panel/src/lib/components/shared/\` (if it exists)

Components that know about domain concepts (e.g., displaying a character name) but are used on multiple surfaces. No write logic — no REST calls, no socket emits.

### stage/ — Operator feature components

\`control-panel/src/lib/components/stage/\`

Components specific to the stage surface. Contain write logic: HP adjustment buttons, condition toggles, dice roll triggers. Composed from \`ui/\` primitives.

Examples: \`CharacterCard\`, \`HpControl\`, \`DiceRoller\`

### cast/ — DM & player components

\`control-panel/src/lib/components/cast/\`

Components specific to the DM or player surfaces. May have different read/write tradeoffs than stage.

### Routes — Composition layer

Routes should compose feature components, not reach down to \`ui/\` primitives directly. A route's job is layout and data wiring, not detailed markup.

\`\`\`
routes/live/characters/+page.svelte
  └── <CharacterList>        ← stage/
       └── <CharacterCard>   ← stage/
            └── <HpBar>      ← stage/ or shared/
                 └── <Badge> ← ui/
\`\`\`

## Decision guide

| Question | Answer |
|----------|--------|
| Does it know about characters/dice/sessions? | If no → \`ui/\` |
| Is it used on stage AND cast? | \`shared/\` |
| Is it stage-only with write logic? | \`stage/\` |
| Is it cast/DM-only? | \`cast/\` |
| Is it one-off for a single route? | Component file alongside the route |`
	},

	{
		slug: 'styling-placement',
		title: 'Styling Placement in OVERLAYS',
		section: 'patterns',
		order: 11,
		summary: 'Where each type of CSS belongs: design tokens, app.css, utilities.css, or local component CSS.',
		tags: ['patterns', 'css', 'tokens', 'styling'],
		repoFiles: [
			'design/tokens.json',
			'control-panel/src/app.css',
			'control-panel/src/utilities.css',
			'control-panel/src/generated-tokens.css'
		],
		sources: [
			{
				type: 'arch',
				label: 'OVERLAYS design system',
				path: 'docs/DESIGN-SYSTEM.md'
			},
			{
				type: 'repo',
				label: 'Token generator script',
				path: 'scripts/generate-tokens.ts'
			}
		],
		content: `## The four styling layers

### 1. Design tokens — \`design/tokens.json\` → \`generated-tokens.css\`

The canonical source. JSON tokens are compiled to CSS custom properties by \`bun run generate:tokens\`. **Never edit the generated file directly.**

\`\`\`json
// design/tokens.json (source)
{ "color": { "hp-full": "#4ade80", "hp-critical": "#ef4444" } }

// generated-tokens.css (output — do not edit)
:root { --color-hp-full: #4ade80; --color-hp-critical: #ef4444; }
\`\`\`

Use tokens for: brand colours, semantic colours, spacing scale, border radii, typography scale.

### 2. app.css — global base styles

Project-wide resets, typography defaults, shared utility classes (\`.card-base\`, \`.btn-base\`, \`.label-caps\`), and layout primitives. Changes here affect every component.

Only add to \`app.css\` when the style is genuinely universal — not "I'll probably reuse this".

### 3. utilities.css — semantic shared utilities

Shared classes that are domain-aware: \`.is-critical\`, \`.is-selected\`, \`.overlay-safe\`. These are BEM-style state classes applied in templates across components.

### 4. Local component CSS — \`<style>\` block or paired \`.css\` file

For wrapper structure and component-specific layout that belongs to exactly one component. This is always valid — don't fight it with global classes.

\`\`\`svelte
<style>
  .card { display: grid; grid-template-columns: 1fr auto; }
  .card.is-collapsed { height: 48px; overflow: hidden; }
</style>
\`\`\`

## Decision guide

| Question | Layer |
|----------|-------|
| Is this a reusable design value (colour, size)? | Token |
| Is this a reset or truly universal utility? | \`app.css\` |
| Is this a shared state class used in multiple components? | \`utilities.css\` |
| Is this the structure of exactly one component? | Local CSS |`
	},

	{
		slug: 'bits-ui-mental-model',
		title: 'shadcn-svelte / bits-ui Mental Model',
		section: 'patterns',
		order: 12,
		summary: 'Headless primitives, composition, and how bits-ui differs from traditional UI libraries.',
		tags: ['patterns', 'bits-ui', 'shadcn-svelte', 'headless', 'composition'],
		repoDirs: ['control-panel/src/lib/components/ui/'],
		sources: [
			{
				type: 'docs',
				label: 'bits-ui documentation',
				url: 'https://bits-ui.com/'
			},
			{
				type: 'docs',
				label: 'shadcn-svelte',
				url: 'https://www.shadcn-svelte.com/'
			}
		],
		content: `## What is a headless component library?

Traditional UI libraries (like Bootstrap) ship components with built-in styles you work around. Headless libraries like \`bits-ui\` provide **behaviour and accessibility** with no visual opinions. You own the styles entirely.

This matches OVERLAYS perfectly — the design language is custom and specific to the production context.

## bits-ui primitives

\`bits-ui\` provides composable primitive components for common UI patterns:

\`\`\`svelte
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Confirm action</Dialog.Title>
      <Dialog.Description>This cannot be undone.</Dialog.Description>
      <Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
\`\`\`

Each sub-component wires up ARIA roles, keyboard navigation, and focus trapping — you style them with your own CSS.

## The wrapper pattern in OVERLAYS

The \`ui/\` folder wraps bits-ui primitives with project-specific defaults:

\`\`\`svelte
<!-- control-panel/src/lib/components/ui/Dialog/Dialog.svelte -->
<script lang="ts">
  import { Dialog as BitsDialog } from 'bits-ui';
  // ... export OVERLAYS-specific props
</script>

<BitsDialog.Root {...props}>
  {@render children()}
</BitsDialog.Root>
\`\`\`

Now the rest of the app imports from \`$lib/components/ui/Dialog\`, not directly from \`bits-ui\`. This creates a single choke point for design decisions.

## tailwind-variants for variant styling

\`tailwind-variants\` composes class variants without manual string concatenation:

\`\`\`typescript
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'btn-base',
  variants: {
    intent: { primary: 'btn-primary', ghost: 'btn-ghost' },
    size: { sm: 'btn-sm', md: 'btn-md' }
  },
  defaultVariants: { intent: 'primary', size: 'md' }
});

// Usage: button({ intent: 'ghost', size: 'sm' }) → 'btn-base btn-ghost btn-sm'
\`\`\``
	}
];

/** Get a topic by slug */
export function getTopic(slug: string): Topic | undefined {
	return allTopics.find((t) => t.slug === slug);
}

/** Get all topics in a section, sorted by order */
export function getTopicsBySection(section: Section): Topic[] {
	return allTopics.filter((t) => t.section === section).sort((a, b) => a.order - b.order);
}
