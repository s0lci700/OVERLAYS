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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const characterModule = require('../../../data/characters');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rollsModule = require('../../../data/rolls');

export function initSocket(io: Server): void {
  initRooms(io);

  io.on('connection', async (socket) => {
    console.log('A user connected: ' + socket.id);

    const sessionId = (socket.handshake.query.sessionId as string) ?? 'default';

    registerSessionEvents(socket, sessionId);
    registerCharacterEvents(socket, sessionId);
    registerCombatEvents(socket, sessionId);

    try {
      if (!pb.authStore.isValid) {
        const ok = await ensureAuth();
        if (!ok) {
          console.warn('[server] PocketBase connection not valid. Auth store invalid.');
          socket.emit('initialData', {
            characters: [],
            rolls: [],
            encounter: getEncounterState(),
            scene: getSceneState(),
            focusedChar: getFocusedChar(),
          });
          return;
        }
      }
      const characters = await characterModule.getAll(pb);
      const rolls = await rollsModule.getAll(pb);
      socket.emit('initialData', {
        characters,
        rolls,
        encounter: getEncounterState(),
        scene: getSceneState(),
        focusedChar: getFocusedChar(),
      });
    } catch (err) {
      console.error(
        '[server] Failed to load initial data from PocketBase:',
        (err as any).status || (err as Error).message || err,
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
