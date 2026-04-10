/*
Source Of Truth: PocketBase persistent records
Owned by: Stage (Player for self-authored notes; DM/Player limited by policy)
Mirrored to: Stage, Cast (DM/Players), and summaries to Commons/Audience via API
*/
export type RecordID = string; // Unique identifier for a record in PocketBase

export type Abilities = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
export type Skill = 
"Acrobatics" | "Animal Handling" | "Arcana" | "Athletics" | "Deception" 
| "History" | "Insight" | "Intimidation" | "Investigation" | "Medicine" 
| "Nature" | "Perception" | "Performance" | "Persuasion" | "Religion" 
| "Sleight of Hand" | "Stealth" | "Survival";

export type AbilityScores = Record<Abilities, number>; // e.g., { "STR": 16, "DEX": 12, ... }

export type SavingThrowProfs = Partial<Record<Abilities, boolean>>; // sparse — only truthy keys stored

export type SkillProfs = Partial<Record<Skill, boolean>>; // sparse — only truthy keys stored

export interface ConditionAsset {
  id: string;
  condition_name: string;
  image_url: string; // URL to the charcoal/sketch SVG or PNG
  is_generated: boolean; // True if created by Imagen, False if from the "Root" library
}

export interface Condition {
  id: string;
  condition_name: string;
  intensity_level: number;
  applied_at: string; // ISO 8601
  asset?: ConditionAsset; // Linked asset for the "Digital Grimoire" aesthetic
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
    player?: string;
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
    ability_scores: AbilityScores;
    saving_throws_proficiencies?: SavingThrowProfs;
    skill_proficiencies?: SkillProfs;
    expertise?: SkillProfs;
    resources?: ResourceSlot[];
    conditions?: Condition[];
    is_active?: boolean;
    is_visible_to_party_overlay?: boolean;
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
