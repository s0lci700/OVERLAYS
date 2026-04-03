/**
 * tooltips.ts
 *
 * Condition descriptions for the Cast/Players surface.
 * Keys match the lowercase condition_name values in PocketBase records
 * and the CONDITION_EFFECTS map in conditionEffects.js.
 *
 * Descriptions are in Spanish (show language: Dados & Risas).
 * Keep them brief — these are mid-session glance references, not rulebook text.
 */

export interface ConditionTooltip {
	/** Display name in Spanish */
	name: string;
	/** One or two-line mechanical summary in Spanish */
	description: string;
}

// ─── Ability Scores ──────────────────────────────────────────────────────────

export interface AbilityTooltip {
	/** Full Spanish name */
	name: string;
	/** Primary use cases in Spanish */
	description: string;
}

/** Keys match ability keys in character-derive.ts ABILITIES array (lowercase). */
export const ABILITY_TOOLTIPS: Record<string, AbilityTooltip> = {
	str: { name: 'Fuerza',       description: 'Ataques cuerpo a cuerpo, atletismo y capacidad de carga.' },
	dex: { name: 'Destreza',     description: 'Ataques a distancia, CA, iniciativa y sigilo.' },
	con: { name: 'Constitución', description: 'Puntos de golpe y tiradas de concentración.' },
	int: { name: 'Inteligencia', description: 'Arcanos, historia e investigación.' },
	wis: { name: 'Sabiduría',    description: 'Percepción, perspicacia y medicina.' },
	cha: { name: 'Carisma',      description: 'Persuasión, engaño e intimidación.' }
};

// ─── Stat Strip ───────────────────────────────────────────────────────────────

export interface StatTooltip {
	name: string;
	description: string;
}

/** Keys match the lowercase stat identifiers used in CharacterHeader. */
export const STAT_TOOLTIPS: Record<string, StatTooltip> = {
	armor: { name: 'Clase de Armadura',   description: 'Dificultad para impactar a este personaje en combate.' },
	speed: { name: 'Velocidad',           description: 'Distancia máxima de movimiento por turno (en pies).' },
	init:  { name: 'Iniciativa',          description: 'Mod. de Destreza. Determina el orden de turno en combate.' },
	prof:  { name: 'Bono de Competencia', description: 'Se añade a ataques, habilidades y salvaciones en las que seas competente.' },
	hd:    { name: 'Dados de Golpe',      description: 'Úsalos en un descanso corto para recuperar PG. Recuperas la mitad en un descanso largo.' },
	pasv:  { name: 'Percepción Pasiva',   description: '10 + bono de Percepción. Detecta amenazas sin necesidad de tirar.' }
};

// ─── Resource Reset Types ─────────────────────────────────────────────────────

/** Keys match ResourceSlot.reset_on values. */
export const RESET_TOOLTIPS: Record<string, string> = {
	short_rest: 'Se recupera en un descanso corto (1 hora).',
	long_rest:  'Se recupera en un descanso largo (8 horas).',
	turn:       'Se recarga al inicio de cada turno.',
	dm:         'Se recarga a discreción del DJ.'
};

// ─── Conditions ───────────────────────────────────────────────────────────────

export const CONDITION_TOOLTIPS: Record<string, ConditionTooltip> = {
	unconscious: {
		name: 'Inconsciente',
		description:
			'Incapacitado, no puede moverse ni hablar. Los ataques tienen ventaja y los golpes cuerpo a cuerpo son críticos automáticos.'
	},
	paralyzed: {
		name: 'Paralizado',
		description:
			'Incapacitado, no puede moverse. Falla tiradas de FUE y DES. Los golpes a menos de 1,5 m son críticos automáticos.'
	},
	petrified: {
		name: 'Petrificado',
		description:
			'Transformado en piedra. Incapacitado, resistencia a todo daño, inmune a veneno y enfermedad.'
	},
	stunned: {
		name: 'Aturdido',
		description:
			'Incapacitado, no puede moverse. Falla tiradas de FUE y DES. Los ataques contra él tienen ventaja.'
	},
	poisoned: {
		name: 'Envenenado',
		description: 'Desventaja en tiradas de ataque y de característica.'
	},
	burning: {
		name: 'En llamas',
		description:
			'Sufre 1d4 de daño por fuego al inicio de cada turno. Una acción puede apagarlo.'
	},
	frozen: {
		name: 'Congelado',
		description:
			'Velocidad reducida a 0. Desventaja en tiradas de DES. Vulnerable al daño contundente.'
	},
	frightened: {
		name: 'Asustado',
		description:
			'Desventaja en ataques y pruebas mientras la fuente del miedo sea visible. No puede acercarse voluntariamente a ella.'
	},
	cursed: {
		name: 'Maldito',
		description:
			'Bajo efecto de una maldición. Los efectos varían según el hechizo u objeto que lo causó.'
	},
	charmed: {
		name: 'Encantado',
		description:
			'No puede atacar ni perjudicar a quien lo encantó. El encantador tiene ventaja en interacciones sociales.'
	},
	blinded: {
		name: 'Cegado',
		description:
			'No puede ver. Los ataques contra él tienen ventaja; los suyos tienen desventaja.'
	},
	invisible: {
		name: 'Invisible',
		description:
			'No puede ser visto sin magia. Sus ataques tienen ventaja; los ataques contra él tienen desventaja.'
	},
	prone: {
		name: 'Tumbado',
		description:
			'Arrastrarse cuesta el doble de movimiento. Levantarse gasta la mitad. Ataques cuerpo a cuerpo tienen ventaja; los de rango, desventaja.'
	}
};