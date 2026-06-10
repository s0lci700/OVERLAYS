/**
 * Dice result socket event handlers — Phase 2.
 *
 * Stage records physical dice results (DiceIntakeForm). The server relays the
 * resolved event to all surfaces, then persists it to the rolls collection.
 *
 * Event names and payload types come from:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 */
import type { Socket } from 'socket.io';
import { pb } from '../../pb';
import { broadcast } from '../rooms';
import * as characterModule from '../../data/characters';
import * as rollsModule from '../../data/rolls';
import { DICE_RESULT_EVENT, type DiceResultEventPayload } from '@contracts/events';

export function registerDiceEvents(socket: Socket, _sessionId: string): void {
	// ── Dice result ─────────────────────────────────────────────────────────────
	socket.on(DICE_RESULT_EVENT, async (payload: DiceResultEventPayload) => {
		// Relay first — overlays react immediately even if persistence fails.
		broadcast(DICE_RESULT_EVENT, { ...payload });

		try {
			const modifier = payload.modifier ?? 0;
			const characterName =
				payload.characterName ||
				(await characterModule.getCharacterName(pb, payload.charId)) ||
				'Unknown';
			const sides = Number(String(payload.diceType).replace(/^d/, '')) || 20;
			const rollRecord = await rollsModule.logRoll(pb, {
				charId: payload.charId,
				characterName,
				result: payload.total - modifier, // natural value; logRoll re-adds the modifier
				modifier,
				sides
			});
			// Legacy mirror — lastRoll store and existing overlays listen on 'dice_rolled'.
			broadcast('dice_rolled', { ...rollRecord });
		} catch (err) {
			console.error('[socket] Failed to persist dice result:', err);
		}
	});
}
