<script>
  import { createEventDispatcher } from "svelte";
  import "$lib/CharacterBulkControls.css";
  import { Button } from "$lib/components/ui/button/index.js";

  export let selectedCount = 0;
  export let selectionMode = false;
  export let hasSelection = false;
  export let bulkAmount = 5;
  export let bulkError = "";

  const dispatch = createEventDispatcher();

  function toggleSelectionMode() {
    selectionMode = !selectionMode;
    dispatch("toggleSelectionMode", { selectionMode });
  }
  function selectAll() {
    dispatch("selectAll");
  }
  function clearSelection() {
    dispatch("clearSelection");
  }
  function onAmountInput(e) {
    bulkAmount = e.target.value;
    dispatch("updateAmount", { bulkAmount });
  }
  function applyBulkHp(type) {
    dispatch("applyBulkHp", { type, bulkAmount: Number(bulkAmount) });
  }
  function applyBulkRest(type) {
    dispatch("applyBulkRest", { type });
  }
  function closeToast() {
    bulkError = "";
    dispatch("clearError");
  }
</script>

<section class="bulk-controls">
  <span class="bulk-controls-title">Selección múltiple</span>
  <span class="bulk-controls-count">{selectedCount} elegidos</span>

  {#if bulkError}
    <div class="bulk-toast" role="alert">
      <span>{bulkError}</span>
      <button class="bulk-toast-close" on:click={closeToast} aria-label="Cerrar"
        >×</button
      >
    </div>
  {/if}

  <div class="bulk-controls-actions">
    <button
      class="bulk-toggle"
      class:is-active={selectionMode}
      type="button"
      on:click={toggleSelectionMode}
    >
      Modo multi
    </button>
    <button class="bulk-toggle" type="button" on:click={selectAll}>
      Seleccionar todos
    </button>
    <button
      class="bulk-toggle"
      type="button"
      on:click={clearSelection}
      disabled={!hasSelection}
    >
      Limpiar
    </button>
  </div>
  <div class="bulk-controls-actions">
    <div class="bulk-amount">
      <span class="bulk-controls-title">Cantidad</span>
      <input
        type="number"
        min="1"
        max="999"
        bind:value={bulkAmount}
        on:input={onAmountInput}
        aria-label="Cantidad de HP"
      />
    </div>
    <Button
      class="bulk-action damage"
      type="button"
      on:click={() => applyBulkHp("damage")}
      disabled={!hasSelection}
    >
      − Daño
    </Button>
    <Button
      class="bulk-action heal"
      type="button"
      on:click={() => applyBulkHp("heal")}
      disabled={!hasSelection}
    >
      + Curar
    </Button>
    <Button
      class="bulk-action rest"
      type="button"
      on:click={() => applyBulkRest("short")}
      disabled={!hasSelection}
    >
      Descanso corto
    </Button>
    <Button
      class="bulk-action rest"
      type="button"
      on:click={() => applyBulkRest("long")}
      disabled={!hasSelection}
    >
      Descanso largo
    </Button>
  </div>
</section>
