/**
 * NPC fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by:
 *   - OverlayTurnOrder participants (enemies use id/name/initiative/hp_current/hp_max/isPlayer/photo)
 *   - OverlayAnnounce (announce_npc type — title/body only)
 *   - DM reference card (full NPC record with faction, traits, notes)
 *
 * IDs: 'e1'/'e2' for encounter mobs; 'npc_xxx' for named NPCs / bosses.
 */

// ── Default: friendly NPC ─────────────────────────────────────────────────────

export const npc_friendly = Object.freeze({
  id: 'npc_001',
  name: 'Marisela',
  title: 'la Tabernera',
  faction: 'Neutral',
  is_hostile: false,
  hp_current: 12,
  hp_max: 12,
  armor_class: 11,
  speed_walk: 30,
  photo: null,
  description: 'Una enana corpulenta con ojos que han visto demasiado. Sirve el mejor hidromiel de Ironhaven.',
  traits: ['información local', 'discreción comprada'],
  ability_scores: { str: 12, dex: 10, con: 14, int: 13, wis: 15, cha: 14 },
  notes: 'Sabe sobre el contrabando del puerto. Pedirá favores antes de hablar.',
});

// ── Edge case 1: hostile mob (encounter fodder) ───────────────────────────────

export const npc_hostile_goblin = Object.freeze({
  id: 'e1',
  name: 'Goblin A',
  title: 'Merodeador',
  faction: 'Clan Diente Roto',
  is_hostile: true,
  hp_current: 7,
  hp_max: 7,
  armor_class: 15,
  speed_walk: 30,
  photo: null,
  description: 'Goblin astuto con una daga oxidada y ningún plan de futuro.',
  traits: ['ataque furtivo', 'huir cuando flanqueado'],
  ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  notes: 'Se rinde si queda solo. Puede revelar ubicación del campamento.',
});

// ── Edge case 2: neutral merchant ─────────────────────────────────────────────

export const npc_neutral_merchant = Object.freeze({
  id: 'npc_002',
  name: 'Torvin Dustmantle',
  title: 'Comerciante de Antigüedades',
  faction: 'Gremio de Mercaderes',
  is_hostile: false,
  hp_current: 8,
  hp_max: 8,
  armor_class: 10,
  speed_walk: 30,
  photo: null,
  description: 'Enano nervioso con una lupa permanentemente colgada del cuello. Compra y vende objetos con historia.',
  traits: ['tasación instantánea', 'memoria perfecta de precios'],
  ability_scores: { str: 9, dex: 10, con: 11, int: 17, wis: 12, cha: 13 },
  notes: 'Tiene un mapa a medias del que vende la mitad. La otra mitad la guarda como seguro de vida.',
});

// ── Edge case 3: boss / villain ───────────────────────────────────────────────

export const npc_boss_sombralord = Object.freeze({
  id: 'BOSS01',
  name: 'El Señor de Sombras',
  title: 'Archimago de la Corte Umbría',
  faction: 'Corte Umbría',
  is_hostile: true,
  hp_current: 85,
  hp_max: 120,
  armor_class: 17,
  speed_walk: 30,
  photo: null,
  description: 'Una figura alta envuelta en sombras vivas. Su voz suena como dos idiomas al mismo tiempo.',
  traits: [
    'Resistencia Legendaria (3/día)',
    'Velo de Sombras — invisibilidad parcial en luz tenue',
    'Contraconjuro — reacción para anular hechizos de nivel 3 o inferior',
    'Acciones Legendarias (3)',
  ],
  ability_scores: { str: 10, dex: 14, con: 18, int: 20, wis: 16, cha: 18 },
  notes: 'Segunda fase a mitad de HP: invoca 2 sombras menores. Vulnerable a luz sagrada (radiante).',
});

// ── Encounter-participant shape (for OverlayTurnOrder / InitiativeStrip) ──────

export const enemy_goblin_a = Object.freeze({
  id: 'e1',
  name: 'Goblin A',
  initiative: 14,
  hp_current: 7,
  hp_max: 7,
  isPlayer: false,
  photo: null,
});

export const enemy_goblin_b = Object.freeze({
  id: 'e2',
  name: 'Goblin B',
  initiative: 9,
  hp_current: 3,
  hp_max: 7,
  isPlayer: false,
  photo: null,
});

export const enemy_boss = Object.freeze({
  id: 'BOSS01',
  name: 'Señor de Sombras',
  initiative: 22,
  hp_current: 85,
  hp_max: 120,
  isPlayer: false,
  photo: null,
});
