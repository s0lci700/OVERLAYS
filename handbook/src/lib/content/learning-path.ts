import type { LearningSection } from '$lib/types/content';

export const learningPath: LearningSection[] = [
	{
		id: 'typescript',
		title: 'TypeScript Foundations',
		description:
			'Read types, write typed functions, understand the TS mental model before touching Svelte.',
		topics: ['ts-intro', 'ts-syntax', 'ts-functions', 'ts-function-types']
	},
	{
		id: 'svelte5',
		title: 'Svelte 5 Fundamentals',
		description: 'Runes, typed props, snippets, and reactivity — the core Svelte 5 patterns.',
		topics: ['svelte5-props', 'svelte5-callbacks-snippets', 'svelte5-derived']
	},
	{
		id: 'architecture',
		title: 'Architecture & Boundaries',
		description:
			'Understand contracts, separation of concerns, and how OVERLAYS is structured end to end.',
		topics: ['contracts-boundaries', 'overlays-architecture']
	},
	{
		id: 'patterns',
		title: 'OVERLAYS Patterns',
		description:
			'Component placement, styling placement, and the bits-ui / shadcn-svelte mental model.',
		topics: ['component-placement', 'styling-placement', 'bits-ui-mental-model']
	}
];

export const sectionColours: Record<string, string> = {
	typescript: 'var(--cyan)',
	svelte5: 'var(--red)',
	architecture: 'var(--purple)',
	patterns: '#fb923c'
};
