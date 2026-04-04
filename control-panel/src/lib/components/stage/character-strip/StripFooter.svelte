<!--
  StripFooter
  ===========
  Sync button migrated from the old +layout.svelte.
  Sends SYNC_START to the server to mark recording start.
-->
<script lang="ts">
  import { SERVER_URL } from '$lib/services/socket.svelte.js';
  import { onMount } from 'svelte';
  import HelpBeacon from '../shared/HelpBeacon.svelte';

  let synced = $state(false);
  let syncing = $state(false);

  async function handleSync() {
    syncing = true;
    try {
      await fetch(`${SERVER_URL}/api/sync-start`, { method: 'POST' });
      synced = true;
      setTimeout(() => {
        synced = false;
      }, 3000);
    } finally {
      syncing = false;
    }
  }

  onMount(() => {
    handleSync();
  });
</script>

<footer class="strip-footer">
  <div class="sync-wrapper">
    {#if !synced}
      <HelpBeacon 
        id="sync_onboard" 
        message="Haz clic aquí al comenzar tu stream para sincronizar los gráficos de la audiencia."
        position="top-right"
      />
    {/if}
    <button
      class="sync-btn"
      class:is-synced={synced}
      class:is-syncing={syncing}
      onclick={handleSync}
      disabled={syncing}
      aria-live="polite"
      aria-label={synced ? 'Sincronización completada' : 'Sincronizar inicio de la sesión'}
      title="Marca el inicio de la grabación para sincronizar overlays (SYNC_START)"
    >
      <span class="sync-icon" aria-hidden="true">{synced ? '✓' : '🎬'}</span>
      <span class="sync-label">{synced ? 'SESIÓN INICIADA' : syncing ? 'SINCRONIZANDO...' : 'INICIAR SESIÓN'}</span>
    </button>
  </div>
</footer>

<style>
  .strip-footer {
    padding: var(--space-3);
    border-top: 1px solid var(--grey-dim);
    background: var(--black-elevated);
    flex-shrink: 0;
  }

  .sync-wrapper {
    position: relative;
    width: 100%;
  }

  .sync-btn {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background: rgba(0, 212, 232, 0.05);
    border: 1px solid var(--grey-dim);
    color: var(--grey);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all var(--t-fast);
    clip-path: var(--hex-clip-md);
  }

  .sync-btn:hover:not(:disabled) {
    border-color: var(--cyan);
    color: var(--cyan);
    background: rgba(0, 212, 232, 0.1);
  }

  .sync-btn.is-synced {
    border-color: var(--cyan);
    color: var(--black);
    background: var(--cyan);
  }

  .sync-btn.is-syncing {
    opacity: 0.6;
    cursor: wait;
  }

  .sync-btn:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }

  .sync-icon {
    font-size: 14px;
  }
</style>
