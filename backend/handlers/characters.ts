/**
 * REST handlers for /api/characters and related sub-resources.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import { pb } from '../pb';
import { broadcast } from '../socket/rooms';

import * as characterModule from '../data/characters';

import * as actions from '../actions/characters';

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

export async function getCharacter(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const char = await characterModule.findById(pb, id as string);
    if (!char) { res.status(404).json({ error: 'Character not found.' }); return; }
    res.status(200).json(char);
  } catch (err) {
    console.error('[server] /api/characters/:id failed:', (err as Error).message || err);
    res.status(500).json({ error: 'Could not read character from PocketBase.' });
  }
}

export async function createCharacter(req: Request, res: Response): Promise<void> {
  const {
    name, player, species, class_name, subclass_name, level,
    hp_current, hp_max, hp_temp,
    ac_base, speed, proficiency_bonus,
    ability_scores, saving_throws_proficiencies, skill_proficiencies, expertise,
    conditions, resources,
    is_active, is_visible_to_party_overlay,
    portrait, notes,
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
  if (portrait !== undefined && typeof portrait !== 'string') {
    res.status(400).json({ error: 'portrait must be a string' }); return;
  }

  const character = await characterModule.createCharacter(pb, {
    name, player, species, class_name, subclass_name, level,
    hp_current, hp_max: hp_max, hp_temp,
    ac_base, speed, proficiency_bonus,
    ability_scores, saving_throws_proficiencies, skill_proficiencies, expertise,
    conditions, resources,
    is_active, is_visible_to_party_overlay,
    portrait, notes,
  });

  broadcast('characterCreated', { character });
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
    character = await actions.updateHp(pb, broadcast, charId, hp_current);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  if (!character) { res.status(404).json({ error: 'Character not found' }); return; }
  res.status(200).json(character);
}

export async function updatePhoto(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { portrait } = req.body;
  if (portrait !== undefined && typeof portrait !== 'string') {
    res.status(400).json({ error: 'portrait must be a string' }); return;
  }
  if (typeof portrait === 'string' && portrait.length > 2000000) {
    res.status(413).json({ error: 'portrait payload is too large' }); return;
  }
  let character;
  try {
    character = await characterModule.updatePhoto(pb, id, portrait ?? '');
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('characterUpdated', { character });
  res.status(200).json(character);
}

export async function updateCharacter(req: Request, res: Response): Promise<void> {
  const updates: Partial<import('../data/characters').CharacterRecord> = {};

  const str = (v: unknown, field: string): boolean => {
    if (typeof v !== 'string' || v.trim() === '') {
      res.status(400).json({ error: `${field} must be a non-empty string` }); return false;
    }
    return true;
  };
  const num = (v: unknown, field: string, min = 0): boolean => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min) {
      res.status(400).json({ error: `${field} must be a number >= ${min}` }); return false;
    }
    return true;
  };

  const b = req.body;
  if (b.name      !== undefined && !str(b.name,      'name'))      return;
  if (b.player    !== undefined && !str(b.player,    'player'))    return;
  if (b.species   !== undefined && !str(b.species,   'species'))   return;
  if (b.class_name !== undefined && !str(b.class_name, 'class_name')) return;
  if (b.level     !== undefined && !num(b.level,     'level', 1))  return;
  if (b.hp_max    !== undefined && !num(b.hp_max,    'hp_max', 1)) return;
  if (b.hp_current !== undefined && !num(b.hp_current, 'hp_current')) return;
  if (b.ac_base   !== undefined && !num(b.ac_base,   'ac_base'))   return;
  if (b.speed     !== undefined && !num(b.speed,     'speed'))     return;
  if (b.proficiency_bonus !== undefined && !num(b.proficiency_bonus, 'proficiency_bonus', 1)) return;
  if (b.notes     !== undefined && !Array.isArray(b.notes)) {
    res.status(400).json({ error: 'notes must be an array' }); return;
  }

  const fields = ['name','player','species','class_name','subclass_name','level',
    'hp_max','hp_current','hp_temp','ac_base','speed','proficiency_bonus',
    'ability_scores','saving_throws_proficiencies','skill_proficiencies','expertise',
    'is_active','is_visible_to_party_overlay','notes'] as const;
  for (const f of fields) {
    if (b[f] !== undefined) (updates as any)[f] = b[f];
  }

  const id = req.params.id as string;
  let character;
  try {
    character = await characterModule.updateCharacterData(pb, id, updates);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  broadcast('characterUpdated', { character });
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
    character = await actions.addCondition(pb, broadcast, id, { condition_name, intensity_level });
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character not found' }); return; }
    throw err;
  }
  if (!character) { res.status(404).json({ error: 'Character not found' }); return; }
  const condition = character.conditions[character.conditions.length - 1];
  console.log(`Condition added: ${condition_name} → ${id}`);
  res.status(201).json(condition);
}

export async function removeCondition(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const condId = req.params.condId as string;
  // Note: REST handler still uses condId directly if available, 
  // but if it only had the name, it could use actions.removeCondition.
  // Since REST API provides condId, we use characterModule directly for now
  // but let's see if we should use the action for consistency.
  // Actually, characterModule.removeCondition is what we want here because we have the ID.
  // Wait, if I want DRY broadcast, I should have an action that takes condId too.
  // For now, I'll stick to the plan of actions for the OVERLAP between REST and Socket.
  // Socket uses NAME. REST uses ID.
  
  if (!SHORT_ID_RE.test(condId)) {
    res.status(400).json({ error: 'condId must be 5 chars' }); return;
  }
  try {
    await characterModule.removeCondition(pb, id, condId);
  } catch (err) {
    if ((err as any)?.status === 404) { res.status(404).json({ error: 'Character or condition not found' }); return; }
    throw err;
  }
  broadcast('conditionRemoved', { charId: id, conditionId: condId });
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
  broadcast('characterDeleted', { charId: id });
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
  broadcast('resourceUpdated', { charId: id, resource });
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
  if (!result) { res.status(404).json({ error: 'Character not found' }); return; }
  broadcast('restTaken', { charId: id, type, restored: result.restored, character: result.character });
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
        const character = await actions.updateHp(pb, broadcast, charId, hp_current);
        if (character) {
          results.push(character);
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
