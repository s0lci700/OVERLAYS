/*
Source Of Truth: API + Stage queue/session orchestration state
Owned by: Stage
Mirrored to: Commons + Audience (payload-specific transforms)
*/

/** HP percentage thresholds shared across Stage, Cast, and Overlay surfaces. */
export const HP_THRESHOLDS = {
	HEALTHY: 60, // > 60% → healthy (green)
	INJURED: 30 // > 30% → injured (yellow), ≤ 30% → critical (red)
} as const;

/** Content types the operator can queue for audience reveal. */
export type PayloadKind = 'character_intro' | 'info_block' | 'location_update';

/** Reveal queue lifecycle: draft → armed → published → expired. */
export type QueueItemStatus = 'draft' | 'armed' | 'published' | 'expired';

export interface CharacterIntroContent {
	characterId: string;
	name: string;
	tagline?: string;
}

export interface InfoBlockContent {
	heading: string;
	body: string;
}

export interface LocationUpdateContent {
	locationName: string;
	description?: string;
}

export type QueuePayloadContent = CharacterIntroContent | InfoBlockContent | LocationUpdateContent;

export interface QueueItem {
	id: string;
	kind: PayloadKind;
	title: string;
	payload: QueuePayloadContent;
	status: QueueItemStatus;
	createdAt: string; // ISO timestamp
	armedAt: string | null;
	publishedAt: string | null;
	clearedAt: string | null;
	expiresAt: string | null; // optional auto-expiry deadline
}

// ─── Session package (exported by the Prep App as session.json) ──────────────

export interface SessionPackageLocation {
	id?: string;
	name: string;
	description?: string;
}

export interface SessionPackageNpc {
	id?: string;
	name: string;
	role?: string;
	notes?: string;
}

export interface SessionPackageStoryBeat {
	id?: string;
	title: string;
	summary?: string;
}

/** Parsed session.json from the Prep App (dados-risas-prep). */
export interface SessionPackage {
	session: {
		title: string;
		session_number: number;
		campaign?: string;
	};
	locations: SessionPackageLocation[];
	npcs: SessionPackageNpc[];
	enemies: SessionPackageNpc[];
	storyBeats: SessionPackageStoryBeat[];
}

export type TerrainTag = 'difficult' | 'cover' | 'hazardous';
export type TerrainFlag = 'indoors' | 'outdoors' | 'dark' | 'slippery' | 'elevated';
export type weatherCondition = 'rain' | 'fog' | 'windy' | 'clear';
export type DarknessLevel = 'bright' | 'dim' | 'dark';
export type hazardType = 'pit' | 'spike_trap' | 'quicksand' | 'falling_rock';

export interface SceneState {
	location: string;
	scene_label: string;
	terrain_flags: Array<TerrainFlag>; // e.g., ['indoors', 'dark', 'slippery']
	map_reference: string; // e.g., a URL or identifier for the map being used
}

export interface TerrainState {
	terrain_tags: Array<TerrainTag>; // e.g., ['difficult', 'cover', 'hazardous']
	weather_conditions: Array<weatherCondition>; // e.g., ['rain', 'fog', 'windy']
	darkness_level: DarknessLevel;
	hazards: Array<hazardType>; // e.g., ['pit', 'spike trap', 'quicksand']
}
