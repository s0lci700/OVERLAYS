<!--
  Overview route
  ==============
  Live, read-only overview for monitor/TV viewing.
-->
<script>
  import "$lib/components/cast/dashboard/Dashboard.css";
  import DashboardCard from "$lib/components/stage/DashboardCard.svelte";
  import MysticalEmptyState from "$lib/components/cast/shared/MysticalEmptyState.svelte";
  import { characters } from "$lib/services/socket.svelte";
  import { history } from "$lib/derived/overviewStore.js";
  // import { listCharacterRecords } from "$lib/services/pocketbase";
  // let characters = $derived(listCharacterRecords());
  const MAX_ACTION_LOG = 10;
  const MAX_ROLL_LOG = 10;

  let actionHistory = $derived(
    $history
      .filter((entry) => entry.type !== "roll")
      .slice(-MAX_ACTION_LOG)
      .reverse(),
  );

  let rollHistory = $derived(
    $history
      .filter((entry) => entry.type === "roll")
      .slice(-MAX_ROLL_LOG)
      .reverse(),
  );

  function formatTime(timestamp) {
    try {
      return new Date(timestamp).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }
</script>

<section class="dashboard-shell">
  <header class="dashboard-header">
    <h1 class="dashboard-title">ESTADO GLOBAL DEL GRUPO</h1>
    <p class="dashboard-subtitle">
      Monitoreo en vivo de personajes y actividad reciente. Los campos sin valor se muestran como "no definidos".
    </p>
  </header>

  {#if $characters.length === 0}
    <div class="dashboard-empty-container">
      <MysticalEmptyState 
        title="EL TABLERO ESTÁ VACÍO" 
        message="Inicia la sesión desde el panel de control o espera la sincronización de las almas."
        icon="history_edu"
      />
    </div>
  {:else}
    <div class="dashboard-grid">
      {#each $characters as character (character.id)}
        <DashboardCard {character} />
      {/each}
    </div>
  {/if}

  <section class="dashboard-meta">
    <div class="dashboard-log" aria-live="polite">
      <div class="dashboard-log-head">
        <h2 class="dashboard-log-title">HISTORIAL DE ACCIONES</h2>
      </div>
      <ul class="dashboard-log-list">
        {#each actionHistory as entry (entry.timestamp)}
          <li class="dashboard-log-item">
            <span class="dashboard-log-time">
              {formatTime(entry.timestamp)}
            </span>
            <div class="dashboard-log-body">
              <span class="dashboard-log-label">{entry.label}</span>
              <span class="dashboard-log-value">{entry.value}</span>
              {#if entry.detail}
                <span class="dashboard-log-detail">{entry.detail}</span>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <div class="dashboard-log" aria-live="polite">
      <div class="dashboard-log-head">
        <h2 class="dashboard-log-title">ÚLTIMAS TIRADAS</h2>
      </div>
      <ul class="dashboard-log-list">
        {#each rollHistory as entry (entry.timestamp)}
          <li class="dashboard-log-item">
            <span class="dashboard-log-time">
              {formatTime(entry.timestamp)}
            </span>
            <div class="dashboard-log-body">
              <span class="dashboard-log-label">{entry.label}</span>
              <span class="dashboard-log-value">{entry.value}</span>
              {#if entry.detail}
                <span class="dashboard-log-detail">{entry.detail}</span>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </section>
</section>
