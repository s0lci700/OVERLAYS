<!--
  SessionImport
  =============
  File picker for session.json packages exported by the Prep App
  (dados-risas-prep). Wires the parsed package into the stage store via
  importSessionPackage() and shows the loaded session summary.

  Props:
    preview {SessionPackage|null} — Storybook-only: renders this package
      instead of reading the stage store.
-->
<script lang="ts">
	import './SessionImport.css';
	import { importSessionPackage, getSessionPackage } from '$lib/derived/stage.svelte';
	import type { SessionPackage } from '$lib/contracts';

	let { preview = null }: { preview?: SessionPackage | null } = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let errorMessage = $state('');
	let importedAt = $state<string | null>(null);

	const pkg = $derived(preview ?? getSessionPackage());

	async function handleFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = ''; // allow re-selecting the same file after a failed import
		if (!file) return;
		errorMessage = '';
		let parsed: unknown;
		try {
			parsed = JSON.parse(await file.text());
		} catch {
			errorMessage = `"${file.name}" no es JSON válido.`;
			return;
		}
		const result = importSessionPackage(parsed);
		if (result.ok === false) {
			errorMessage = result.error;
			return;
		}
		importedAt = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="session-import">
	{#if pkg}
		<div class="session-import__loaded">
			<span class="session-import__label">
				SESIÓN CARGADA{importedAt ? ` · ${importedAt}` : ''}
			</span>
			<span class="session-import__title">
				{pkg.session.session_number ? `#${pkg.session.session_number} · ` : ''}{pkg.session.title}
			</span>
			<span class="session-import__counts">
				{pkg.locations.length} locaciones · {pkg.npcs.length} PNJs · {pkg.enemies.length} enemigos ·
				{pkg.storyBeats.length} momentos
			</span>
		</div>
	{/if}

	<button type="button" class="session-import__btn" onclick={() => fileInput?.click()}>
		{pkg ? 'REEMPLAZAR SESIÓN' : 'IMPORTAR SESIÓN'}
	</button>

	{#if errorMessage}
		<p class="session-import__error" role="alert">{errorMessage}</p>
	{/if}

	<input
		bind:this={fileInput}
		class="session-import__input"
		type="file"
		accept=".json,application/json"
		onchange={handleFile}
	/>
</div>
