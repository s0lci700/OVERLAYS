import { json, error } from '@sveltejs/kit';
import { contextPacks, getContextPack } from '$lib/content/context-packs';
import { getTopic } from '$lib/content/topics';

export function entries() {
	return contextPacks.map((p) => ({ slug: p.slug }));
}

// Machine-readable context pack — includes full topic content for LLM usage
export function GET({ params }) {
	const pack = getContextPack(params.slug);
	if (!pack) error(404, `Context pack "${params.slug}" not found`);

	const topics = pack.topics
		.map((slug) => getTopic(slug))
		.filter(Boolean)
		.map((topic) => ({
			slug: topic!.slug,
			title: topic!.title,
			summary: topic!.summary,
			section: topic!.section,
			tags: topic!.tags,
			content: topic!.content,
			repoFiles: topic!.repoFiles,
			repoDirs: topic!.repoDirs,
			sources: topic!.sources
		}));

	return json(
		{ ...pack, topics },
		{
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Access-Control-Allow-Origin': '*'
			}
		}
	);
}

export const prerender = true;
