/**
 * character-form.ts
 * =================
 * Shared utilities for CharacterCreationForm and CharacterProfileForm.
 * Payload shape mirrors the flat PocketBase `characters` schema exactly.
 *
 * PocketBase fields:
 *   name, player, species, class_name, subclass_name, level,
 *   hp_current, hp_max, hp_temp, ac_base, speed, proficiency_bonus,
 *   ability_scores (JSON), saving_throws_proficiencies (JSON),
 *   skill_proficiencies (JSON), expertise (JSON),
 *   resources (JSON), conditions (JSON),
 *   is_active, is_visible_to_party_overlay, notes (JSON)
 *
 * Fields from the old character-form.js that are NOT in PocketBase
 * (background, alignment, languages, equipment, speciesSize) have been removed.
 */

import type { CharacterRecord } from '$lib/contracts/records';

// ── Shared constants ─────────────────────────────────────────────────────────

export const PHOTO_OPTIONS = [
	{ label: 'Aleatorio', value: '' },
	{ label: 'Barbarian', value: '/assets/img/barbarian-256.webp' },
	{ label: 'Dwarf',     value: '/assets/img/dwarf-256.webp' },
	{ label: 'Elf',       value: '/assets/img/elf-256.webp' },
	{ label: 'Tiefling',  value: '/assets/img/thiefling-256.webp' },
	{ label: 'Wizard',    value: '/assets/img/wizard-256.webp' },
];

// ── Option types ──────────────────────────────────────────────────────────────

export interface OptionItem {
	key:   string;
	label: string;
}

export interface OptionSets {
	classOptions:        OptionItem[];
	subclassOptions:     OptionItem[];
	speciesOptions:      OptionItem[];
	skillOptions:        OptionItem[];
}

// ── Form state ────────────────────────────────────────────────────────────────
// UI field names → maps to PocketBase schema via buildCharacterPayload.

export interface CharacterFormValues {
	name:          string;
	player:        string;
	hpMax:         number;  // → hp_max / hp_current
	armorClass:    number;  // → ac_base
	speedWalk:     number;  // → speed
	classPrimary:  string;  // → class_name
	classSubclass: string;  // → subclass_name
	classLevel:    number;  // → level
	speciesName:   string;  // → species
	skills:        string[]; // → skill_proficiencies (JSON)
}

// ── Option parsing ────────────────────────────────────────────────────────────

export function parseOptionSets(
	characterOptions: Record<string, OptionItem[]>,
): OptionSets {
	const opts = characterOptions ?? {};
	return {
		classOptions:    opts.classes    ?? [],
		subclassOptions: opts.subclasses ?? [],
		speciesOptions:  opts.species    ?? [],
		skillOptions:    opts.skills     ?? [],
	};
}

// ── Label map ─────────────────────────────────────────────────────────────────

export function buildLabelMap(optionSets: OptionSets): Map<string, string> {
	return new Map<string, string>(
		[...optionSets.skillOptions]
			.filter((opt) => opt?.key != null && opt?.label != null)
			.map((opt): [string, string] => [String(opt.key).trim(), String(opt.label).trim()])
			.filter(([k, v]) => k.length > 0 && v.length > 0),
	);
}

// ── Normalize multi-select arrays ─────────────────────────────────────────────

export function normalizeSelection(values: string[] | null | undefined): string[] {
	if (!Array.isArray(values)) return [];
	return values.map((v) => String(v).trim()).filter((v) => v.length > 0);
}

// ── Payload builder ───────────────────────────────────────────────────────────
// Single source of truth for what goes to POST /api/characters.
// Maps form UI names → flat PocketBase field names.

export function buildCharacterPayload(fields: CharacterFormValues): Partial<CharacterRecord> {
	const level = Number(fields.classLevel);
	const hpMax = Number(fields.hpMax);

	// D&D 5e proficiency bonus by level
	const proficiency_bonus =
		level >= 17 ? 6 :
		level >= 13 ? 5 :
		level >= 9  ? 4 :
		level >= 5  ? 3 : 2;

	const skills = normalizeSelection(fields.skills);

	// Default ability scores — PocketBase marks this field Required.
	// All scores start at 10 (D&D point-buy baseline).
	const ability_scores = {
		STR: 10, DEX: 10, CON: 10,
		INT: 10, WIS: 10, CHA: 10,
	};

	return {
		name:          fields.name.trim(),
		player:        fields.player.trim(),
		species:       fields.speciesName,
		class_name:    fields.classPrimary,
		subclass_name: fields.classSubclass,
		level,
		hp_max:        hpMax,
		hp_current:    hpMax,
		ac_base:       Number(fields.armorClass),
		speed:         Number(fields.speedWalk),
		proficiency_bonus,
		ability_scores,
		...(skills.length > 0 ? {
			skill_proficiencies: Object.fromEntries(skills.map(s => [s, true])) as import('$lib/contracts/records').SkillProfs,
		} : {}),
		is_active:                   true,
		is_visible_to_party_overlay: true,
	};
}

// ── Default form values ───────────────────────────────────────────────────────

export function getDefaultFormValues(): CharacterFormValues {
	return {
		name:          '',
		player:        '',
		hpMax:         30,
		armorClass:    10,
		speedWalk:     30,
		classPrimary:  '',
		classSubclass: '',
		classLevel:    1,
		speciesName:   '',
		skills:        [],
	};
}

// ── Edit-mode initialisation ──────────────────────────────────────────────────

export function getFormValuesFromCharacter(character: CharacterRecord): CharacterFormValues {
	const skillProfs = character.skill_proficiencies
		? (Object.entries(character.skill_proficiencies) as [string, boolean][])
				.filter(([, v]) => v === true)
				.map(([k]) => k)
		: [];

	return {
		name:          character.name         ?? '',
		player:        character.player       ?? '',
		hpMax:         character.hp_max       ?? 30,
		armorClass:    character.ac_base      ?? 10,
		speedWalk:     character.speed        ?? 30,
		classPrimary:  character.class_name   ?? '',
		classSubclass: character.subclass_name ?? '',
		classLevel:    character.level        ?? 1,
		speciesName:   character.species      ?? '',
		skills:        skillProfs,
	};
}
