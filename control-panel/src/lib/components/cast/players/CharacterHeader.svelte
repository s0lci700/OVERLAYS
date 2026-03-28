<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    computeSkillTotal,
    computePassive,
    ABILITY_LABELS
  } from '$lib/utils/character-derive';
  import StatDisplay from '$lib/components/shared/stat-display/stat-display.svelte';

  let {
    character
  }: {
    character: CharacterRecord;
  } = $props();

  const dexMod = $derived(computeAbilityModifier(character.ability_scores['dex'] ?? 10));
  const wisMod = $derived(computeAbilityModifier(character.ability_scores['wis'] ?? 10));

  const isProfPercep = $derived(character.skill_proficiencies.includes('perception'));
  const isExpertPercep = $derived(character.expertise.includes('perception'));
  const passivePerception = $derived(
    computePassive(
      computeSkillTotal(wisMod, isProfPercep, isExpertPercep, character.proficiency_bonus)
    )
  );

  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
</script>

<div class="character-identity">
  <div class="identity-top">
    <h1 class="character-name">{character.name}</h1>
    <span class="level-badge">LVL {character.level}</span>
  </div>
  <div class="species-line">
    {character.species} · {character.class_name}
    {#if character.subclass_name}
      · {character.subclass_name}
    {/if}
  </div>
</div>

<div class="stat-strip">
  <StatDisplay label="ARMOR" value={character.ac_base} variant="cast" />
  <StatDisplay label="SPEED" value={character.speed} variant="cast" />
  <StatDisplay label="INIT" value={formatMod(dexMod)} variant="cast" />
  <StatDisplay label="PASV" value={passivePerception} variant="cast" />
</div>

<style>
  .character-identity {
    background: rgba(27, 27, 35, 0.8);
    backdrop-filter: blur(var(--cast-blur));
    border: 1px solid rgba(200, 148, 74, 0.2);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .identity-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .character-name {
    font-family: var(--cast-font-identity);
    font-size: 2rem;
    font-weight: 600;
    color: var(--cast-text-primary);
    margin: 0;
    line-height: 1.1;
  }

  .level-badge {
    padding: 2px 8px;
    border-radius: var(--cast-radius-pill);
    font-family: var(--cast-font-chrome);
    font-size: 10px;
    font-weight: 700;
    color: var(--cast-amber);
    border: 1px solid rgba(200, 148, 74, 0.5);
    background: rgba(200, 148, 74, 0.1);
  }

  .species-line {
    font-family: var(--cast-font-chrome);
    font-size: 11px;
    color: var(--cast-text-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    border: 1px solid var(--cast-border-subtle);
    border-left: 2px solid var(--cast-amber);
  }

  :global(.stat-strip > div) {
    border-right: 1px solid var(--cast-border-subtle);
    padding: 0.75rem 0.25rem;
  }

  :global(.stat-strip > div:last-child) {
    border-right: none;
  }
</style>
