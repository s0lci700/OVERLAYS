<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let { 
    message = "", 
    id = "", 
    position = "top-right" 
  } = $props();

  let visible = $state(false);
  let dismissed = $state(false);

  onMount(() => {
    // Check if this specific beacon was dismissed in the past
    if (id) {
      try {
        dismissed = localStorage.getItem(`beacon_${id}`) === 'true';
      } catch (e) {
        console.warn('LocalStorage blocked, help beacon will reset on reload');
      }
    }
  });

  function dismiss() {
    dismissed = true;
    if (id) {
      try {
        localStorage.setItem(`beacon_${id}`, 'true');
      } catch (e) {
        // Silently fail if storage is full or blocked
      }
    }
  }
</script>

{#if !dismissed}
  <div class="beacon-root {position}" onmouseenter={() => visible = true} onmouseleave={() => visible = false}>
    <button class="beacon-dot" aria-label="Ver ayuda" onclick={dismiss}>
      <span class="beacon-pulse"></span>
    </button>

    {#if visible}
      <div class="beacon-tooltip" transition:fade={{ duration: 150 }}>
        <p class="beacon-text">{message}</p>
        <span class="beacon-hint">Haz clic para ocultar</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .beacon-root {
    position: absolute;
    z-index: 100;
    pointer-events: auto;
  }

  .beacon-root.top-right { top: -4px; right: -4px; }
  .beacon-root.top-left { top: -4px; left: -4px; }

  .beacon-dot {
    width: 12px;
    height: 12px;
    background: var(--cast-amber);
    border-radius: 50%;
    border: 2px solid var(--black);
    cursor: help;
    padding: 0;
    position: relative;
  }

  .beacon-pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid var(--cast-amber);
    animation: pulse 2s infinite;
    pointer-events: none;
  }

  .beacon-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    width: 200px;
    background: var(--popover);
    border: 1px solid var(--cast-amber-border);
    padding: var(--space-3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .beacon-text {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--white);
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  .beacon-hint {
    font-size: 9px;
    color: var(--cast-amber);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @keyframes pulse {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
</style>
