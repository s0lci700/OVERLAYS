<!--
  StripHeader
  ===========
  Bulk DMG/HEAL controls at the top of the character strip.
  Applies HP delta to every character in the active roster simultaneously.
-->
<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import { Stepper } from '$lib/components/shared/stepper/index';
  import { mutateHp } from '$lib/derived/stage.svelte';

  let { characters }: { characters: CharacterRecord[] } = $props();

  let dmgAmount = $state(1);
  let healAmount = $state(1);

  function applyAll(delta: number) {
    for (const char of characters) {
      mutateHp(char.id, { delta });
    }
  }
</script>

<header class="strip-header">
  <div class="strip-header__row">
    <div class="strip-header__meta">
      <span class="strip-header__label">DAÑO GLOBAL</span>
      <button 
        class="btn-dmg-all" 
        onclick={() => applyAll(-dmgAmount)}
        aria-label={`Aplicar ${dmgAmount} de daño a todos los personajes`}
      >
        DAÑO
      </button>
    </div>
    <Stepper bind:value={dmgAmount} min={1} max={999} size="sm" />
  </div>

  <div class="strip-header__row">
    <div class="strip-header__meta">
      <span class="strip-header__label">SANACIÓN G.</span>
      <button 
        class="btn-heal-all" 
        onclick={() => applyAll(healAmount)}
        aria-label={`Aplicar ${healAmount} de sanación a todos los personajes`}
      >
        CURAR
      </button>
    </div>
    <Stepper bind:value={healAmount} min={1} max={999} size="sm" />
  </div>
</header>

<style>
  .strip-header {
    padding: var(--space-3);
    border-bottom: 1px solid var(--grey-dim);
    background: var(--black-elevated);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    flex-shrink: 0;
  }

  .strip-header__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .strip-header__meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .strip-header__label {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    color: var(--cast-amber);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.8;
  }

  .btn-dmg-all,
  .btn-heal-all {
    width: 80px;
    height: 32px;
    background: transparent;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--t-fast);
    flex-shrink: 0;
    clip-path: var(--hex-clip-sm);
  }

  .btn-dmg-all {
    border: 1px solid var(--red);
    color: var(--red);
    background: rgba(255, 77, 106, 0.05);
  }

  .btn-dmg-all:hover {
    background: var(--red);
    color: var(--white);
    transform: translateY(-1px);
  }

  .btn-dmg-all:active {
    transform: scale(0.96);
  }

  .btn-heal-all {
    border: 1px solid var(--cyan);
    color: var(--cyan);
    background: rgba(0, 229, 255, 0.05);
  }

  .btn-heal-all:hover {
    background: var(--cyan);
    color: var(--black);
    transform: translateY(-1px);
  }

  .btn-heal-all:active {
    transform: scale(0.96);
  }

  .btn-dmg-all:focus-visible,
  .btn-heal-all:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }
</style>
