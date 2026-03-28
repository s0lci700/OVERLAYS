<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    computeSavingThrow,
    ABILITIES,
    ABILITY_LABELS
  } from '$lib/utils/character-derive';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import ProficiencyDot from '$lib/components/cast/shared/ProficiencyDot.svelte';

  let {
    character
  }: {
    character: CharacterRecord;
  } = $props();

  const saves = $derived(
    ABILITIES.map((ab) => {
      const isProficient = character.saving_throws_proficiencies.includes(ab);
      const abilityMod = computeAbilityModifier(character.ability_scores[ab] ?? 10);
      const total = computeSavingThrow(abilityMod, isProficient, character.proficiency_bonus);
      return { ab, isProficient, total };
    })
  );

  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
</script>

<section class="saving-throws-section">
  <CastSectionHeader title="SAVING THROWS" />

  <div class="saves-list">
    {#each saves as { ab, isProficient, total }}
      <div class="save-row" class:is-proficient={isProficient}>
        <div class="prof-indicator">
          <ProficiencyDot level={isProficient ? 'proficient' : 'none'} />
        </div>
        <span class="ability-label">{ABILITY_LABELS[ab]}</span>
        <span class="save-total">{formatMod(total)}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .saves-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background-color: var(--cast-border-subtle);
  }

  .save-row {
    display: grid;
    grid-template-columns: 24px 3rem 1fr;
    align-items: center;
    gap: 0.75rem;
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    padding: 0 0.75rem;
    height: 44px;
    border-left: 2px solid transparent;
  }

  .save-row.is-proficient {
    border-left: 2px solid var(--cast-amber);
  }

  .prof-indicator {
    display: flex;
    justify-content: center;
  }

  .ability-label {
    font-family: var(--cast-font-chrome);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--cast-amber);
    text-transform: uppercase;
  }

  .save-total {
    font-family: var(--cast-font-data);
    font-weight: 700;
    font-size: 1rem;
    color: var(--cast-text-primary);
    text-align: right;
  }
</style>
