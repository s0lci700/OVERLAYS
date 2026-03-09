import { allTopics, getTopic } from '$lib/content/topics';
import { marked } from 'marked';
import { error } from '@sveltejs/kit';

// Provide all slugs for prerendering
export function entries() {
	return allTopics.map((t) => ({ slug: t.slug }));
}

export async function load({ params }) {
	const topic = getTopic(params.slug);
	if (!topic) error(404, `Topic "${params.slug}" not found`);

	// Render markdown to HTML on the server at build time
	const html = await marked(topic.content, { gfm: true });

	return { topic, html };
}
