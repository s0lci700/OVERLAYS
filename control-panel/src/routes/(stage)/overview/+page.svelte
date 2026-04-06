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

  let totalHpCur = $derived($characters.reduce((sum, c) => sum + (c.hp_current || 0), 0));
  let totalHpMax = $derived($characters.reduce((sum, c) => sum + (c.hp_max || 0), 0));
  let totalActiveConditions = $derived($characters.reduce((sum, c) => sum + (c.conditions?.length || 0), 0));
</script>

<section class="dashboard-shell">
  <header class="dashboard-header">
    <div class="dash-header-left">
      <h1 class="dashboard-title">ESTADO GLOBAL DEL GRUPO</h1>
      <p class="dashboard-subtitle">Control de producción en vivo · TableRelay Flagship</p>
    </div>
    
    {#if $characters.length > 0}
      <div class="dashboard-status-hero">
        <div class="status-group-main">
          <div class="status-stat primary">
            <span class="status-label">SALUD TOTAL DEL GRUPO</span>
            <span class="status-value accent">{totalHpCur} / {totalHpMax}</span>
          </div>
        </div>
        
        <div class="status-group-secondary">
          <div class="status-stat">
            <span class="status-label">CONDICIONES</span>
            <span class="status-value">{totalActiveConditions}</span>
          </div>
          <div class="status-stat">
            <span class="status-label">PERSONAJES</span>
            <span class="status-value">{$characters.length}</span>
          </div>
        </div>
      </div>
    {/if}
  </header>

  <main class="dashboard-main">
    {#if $characters.length === 0}
      <div class="dashboard-empty-container">
        <MysticalEmptyState 
          title="EL TABLERO ESTÁ VACÍO" 
          message="Esperando conexión con los jugadores o el inicio de la sesión."
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
  </main>

  <aside class="dashboard-side" aria-label="Historial y actividad en vivo">
    <div class="dashboard-log" aria-live="polite">
      <h2 class="dashboard-log-title">Historial de Acciones</h2>
      <ul class="dashboard-log-list">
        {#each actionHistory as entry (entry.timestamp)}
          <li class="dashboard-log-item">
            <span class="dashboard-log-time">{formatTime(entry.timestamp)}</span>
            <div class="dashboard-log-body">
              <span class="dashboard-log-label">{entry.label}</span>
              <span class="dashboard-log-value">{entry.value}</span>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <div class="dashboard-log" aria-live="polite">
      <h2 class="dashboard-log-title">Últimas Tiradas</h2>
      <ul class="dashboard-log-list">
        {#each rollHistory as entry (entry.timestamp)}
          <li class="dashboard-log-item">
            <span class="dashboard-log-time">{formatTime(entry.timestamp)}</span>
            <div class="dashboard-log-body">
              <span class="dashboard-log-label">{entry.label}</span>
              <span class="dashboard-log-value">{entry.value}</span>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </aside>
</section>
