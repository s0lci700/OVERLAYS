/**
 * Character socket event handlers — Phase 2.
 *
 * Phase 2 will register handlers for incoming client socket.on() events:
 *   HP_UPDATED, CONDITION_ADDED, CONDITION_REMOVED, RESOURCE_UPDATED
 *
 * Event names are defined in:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 *
 * See also: handlers/characters.ts for the REST equivalents (already wired).
 */
import type { Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerCharacterEvents(_socket: Socket, _sessionId: string): void {
  // TODO: Phase 2 — wire socket.on(HP_UPDATED), socket.on(CONDITION_ADDED), etc.
}
