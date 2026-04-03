/**
 * hitDice.ts
 *
 * Maps class_name values (lowercase, as stored in PocketBase) to their
 * D&D 5e hit die type. Used to derive hit dice display from class + level
 * without requiring a separate DB field.
 *
 * Source: Player's Handbook 5e
 * Keys must match the `key` values in character-options.template.json.
 */

export type HitDie = 'd6' | 'd8' | 'd10' | 'd12';

export const HIT_DICE_BY_CLASS: Record<string, HitDie> = {
	artificer: 'd8',
	barbarian: 'd12',
	bard: 'd8',
	cleric: 'd8',
	druid: 'd8',
	fighter: 'd10',
	monk: 'd8',
	paladin: 'd10',
	ranger: 'd10',
	rogue: 'd8',
	sorcerer: 'd6',
	warlock: 'd8',
	wizard: 'd6'
};

/**
 * Returns the hit die type for a given class name.
 * Falls back to 'd8' (the most common die) for unknown classes.
 *
 * @example
 * getHitDie('fighter') // → 'd10'
 * getHitDie('wizard')  // → 'd6'
 */
export function getHitDie(className: string): HitDie {
	return HIT_DICE_BY_CLASS[className.toLowerCase()] ?? 'd8';
}

/**
 * Returns the full hit dice notation for display, e.g. "4d10" for a
 * level 4 Fighter.
 */
export function formatHitDice(className: string, level: number): string {
	return `${level}${getHitDie(className)}`;
}
