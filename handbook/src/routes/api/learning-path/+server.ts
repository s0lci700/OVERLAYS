import { json } from '@sveltejs/kit';
import { learningPath } from '$lib/content/learning-path';
import { allTopics } from '$lib/content/topics';

// Machine-readable learning path with topic summaries resolved
export function GET() {
	const resolved = learningPath.map((section) => ({
		...section,
		topics: section.topics.map((slug) => {
			const topic = allTopics.find((t) => t.slug === slug);
			return topic
				? { slug: topic.slug, title: topic.title, summary: topic.summary }
				: { slug, title: slug, summary: '' };
		})
	}));

	return json(resolved, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*'
		}
	});
}

export const prerender = true;
