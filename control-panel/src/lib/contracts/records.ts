/*
Source Of Truth: PocketBase persistent records
Owned by: Stage (Player for self-authored notes; DM/Player limited by policy)
Mirrored to: Stage, Cast (DM/Players), and summaries to Commons/Audience via API
*/
export type RecordID = string; // Unique identifier for a record in PocketBase

export interface Condition {
  id: string;
  condition_name: string;
  intensity_level: number;
  applied_at: string; // ISO 8601
}

export interface ResourceSlot {
  id: string;
  name: string;
  pool_max: number;
  pool_current: number;
  reset_on: 'long_rest' | 'short_rest' | 'turn' | 'dm';
}

export interface CharacterRecord {
    id: string;
    name: string;
    player: string;
    species: string;
    class_name: string;
    subclass_name?: string;
    level:number;
    hp_current: number;
    hp_max: number;
    hp_temp?: number;
    ac_base: number;
    speed: number;
    proficiency_bonus: number;
    ability_scores: Record<string, number>;
    saving_throws_proficiencies: string[];
    skill_proficiencies: string[];
    expertise: string[];
    resources: ResourceSlot[];
    conditions: Condition[];
    is_active: boolean;
    is_visible_to_party_overlay: boolean;
    portrait?: string; // URL or base64 image data
    notes?: string[];
}

export interface CampaignRecord {
    id: string;
    title: string;
    setting: string;
    is_active: boolean;
}

export interface SessionRecord {
    id: string;
    campaign: string;
    title: string;
    session_number: number;
    is_active: boolean;
}
