/**
 * Topic content module.
 *
 * Public API (unchanged from Phase 1):
 *   allTopics        — Topic[]
 *   getTopic(slug)   — Topic | undefined
 *   getTopicsBySection(section) — Topic[]
 *
 * Internal structure:
 *   registry.ts          — typed metadata for all topics (no markdown body)
 *   content/<slug>.md    — markdown body per topic, imported as raw strings
 *
 * To add a new topic:
 *   1. Add metadata to registry.ts
 *   2. Create content/<slug>.md
 *   3. Add the ?raw import and contentMap entry below
 */

import type { Topic } from '$lib/types/content';
import { topicRegistry } from './registry';

// ?raw imports — Vite resolves these at build time into string constants.
// Adding a topic requires one new import + one new contentMap entry.
import tsIntro from './content/ts-intro.md?raw';
import tsSyntax from './content/ts-syntax.md?raw';
import tsFunctions from './content/ts-functions.md?raw';
import tsFunctionTypes from './content/ts-function-types.md?raw';
import svelte5Props from './content/svelte5-props.md?raw';
import svelte5CallbacksSnippets from './content/svelte5-callbacks-snippets.md?raw';
import svelte5Derived from './content/svelte5-derived.md?raw';
import contractsBoundaries from './content/contracts-boundaries.md?raw';
import overlaysArchitecture from './content/overlays-architecture.md?raw';
import componentPlacement from './content/component-placement.md?raw';
import stylingPlacement from './content/styling-placement.md?raw';
import bitsUiMentalModel from './content/bits-ui-mental-model.md?raw';

const contentMap: Record<string, string> = {
	'ts-intro': tsIntro,
	'ts-syntax': tsSyntax,
	'ts-functions': tsFunctions,
	'ts-function-types': tsFunctionTypes,
	'svelte5-props': svelte5Props,
	'svelte5-callbacks-snippets': svelte5CallbacksSnippets,
	'svelte5-derived': svelte5Derived,
	'contracts-boundaries': contractsBoundaries,
	'overlays-architecture': overlaysArchitecture,
	'component-placement': componentPlacement,
	'styling-placement': stylingPlacement,
	'bits-ui-mental-model': bitsUiMentalModel
};

export const allTopics: Topic[] = topicRegistry.map((meta) => ({
	...meta,
	content: contentMap[meta.slug] ?? ''
}));

/** Get a topic by slug */
export function getTopic(slug: string): Topic | undefined {
	return allTopics.find((t) => t.slug === slug);
}

/** Get all topics in a section, sorted by order */
export function getTopicsBySection(section: string): Topic[] {
	return allTopics.filter((t) => t.section === section).sort((a, b) => a.order - b.order);
}
