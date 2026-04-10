/**
 * Character socket event handlers — Phase 2.
 *
 * Listens for mutation events from Stage clients, persists to PocketBase,
 * then broadcasts the updated state to all connected clients.
 *
 * Event names and payload types come from:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 *
 * Actions (Mutate + Sync) come from:
 *   src/server/actions/characters.ts
 */
import type { Socket } from 'socket.io';
import { pb } from '../../pb';
import { broadcast } from '../rooms';
import * as actions from '../../actions/characters';
import {
  HP_UPDATED,
  CONDITION_ADDED,
  CONDITION_REMOVED,
  RESOURCE_UPDATED,
  type HpUpdatedPayload,
  type ConditionAddedPayload,
  type ConditionRemovedPayload,
  type ResourceUpdatedPayload,
} from '@contracts/events';

export function registerCharacterEvents(socket: Socket, _sessionId: string): void {

  // ── HP ──────────────────────────────────────────────────────────────────────
  socket.on(HP_UPDATED, async (payload: HpUpdatedPayload) => {
    const { targetID, newHp } = payload;
    await actions.updateHp(pb, broadcast, targetID, newHp);
  });

  // ── Condition added ─────────────────────────────────────────────────────────
  socket.on(CONDITION_ADDED, async (payload: ConditionAddedPayload) => {
    const { targetID, condition } = payload;
    await actions.addCondition(pb, broadcast, targetID, { condition_name: condition });
  });

  // ── Condition removed ───────────────────────────────────────────────────────
  socket.on(CONDITION_REMOVED, async (payload: ConditionRemovedPayload) => {
    const { targetID, condition } = payload;
    await actions.removeCondition(pb, broadcast, targetID, condition);
  });

  // ── Resource updated ────────────────────────────────────────────────────────
  socket.on(RESOURCE_UPDATED, async (payload: ResourceUpdatedPayload) => {
    const { targetID, resourceName, newValue } = payload;
    await actions.updateResource(pb, broadcast, targetID, { resourceName, newValue });
  });
}
