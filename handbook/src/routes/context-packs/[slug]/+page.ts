import { contextPacks, getContextPack } from '$lib/content/context-packs';
import { getTopic } from '$lib/content/topics';
import { error } from '@sveltejs/kit';

export function entries() {
	return contextPacks.map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const pack = getContextPack(params.slug);
	if (!pack) error(404, `Context pack "${params.slug}" not found`);

	const topics = pack.topics
		.map((slug) => getTopic(slug))
		.filter(Boolean) as NonNullable<ReturnType<typeof getTopic>>[];

	return { pack, topics };
}
