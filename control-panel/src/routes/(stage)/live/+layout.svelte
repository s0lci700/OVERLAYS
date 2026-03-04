<!--
  Stage › Live layout: bottom nav for in-session operator tabs + SYNC_START button.
-->
<script>
  import { page } from "$app/stores";
  import { SERVER_URL } from "$lib/stores/socket.js";

  let { children } = $props();

  let synced = $state(false);
  let syncing = $state(false);

  async function handleSync() {
    syncing = true;
    try {
      await fetch(`${SERVER_URL}/api/sync-start`, { method: "POST" });
      synced = true;
      setTimeout(() => { synced = false; }, 3000);
    } finally {
      syncing = false;
    }
  }
</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={$page.url.pathname.includes("/characters")}
    href="/live/characters"
  >
    <span class="nav-icon">⚔</span>
    <span class="nav-label">PERSONAJES</span>
  </a>
  <a
    class="nav-tab"
    class:active={$page.url.pathname.includes("/dice")}
    href="/live/dice"
  >
    <span class="nav-icon">⬡</span>
    <span class="nav-label">DADOS</span>
  </a>
  <button
    class="sync-btn"
    class:is-synced={synced}
    onclick={handleSync}
    disabled={syncing}
    title="Marcar inicio de grabación (SYNC_START)"
  >
    <span class="sync-icon">{synced ? "✓" : "🎬"}</span>
    <span class="sync-label">{synced ? "SYNCED" : "SYNC"}</span>
  </button>
</nav>
