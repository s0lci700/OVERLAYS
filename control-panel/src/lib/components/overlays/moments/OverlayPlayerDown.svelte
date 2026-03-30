<!--
  OverlayPlayerDown — Character down / KO moment.
  Route: /moments/player-down?server=...
  Socket events: player_down { charId, isDead }
-->
<script>
  import { onMount, tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop, screenFlash } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000', preview = null } = $props();

  let socket = $state();
  let getChar = $state();
  let liveVisible = $state(false);
  let liveCharName = $state('');
  let liveIsDead = $state(false);

  const visible = $derived(preview ? true : liveVisible);
  const charName = $derived(preview ? (preview.charName ?? '') : liveCharName);
  const isDead = $derived(preview ? (preview.isDead ?? false) : liveIsDead);

  let cardEl = $state();
  let flashEl;
  let hideTimer = null;

  $effect(() => {
    const init = preview ? { socket: { on() {}, off() {} }, getChar: () => null } : createOverlaySocket(serverUrl);
    socket = init.socket;
    getChar = init.getChar;
  });

  onMount(() => {
    if (preview) {
      // preview is true by derived
    }
  });

  $effect(() => {
    if (!socket) return;

    const handlePlayerDown = async ({ charId, isDead: dead }) => {
      if (hideTimer) clearTimeout(hideTimer);
      const char = getChar(charId);
      liveCharName = char?.name ?? 'Personaje';
      liveIsDead = dead;

      if (flashEl) screenFlash(flashEl, dead ? 'rgba(0,0,0,0.85)' : 'rgba(255,77,106,0.5)');

      liveVisible = true;
      await tick();
      if (cardEl) fadeInFromBottom(cardEl, 500);

      hideTimer = setTimeout(() => {
        fadeOutToTop(cardEl, 400, () => { liveVisible = false; });
      }, dead ? 8000 : 5000);
    };

    socket.on('player_down', handlePlayerDown);

    return () => {
      socket.off('player_down', handlePlayerDown);
    };
  });
</script>

<div class="flash-overlay" bind:this={flashEl}></div>

{#if visible}
  <div class="down-canvas">
    <div class="down-card" class:is-dead={isDead} bind:this={cardEl}>
      <div class="down-label">{isDead ? '☠ CAÍDO PARA SIEMPRE' : 'INCONSCIENTE'}</div>
      <div class="down-name">{charName}</div>
      {#if !isDead}
        <div class="down-sublabel">Tiradas de muerte activas</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .flash-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
  }

  .down-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .down-card {
    background: rgba(8,8,12,0.95);
    border: 1px solid rgba(255,77,106,0.4);
    border-top: 4px solid var(--red, #ff4d6a);
    border-radius: 6px;
    padding: 48px 72px;
    text-align: center;
    opacity: 0;
  }

  .down-card.is-dead { border-top-color: rgba(255,255,255,0.15); }

  .down-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--red, #ff4d6a);
    margin-bottom: 12px;
  }

  .is-dead .down-label { color: rgba(255,255,255,0.4); }

  .down-name {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 88px;
    color: var(--white, #ffffff);
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .down-sublabel {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    margin-top: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
</style>
