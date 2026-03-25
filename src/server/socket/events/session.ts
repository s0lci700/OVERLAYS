/**
 * Session lifecycle socket event handlers — Phase 2.
 *
 * Phase 2 will register handlers for room joining/leaving,
 * sync-start acknowledgement, and session state broadcasting.
 *
 * Event names are defined in:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 */
import type { Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerSessionEvents(_socket: Socket, _sessionId: string): void {
  // TODO: Phase 2 — wire room joining, disconnect cleanup, sync acknowledgement, etc.
}
