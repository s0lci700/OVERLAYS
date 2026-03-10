import type { TopicMeta } from '$lib/types/content';

/**
 * All topic metadata — slug, title, section, order, summary, tags, sources, repoFiles, repoDirs.
 * Content (markdown body) lives in ./content/<slug>.md and is combined in index.ts.
 *
 * To add a new topic:
 *   1. Add an entry here
 *   2. Create ./content/<slug>.md
 */
export const topicRegistry: TopicMeta[] = [
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
		related: ['ts-syntax', 'ts-functions'],
		recall: [
			'What does TypeScript add on top of plain JavaScript — at runtime vs at compile time?',
			'Where do global type augmentations live in this codebase?',
			"What's the difference between a type annotation you write and a type TypeScript infers?"
		],
		confusedWith: ['ts-syntax']
	},
	{
		slug: 'ts-syntax',
		title: 'Reading TypeScript Syntax',
		section: 'typescript',
		order: 2,
		summary: "Unions, intersections, utility types, and type aliases — the syntax you'll see daily.",
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
		related: ['ts-intro', 'ts-functions', 'ts-function-types'],
		recall: [
			"What's the difference between a union type (`A | B`) and an intersection type (`A & B`)?",
			'When would you use `Omit<T, K>` instead of `Pick<T, K>`?',
			'What does `type TopicMeta = Omit<Topic, "content">` mean in plain English?'
		],
		confusedWith: ['ts-function-types']
	},
	{
		slug: 'ts-functions',
		title: 'Functions as Values',
		section: 'typescript',
		order: 3,
		summary:
			'Functions are first-class values in JavaScript and TypeScript — type them like anything else.',
		tags: ['typescript', 'functions', 'callbacks'],
		repoFiles: ['data/characters.js', 'control-panel/src/lib/stores/socket.js'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript — More on Functions',
				url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html'
			}
		],
		related: ['ts-function-types', 'ts-syntax', 'contracts-boundaries'],
		recall: [
			"What does it mean for a function to be a 'first-class value'?",
			'Can you assign a function to a variable the same way you assign a number? Show the syntax.',
			"What's the difference between a function declaration and a function expression?"
		],
		confusedWith: ['ts-function-types']
	},
	{
		slug: 'ts-function-types',
		title: 'Function Types',
		section: 'typescript',
		order: 4,
		summary:
			'How to write and read the type of a function — parameter types, return types, and signatures.',
		tags: ['typescript', 'function-types', 'generics'],
		sources: [
			{
				type: 'docs',
				label: 'TypeScript — Function Types',
				url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions'
			}
		],
		related: ['ts-functions', 'ts-syntax', 'svelte5-props'],
		recall: [
			'Write the type for a callback that takes a `string` and returns nothing.',
			"What's the difference between `() => void` and `() => undefined`?",
			'In `(pb: PocketBase, id: string) => Promise<Character>`, identify each part of the signature.'
		],
		confusedWith: ['ts-functions']
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
		related: ['ts-function-types', 'svelte5-callbacks-snippets', 'svelte5-derived'],
		recall: [
			'What Svelte 5 rune replaces `export let` for receiving props?',
			'How do you give a prop a default value in Svelte 5?',
			'What happens at runtime if a parent does not pass a required prop?'
		],
		confusedWith: ['svelte5-callbacks-snippets']
	},
	{
		slug: 'svelte5-callbacks-snippets',
		title: 'Callback Props vs Snippets',
		section: 'svelte5',
		order: 6,
		summary:
			'When to use callback function props vs Snippets for content injection in Svelte 5.',
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
		related: ['svelte5-props', 'svelte5-derived', 'bits-ui-mental-model'],
		recall: [
			'When should you pass a callback prop instead of using a Snippet?',
			'What tag renders a Snippet passed from a parent component?',
			"What's the Svelte 5 replacement for named slots?"
		],
		confusedWith: ['svelte5-props']
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
		related: ['svelte5-props', 'svelte5-callbacks-snippets', 'contracts-boundaries'],
		recall: [
			"What's the difference between `$state` and `$derived`?",
			'When should you use `$derived.by()` instead of plain `$derived`?',
			"What's the key difference between `$derived` and `$effect` — one computes, the other does what?"
		],
		confusedWith: ['svelte5-props']
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
		related: ['overlays-architecture', 'ts-function-types', 'component-placement'],
		recall: [
			'In OVERLAYS, which layer is the only one allowed to write to PocketBase directly?',
			'What should an overlay component do when it needs fresh data — poll, fetch, or listen?',
			'Name three concrete places in the codebase where a contract boundary is enforced.'
		],
		confusedWith: ['overlays-architecture']
	},
	{
		slug: 'overlays-architecture',
		title: 'OVERLAYS Frontend Architecture Overview',
		section: 'architecture',
		order: 9,
		summary:
			'How the full frontend stack fits together: SvelteKit, Socket.io, PocketBase, and OBS.',
		tags: ['architecture', 'sveltekit', 'socket-io', 'pocketbase'],
		repoFiles: ['server.js', 'control-panel/src/lib/stores/socket.js'],
		repoDirs: ['control-panel/src/routes/', 'control-panel/src/lib/components/'],
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
		related: ['contracts-boundaries', 'component-placement', 'svelte5-derived'],
		recall: [
			'What port does each service run on (PocketBase, Node server, control panel)?',
			'Does Socket.io data flow from server to clients, or do clients pull from the server?',
			'Why do overlay routes never send HTTP requests to the server?'
		],
		confusedWith: ['contracts-boundaries']
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
		related: ['styling-placement', 'overlays-architecture', 'bits-ui-mental-model'],
		recall: [
			'Where should a reusable button that appears in both stage and cast routes live?',
			"What distinguishes a `ui/` component from a `stage/` component?",
			'If a component is only used in one route file, where should it live?'
		],
		confusedWith: ['styling-placement']
	},
	{
		slug: 'styling-placement',
		title: 'Styling Placement in OVERLAYS',
		section: 'patterns',
		order: 11,
		summary:
			'Where each type of CSS belongs: design tokens, app.css, utilities.css, or local component CSS.',
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
		related: ['component-placement', 'bits-ui-mental-model', 'overlays-architecture'],
		recall: [
			'Where is the single source of truth for design tokens in this codebase?',
			'Should you ever edit `generated-tokens.css` directly? Why or why not?',
			"What's the difference between a design token variable and a utility class?"
		],
		confusedWith: ['component-placement']
	},
	{
		slug: 'bits-ui-mental-model',
		title: 'shadcn-svelte / bits-ui Mental Model',
		section: 'patterns',
		order: 12,
		summary:
			'Headless primitives, composition, and how bits-ui differs from traditional UI libraries.',
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
		related: ['component-placement', 'svelte5-callbacks-snippets', 'styling-placement'],
		recall: [
			"What does 'headless' mean in the context of bits-ui?",
			'When you install a shadcn-svelte component, what actually lands in your project directory?',
			'How does bits-ui composition differ from wrapping everything in a single opinionated component?'
		],
		confusedWith: ['svelte5-callbacks-snippets']
	}
];
