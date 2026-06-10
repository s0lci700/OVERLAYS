/**
 * Reveal/content queue socket event handlers — Phase 2.
 *
 * Stage owns the queue lifecycle locally (stage-queue.svelte.ts); the server
 * relays publish/clear events so Commons + Audience overlays mirror the state.
 *
 * Event names and payload types come from:
 *   control-panel/src/lib/contracts/events.ts → EventPayloadMap
 */
import type { Socket } from 'socket.io';
import { broadcast } from '../rooms';
import {
	QUEUE_PAYLOAD_PUBLISHED,
	QUEUE_PAYLOAD_CLEARED,
	type QueuePayloadPublishedPayload,
	type QueuePayloadClearedPayload
} from '@contracts/events';

export function registerQueueEvents(socket: Socket, _sessionId: string): void {
	// ── Payload published ───────────────────────────────────────────────────────
	socket.on(QUEUE_PAYLOAD_PUBLISHED, (payload: QueuePayloadPublishedPayload) => {
		broadcast(QUEUE_PAYLOAD_PUBLISHED, { ...payload });
	});

	// ── Payload cleared ─────────────────────────────────────────────────────────
	socket.on(QUEUE_PAYLOAD_CLEARED, (payload: QueuePayloadClearedPayload) => {
		broadcast(QUEUE_PAYLOAD_CLEARED, { ...payload });
	});
}
