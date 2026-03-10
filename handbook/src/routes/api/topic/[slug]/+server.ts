import { json, error } from '@sveltejs/kit';
import { allTopics, getTopic } from '$lib/content/topics';

export function entries() {
	return allTopics.map((t) => ({ slug: t.slug }));
}

// Machine-readable single topic — full content + all metadata fields.
// Suitable for pasting a single topic into an LLM without loading a full context pack.
export function GET({ params }) {
	const topic = getTopic(params.slug);
	if (!topic) error(404, `Topic "${params.slug}" not found`);

	return json(topic, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*'
		}
	});
}

export const prerender = true;
