import { json } from '@sveltejs/kit';
import { allTopics } from '$lib/content/topics';

// Machine-readable topic index — returns metadata without full markdown content
export function GET() {
	const topics = allTopics.map(({ content: _content, ...meta }) => meta);
	return json(topics, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*'
		}
	});
}

export const prerender = true;
// Required to avoid a prerender conflict with /api/topics/[slug]:
// without this, SvelteKit writes /api/topics as a file AND needs it
// as a directory for child routes, which is impossible on disk.
export const trailingSlash = 'always';
