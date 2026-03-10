import { allTopics, getTopicsBySection } from '$lib/content/topics';
import type { Section } from '$lib/types/content';

const sections: Section[] = ['typescript', 'svelte5', 'architecture', 'patterns'];

const sectionLabels: Record<Section, string> = {
	typescript: 'TypeScript',
	svelte5: 'Svelte 5',
	architecture: 'Architecture',
	patterns: 'Patterns & Glossary'
};

export function load() {
	return {
		sections: sections.map((id) => ({
			id,
			label: sectionLabels[id],
			topics: getTopicsBySection(id)
		})),
		total: allTopics.length
	};
}
