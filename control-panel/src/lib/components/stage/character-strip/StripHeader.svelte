<!--
  StripHeader
  ===========
  Bulk DMG/HEAL controls at the top of the character strip.
  Applies HP delta to every character in the active roster simultaneously.
  Hold-to-confirm prevents accidental bulk mutations.
-->
<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import { Stepper } from '$lib/components/shared/stepper/index';
  import { HoldButton } from '$lib/components/shared/hold-button/index';
  import { UndoToast } from '$lib/components/shared/undo-toast/index';
  import { mutateHp } from '$lib/derived/stage.svelte';
  import { makeWheelHandler } from '$lib/utils/utils';

  let { characters }: { characters: CharacterRecord[] } = $props();

  let dmgAmount = $state(1);
  let healAmount = $state(1);

  const dmgWheelHandler = makeWheelHandler(
    () => dmgAmount,
    (newVal) => (dmgAmount = newVal),
    1, 999
  );

  const healWheelHandler = makeWheelHandler(
    () => healAmount,
    (newVal) => (healAmount = newVal),
    1, 999
  );
  

  type Snapshot = { id: string; hp: number }[];
  let toast = $state<{ label: string; snapshot: Snapshot } | null>(null);
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  function applyAll(delta: number) {
    for (const char of characters) {
      mutateHp(char.id, { delta });
    }
  }

  function showToast(label: string, snapshot: Snapshot) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast = { label, snapshot };
    toastTimeout = setTimeout(clearToast, 3000);
  }

  function clearToast() {
    toast = null;
    toastTimeout = null;
  }

  function undoApplyAll() {
    if (!toast) return;
    for (const snap of toast.snapshot) {
      const char = characters.find(c => c.id === snap.id);
      if (char) mutateHp(snap.id, { delta: snap.hp - char.hp_current });
    }
    clearToast();
  }
</script>

<header class="strip-header">
  <div class="strip-header__group">
    <span class="strip-header__label">DAÑO GLOBAL</span>
    <div class="strip-header__controls">
      <HoldButton
        variant="dmg"
        label="DAÑO"
        holdDuration={800}
        style="width:88px;"
        onConfirm={() => {
          const snapshot: Snapshot = characters.map(c => ({ id: c.id, hp: c.hp_current }));
          applyAll(-dmgAmount);
          showToast('Daño aplicado a todos', snapshot);
        }}
        ariaLabel={`Mantener para aplicar ${dmgAmount} de daño a todos los personajes`}
      />
      <Stepper onwheel={dmgWheelHandler} bind:value={dmgAmount} min={1} max={999} size="sm" />
    </div>
  </div>

  <div class="strip-header__group">
    <span class="strip-header__label">SANACIÓN GLOBAL</span>
    <div class="strip-header__controls">
      <HoldButton
        variant="heal"
        label="CURAR"
        holdDuration={800}
        style="width:88px;"
        onConfirm={() => {
          const snapshot: Snapshot = characters.map(c => ({ id: c.id, hp: c.hp_current }));
          applyAll(healAmount);
          showToast('Sanación aplicada a todos', snapshot);
        }}
        ariaLabel={`Mantener para aplicar ${healAmount} de sanación a todos los personajes`}
      />
      <Stepper onwheel={healWheelHandler} bind:value={healAmount} min={1} max={999} size="sm" />
    </div>
  </div>

  {#if toast}
    <UndoToast label={toast.label} onUndo={undoApplyAll} />
  {/if}
</header>

<style>
  .strip-header {
    padding: var(--space-3);
    border-bottom: 1px solid var(--grey-dim);
    background: var(--black-elevated);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex-shrink: 0;
    position: relative;
  }

  .strip-header__group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .strip-header__controls {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .strip-header__label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    color: var(--cast-amber);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
</style>
