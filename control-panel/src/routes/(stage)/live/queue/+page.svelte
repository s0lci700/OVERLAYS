<!--
  Reveal/Content Queue route — TASK-2.3.
  Two-panel layout: left = queued items with status badges; right = selected
  item preview with lifecycle actions (draft → armed → published → expired).
  Publishing broadcasts QUEUE_PAYLOAD_PUBLISHED via the stage-queue store.
-->
<script lang="ts">
	import { characters } from '$lib/services/socket.svelte';
	import {
		getQueueItems,
		getQueueItem,
		getPublishedHistory,
		addToQueue,
		armPayload,
		disarmPayload,
		publishPayload,
		clearPayload,
		deleteFromQueue,
		expireExpired
	} from '$lib/derived/stage-queue.svelte';
	import type { PayloadKind, QueueItem, QueuePayloadContent } from '$lib/contracts';
	import { fly, fade } from 'svelte/transition';

	// ─── Constants ────────────────────────────────────────────────────────────

	const KIND_OPTIONS: Array<{ value: PayloadKind; label: string }> = [
		{ value: 'character_intro', label: 'INTRO PERSONAJE' },
		{ value: 'info_block', label: 'BLOQUE INFO' },
		{ value: 'location_update', label: 'UBICACIÓN' }
	];

	const STATUS_LABELS: Record<QueueItem['status'], string> = {
		draft: 'BORRADOR',
		armed: 'ARMADO',
		published: 'EN VIVO',
		expired: 'EXPIRADO'
	};

	// ─── State ────────────────────────────────────────────────────────────────

	let selectedItemId = $state<string | null>(null);
	let showAddModal = $state(false);

	// Add-to-queue form
	let formKind = $state<PayloadKind>('character_intro');
	let formCharacterId = $state('');
	let formTagline = $state('');
	let formHeading = $state('');
	let formBody = $state('');
	let formLocationName = $state('');
	let formDescription = $state('');
	let formError = $state('');

	// ─── Derived ──────────────────────────────────────────────────────────────

	const items = $derived(getQueueItems());
	const history = $derived(getPublishedHistory().slice(0, 8));
	const selectedItem = $derived(selectedItemId ? getQueueItem(selectedItemId) : null);

	// ─── Lifecycle ────────────────────────────────────────────────────────────

	// Auto-expire published payloads past their deadline.
	$effect(() => {
		const interval = setInterval(() => expireExpired(), 5000);
		return () => clearInterval(interval);
	});

	// ─── Handlers ─────────────────────────────────────────────────────────────

	function resetForm(): void {
		formCharacterId = '';
		formTagline = '';
		formHeading = '';
		formBody = '';
		formLocationName = '';
		formDescription = '';
		formError = '';
	}

	function buildContent(): { title: string; payload: QueuePayloadContent } | null {
		switch (formKind) {
			case 'character_intro': {
				const char = $characters.find((c) => c.id === formCharacterId);
				if (!char) {
					formError = 'Selecciona un personaje.';
					return null;
				}
				return {
					title: char.name,
					payload: {
						characterId: char.id,
						name: char.name,
						tagline: formTagline.trim() || undefined
					}
				};
			}
			case 'info_block': {
				if (!formHeading.trim() || !formBody.trim()) {
					formError = 'Título y contenido son obligatorios.';
					return null;
				}
				return {
					title: formHeading.trim(),
					payload: { heading: formHeading.trim(), body: formBody.trim() }
				};
			}
			case 'location_update': {
				if (!formLocationName.trim()) {
					formError = 'El nombre de la ubicación es obligatorio.';
					return null;
				}
				return {
					title: formLocationName.trim(),
					payload: {
						locationName: formLocationName.trim(),
						description: formDescription.trim() || undefined
					}
				};
			}
		}
	}

	function handleAdd(): void {
		formError = '';
		const content = buildContent();
		if (!content) return;
		const item = addToQueue({ kind: formKind, title: content.title, payload: content.payload });
		selectedItemId = item.id;
		showAddModal = false;
		resetForm();
	}

	function handleDelete(itemId: string): void {
		if (deleteFromQueue(itemId) && selectedItemId === itemId) selectedItemId = null;
	}

	function kindLabel(kind: PayloadKind): string {
		return KIND_OPTIONS.find((k) => k.value === kind)?.label ?? kind;
	}

	function formatTime(iso: string | null): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<section class="queue-route">
	<!-- ─── Left panel: queue list ─────────────────────────────────────────── -->
	<div class="queue-route__list-panel">
		<header class="queue-route__header">
			<h2 class="label-caps">COLA DE REVELACIÓN</h2>
			<button class="queue-route__add-btn" onclick={() => (showAddModal = true)}> + AÑADIR </button>
		</header>

		{#if items.length === 0}
			<p class="queue-route__empty">
				Cola vacía. Añade un bloque de contenido para prepararlo antes de revelarlo.
			</p>
		{:else}
			<ul class="queue-route__list">
				{#each items as item (item.id)}
					<li in:fly={{ y: 8, duration: 200 }}>
						<button
							class="queue-card"
							class:is-selected={selectedItemId === item.id}
							onclick={() => (selectedItemId = item.id)}
						>
							<span class="queue-card__kind">{kindLabel(item.kind)}</span>
							<span class="queue-card__title">{item.title}</span>
							<span class="status-badge" data-status={item.status}>
								{STATUS_LABELS[item.status]}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Published history -->
		<footer class="queue-route__history">
			<h3 class="label-caps">HISTORIAL</h3>
			{#if history.length === 0}
				<p class="queue-route__empty">Sin publicaciones todavía.</p>
			{:else}
				<ul>
					{#each history as past (past.id)}
						<li class="history-row">
							<span class="history-row__time">{formatTime(past.publishedAt)}</span>
							<span class="history-row__kind">{kindLabel(past.kind)}</span>
							<span class="history-row__title">{past.title}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</footer>
	</div>

	<!-- ─── Right panel: preview + actions ─────────────────────────────────── -->
	<div class="queue-route__preview-panel">
		{#if !selectedItem}
			<p class="queue-route__empty">Selecciona un elemento de la cola para previsualizarlo.</p>
		{:else}
			<article class="preview" in:fade={{ duration: 150 }}>
				<header class="preview__header">
					<span class="queue-card__kind">{kindLabel(selectedItem.kind)}</span>
					<span class="status-badge" data-status={selectedItem.status}>
						{STATUS_LABELS[selectedItem.status]}
					</span>
				</header>

				<h2 class="preview__title">{selectedItem.title}</h2>

				{#if selectedItem.kind === 'character_intro' && 'tagline' in selectedItem.payload}
					<p class="preview__body">{selectedItem.payload.tagline ?? ''}</p>
				{:else if selectedItem.kind === 'info_block' && 'body' in selectedItem.payload}
					<p class="preview__body">{selectedItem.payload.body}</p>
				{:else if selectedItem.kind === 'location_update' && 'description' in selectedItem.payload}
					<p class="preview__body">{selectedItem.payload.description ?? ''}</p>
				{/if}

				<dl class="preview__meta">
					<dt>CREADO</dt>
					<dd>{formatTime(selectedItem.createdAt)}</dd>
					<dt>ARMADO</dt>
					<dd>{formatTime(selectedItem.armedAt)}</dd>
					<dt>PUBLICADO</dt>
					<dd>{formatTime(selectedItem.publishedAt)}</dd>
				</dl>

				<div class="preview__actions">
					{#if selectedItem.status === 'draft'}
						<button class="action-btn action-btn--arm" onclick={() => armPayload(selectedItem.id)}>
							ARMAR
						</button>
						<button
							class="action-btn action-btn--danger"
							onclick={() => handleDelete(selectedItem.id)}
						>
							ELIMINAR
						</button>
					{:else if selectedItem.status === 'armed'}
						<button
							class="action-btn action-btn--publish"
							onclick={() => publishPayload(selectedItem.id)}
						>
							PUBLICAR
						</button>
						<button class="action-btn" onclick={() => disarmPayload(selectedItem.id)}>
							DESARMAR
						</button>
					{:else if selectedItem.status === 'published'}
						<button
							class="action-btn action-btn--danger"
							onclick={() => clearPayload(selectedItem.id)}
						>
							LIMPIAR DE PANTALLA
						</button>
					{:else}
						<p class="queue-route__empty">Este elemento ya expiró.</p>
					{/if}
				</div>
			</article>
		{/if}
	</div>
</section>

<!-- ─── Add-to-queue modal ─────────────────────────────────────────────────── -->
{#if showAddModal}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) showAddModal = false;
		}}
		transition:fade={{ duration: 120 }}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="add-modal-title"
			in:fly={{ y: 12, duration: 200 }}
		>
			<h2 class="label-caps" id="add-modal-title">AÑADIR A LA COLA</h2>

			<!-- Type selector -->
			<div class="modal__field">
				<span class="modal__label" id="kind-group-label">TIPO DE CONTENIDO</span>
				<div class="kind-group" role="radiogroup" aria-labelledby="kind-group-label">
					{#each KIND_OPTIONS as kind (kind.value)}
						<button
							type="button"
							class="kind-btn"
							class:is-active={formKind === kind.value}
							role="radio"
							aria-checked={formKind === kind.value}
							onclick={() => (formKind = kind.value)}
						>
							{kind.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Type-specific fields -->
			{#if formKind === 'character_intro'}
				<div class="modal__field">
					<label class="modal__label" for="char-select">PERSONAJE</label>
					<select id="char-select" class="modal__input" bind:value={formCharacterId}>
						<option value="" disabled>Selecciona…</option>
						{#each $characters as char (char.id)}
							<option value={char.id}>{char.name}</option>
						{/each}
					</select>
				</div>
				<div class="modal__field">
					<label class="modal__label" for="tagline">FRASE (OPCIONAL)</label>
					<input
						id="tagline"
						class="modal__input"
						type="text"
						maxlength="80"
						bind:value={formTagline}
					/>
				</div>
			{:else if formKind === 'info_block'}
				<div class="modal__field">
					<label class="modal__label" for="heading">TÍTULO</label>
					<input
						id="heading"
						class="modal__input"
						type="text"
						maxlength="60"
						bind:value={formHeading}
					/>
				</div>
				<div class="modal__field">
					<label class="modal__label" for="body">CONTENIDO</label>
					<textarea id="body" class="modal__input" rows="3" maxlength="240" bind:value={formBody}
					></textarea>
				</div>
			{:else}
				<div class="modal__field">
					<label class="modal__label" for="location">UBICACIÓN</label>
					<input
						id="location"
						class="modal__input"
						type="text"
						maxlength="60"
						bind:value={formLocationName}
					/>
				</div>
				<div class="modal__field">
					<label class="modal__label" for="description">DESCRIPCIÓN (OPCIONAL)</label>
					<textarea
						id="description"
						class="modal__input"
						rows="2"
						maxlength="160"
						bind:value={formDescription}
					></textarea>
				</div>
			{/if}

			{#if formError}
				<p class="modal__error" role="alert">{formError}</p>
			{/if}

			<div class="modal__actions">
				<button class="action-btn" onclick={() => (showAddModal = false)}>CANCELAR</button>
				<button class="action-btn action-btn--publish" onclick={handleAdd}>
					AÑADIR BORRADOR
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.queue-route {
		display: grid;
		grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.2fr);
		gap: var(--space-4);
		padding: var(--space-4);
		min-height: calc(100dvh - 64px);
		background: var(--black);
	}

	@media (max-width: 768px) {
		.queue-route {
			grid-template-columns: 1fr;
		}
	}

	.queue-route__list-panel,
	.queue-route__preview-panel {
		background: var(--black-card);
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-height: 0;
	}

	.queue-route__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.queue-route__add-btn {
		height: 32px;
		padding: 0 var(--space-3);
		background: transparent;
		border: 1px solid var(--cyan);
		border-radius: var(--radius-sm);
		color: var(--cyan);
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition:
			background var(--t-fast),
			color var(--t-fast);
	}

	.queue-route__add-btn:hover {
		background: var(--cyan);
		color: var(--black);
	}

	.queue-route__empty {
		font-family: var(--font-ui);
		font-size: 13px;
		color: var(--grey);
	}

	.queue-route__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		overflow-y: auto;
		flex: 1;
	}

	.queue-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		text-align: left;
		transition: border-color var(--t-fast);
	}

	.queue-card:hover {
		border-color: var(--grey);
	}

	.queue-card.is-selected {
		border-color: var(--cyan);
	}

	.queue-card__kind {
		font-family: var(--font-display);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--cyan);
		flex-shrink: 0;
	}

	.queue-card__title {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 700;
		color: var(--white);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-badge {
		font-family: var(--font-display);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		border-radius: var(--radius-sm);
		padding: 2px var(--space-2);
		flex-shrink: 0;
	}

	.status-badge[data-status='draft'] {
		color: var(--grey);
		border: 1px solid var(--grey-dim);
	}

	.status-badge[data-status='armed'] {
		color: var(--amber, #c8944a);
		border: 1px solid var(--amber, #c8944a);
	}

	.status-badge[data-status='published'] {
		color: var(--cyan);
		border: 1px solid var(--cyan);
	}

	.status-badge[data-status='expired'] {
		color: var(--grey-dim);
		border: 1px solid var(--grey-dim);
	}

	.queue-route__history ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.history-row {
		display: flex;
		gap: var(--space-2);
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--grey);
	}

	.history-row__time {
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}

	.history-row__kind {
		color: var(--cyan);
		font-size: 10px;
		align-self: center;
		flex-shrink: 0;
	}

	.history-row__title {
		color: var(--white);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.preview__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.preview__title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 700;
		color: var(--white);
		margin: 0;
	}

	.preview__body {
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--grey);
		margin: 0;
		white-space: pre-wrap;
	}

	.preview__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-3);
		margin: 0;
		font-size: 11px;
	}

	.preview__meta dt {
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--grey-dim);
	}

	.preview__meta dd {
		margin: 0;
		font-family: var(--font-ui);
		color: var(--grey);
		font-variant-numeric: tabular-nums;
	}

	.preview__actions {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.action-btn {
		height: 40px;
		padding: 0 var(--space-4);
		background: transparent;
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-sm);
		color: var(--grey);
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition:
			background var(--t-fast),
			color var(--t-fast),
			border-color var(--t-fast);
	}

	.action-btn:hover {
		border-color: var(--grey);
		color: var(--white);
	}

	.action-btn--arm {
		border-color: var(--amber, #c8944a);
		color: var(--amber, #c8944a);
	}

	.action-btn--arm:hover {
		background: var(--amber, #c8944a);
		color: var(--black);
	}

	.action-btn--publish {
		border-color: var(--cyan);
		color: var(--cyan);
	}

	.action-btn--publish:hover {
		background: var(--cyan);
		color: var(--black);
	}

	.action-btn--danger {
		border-color: var(--red, #b14040);
		color: var(--red, #b14040);
	}

	.action-btn--danger:hover {
		background: var(--red, #b14040);
		color: var(--black);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: grid;
		place-items: center;
		z-index: 100;
	}

	.modal {
		width: min(440px, calc(100vw - var(--space-4) * 2));
		background: var(--black-card);
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.modal__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.modal__label {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--grey);
	}

	.modal__input {
		background: var(--black);
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-sm);
		color: var(--white);
		font-family: var(--font-ui);
		font-size: 14px;
		padding: var(--space-2) var(--space-3);
	}

	.modal__input:focus-visible {
		outline: 2px solid var(--cyan);
		outline-offset: 1px;
	}

	.modal__error {
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--red, #b14040);
		margin: 0;
	}

	.modal__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	.kind-group {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.kind-btn {
		height: 32px;
		padding: 0 var(--space-3);
		background: transparent;
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-sm);
		color: var(--grey);
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition:
			border-color var(--t-fast),
			color var(--t-fast);
	}

	.kind-btn.is-active {
		border-color: var(--cyan);
		color: var(--cyan);
	}
</style>
