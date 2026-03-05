<!--
  OverlayLowerThird — Character nameplate lower third.
  Route: /show/lower-third?server=...
  Socket events: lower_third { characterName, playerName, duration? }
-->
<script>
  import { onMount, tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000', preview = null } = $props();

  let socket = $state();
  let visible = $state(preview != null);
  let characterName = $state(preview?.characterName ?? '');
  let playerName = $state(preview?.playerName ?? '');
  let barEl = $state();
  let hideTimer = null;

  $effect(() => {
    socket = preview ? { on() {} } : createOverlaySocket(serverUrl);
  });

  onMount(() => {
    if (preview) setTimeout(() => { visible = true; }, 100);
  });

  $effect(() => {
    if (!socket) return;

    const handleLowerThird = async ({ characterName: cn, playerName: pn, duration = 5000 }) => {
      if (hideTimer) clearTimeout(hideTimer);
      characterName = cn;
      playerName = pn;
      visible = true;
      await tick();
      if (barEl) fadeInFromBottom(barEl, 350);
      if (duration > 0) {
        hideTimer = setTimeout(() => {
          fadeOutToTop(barEl, 300, () => { visible = false; });
        }, duration);
      }
    };

    socket.on('lower_third', handleLowerThird);

    return () => {
      socket.off('lower_third', handleLowerThird);
    };
  });
</script>

{#if visible}
  <div class="lower-third-pos">
    <div class="lower-third-bar" bind:this={barEl}>
      <div class="lt-char">{characterName}</div>
      {#if playerName}<div class="lt-player">{playerName}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .lower-third-pos {
    position: absolute;
    bottom: 80px;
    left: 80px;
  }

  .lower-third-bar {
    background: rgba(8,8,12,0.9);
    border-left: 4px solid var(--red, #ff4d6a);
    padding: 10px 20px 10px 16px;
    opacity: 0;
  }

  .lt-char {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 32px;
    color: var(--white, #ffffff);
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .lt-player {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 4px;
  }
</style>
