<!--
  Characters tab: renders one CharacterCard per character in the store.
-->
<script>
  import "$lib/CharacterBulkControls.css";
  import CharacterCard from "$lib/CharacterCard.svelte";
  import { characters, SERVER_URL } from "$lib/socket.js";

  const DEFAULT_BULK_AMOUNT = 5;

  let selectedIds = $state(new Set());
  let bulkAmount = $state(DEFAULT_BULK_AMOUNT);
  let selectionMode = $state(false);

  let selectedCount = $derived(selectedIds.size);
  let hasSelection = $derived(selectionMode && selectedCount > 0);

  let bulkError = $state("");
  let bulkErrorTimer;

  function showBulkError(msg) {
    bulkError = msg;
    clearTimeout(bulkErrorTimer);
    bulkErrorTimer = setTimeout(() => (bulkError = ""), 4000);
  }

  function toggleSelectionMode() {
    selectionMode = !selectionMode;
    if (!selectionMode) {
      clearSelection();
    }
  }

  function toggleSelection(charId) {
    const next = new Set(selectedIds);
    if (next.has(charId)) {
      next.delete(charId);
    } else {
      next.add(charId);
    }
    selectedIds = next;
  }

  function clearSelection() {
    selectedIds = new Set();
  }

  function selectAll() {
    if (!selectionMode) return;
    selectedIds = new Set($characters.map((character) => character.id));
  }

  async function applyBulkHp(type) {
    if (!hasSelection) return;

    const parsedAmount = Number(bulkAmount);
    const amount = Math.max(
      1,
      Math.min(
        999,
        Number.isFinite(parsedAmount)
          ? Math.trunc(parsedAmount)
          : DEFAULT_BULK_AMOUNT,
      ),
    );
    bulkAmount = amount;

    const targets = $characters.filter((character) =>
      selectedIds.has(character.id),
    );

    try {
      await Promise.all(
        targets.map((character) => {
          let newHp =
            type === "damage"
              ? character.hp_current - amount
              : character.hp_current + amount;
          newHp = Math.max(0, Math.min(newHp, character.hp_max));
          return fetch(`${SERVER_URL}/api/characters/${character.id}/hp`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hp_current: newHp }),
          });
        }),
      );
    } catch (error) {
      console.error("Bulk HP update failed", error);
      showBulkError("No se pudo actualizar a todos. Intenta nuevamente.");
    }
  }

  async function applyBulkRest(type) {
    if (!hasSelection) return;

    const targets = $characters.filter((character) =>
      selectedIds.has(character.id),
    );

    try {
      await Promise.all(
        targets.map((character) =>
          fetch(`${SERVER_URL}/api/characters/${character.id}/rest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
          }),
        ),
      );
    } catch (error) {
      console.error("Bulk rest failed", error);
      showBulkError("No se pudo aplicar el descanso a todos.");
    }
  }
</script>

<section class="bulk-controls">
  <span class="bulk-controls-title">Selección múltiple</span>
  <span class="bulk-controls-count">{selectedCount} elegidos</span>

  {#if bulkError}
    <div class="bulk-toast" role="alert">
      <span>{bulkError}</span>
      <button
        class="bulk-toast-close"
        onclick={() => (bulkError = "")}
        aria-label="Cerrar">&times;</button
      >
    </div>
  {/if}

  <div class="bulk-controls-actions">
    <button
      class="bulk-toggle"
      class:is-active={selectionMode}
      type="button"
      onclick={toggleSelectionMode}
    >
      Modo multi
    </button>
    <button class="bulk-toggle" type="button" onclick={selectAll}>
      Seleccionar todos
    </button>
    <button
      class="bulk-toggle"
      type="button"
      onclick={clearSelection}
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
        aria-label="Cantidad de HP"
      />
    </div>
    <button
      class="btn-base bulk-action damage"
      type="button"
      onclick={() => applyBulkHp("damage")}
      disabled={!hasSelection}
    >
      − Daño
    </button>
    <button
      class="btn-base bulk-action heal"
      type="button"
      onclick={() => applyBulkHp("heal")}
      disabled={!hasSelection}
    >
      + Curar
    </button>
    <button
      class="btn-base bulk-action rest"
      type="button"
      onclick={() => applyBulkRest("short")}
      disabled={!hasSelection}
    >
      Descanso corto
    </button>
    <button
      class="btn-base bulk-action rest"
      type="button"
      onclick={() => applyBulkRest("long")}
      disabled={!hasSelection}
    >
      Descanso largo
    </button>
  </div>
</section>

<div class="characters-grid" class:grid-three={$characters.length > 2}>
  {#each $characters as character (character.id)}
    <CharacterCard
      {character}
      selectable={selectionMode}
      selected={selectionMode && selectedIds.has(character.id)}
      onToggleSelect={toggleSelection}
    />
  {/each}
</div>
