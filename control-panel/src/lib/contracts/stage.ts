/*
Source Of Truth: API + Stage queue/session orchestration state
Owned by: Stage
Mirrored to: Commons + Audience (payload-specific transforms)
*/

/** HP percentage thresholds shared across Stage, Cast, and Overlay surfaces. */
export const HP_THRESHOLDS = {
  HEALTHY: 60, // > 60% → healthy (green)
  INJURED: 30, // > 30% → injured (yellow), ≤ 30% → critical (red)
} as const;

export type PayloadKind = 'reveal_queue' 
| 'hp_mutation' | 'condition_mutation' | 'combat_control'

export type PublishStatus = 'pending' 
| 'published' | 'archived' | 'failed';


export interface QueueItem {
    id: string;
    kind: PayloadKind;
    payload: any; // Can be more specifically typed based on the kind of payload
    publishedAt: number; // Timestamp of when the item was published
    status: PublishStatus
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

