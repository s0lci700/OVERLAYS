/**
 * Socket.io server initialization.
 * Registers all event handlers and sends initialData on connection.
 * Imported by: server.ts
 */
import type { Server } from 'socket.io';
import { pb, ensureAuth } from '../pb';
import { initRooms } from './rooms';
import { getEncounterState } from '../state/encounter';
import { getSceneState, getFocusedChar } from '../state/scene';
import { registerCharacterEvents } from './events/character';
import { registerCombatEvents } from './events/combat';
import { registerSessionEvents } from './events/session';

import * as characterModule from '../data/characters';

export function initSocket(io: Server): void {
  initRooms(io);

  io.on('connection', async (socket) => {
    console.log('A user connected: ' + socket.id);

    const sessionId = (socket.handshake.query.sessionId as string) ?? 'default';

    registerSessionEvents(socket, sessionId);
    registerCharacterEvents(socket, sessionId);
    registerCombatEvents(socket, sessionId);

    try {
      // Always verify auth before fetching — the local authStore can appear
      // valid even after PocketBase restarts (stale token), which causes 400s.
      const ok = await ensureAuth();
      if (!ok) {
        console.warn('[server] PocketBase connection not valid. Auth store invalid.');
        socket.emit('initialData', {
          characters: [],
          encounter: getEncounterState(),
          scene: getSceneState(),
          focusedChar: getFocusedChar(),
        });
        return;
      }
      const characters = await characterModule.getAll(pb);
      socket.emit('initialData', {
        characters,
        encounter: getEncounterState(),
        scene: getSceneState(),
        focusedChar: getFocusedChar(),
      });
    } catch (err) {
      const pbErr = err as any;
      console.error(
        '[server] Failed to load initial data from PocketBase:',
        `[${pbErr.status ?? 0}]`,
        pbErr.response?.message || pbErr.message || String(err),
        pbErr.response?.data && Object.keys(pbErr.response.data).length
          ? JSON.stringify(pbErr.response.data)
          : '',
      );
      socket.emit('initialData', {
        characters: [],
        rolls: [],
        encounter: getEncounterState(),
        scene: getSceneState(),
        focusedChar: getFocusedChar(),
      });
    }
  });
}
