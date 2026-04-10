/**
 * Mock CharacterRecord fixtures for Living Archive Storybook stories.
 * Characters are designed to exercise specific design states.
 */
import type { CharacterRecord } from '$lib/contracts/records';

/** Thia Siannodel — LVL 12 Elf Wizard. Healthy, full resources, expertise in arcana+history. */
export const thia: CharacterRecord = {
	id: 'CH201',
	name: 'Thia Siannodel',
	player: 'Ana',
	species: 'Elf',
	class_name: 'Wizard',
	subclass_name: 'School of Divination',
	level: 12,
	hp_current: 45,
	hp_max: 64,
	ac_base: 18,
	speed: 30,
	proficiency_bonus: 4,
	ability_scores: { STR: 8, DEX: 14, CON: 13, INT: 20, WIS: 12, CHA: 10 },
	saving_throws_proficiencies: { INT: true, WIS: true },
	skill_proficiencies: { Arcana: true, History: true, Investigation: true, Insight: true, Perception: true },
	expertise: { Arcana: true, History: true },
	resources: [
		{ id: 'r1', name: 'Spell Slots Nv.1', pool_current: 3, pool_max: 4, reset_on: 'long_rest' },
		{ id: 'r2', name: 'Spell Slots Nv.2', pool_current: 2, pool_max: 3, reset_on: 'long_rest' },
		{ id: 'r3', name: 'Spell Slots Nv.3', pool_current: 1, pool_max: 3, reset_on: 'long_rest' },
		{ id: 'r4', name: 'Arcane Recovery', pool_current: 1, pool_max: 1, reset_on: 'long_rest' },
		{ id: 'r5', name: 'Portent Dice', pool_current: 2, pool_max: 2, reset_on: 'long_rest' },
	],
	conditions: [],
	is_active: true,
	is_visible_to_party_overlay: true,
	notes: [
		'Recovered the obsidian shard from the Alpha wolf. Chain Lightning scored 47 damage.',
		'Elder Vaelen warned about the Gaze of the Void. The wizard council is fractured.',
	],
};

/** Thia — Critical HP state (19%). Tests the breathing animation on the HP display. */
export const thiaCritical: CharacterRecord = {
	...thia,
	id: 'CH202',
	hp_current: 12,
	conditions: [
		{ id: 'c1', condition_name: 'Poisoned', intensity_level: 1, applied_at: '2026-03-26T20:00:00Z' },
		{ id: 'c2', condition_name: 'Concentration', intensity_level: 0, applied_at: '2026-03-26T20:05:00Z' },
	],
	resources: [
		{ id: 'r1', name: 'Spell Slots Nv.1', pool_current: 0, pool_max: 4, reset_on: 'long_rest' },
		{ id: 'r2', name: 'Spell Slots Nv.2', pool_current: 0, pool_max: 3, reset_on: 'long_rest' },
		{ id: 'r3', name: 'Spell Slots Nv.3', pool_current: 1, pool_max: 3, reset_on: 'long_rest' },
		{ id: 'r4', name: 'Arcane Recovery', pool_current: 0, pool_max: 1, reset_on: 'long_rest' },
		{ id: 'r5', name: 'Portent Dice', pool_current: 1, pool_max: 2, reset_on: 'long_rest' },
	],
};

/** Grimtar Axebane — LVL 8 Dwarf Fighter. No expertise, martial skill spread. */
export const grimtar: CharacterRecord = {
	id: 'CH203',
	name: 'Grimtar Axebane',
	player: 'Luca',
	species: 'Dwarf',
	class_name: 'Fighter',
	subclass_name: 'Battle Master',
	level: 8,
	hp_current: 72,
	hp_max: 72,
	ac_base: 20,
	speed: 25,
	proficiency_bonus: 3,
	ability_scores: { STR: 20, DEX: 12, CON: 18, INT: 8, WIS: 14, CHA: 10 },
	saving_throws_proficiencies: { STR: true, CON: true },
	skill_proficiencies: { Athletics: true, Perception: true, Intimidation: true },
	resources: [
		{ id: 'r6', name: 'Action Surge', pool_current: 1, pool_max: 1, reset_on: 'short_rest' },
		{ id: 'r7', name: 'Second Wind', pool_current: 0, pool_max: 1, reset_on: 'short_rest' },
		{ id: 'r8', name: 'Superiority Dice', pool_current: 3, pool_max: 4, reset_on: 'short_rest' },
		{ id: 'r9', name: 'Indomitable', pool_current: 1, pool_max: 1, reset_on: 'long_rest' },
	],
	conditions: [
		{ id: 'c3', condition_name: 'Blessed', intensity_level: 0, applied_at: '2026-03-26T21:00:00Z' },
	],
	is_active: true,
	is_visible_to_party_overlay: true,
};

/** Minimal character — no resources, no conditions, no expertise. Edge case. */
export const minimal: CharacterRecord = {
	id: 'CH204',
	name: 'Rook',
	player: 'Test',
	species: 'Human',
	class_name: 'Rogue',
	level: 1,
	hp_current: 8,
	hp_max: 8,
	ac_base: 13,
	speed: 30,
	proficiency_bonus: 2,
	ability_scores: { STR: 10, DEX: 16, CON: 12, INT: 10, WIS: 10, CHA: 10 },
	saving_throws_proficiencies: { DEX: true, INT: true },
	skill_proficiencies: { Stealth: true, Perception: true },
	resources: [],
	conditions: [],
	is_active: true,
	is_visible_to_party_overlay: true,
};
