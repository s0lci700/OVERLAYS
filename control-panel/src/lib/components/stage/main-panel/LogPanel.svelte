<!--
  LogPanel
  ========
  Activity history log — shows HP changes, rolls, conditions, and rests.
  Data comes from the overviewStore history store.
-->
<script lang="ts">
  import { history } from '$lib/derived/overviewStore.js';
  import MysticalEmptyState from '$lib/components/cast/shared/MysticalEmptyState.svelte';
  import { flip } from 'svelte/animate';
  import { slide, fade } from 'svelte/transition';

  function formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const TYPE_COLORS: Record<string, string> = {
    hp: 'var(--red)',
    roll: 'var(--purple)',
    condition: 'var(--cyan)',
    resource: 'var(--grey)',
    rest: 'var(--hp-healthy, #22c55e)',
  };
</script>

<div class="log-panel">
  {#if $history.length === 0}
    <div in:fade={{ duration: 200, delay: 100 }}>
      <MysticalEmptyState 
        title="SIN ACTIVIDAD" 
        message="Aún no se han registrado eventos en esta sesión."
        icon="history"
      />
    </div>
  {:else}
    <ul class="log-list" aria-label="Historial de actividad">
      {#each [...$history].reverse() as entry (entry.timestamp)}
        <li 
          class="log-entry"
          animate:flip={{ duration: 300 }}
          in:slide={{ duration: 250, axis: 'y' }}
        >
          <span class="log-entry__time">{formatTime(entry.timestamp)}</span>
          <span
            class="log-entry__label"
            style="color: {TYPE_COLORS[entry.type] ?? 'var(--grey)'}"
          >
            {entry.label}
          </span>
          <span class="log-entry__value">{entry.value}</span>
          {#if entry.detail}
            <span class="log-entry__detail">{entry.detail}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .log-panel {
    display: flex;
    flex-direction: column;
  }

  .log-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .log-entry {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    grid-template-rows: auto auto;
    gap: 0 var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--black-card);
    border: 1px solid var(--grey-dim);
    transition: border-color var(--t-fast);
  }

  .log-entry:hover {
    border-color: var(--grey);
  }

  .log-entry__time {
    grid-row: 1 / 3;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--grey);
    align-self: center;
  }

  .log-entry__label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    align-self: end;
  }

  .log-entry__value {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--white);
    align-self: end;
    text-align: right;
  }

  .log-entry__detail {
    grid-column: 2 / 4;
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--grey);
  }
</style>
