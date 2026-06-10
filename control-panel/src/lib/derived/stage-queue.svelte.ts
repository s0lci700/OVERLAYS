import type {
	CharacterIntroContent,
	InfoBlockContent,
	LocationUpdateContent,
	PayloadKind,
	QueueItem,
	QueuePayloadContent
} from '$lib/contracts';
import {
	QUEUE_PAYLOAD_PUBLISHED,
	QUEUE_PAYLOAD_CLEARED,
	type EventPayloadMap
} from '$lib/contracts/events';
import { getSocket } from '$lib/services/socket.svelte';

const HISTORY_LIMIT = 10;

// ─────────────── STATE ───────────────────────────────────────────────────────────

let queueState = $state({
	items: [] as QueueItem[],

	activePayloads: {} as Record<string, QueueItem>,

	publishedHistory: [] as QueueItem[]
});

// ─────────────── ACCESSORS ────────────────────────────────────────────────────────

export function getQueueItems(): QueueItem[] {
	return queueState.items;
}

export function getQueueItem(itemId: QueueItem['id']): QueueItem | null {
	return queueState.items.find((i) => i.id === itemId) ?? null;
}

export function getActivePayloads(): Record<string, QueueItem> {
	return queueState.activePayloads;
}

export function getPublishedHistory(): QueueItem[] {
	return queueState.publishedHistory;
}

// ─────────────── LOCAL HELPERS ──────────────────────────────────────────────────────

function createQueueItemId(): string {
	return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Throwaway timestamp helpers — never stored as reactive Dates. */
const nowIso = (): string => new Date().toISOString();
const nowEpochMs = (): number => Date.now();

function isNonEmpty(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that the payload carries every field its kind requires.
 * Arming incomplete content is rejected — drafts can stay half-filled.
 */
function isContentComplete(kind: PayloadKind, payload: QueuePayloadContent): boolean {
	switch (kind) {
		case 'character_intro': {
			const p = payload as CharacterIntroContent;
			return isNonEmpty(p.characterId) && isNonEmpty(p.name);
		}
		case 'info_block': {
			const p = payload as InfoBlockContent;
			return isNonEmpty(p.heading) && isNonEmpty(p.body);
		}
		case 'location_update': {
			const p = payload as LocationUpdateContent;
			return isNonEmpty(p.locationName);
		}
	}
}

// ─────────────── ACTIONS ────────────────────────────────────────────────────────

/** Creates a draft queue item with a generated ID and timestamp. */
export function addToQueue(input: {
	kind: PayloadKind;
	title: string;
	payload: QueuePayloadContent;
	expiresAt?: string | null;
}): QueueItem {
	const item: QueueItem = {
		id: createQueueItemId(),
		kind: input.kind,
		title: input.title,
		payload: input.payload,
		status: 'draft',
		createdAt: nowIso(),
		armedAt: null,
		publishedAt: null,
		clearedAt: null,
		expiresAt: input.expiresAt ?? null
	};
	queueState.items.push(item);
	return item;
}

/** draft → armed. Validates content completeness before arming. */
export function armPayload(itemId: QueueItem['id']): boolean {
	const item = getQueueItem(itemId);
	if (!item) {
		console.warn(`Queue item ${itemId} not found`);
		return false;
	}
	if (item.status !== 'draft') {
		console.warn(`Queue item ${itemId} cannot be armed from status "${item.status}"`);
		return false;
	}
	if (!isContentComplete(item.kind, item.payload)) {
		console.warn(`Queue item ${itemId} (${item.kind}) has incomplete content — not armed`);
		return false;
	}
	item.status = 'armed';
	item.armedAt = nowIso();
	return true;
}

/** armed → draft. Lets the operator pull an armed item back for editing. */
export function disarmPayload(itemId: QueueItem['id']): boolean {
	const item = getQueueItem(itemId);
	if (!item || item.status !== 'armed') return false;
	item.status = 'draft';
	item.armedAt = null;
	return true;
}

/**
 * armed → published. Adds to activePayloads, logs to history,
 * and broadcasts QUEUE_PAYLOAD_PUBLISHED to all surfaces.
 */
export function publishPayload(itemId: QueueItem['id']): boolean {
	const item = getQueueItem(itemId);
	if (!item) {
		console.warn(`Queue item ${itemId} not found`);
		return false;
	}
	if (item.status !== 'armed') {
		console.warn(`Queue item ${itemId} cannot be published from status "${item.status}"`);
		return false;
	}
	const timestamp = nowIso();
	item.status = 'published';
	item.publishedAt = timestamp;
	queueState.activePayloads[item.id] = item;
	queueState.publishedHistory.unshift(item);
	if (queueState.publishedHistory.length > HISTORY_LIMIT) queueState.publishedHistory.pop();
	getSocket().emit(QUEUE_PAYLOAD_PUBLISHED, {
		item: $state.snapshot(item) as QueueItem,
		source: 'stage',
		timestamp
	} as EventPayloadMap['queuePayloadPublished']);
	return true;
}

/**
 * published → expired. Removes from activePayloads and broadcasts
 * QUEUE_PAYLOAD_CLEARED so overlays take the content down.
 */
export function clearPayload(itemId: QueueItem['id']): boolean {
	const item = getQueueItem(itemId);
	if (!item) {
		console.warn(`Queue item ${itemId} not found`);
		return false;
	}
	if (item.status !== 'published') {
		console.warn(`Queue item ${itemId} cannot be cleared from status "${item.status}"`);
		return false;
	}
	const timestamp = nowIso();
	item.status = 'expired';
	item.clearedAt = timestamp;
	delete queueState.activePayloads[item.id];
	getSocket().emit(QUEUE_PAYLOAD_CLEARED, {
		itemId: item.id,
		kind: item.kind,
		source: 'stage',
		timestamp
	} as EventPayloadMap['queuePayloadCleared']);
	return true;
}

/** Removes a draft item from the queue. Non-drafts are kept for history integrity. */
export function deleteFromQueue(itemId: QueueItem['id']): boolean {
	const idx = queueState.items.findIndex((i) => i.id === itemId);
	if (idx === -1) return false;
	if (queueState.items[idx].status !== 'draft') {
		console.warn(`Queue item ${itemId} is not a draft — delete refused`);
		return false;
	}
	queueState.items.splice(idx, 1);
	return true;
}

/**
 * Scans published payloads past their expiresAt deadline and clears them.
 * Returns the number of items auto-expired. Call from an interval on the queue route.
 */
export function expireExpired(nowMs: number = nowEpochMs()): number {
	const cutoff = nowMs;
	let expired = 0;
	for (const item of Object.values(queueState.activePayloads)) {
		if (item.expiresAt && Date.parse(item.expiresAt) <= cutoff) {
			if (clearPayload(item.id)) expired += 1;
		}
	}
	return expired;
}
