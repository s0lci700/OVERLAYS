/**
 * REST handlers for /api/characters and related sub-resources.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import { pb } from '../pb';
import { broadcast } from '../socket/rooms';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const characterModule = require('../../../data/characters');

const SHORT_ID_RE = /^[A-Z0-9]{5}$/i;
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export async function listCharacters(req: Request, res: Response): Promise<void> {
  try {
    const chars = await characterModule.getAll(pb);
    res.status(200).json(chars);
  } catch (err) {
    console.error('[server] /api/characters failed to read from PocketBase:', (err as Error).message || err);
    res.status(500).json({ error: 'Could not read characters from PocketBase.' });
  }
}

export async function createCharacter(req: Request, res: Response): Promise<void> {
  const {
    campaign_id, name, player, hp_current, hp_max, hp_temp,
    ability_scores, turn_state, death_state, armor_class, speed_walk,
    entity_type, visible_to_players, class_primary, conditions, resources,
    photo, background, species, languages, alignment, proficiencies, equipment,
  } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name must be a non-empty string' }); return;
  }
  if (typeof player !== 'string' || player.trim() === '') {
    res.status(400).json({ error: 'player must be a non-empty string' }); return;
  }
  if (typeof hp_max !== 'number' || !Number.isFinite(hp_max) || hp_max <= 0) {
    res.status(400).json({ error: 'hp_max must be a positive finite number' }); return;
  }
  if (hp_current !== undefined && (typeof hp_current !== 'number' || !Number.isFinite(hp_current) || hp_current < 0)) {
    res.status(400).json({ error: 'hp_current must be a finite number greater than or equal to 0' }); return;
  }
  if (armor_class !== undefined && (typeof armor_class !== 'number' || !Number.isFinite(armor_class) || armor_class < 0)) {
    res.status(400).json({ error: 'armor_class must be a finite number greater than or equal to 0' }); return;
  }
  if (speed_walk !== undefined && (typeof speed_walk !== 'number' || !Number.isFinite(speed_walk) || speed_walk < 0)) {
    res.status(400).json({ error: 'speed_walk must be a finite number greater than or equal to 0' }); return;
  }
  if (photo !== undefined && typeof photo !== 'string') {
    res.status(400).json({ error: 'photo must be a string' }); return;
  }

  const character = await characterModule.createCharacter(pb, {
    campaign_id, name, player, hp_current, hp_max, hp_temp,
    ability_scores, turn_state, death_state, armor_class, speed_walk,
    entity_type, visible_to_players, class_primary, conditions, resources,
    photo, background, species, languages, alignment, proficiencies, equipment,
  });

  broadcast('character_created', { character });
  res.status(201).json(character);
}

export async function updateHp(req: Request, res: Response): Promise<void> {
  const charId = req.params.id as string;
  const { hp_current } = req.body;
  if (hp_current === undefined || typeof hp_current !== 'number' || !Number.isFinite(hp_current)) {
    res.status(400).json({ error: 'hp_current must be a finite number' }); return;
  }
  let character;
  try {
    character = await characterModule.updateHp(pb, charId, hp_current);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  if (!character) { res.status(404).json({ error: 'Character not found' }); return; }
  broadcast('hp_updated', { character, hp_current: character.hp_current });
  res.status(200).json(character);
}

export async function updatePhoto(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { photo } = req.body;
  if (photo !== undefined && typeof photo !== 'string') {
    res.status(400).json({ error: 'photo must be a string' }); return;
  }
  if (typeof photo === 'string' && photo.length > 2000000) {
    res.status(413).json({ error: 'photo payload is too large' }); return;
  }
  let character;
  try {
    character = await characterModule.updatePhoto(pb, id, photo);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('character_updated', { character });
  res.status(200).json(character);
}

export async function updateCharacter(req: Request, res: Response): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ error: 'name must be a non-empty string' }); return;
    }
    updates.name = req.body.name;
  }
  if (req.body.player !== undefined) {
    if (typeof req.body.player !== 'string' || req.body.player.trim() === '') {
      res.status(400).json({ error: 'player must be a non-empty string' }); return;
    }
    updates.player = req.body.player;
  }
  if (req.body.hp_max !== undefined) {
    if (typeof req.body.hp_max !== 'number' || !Number.isFinite(req.body.hp_max) || req.body.hp_max <= 0) {
      res.status(400).json({ error: 'hp_max must be a positive finite number' }); return;
    }
    updates.hp_max = req.body.hp_max;
  }
  if (req.body.hp_current !== undefined) {
    if (typeof req.body.hp_current !== 'number' || !Number.isFinite(req.body.hp_current) || req.body.hp_current < 0) {
      res.status(400).json({ error: 'hp_current must be a finite number greater than or equal to 0' }); return;
    }
    updates.hp_current = req.body.hp_current;
  }
  if (req.body.armor_class !== undefined) {
    if (typeof req.body.armor_class !== 'number' || !Number.isFinite(req.body.armor_class) || req.body.armor_class < 0) {
      res.status(400).json({ error: 'armor_class must be a finite number greater than or equal to 0' }); return;
    }
    updates.armor_class = req.body.armor_class;
  }
  if (req.body.speed_walk !== undefined) {
    if (typeof req.body.speed_walk !== 'number' || !Number.isFinite(req.body.speed_walk) || req.body.speed_walk < 0) {
      res.status(400).json({ error: 'speed_walk must be a finite number greater than or equal to 0' }); return;
    }
    updates.speed_walk = req.body.speed_walk;
  }
  if (req.body.class_primary !== undefined) {
    if (!isPlainObject(req.body.class_primary)) { res.status(400).json({ error: 'class_primary must be an object' }); return; }
    updates.class_primary = req.body.class_primary;
  }
  if (req.body.background !== undefined) {
    if (!isPlainObject(req.body.background)) { res.status(400).json({ error: 'background must be an object' }); return; }
    updates.background = req.body.background;
  }
  if (req.body.species !== undefined) {
    if (!isPlainObject(req.body.species)) { res.status(400).json({ error: 'species must be an object' }); return; }
    updates.species = req.body.species;
  }
  if (req.body.languages !== undefined) {
    if (!Array.isArray(req.body.languages)) { res.status(400).json({ error: 'languages must be an array' }); return; }
    updates.languages = req.body.languages;
  }
  if (req.body.alignment !== undefined) {
    if (typeof req.body.alignment !== 'string') { res.status(400).json({ error: 'alignment must be a string' }); return; }
    updates.alignment = req.body.alignment;
  }
  if (req.body.proficiencies !== undefined) {
    if (!isPlainObject(req.body.proficiencies)) { res.status(400).json({ error: 'proficiencies must be an object' }); return; }
    updates.proficiencies = req.body.proficiencies;
  }
  if (req.body.equipment !== undefined) {
    if (!isPlainObject(req.body.equipment)) { res.status(400).json({ error: 'equipment must be an object' }); return; }
    updates.equipment = req.body.equipment;
  }

  const id = req.params.id as string;
  let character;
  try {
    character = await characterModule.updateCharacterData(pb, id, updates);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('character_updated', { character });
  res.status(200).json(character);
}

export async function addCondition(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { condition_name, intensity_level } = req.body;
  if (typeof condition_name !== 'string' || condition_name.trim() === '') {
    res.status(400).json({ error: 'condition_name must be a non-empty string' }); return;
  }
  if (intensity_level !== undefined && (typeof intensity_level !== 'number' || intensity_level <= 0)) {
    res.status(400).json({ error: 'intensity_level must be a positive number' }); return;
  }
  let character;
  try {
    character = await characterModule.addCondition(pb, id, { condition_name, intensity_level });
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  const condition = character.conditions[character.conditions.length - 1];
  broadcast('condition_added', { charId: id, condition });
  console.log(`Condition added: ${condition_name} → ${id}`);
  res.status(201).json(condition);
}

export async function removeCondition(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const condId = req.params.condId as string;
  if (!SHORT_ID_RE.test(condId)) {
    res.status(400).json({ error: 'condId must be 5 chars' }); return;
  }
  try {
    await characterModule.removeCondition(pb, id, condId);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character or condition not found' }); return; }
    throw err;
  }
  broadcast('condition_removed', { charId: id, conditionId: condId });
  console.log(`Condition removed: ${condId} from ${id}`);
  res.status(200).json({ ok: true });
}

export async function deleteCharacter(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    await characterModule.removeCharacter(pb, id);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('character_deleted', { charId: id });
  console.log(`Character deleted: ${id}`);
  res.status(200).json({ ok: true });
}

export async function updateResource(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const rid = req.params.rid as string;
  const { pool_current } = req.body;
  if (pool_current === undefined || pool_current === null) {
    res.status(400).json({ error: 'pool_current required' }); return;
  }
  if (typeof pool_current !== 'number' || !Number.isFinite(pool_current)) {
    res.status(400).json({ error: 'pool_current must be a number' }); return;
  }
  if (pool_current < 0) {
    res.status(400).json({ error: 'pool_current must be >= 0' }); return;
  }
  let resource;
  try {
    resource = await characterModule.updateResource(pb, id, rid, pool_current);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character or resource not found' }); return; }
    throw err;
  }
  broadcast('resource_updated', { charId: id, resource });
  res.status(200).json(resource);
}

export async function restoreResources(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { type } = req.body;
  if (!['short', 'long'].includes(type)) {
    res.status(400).json({ error: 'type must be "short" or "long"' }); return;
  }
  let result;
  try {
    result = await characterModule.restoreResources(pb, id, type);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('rest_taken', { charId: id, type, restored: result.restored, character: result.character });
  console.log(`Rest taken: ${type} → ${id}, restored: ${result.restored.join(', ')}`);
  res.status(200).json({ restored: result.restored });
}

export async function batchUpdateHp(req: Request, res: Response): Promise<void> {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400).json({ error: 'updates must be a non-empty array' }); return;
  }

  const results: unknown[] = [];
  const errors: unknown[] = [];

  await Promise.all(
    updates.map(async ({ charId, hp_current }: { charId: string; hp_current: number }) => {
      if (charId == null || charId === '') { errors.push({ charId, error: 'charId required' }); return; }
      if (typeof hp_current !== 'number' || !Number.isFinite(hp_current)) { errors.push({ charId, error: 'hp_current must be a finite number' }); return; }
      try {
        const character = await characterModule.updateHp(pb, charId, hp_current);
        if (character) {
          results.push(character);
          broadcast('hp_updated', { character, hp_current: character.hp_current });
        } else {
          errors.push({ charId, error: 'Character not found' });
        }
      } catch (err) {
        errors.push({ charId, error: (err as Error)?.message || 'Unknown error' });
      }
    }),
  );

  res.status(errors.length && !results.length ? 400 : 200).json({ results, errors });
}
