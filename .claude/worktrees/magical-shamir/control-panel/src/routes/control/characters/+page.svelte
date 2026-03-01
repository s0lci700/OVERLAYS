<!--
  Characters tab: renders one CharacterCard per character in the store.
-->
<script>
  import "$lib/CharacterBulkControls.css";
  import CharacterCard from "$lib/CharacterCard.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { characters, SERVER_URL } from "$lib/socket.js";
  import { createDraggable } from "animejs";
  import { onMount } from "svelte";
  import CharacterBulkControls from "$lib/CharacterBulkControls.svelte";

  const DEFAULT_BULK_AMOUNT = 5;

  let gridEl;

  // ── Drag-to-reorder ──────────────────────────────────────────────────────
  let sortOrder = $state(null); // null = server order

  let displayChars = $derived(
    sortOrder
      ? sortOrder
          .map((id) => $characters.find((c) => c.id === id))
          .filter(Boolean)
      : $characters,
  );

  // Keep sortOrder in sync when characters are added/removed on the server
  $effect(() => {
    if (!sortOrder) return;
    const ids = $characters.map((c) => c.id);
    const current = new Set(ids);
    const filtered = sortOrder.filter((id) => current.has(id));
    const existing = new Set(filtered);
    const added = ids.filter((id) => !existing.has(id));
    if (filtered.length !== sortOrder.length || added.length > 0) {
      sortOrder = [...filtered, ...added];
    }
  });

  // Svelte action: makes each card wrapper draggable for reordering.
  function draggableCard(node, charId) {
    let snapValues = [0];
    let draggable;

    draggable = createDraggable(node, {
      trigger: node.querySelector(".drag-handle"),
      x: { snap: [0] }, // lock X — always snaps back to 0
      y: { snap: () => snapValues },
      releaseStiffness: 500,
      releaseDamping: 45,

      onGrab() {
        node.classList.add("is-dragging");
        // Capture snap targets = Y-delta from this card's center to every other card's center
        const thisRect = node.getBoundingClientRect();
        const thisCenterY = thisRect.top + thisRect.height / 2;
        const wrappers = Array.from(
          gridEl.querySelectorAll(".char-card-exit-wrap"),
        );
        snapValues = wrappers.map((w) => {
          const r = w.getBoundingClientRect();
          return r.top + r.height / 2 - thisCenterY;
        });
        draggable.refresh(); // tell draggable to pick up the new snapValues
      },

      onSettle(self) {
        node.classList.remove("is-dragging");

        // Find which slot we snapped to
        const settledY = self.y;
        let targetSlot = 0;
        let closestDist = Infinity;
        snapValues.forEach((sv, i) => {
          const d = Math.abs(sv - settledY);
          if (d < closestDist) {
            closestDist = d;
            targetSlot = i;
          }
        });

        // Synchronously clear the drag transform so Svelte sees clean positions
        node.style.transform = "";
        self.setX(0, true);
        self.setY(0, true);

        // Apply new sort order
        const currentOrder = sortOrder ?? $characters.map((c) => c.id);
        const selfIndex = currentOrder.indexOf(charId);
        const without = currentOrder.filter((id) => id !== charId);
        let insertAt = targetSlot;
        if (selfIndex >= 0 && selfIndex < targetSlot) insertAt = targetSlot - 1;
        insertAt = Math.max(0, Math.min(insertAt, without.length));
        const newOrder = [...without];
        newOrder.splice(insertAt, 0, charId);
        sortOrder = newOrder;
      },
    });

    return {
      destroy() {
        draggable.revert();
      },
    };
  }

  // ── Svelte exit transition for removed cards ─────────────────────────────
  function cardExit(node, { duration = 280 } = {}) {
    return {
      duration,
      css: (t, u) => `
        opacity: ${t};
        transform: scale(${0.88 + t * 0.12}) translateY(${u * -10}px);
      `,
    };
  }

  // ── Bulk controls ────────────────────────────────────────────────────────
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

<CharacterBulkControls
  {selectedCount}
  bind:selectionMode
  {hasSelection}
  bind:bulkAmount
  {bulkError}
  on:toggleSelectionMode={() => toggleSelectionMode()}
  on:selectAll={() => selectAll()}
  on:clearSelection={() => clearSelection()}
  on:applyBulkHp={(e) => applyBulkHp(e.detail.type)}
  on:applyBulkRest={(e) => applyBulkRest(e.detail.type)}
  on:clearError={() => (bulkError = "")}
/>

<div
  bind:this={gridEl}
  class="characters-grid"
  class:grid-three={$characters.length > 2}
>
  {#each displayChars as character (character.id)}
    <div
      use:draggableCard={character.id}
      out:cardExit
      class="char-card-exit-wrap"
    >
      <button class="drag-handle" type="button" aria-label="Reordenar">⠿</button
      >
      <CharacterCard
        {character}
        selectable={selectionMode}
        selected={selectionMode && selectedIds.has(character.id)}
        onToggleSelect={toggleSelection}
      />
    </div>
  {/each}
</div>
