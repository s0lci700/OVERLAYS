<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    computeSkillTotal,
    computePassive
  } from '$lib/utils/character-derive';
  import StatDisplay from '$lib/components/shared/stat-display/stat-display.svelte';
  import { formatHitDice, getHitDie } from '$lib/data/hitDice';
  import { getDieSVG } from '$lib/assets/dice/die';
  import * as Tooltip from '$lib/components/shared/tooltip/index';
  import { STAT_TOOLTIPS } from '$lib/data/tooltips';

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

  const hitDice = $derived(formatHitDice(character.class_name, character.level));
  const hitDieType = $derived(getHitDie(character.class_name));
  const hitDieIcon = $derived(getDieSVG(hitDieType));

  const stats = $derived([
    { key: 'armor', label: 'ARMOR', value: character.ac_base,                    icon: undefined },
    { key: 'speed', label: 'SPEED', value: character.speed,                      icon: undefined },
    { key: 'init',  label: 'INIT',  value: formatMod(dexMod),                   icon: undefined },
    { key: 'prof',  label: 'PROF',  value: formatMod(character.proficiency_bonus), icon: undefined },
    { key: 'hd',    label: 'HitDice', value: hitDice,                           icon: hitDieIcon.svg.raw },
  ]);
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

<Tooltip.Provider delayDuration={300}>
  <div class="stat-strip">
    {#each stats as stat (stat.key)}
      {@const tip = STAT_TOOLTIPS[stat.key]}
      <Tooltip.Root>
        <Tooltip.Trigger class="stat-cell">
          <StatDisplay label={stat.label} value={stat.value} icon={stat.icon} variant="cast" />
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
    grid-template-columns: repeat(5, 1fr);
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    border: 1px solid var(--cast-border-subtle);
    border-left: 2px solid var(--cast-amber);
  }

  /* Trigger renders as <button> — reset styles and apply cell layout */
  :global(.stat-cell) {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--cast-border-subtle);
    padding: 0.75rem 0.25rem;
    width: 100%;
    background: transparent;
    border-top: none;
    border-bottom: none;
    border-left: none;
    cursor: default;
  }

  :global(.stat-cell:last-child) {
    border-right: none;
  }
</style>
