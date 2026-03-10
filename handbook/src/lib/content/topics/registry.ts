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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
	}
];
