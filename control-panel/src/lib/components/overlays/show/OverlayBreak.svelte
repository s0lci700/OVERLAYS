<!--
  OverlayBreak — Break slate.
  Route: /show/break?server=...
  Socket events: break_start { countdown? }, break_end.
  POST /api/break/start and /api/break/stop trigger these events.
-->
<script>
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket } = createOverlaySocket(serverUrl);

  let visible = $state(false);
  let countdown = $state(0);
  let countdownTimer = null;

  socket.on('break_start', async ({ countdown: secs } = {}) => {
    visible = true;
    if (secs > 0) {
      countdown = secs;
      countdownTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) { clearInterval(countdownTimer); countdown = 0; }
      }, 1000);
    }
  });

  socket.on('break_end', () => {
    clearInterval(countdownTimer);
    visible = false;
  });
</script>

{#if visible}
  <div class="break-canvas">
    <div class="break-content">
      <div class="break-label">— Pausa —</div>
      <div class="break-title">VOLVEMOS EN UN MOMENTO</div>
      {#if countdown > 0}
        <div class="break-countdown">{countdown}s</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .break-canvas {
    position: absolute;
    inset: 0;
    background: rgba(4, 4, 8, 0.97);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .break-content { text-align: center; }

  .break-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: rgba(255,255,255,0.3);
    margin-bottom: 16px;
  }

  .break-title {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 96px;
    color: var(--white, #ffffff);
    line-height: 1;
    letter-spacing: 0.06em;
  }

  .break-countdown {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 32px;
    color: rgba(255,255,255,0.4);
    margin-top: 24px;
    letter-spacing: 0.1em;
  }
</style>
