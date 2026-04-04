/**
 * Character socket event handlers — Phase 2.
 *
 * Listens for mutation events from Stage clients, persists to PocketBase,
 * then broadcasts the updated state to all connected clients.
 *
 * Event names and payload types come from:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 *
 * Data functions come from:
 *   src/server/data/characters.ts
 */
import type { Socket } from 'socket.io';
import { pb } from '../../pb';
import { broadcast } from '../rooms';
import {
  updateHp,
  addCondition,
  removeCondition,
  updateResource,
  findById,
} from '../../data/characters';
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
    const character = await updateHp(pb, targetID, newHp);
    if (!character) {
      console.warn(`[socket:hpUpdated] Character ${targetID} not found`);
      return;
    }
    broadcast(HP_UPDATED, { character, hp_current: character.hp_current });
  });

  // ── Condition added ─────────────────────────────────────────────────────────
  socket.on(CONDITION_ADDED, async (payload: ConditionAddedPayload) => {
    const { targetID, condition } = payload;
    const character = await addCondition(pb, targetID, { condition_name: condition });
    if (!character) {
      console.warn(`[socket:conditionAdded] Character ${targetID} not found`);
      return;
    }
    const added = character.conditions.find((c) => c.condition_name === condition) ?? null;
    broadcast(CONDITION_ADDED, { charId: targetID, character, condition: added });
  });

  // ── Condition removed ───────────────────────────────────────────────────────
  // Payload carries condition_name (not ID) — look up ID before removing.
  socket.on(CONDITION_REMOVED, async (payload: ConditionRemovedPayload) => {
    const { targetID, condition } = payload;
    const current = await findById(pb, targetID);
    if (!current) {
      console.warn(`[socket:conditionRemoved] Character ${targetID} not found`);
      return;
    }
    const match = current.conditions.find(
      (c) => c.condition_name.toLowerCase() === condition.toLowerCase(),
    );
    if (!match) {
      console.warn(`[socket:conditionRemoved] Condition "${condition}" not found on ${targetID}`);
      return;
    }
    const character = await removeCondition(pb, targetID, match.id);
    if (!character) return;
    broadcast(CONDITION_REMOVED, { charId: targetID, character, conditionId: match.id });
  });

  // ── Resource updated ────────────────────────────────────────────────────────
  // Payload carries resourceName (not ID) — look up ID before updating.
  socket.on(RESOURCE_UPDATED, async (payload: ResourceUpdatedPayload) => {
    const { targetID, resourceName, newValue } = payload;
    const current = await findById(pb, targetID);
    if (!current) {
      console.warn(`[socket:resourceUpdated] Character ${targetID} not found`);
      return;
    }
    const resource = current.resources.find((r) => r.name === resourceName);
    if (!resource) {
      console.warn(`[socket:resourceUpdated] Resource "${resourceName}" not found on ${targetID}`);
      return;
    }
    const updated = await updateResource(pb, targetID, resource.id, newValue);
    if (!updated) return;
    broadcast(RESOURCE_UPDATED, { charId: targetID, resource: updated });
  });
}
