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
  let liveVisible = $state(false);
  let liveCharacterName = $state('');
  let livePlayerName = $state('');

  const visible = $derived(preview ? true : liveVisible);
  const characterName = $derived(preview ? (preview.characterName ?? '') : liveCharacterName);
  const playerName = $derived(preview ? (preview.playerName ?? '') : livePlayerName);

  let barEl = $state();
  let hideTimer = null;

  $effect(() => {
    const init = preview ? { socket: { on() {}, off() {} } } : createOverlaySocket(serverUrl);
    socket = init.socket;
  });

  onMount(() => {
    if (preview) {
      setTimeout(() => {
        // we don't need to set visible here because it's derived
      }, 100);
    }
  });

  $effect(() => {
    if (!socket) return;

    const handleLowerThird = async ({
      characterName: cn,
      playerName: pn,
      duration = 5000,
    }) => {
      if (hideTimer) clearTimeout(hideTimer);
      liveCharacterName = cn;
      livePlayerName = pn;
      liveVisible = true;
      await tick();
      if (barEl) fadeInFromBottom(barEl, 350);
      if (duration > 0) {
        hideTimer = setTimeout(() => {
          fadeOutToTop(barEl, 300, () => {
            liveVisible = false;
          });
        }, duration);
      }
    };

    socket.on("lower_third", handleLowerThird);

    return () => {
      socket.off("lower_third", handleLowerThird);
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
