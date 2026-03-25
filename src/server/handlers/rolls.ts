/**
 * REST handlers for /api/rolls.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import { pb } from '../pb';
import { broadcast } from '../socket/rooms';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const characterModule = require('../../../data/characters');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rollsModule = require('../../../data/rolls');

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export async function logRoll(req: Request, res: Response): Promise<void> {
  const { charId, result, sides } = req.body;
  if (charId == null || charId === '') {
    res.status(400).json({ error: 'charId required' }); return;
  }
  if (!isFiniteNumber(result)) {
    res.status(400).json({ error: 'result must be a finite number' }); return;
  }
  if (!isFiniteNumber(sides) || sides < 1) {
    res.status(400).json({ error: 'sides must be a positive number' }); return;
  }
  const modifier = req.body.modifier ?? 0;
  const characterName = (await characterModule.getCharacterName(pb, req.body.charId)) || 'Unknown';

  const rollRecord = await rollsModule.logRoll(pb, { charId, characterName, result, modifier, sides });
  broadcast('dice_rolled', { ...rollRecord });
  console.log('Roll received:', characterName, req.body);
  res.status(201).json(rollRecord);
}
