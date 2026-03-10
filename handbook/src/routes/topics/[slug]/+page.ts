import { allTopics, getTopic } from '$lib/content/topics';
import { marked, Renderer } from 'marked';
import { error } from '@sveltejs/kit';

// Provide all slugs for prerendering
export function entries() {
	return allTopics.map((t) => ({ slug: t.slug }));
}

// Escape raw HTML blocks/inline instead of passing them through untouched.
// Prevents XSS if topic content ever includes raw HTML (e.g. from external sources).
const renderer = new Renderer();
renderer.html = ({ raw }: { raw: string }) =>
	raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export async function load({ params }) {
	const topic = getTopic(params.slug);
	if (!topic) error(404, `Topic "${params.slug}" not found`);

	// Render markdown to HTML on the server at build time
	const html = await marked(topic.content, { renderer, gfm: true });

	return { topic, html };
}
