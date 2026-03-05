<script>
  import "./SessionBar.css";

  let {
    pendingAction = null,
    pendingTarget = null,
    onAction = () => {},
    onCancel = () => {},
    onConfirm = () => {},
    onNextTurn = () => {},
  } = $props();

  let inputValue = $state("");
  let restType = $state("short");

  // Reset local state whenever a new target is selected
  $effect(() => {
    if (pendingTarget) {
      inputValue = "";
      restType = "short";
    }
  });

  const ACTION_LABELS = {
    damage:    "Daño",
    heal:      "Curar",
    condition: "Condición",
    rest:      "Descanso",
  };

  function handleConfirm() {
    const value =
      pendingAction === "rest" ? restType : String(inputValue ?? "").trim();
    onConfirm({ action: pendingAction, targetId: pendingTarget, value });
  }
</script>

<div
  class="sb-bar"
  class:sb-bar--idle={!pendingAction}
  class:sb-bar--pending={pendingAction && !pendingTarget}
  class:sb-bar--confirm={pendingAction && pendingTarget}
  role="toolbar"
  aria-label="Barra de acciones DM"
>
  {#if !pendingAction}
    <!-- ── STATE 1: IDLE — all action buttons ── -->
    <div class="sb-actions">
      <button
        class="sb-btn sb-btn--damage"
        onclick={() => onAction("damage")}
        aria-label="Aplicar daño"
      >
        ⚔ Daño
      </button>
      <button
        class="sb-btn sb-btn--heal"
        onclick={() => onAction("heal")}
        aria-label="Curar"
      >
        ✦ Curar
      </button>
      <button
        class="sb-btn sb-btn--condition"
        onclick={() => onAction("condition")}
        aria-label="Agregar condición"
      >
        ◈ Condición
      </button>
      <button
        class="sb-btn sb-btn--rest"
        onclick={() => onAction("rest")}
        aria-label="Descanso"
      >
        ☽ Descanso
      </button>
    </div>
    <button
      class="sb-btn sb-btn--next"
      onclick={() => onNextTurn()}
      aria-label="Siguiente turno"
    >
      Siguiente ▶
    </button>

  {:else if !pendingTarget}
    <!-- ── STATE 2: ACTION SELECTED, no target yet ── -->
    <button
      class="sb-btn sb-btn--cancel"
      onclick={() => onCancel()}
      aria-label="Cancelar acción"
    >
      ← Cancelar
    </button>
    <span class="sb-hint">
      Selecciona un objetivo para&nbsp;<strong>{ACTION_LABELS[pendingAction] ?? pendingAction}</strong>
    </span>

  {:else}
    <!-- ── STATE 3: TARGET SELECTED — confirm panel ── -->
    <button
      class="sb-btn sb-btn--cancel"
      onclick={() => onCancel()}
      aria-label="Cancelar acción"
    >
      ← Cancelar
    </button>

    <div class="sb-confirm-row">
      {#if pendingAction === "damage" || pendingAction === "heal"}
        <label class="sr-only" for="sb-amount-input">
          Cantidad de {ACTION_LABELS[pendingAction]}
        </label>
        <input
          id="sb-amount-input"
          class="sb-input sb-input--number mono-num"
          type="number"
          min="0"
          max="999"
          placeholder="0"
          bind:value={inputValue}
          onkeydown={(e) => e.key === "Enter" && handleConfirm()}
        />

      {:else if pendingAction === "condition"}
        <label class="sr-only" for="sb-condition-input">Nombre de condición</label>
        <input
          id="sb-condition-input"
          class="sb-input sb-input--text"
          type="text"
          maxlength="32"
          placeholder="ej. Envenenado"
          bind:value={inputValue}
          onkeydown={(e) => e.key === "Enter" && handleConfirm()}
        />

      {:else if pendingAction === "rest"}
        <label class="sr-only" for="sb-rest-select">Tipo de descanso</label>
        <select
          id="sb-rest-select"
          class="sb-select selector"
          bind:value={restType}
        >
          <option value="short">Descanso Corto</option>
          <option value="long">Descanso Largo</option>
        </select>
      {/if}

      <button
        class="sb-btn sb-btn--confirm"
        class:sb-btn--confirm-add={pendingAction === "condition"}
        onclick={handleConfirm}
        aria-label="Confirmar acción"
      >
        {pendingAction === "condition" ? "Agregar" : "Confirmar"}
      </button>
    </div>
  {/if}
</div>
