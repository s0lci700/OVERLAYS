/**
 * Combat socket event handlers — Phase 2.
 *
 * Phase 2 will register handlers for incoming client socket.on() events:
 *   COMBAT_STARTED, TURN_ADVANCED
 *
 * Event names are defined in:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 *
 * See also: handlers/encounter.ts for the REST equivalents (already wired).
 */
import type { Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerCombatEvents(_socket: Socket, _sessionId: string): void {
  // TODO: Phase 2 — wire socket.on(COMBAT_STARTED), socket.on(TURN_ADVANCED), etc.
}
