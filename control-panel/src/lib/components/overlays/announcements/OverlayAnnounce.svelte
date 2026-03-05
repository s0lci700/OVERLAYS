<!--
  OverlayAnnounce — Generic announcement modal.
  Route: /announcements?server=...
  Socket events: announce { type, title, body?, image?, duration? }
  Types: location, knowledge (typewriter), npc, custom, sponsor
-->
<script>
  import { onDestroy, tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { slideInFromLeft, slideOutToLeft, typewriterReveal } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000', preview = null } = $props();

  let socket = $state();
  let visible = $state(preview != null);
  let type = $state(preview?.type ?? 'custom');
  let title = $state(preview?.title ?? '');
  let body = $state(preview?.body ?? '');
  let image = $state(preview?.image ?? null);

  let cardEl = $state();
  let bodyEl = $state();
  let hideTimer = null;

  const TYPE_CONFIG = {
    location:  { defaultDuration: 5000 },
    knowledge: { defaultDuration: 8000 },
    npc:       { defaultDuration: 5000 },
    custom:    { defaultDuration: 4000 },
    sponsor:   { defaultDuration: 3000 },
  };

  $effect(() => {
    // Re-initialize socket when serverUrl or preview changes
    socket = preview ? { on() {} } : createOverlaySocket(serverUrl);
  });

  $effect(() => {
    if (!socket) return;

    const handleAnnounce = async (data) => {
      if (hideTimer) clearTimeout(hideTimer);

      type  = data.type ?? 'custom';
      title = data.title ?? '';
      body  = data.body ?? '';
      image = data.image ?? null;

      const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.custom;
      const duration = data.duration ?? cfg.defaultDuration;

      visible = true;
      await tick();

      if (cardEl) slideInFromLeft(cardEl);

      if (type === 'knowledge' && bodyEl && body) {
        await typewriterReveal(bodyEl, body);
      }

      if (duration > 0) {
        hideTimer = setTimeout(dismiss, duration);
      }
    };

    socket.on('announce', handleAnnounce);

    return () => {
      socket.off('announce', handleAnnounce);
    };
  });

  async function dismiss() {
    if (!cardEl) { visible = false; return; }
    slideOutToLeft(cardEl, 400, () => { visible = false; });
  }

  onDestroy(() => { if (hideTimer) clearTimeout(hideTimer); });
</script>

{#if visible}
  <div class="announce-canvas">
    <div class="announce-card is-{type}" bind:this={cardEl}>
      {#if image}
        <div class="announce-image">
          <img src={serverUrl + image} alt={title} />
        </div>
      {/if}
      <div class="announce-content">
        <div class="announce-type-label">
          {type === 'location' ? '— Locación —' : type === 'npc' ? '— Personaje —' : type === 'knowledge' ? '— Conocimiento desbloqueado —' : ''}
        </div>
        <div class="announce-title">{title}</div>
        {#if body}
          <div class="announce-body" bind:this={bodyEl}>{type === 'knowledge' ? '' : body}</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .announce-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .announce-card {
    background: rgba(8, 8, 12, 0.92);
    border: 1px solid rgba(255,255,255,0.12);
    border-left: 4px solid var(--red, #ff4d6a);
    border-radius: 6px;
    padding: 40px 56px;
    min-width: 480px;
    max-width: 860px;
    opacity: 0;
  }

  .announce-card.is-knowledge { border-left-color: #1e9e8e; }
  .announce-card.is-npc       { border-left-color: var(--purple, #500df5); }
  .announce-card.is-sponsor   { border-left-color: #c9a227; }

  .announce-type-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 10px;
  }

  .announce-title {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 72px;
    color: var(--white, #ffffff);
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .announce-body {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 16px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    margin-top: 16px;
    max-width: 640px;
  }

  .announce-image img {
    max-height: 120px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
</style>
