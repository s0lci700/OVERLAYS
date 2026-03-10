export type Section = 'typescript' | 'svelte5' | 'architecture' | 'patterns';
export type ProgressStatus = 'not-started' | 'in-progress' | 'reviewed' | 'solid';
export type SourceType = 'docs' | 'repo' | 'arch' | 'external';

export interface Source {
	type: SourceType;
	label: string;
	url?: string;
	path?: string; // relative repo path
	note?: string;
}

export interface Topic {
	slug: string;
	title: string;
	section: Section;
	order: number;
	summary: string;
	tags: string[];
	content: string; // markdown
	repoFiles?: string[];
	repoDirs?: string[];
	sources?: Source[];
	related?: string[]; // slugs of related topics
	recall?: string[]; // active-recall questions (no answers — find them in the content)
	confusedWith?: string[]; // slugs of topics commonly mistaken for this one
}

/** Topic metadata without the markdown body — used in registry.ts */
export type TopicMeta = Omit<Topic, 'content'>;

export interface LearningSection {
	id: string;
	title: string;
	description: string;
	topics: string[]; // slugs in order
}

export interface ContextPack {
	slug: string;
	title: string;
	description: string;
	topics: string[]; // slugs
	tags?: string[];
}

export interface RepoEntry {
	path: string;
	description: string;
	type: 'file' | 'dir';
}

export interface RepoSection {
	id: string;
	label: string;
	entries: RepoEntry[];
}

// Boundary interfaces for future integrations (Phase 2)

/** Placeholder for future Notion companion sync */
export interface NotionBoundary {
	/** Future: push study session to Notion */
	pushSession?: (session: { topicSlug: string; date: string; notes: string }) => Promise<void>;
	/** Future: pull mobile notes from Notion */
	pullNotes?: (topicSlug: string) => Promise<string[]>;
}

/** Placeholder for future external docs/context enrichment */
export interface ContextEnrichmentBoundary {
	/** Future: fetch enriched context for a topic */
	fetchContext?: (topicSlug: string) => Promise<{ content: string; source: string }[]>;
}
