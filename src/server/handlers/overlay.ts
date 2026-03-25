/**
 * REST handlers for overlay broadcast events.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import { broadcast } from '../socket/rooms';

export function announce(req: Request, res: Response): void {
  const { type, title, body, image, duration } = req.body;
  if (!type || !title) {
    res.status(400).json({ error: 'type and title are required' }); return;
  }
  broadcast('announce', { type, title, body: body ?? null, image: image ?? null, duration: duration ?? null });
  res.status(200).json({ ok: true });
}

export function levelUp(req: Request, res: Response): void {
  const { charId, newLevel, className } = req.body;
  if (!charId || !newLevel) {
    res.status(400).json({ error: 'charId and newLevel required' }); return;
  }
  broadcast('level_up', { charId, newLevel, className: className ?? '' });
  res.status(200).json({ ok: true });
}

export function playerDown(req: Request, res: Response): void {
  const { charId, isDead } = req.body;
  if (!charId) {
    res.status(400).json({ error: 'charId required' }); return;
  }
  broadcast('player_down', { charId, isDead: isDead === true });
  res.status(200).json({ ok: true });
}

export function lowerThird(req: Request, res: Response): void {
  const { characterName, playerName, duration } = req.body;
  if (!characterName) {
    res.status(400).json({ error: 'characterName required' }); return;
  }
  broadcast('lower_third', { characterName, playerName: playerName ?? '', duration: duration ?? 5000 });
  res.status(200).json({ ok: true });
}
