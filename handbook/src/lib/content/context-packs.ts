import type { ContextPack } from '$lib/types/content';

export const contextPacks: ContextPack[] = [
	{
		slug: 'typescript-basics',
		title: 'TypeScript Basics',
		description:
			'Core TypeScript for reading and writing types in OVERLAYS. Give this to an LLM when discussing the codebase.',
		topics: ['ts-intro', 'ts-syntax', 'ts-functions', 'ts-function-types'],
		tags: ['typescript', 'foundations']
	},
	{
		slug: 'svelte5-fundamentals',
		title: 'Svelte 5 Fundamentals',
		description:
			'Props, reactivity, snippets in Svelte 5. Essential context for any component work.',
		topics: ['svelte5-props', 'svelte5-callbacks-snippets', 'svelte5-derived'],
		tags: ['svelte5', 'runes']
	},
	{
		slug: 'overlays-frontend-architecture',
		title: 'OVERLAYS Frontend Architecture',
		description:
			'How the frontend is organized, why boundaries exist, and the full data flow from PocketBase to overlays.',
		topics: ['contracts-boundaries', 'overlays-architecture', 'component-placement'],
		tags: ['architecture', 'sveltekit']
	},
	{
		slug: 'styling-system',
		title: 'Styling System in OVERLAYS',
		description:
			'Tokens, global CSS, utilities, local CSS — where each style lives and why.',
		topics: ['styling-placement'],
		tags: ['css', 'tokens', 'design-system']
	}
];

export function getContextPack(slug: string): ContextPack | undefined {
	return contextPacks.find((p) => p.slug === slug);
}
