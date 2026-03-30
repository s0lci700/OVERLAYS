<!--
  Stage › Live layout: bottom nav for in-session operator tabs + SYNC_START button.
-->
<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { SERVER_URL } from "$lib/services/socket";
	import { onMount } from "svelte";

  let { children } = $props();

  let synced = $state(false);
  let syncing = $state(false);

  async function handleSync() {
    syncing = true;
    try {
      await fetch(`${SERVER_URL}/api/sync-start`, { method: "POST" });
      synced = true;
      setTimeout(() => {
        synced = false;
      }, 3000);
    } finally {
      syncing = false;
    }
  };

  onMount(() => {
    handleSync(); // Auto-sync on page load for seamless recording start, can be removed if manual sync is preferred
    synced = false;
  });

</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={page.url.pathname.includes("/characters")}
    href={resolve("/live/characters", {})}
    aria-current={page.url.pathname.includes("/characters") ? "page" : undefined}
  >
    <span class="nav-icon" aria-hidden="true">⚔</span>
    <span class="nav-label">PERSONAJES</span>
  </a>
  <a
    class="nav-tab"
    class:active={page.url.pathname.includes("/dice")}
    href={resolve("/live/dice", {})}
    aria-current={page.url.pathname.includes("/dice") ? "page" : undefined}
  >
    <span class="nav-icon" aria-hidden="true">⬡</span>
    <span class="nav-label">DADOS</span>
  </a>
  <button
    class="sync-btn"
    class:is-synced={synced}
    onclick={handleSync}
    disabled={syncing}
    aria-live="polite"
    aria-label={synced ? "Sincronización completada" : "Sincronizar inicio de grabación"}
    title="Marcar inicio de grabación (SYNC_START)"
  >
    <span class="sync-icon" aria-hidden="true">{synced ? "✓" : "🎬"}</span>
    <span class="sync-label" aria-hidden="true">{synced ? "SYNCED" : "SYNC"}</span>
  </button>
</nav>
