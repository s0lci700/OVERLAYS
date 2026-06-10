<!--
  OverlayReveal — reveal/content queue consumer (TASK-2.3 audience half).
  Route: /reveal?server=...
  Socket events: queuePayloadPublished / queuePayloadCleared (stage-queue lifecycle)
  Kinds: character_intro (portrait + name + tagline), info_block, location_update

  Shows the most recently published payload until the operator clears it
  (or its expiresAt deadline passes as a local fallback).
-->
<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
	import { slideInFromLeft, slideOutToLeft } from '$lib/components/overlays/shared/animations.js';
	import { resolvePhotoSrc } from '$lib/services/utils.js';
	import {
		QUEUE_PAYLOAD_PUBLISHED,
		QUEUE_PAYLOAD_CLEARED,
		type QueuePayloadPublishedPayload,
		type QueuePayloadClearedPayload
	} from '$lib/contracts/events';
	import type {
		QueueItem,
		CharacterIntroContent,
		InfoBlockContent,
		LocationUpdateContent
	} from '$lib/contracts';
	import type { OverlaySocketInstance } from '$lib/components/overlays/shared/overlaySocket.svelte.js';

	let {
		serverUrl = 'http://localhost:3000',
		preview = null
	}: { serverUrl?: string; preview?: QueueItem | null } = $props();

	// ─── State ────────────────────────────────────────────────────────────────

	let overlay = $state<OverlaySocketInstance | null>(null);
	let activeItems = $state<QueueItem[]>([]);
	let cardEl = $state<HTMLElement | null>(null);

	// Local expiry fallback timers — the Stage route also auto-expires, but only
	// while it's open; the overlay must never depend on that.
	const expiryTimers: Record<string, ReturnType<typeof setTimeout>> = {};

	// ─── Derived ──────────────────────────────────────────────────────────────

	/** Most recently published payload wins the screen. */
	const current = $derived(preview ?? activeItems.at(-1) ?? null);

	const intro = $derived(
		current?.kind === 'character_intro' ? (current.payload as CharacterIntroContent) : null
	);
	const info = $derived(
		current?.kind === 'info_block' ? (current.payload as InfoBlockContent) : null
	);
	const loc = $derived(
		current?.kind === 'location_update' ? (current.payload as LocationUpdateContent) : null
	);

	const introChar = $derived(intro && overlay ? overlay.getChar(intro.characterId) : null);
	const introPhoto = $derived(
		introChar?.portrait ? resolvePhotoSrc(introChar.portrait, serverUrl) : null
	);

	const KIND_LABELS: Record<QueueItem['kind'], string> = {
		character_intro: '— Personaje —',
		info_block: '— Información —',
		location_update: '— Locación —'
	};

	// ─── Socket wiring ────────────────────────────────────────────────────────

	$effect(() => {
		if (preview) return;
		const instance = createOverlaySocket(serverUrl);
		overlay = instance;

		const handlePublished = async (data: QueuePayloadPublishedPayload) => {
			const item = data.item;
			if (!item?.id) return;
			activeItems = [...activeItems.filter((i) => i.id !== item.id), item];
			scheduleExpiry(item);
			await tick();
			if (cardEl) slideInFromLeft(cardEl);
		};

		const handleCleared = (data: QueuePayloadClearedPayload) => {
			removeItem(data.itemId);
		};

		instance.socket.on(QUEUE_PAYLOAD_PUBLISHED, handlePublished);
		instance.socket.on(QUEUE_PAYLOAD_CLEARED, handleCleared);

		return () => {
			instance.socket.off(QUEUE_PAYLOAD_PUBLISHED, handlePublished);
			instance.socket.off(QUEUE_PAYLOAD_CLEARED, handleCleared);
		};
	});

	// ─── Helpers ──────────────────────────────────────────────────────────────

	function scheduleExpiry(item: QueueItem): void {
		if (expiryTimers[item.id]) clearTimeout(expiryTimers[item.id]);
		if (!item.expiresAt) return;
		const delay = Date.parse(item.expiresAt) - Date.now();
		if (delay <= 0) return;
		expiryTimers[item.id] = setTimeout(() => removeItem(item.id), delay);
	}

	function removeItem(itemId: string): void {
		if (expiryTimers[itemId]) {
			clearTimeout(expiryTimers[itemId]);
			delete expiryTimers[itemId];
		}
		const finish = () => {
			activeItems = activeItems.filter((i) => i.id !== itemId);
		};
		// Animate out only when clearing the visible card
		if (current?.id === itemId && cardEl) {
			slideOutToLeft(cardEl, 400, finish);
		} else {
			finish();
		}
	}

	onDestroy(() => {
		Object.values(expiryTimers).forEach(clearTimeout);
	});
</script>

{#if current}
	<div class="reveal-canvas">
		<div class="reveal-card is-{current.kind}" bind:this={cardEl}>
			<div class="reveal-type-label">{KIND_LABELS[current.kind]}</div>

			{#if intro}
				<div class="reveal-intro">
					{#if introPhoto}
						<img class="reveal-portrait" src={introPhoto} alt={intro.name} />
					{/if}
					<div class="reveal-intro-text">
						<div class="reveal-title">{intro.name}</div>
						{#if intro.tagline}
							<div class="reveal-body">{intro.tagline}</div>
						{/if}
					</div>
				</div>
			{:else if info}
				<div class="reveal-title">{info.heading}</div>
				<div class="reveal-body">{info.body}</div>
			{:else if loc}
				<div class="reveal-title">{loc.locationName}</div>
				{#if loc.description}
					<div class="reveal-body">{loc.description}</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.reveal-canvas {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 96px;
		pointer-events: none;
	}

	.reveal-card {
		background: rgba(8, 8, 12, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-top: 3px solid var(--cyan, #2ec5cc);
		border-radius: 6px;
		padding: 32px 48px;
		min-width: 480px;
		max-width: 860px;
		opacity: 0;
	}

	.reveal-card.is-character_intro {
		border-color: rgba(80, 13, 245, 0.35);
		border-top-color: var(--purple, #500df5);
	}

	.reveal-card.is-info_block {
		border-color: rgba(30, 158, 142, 0.35);
		border-top-color: #1e9e8e;
	}

	.reveal-card.is-location_update {
		border-color: rgba(255, 77, 106, 0.35);
		border-top-color: var(--red, #ff4d6a);
	}

	.reveal-type-label {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: rgba(255, 255, 255, 0.35);
		margin-bottom: 10px;
	}

	.reveal-intro {
		display: flex;
		align-items: center;
		gap: 28px;
	}

	.reveal-portrait {
		width: 112px;
		height: 112px;
		border-radius: 6px;
		object-fit: cover;
		border: 1px solid rgba(255, 255, 255, 0.15);
		flex-shrink: 0;
	}

	.reveal-title {
		font-family: var(--font-display, 'Space Grotesk', sans-serif);
		font-size: 56px;
		color: var(--white, #ffffff);
		line-height: 1.05;
		letter-spacing: 0.04em;
	}

	.reveal-body {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 16px;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		margin-top: 12px;
		max-width: 640px;
	}
</style>
