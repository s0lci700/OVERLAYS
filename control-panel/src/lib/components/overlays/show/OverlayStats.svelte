<!--
  OverlayStats — Session statistics counter.
  Route: /show/stats?server=...
  Listens passively: dice_rolled (counts crits/pifias), player_down (counts downs).
  Toggle visibility via toggle_stats socket event { visible: boolean }.
-->
<script>
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket } = createOverlaySocket(serverUrl);

  let visible = $state(false);
  let crits = $state(0);
  let pifias = $state(0);
  let downs = $state(0);

  socket.on('dice_rolled', ({ result, sides }) => {
    if (result === sides) crits++;
    if (result === 1) pifias++;
  });

  socket.on('player_down', () => { downs++; });

  socket.on('toggle_stats', ({ visible: v }) => { visible = v; });
</script>

{#if visible}
  <div class="stats-panel">
    <div class="stat-row"><span class="stat-label">Crits</span><span class="stat-val is-crit">{crits}</span></div>
    <div class="stat-row"><span class="stat-label">Pifias</span><span class="stat-val is-fail">{pifias}</span></div>
    <div class="stat-row"><span class="stat-label">Caídos</span><span class="stat-val">{downs}</span></div>
  </div>
{/if}

<style>
  .stats-panel {
    position: absolute;
    bottom: 80px;
    right: 60px;
    background: rgba(8,8,12,0.88);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
  }

  .stat-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.4);
  }

  .stat-val {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 32px;
    color: var(--white, #ffffff);
    line-height: 1;
  }

  .stat-val.is-crit  { color: #c9a227; }
  .stat-val.is-fail  { color: var(--red, #ff4d6a); }
</style>
