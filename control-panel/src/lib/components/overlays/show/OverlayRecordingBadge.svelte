<!--
  OverlayRecordingBadge — GRABANDO indicator.
  Route: /show/recording-badge?server=...
  Socket events: sync_start (show badge), recording_stop (hide badge).
  Also triggered by POST /api/sync-start on the server.
-->
<script>
  import { tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  let socket = $state();
  let visible = $state(false);
  let badgeEl = $state();

  $effect(() => {
    const { socket: s } = createOverlaySocket(serverUrl);
    socket = s;
  });

  $effect(() => {
    if (!socket) return;

    const handleSyncStart = async () => {
      visible = true;
      await tick();
      if (badgeEl) fadeInFromBottom(badgeEl, 300);
    };

    const handleRecordingStop = () => {
      fadeOutToTop(badgeEl, 300, () => { visible = false; });
    };

    socket.on('sync_start', handleSyncStart);
    socket.on('recording_stop', handleRecordingStop);

    return () => {
      socket.off('sync_start', handleSyncStart);
      socket.off('recording_stop', handleRecordingStop);
    };
  });
</script>

{#if visible}
  <div class="badge-pos">
    <div class="recording-badge" bind:this={badgeEl}>
      <span class="dot"></span>
      <span class="label">GRABANDO</span>
    </div>
  </div>
{/if}

<style>
  .badge-pos {
    position: absolute;
    top: 40px;
    left: 60px;
  }

  .recording-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(8,8,12,0.85);
    border: 1px solid rgba(255,77,106,0.4);
    border-radius: 4px;
    padding: 6px 12px;
    opacity: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red, #ff4d6a);
    animation: blink 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }

  .label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--red, #ff4d6a);
    text-transform: uppercase;
  }
</style>
