/**
 * REST handlers for /api/encounter.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import { pb } from '../pb';
import { broadcast } from '../socket/rooms';
import { getEncounterState, setEncounterState } from '../state/encounter';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const characterModule = require('../../../data/characters');

export function getEncounter(_req: Request, res: Response): void {
  res.json(getEncounterState());
}

export async function startEncounter(req: Request, res: Response): Promise<void> {
  const { participants } = req.body;
  if (!Array.isArray(participants) || participants.length === 0) {
    res.status(400).json({ error: 'participants must be a non-empty array' }); return;
  }

  const chars = await characterModule.getAll(pb);
  const charMap = Object.fromEntries(chars.map((c: Record<string, unknown>) => [c.id, c]));
  const sorted = participants
    .filter((p: { charId: string }) => charMap[p.charId])
    .map((p: { charId: string; initiative: number }) => {
      const c = charMap[p.charId] as Record<string, unknown>;
      return {
        charId: p.charId,
        name: c.name as string,
        photo: (c.photo as string | null) || null,
        class_primary: (c.class_primary as Record<string, unknown> | null) || null,
        hp_current: c.hp_current as number,
        hp_max: c.hp_max as number,
        initiative: Number(p.initiative) || 0,
      };
    })
    .sort((a: { initiative: number }, b: { initiative: number }) => b.initiative - a.initiative);

  if (sorted.length === 0) {
    res.status(400).json({ error: 'No valid participants found' }); return;
  }

  const state = setEncounterState({ active: true, round: 1, currentTurnIndex: 0, participants: sorted });
  broadcast('encounter_started', state as unknown as Record<string, unknown>);
  res.status(200).json(state);
}

export function nextTurn(req: Request, res: Response): void {
  const state = getEncounterState();
  if (!state.active) {
    res.status(400).json({ error: 'No active encounter' }); return;
  }

  let next = state.currentTurnIndex + 1;
  let round = state.round;
  if (next >= state.participants.length) {
    next = 0;
    round += 1;
  }
  const updated = setEncounterState({ ...state, currentTurnIndex: next, round });
  broadcast('turn_advanced', {
    currentTurnIndex: updated.currentTurnIndex,
    currentParticipant: updated.participants[updated.currentTurnIndex] as unknown as Record<string, unknown>,
    round: updated.round,
  });
  res.status(200).json(updated);
}

export function endEncounter(_req: Request, res: Response): void {
  setEncounterState({ active: false, round: 0, currentTurnIndex: 0, participants: [] });
  broadcast('encounter_ended', {});
  res.status(200).json({ ok: true });
}
