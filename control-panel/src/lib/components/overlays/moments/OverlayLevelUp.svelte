<!--
  OverlayLevelUp — Level-up achievement moment.
  Route: /moments/level-up?server=...
  Socket events: level_up { charId, newLevel, className }
-->
<script>
  import { onMount, tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop, screenFlash } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000', preview = null } = $props();

  let socket = $state();
  let getChar = $state();
  let visible = $state(false);

  // Use $state for live values, but initialize with $derived for preview mode
  let liveCharName = $state('');
  let liveNewLevel = $state(1);
  let liveClassName = $state('');

  const charName = $derived(preview ? (preview.charName ?? '') : liveCharName);
  const newLevel = $derived(preview ? (preview.newLevel ?? 1) : liveNewLevel);
  const className = $derived(preview ? (preview.className ?? '') : liveClassName);

  let cardEl = $state();
  let flashEl;

  $effect(() => {
    const init = preview ? { socket: { on() {}, off() {} }, getChar: () => null } : createOverlaySocket(serverUrl);
    socket = init.socket;
    getChar = init.getChar;
  });

  onMount(() => {
    if (preview) setTimeout(() => { visible = true; }, 100);
  });

  $effect(() => {
    if (!socket) return;

    const handleLevelUp = async ({ charId, newLevel: lvl, className: cls }) => {
      const char = getChar(charId);
      liveCharName = char?.name ?? 'Personaje';
      liveNewLevel = lvl;
      liveClassName = cls;

      if (flashEl) screenFlash(flashEl, 'rgba(201,162,39,0.4)', 600);

      visible = true;
      await tick();
      if (cardEl) fadeInFromBottom(cardEl, 600);

      setTimeout(() => {
        fadeOutToTop(cardEl, 400, () => { visible = false; });
      }, 6000);
    };

    socket.on('level_up', handleLevelUp);

    return () => {
      socket.off('level_up', handleLevelUp);
    };
  });
</script>

<div class="flash-overlay" bind:this={flashEl}></div>

{#if visible}
  <div class="levelup-canvas">
    <div class="levelup-card" bind:this={cardEl}>
      <div class="levelup-label">— Subida de Nivel —</div>
      <div class="levelup-level">NIVEL {newLevel}</div>
      <div class="levelup-name">{charName}</div>
      {#if className}<div class="levelup-class">{className}</div>{/if}
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

  .levelup-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .levelup-card {
    background: rgba(8,8,12,0.93);
    border: 1px solid rgba(201,162,39,0.35);
    border-top: 4px solid #c9a227;
    border-radius: 6px;
    padding: 48px 72px;
    text-align: center;
    opacity: 0;
  }

  .levelup-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(201,162,39,0.7);
    margin-bottom: 8px;
  }

  .levelup-level {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 120px;
    color: #c9a227;
    line-height: 1;
    letter-spacing: 0.06em;
  }

  .levelup-name {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 52px;
    color: var(--white, #ffffff);
    letter-spacing: 0.05em;
  }

  .levelup-class {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 8px;
  }
</style>
