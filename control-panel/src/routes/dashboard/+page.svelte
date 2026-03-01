<!--
  Dashboard route
  ===============
  Live, read-only dashboard for monitor/TV viewing.
-->
<script>
  import "$lib/Dashboard.css";
  import DashboardCard from "$lib/DashboardCard.svelte";
  import { characters } from "$lib/socket.js";
  import { actionHistory, rollHistory } from "$lib/dashboardStore.js";

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
    <h1 class="dashboard-title">Dashboard de personajes</h1>
    <p class="dashboard-subtitle">
      Vista en vivo para mesa o pantalla principal. Campos vacios muestran "no
      definida".
    </p>
  </header>

  {#if $characters.length === 0}
    <div class="dashboard-empty">
      <p class="dashboard-empty-title">Sin personajes activos</p>
      <p class="dashboard-empty-subtitle">
        Crea personajes desde el panel de control o espera la sincronizacion.
      </p>
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
        <h2 class="dashboard-log-title">Últimas acciones</h2>
      </div>
      <ul class="dashboard-log-list">
        {#each $actionHistory as entry (entry.timestamp)}
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
        <h2 class="dashboard-log-title">Últimos dados</h2>
      </div>
      <ul class="dashboard-log-list">
        {#each $rollHistory as entry (entry.timestamp)}
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
