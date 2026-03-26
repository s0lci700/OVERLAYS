/**
 * Miscellaneous REST handlers: info, tokens, sync-start, scene, character-focus.
 * Routes are mounted in router.ts.
 */
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pb } from '../pb';
import { broadcast, setSyncStartTime } from '../socket/rooms';
import { getSceneState, setSceneState, setFocusedChar } from '../state/scene';

import * as characterModule from '../data/characters';

// ── Token cache ──────────────────────────────────────────────────────────────

let cachedTokens: unknown = null;

export function preloadTokens(): void {
  try {
    cachedTokens = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'design', 'tokens.json'), 'utf-8'),
    );
  } catch (err) {
    console.warn('⚠️  Could not preload design/tokens.json:', (err as Error).message);
  }
}

// ── Network ───────────────────────────────────────────────────────────────────

export function getMainIP(): string {
  const interfaces = os.networkInterfaces();
  for (const [, addresses] of Object.entries(interfaces)) {
    for (const addressInfo of addresses ?? []) {
      if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
        return addressInfo.address;
      }
    }
  }
  return '127.0.0.1';
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export function getInfo(_req: Request, res: Response): void {
  res.json({
    ip: getMainIP(),
    port: process.env.PORT ?? 3000,
    controlPanelUrl: process.env.CONTROL_PANEL_ORIGIN || 'http://localhost:5173',
  });
}

export function getTokens(_req: Request, res: Response): void {
  if (cachedTokens) { res.json(cachedTokens); return; }
  try {
    cachedTokens = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'design', 'tokens.json'), 'utf-8'),
    );
    res.json(cachedTokens);
  } catch (err) {
    res.status(500).json({ error: 'Could not read design tokens.', details: (err as Error).message });
  }
}

export function syncStart(_req: Request, res: Response): void {
  const ts_abs = Date.now();
  setSyncStartTime(ts_abs);
  broadcast('sync_start', { ts_abs });
  res.status(200).json({ ts_abs });
}

export function getScene(_req: Request, res: Response): void {
  res.json(getSceneState());
}

export function changeScene(req: Request, res: Response): void {
  const { title, subtitle = '', visible = true } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title must be a non-empty string' }); return;
  }
  const state = setSceneState({ title, subtitle, visible });
  broadcast('scene_changed', state as unknown as Record<string, unknown>);
  res.status(200).json(state);
}

export async function focusCharacter(req: Request, res: Response): Promise<void> {
  const { charId } = req.body;
  if (charId == null) { res.status(400).json({ error: 'charId required' }); return; }

  if (charId === '') {
    setFocusedChar(null);
    broadcast('character_unfocused', {});
    res.status(200).json({ focused: null }); return;
  }

  const char = await characterModule.findById(pb, charId);
  if (!char) { res.status(404).json({ error: 'Character not found' }); return; }

  setFocusedChar(char as unknown as Record<string, unknown>);
  broadcast('character_focused', { character: char });
  res.status(200).json({ focused: char });
}
