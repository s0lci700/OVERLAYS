<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    ABILITIES,
    ABILITY_LABELS
  } from '$lib/utils/character-derive';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import * as Tooltip from '$lib/components/shared/tooltip/index';
  import { ABILITY_TOOLTIPS } from '$lib/data/tooltips';

  let {
    character
  }: {
    character: CharacterRecord;
  } = $props();

  const modifiers = $derived(
    Object.fromEntries(
      ABILITIES.map((ab) => [ab, computeAbilityModifier(character.ability_scores[ab] ?? 10)])
    )
  );

  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
</script>

<section class="ability-section">
  <CastSectionHeader title="ABILITY SCORES" />

  <Tooltip.Provider delayDuration={200}>
    <div class="ability-grid">
      {#each ABILITIES as ab (ab)}
        {@const tip = ABILITY_TOOLTIPS[ab]}
        <Tooltip.Root>
          <Tooltip.Trigger class="ability-cell">
            <span class="ability-label">{ABILITY_LABELS[ab]}</span>
            <span class="ability-mod">{formatMod(modifiers[ab])}</span>
            <span class="ability-score">{character.ability_scores[ab] ?? 10}</span>
          </Tooltip.Trigger>
          {#if tip}
            <Tooltip.Content
              class="!bg-[#1b1b23] !text-[#f0f0f0] !rounded-none border border-[rgba(255,255,255,0.08)] max-w-[200px] !px-3 !py-2"
            >
              <p class="tip-name">{tip.name}</p>
              <p class="tip-desc">{tip.description}</p>
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
      {/each}
    </div>
  </Tooltip.Provider>
</section>

<style>
  .ability-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background-color: var(--cast-border-subtle);
  }

  /* Trigger renders as <button> — reset and apply cell styles */
  :global(.ability-cell) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem;
    gap: 2px;
    background-color: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    min-height: 64px;
    width: 100%;
    border: none;
    cursor: default;
  }

  .ability-label {
    font-family: var(--cast-font-chrome);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--cast-amber);
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .ability-mod {
    font-family: var(--cast-font-data);
    font-weight: 700;
    font-size: 1.75rem;
    letter-spacing: 0.02em;
    color: var(--cast-text-primary);
    line-height: 1;
  }

  .ability-score {
    font-family: var(--cast-font-data);
    font-size: 11px;
    color: var(--cast-text-secondary);
    opacity: 0.8;
  }
</style>
