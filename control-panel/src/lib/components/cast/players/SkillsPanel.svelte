<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    computeSkillTotal,
    SKILL_ABILITY,
    SKILL_LABELS,
    ABILITIES,
    ABILITY_LABELS,
    SKILLS_BY_ABILITY
  } from '$lib/utils/character-derive';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import ProficiencyDot from '$lib/components/cast/shared/ProficiencyDot.svelte';

  let {
    character,
    groupByAbility = true,
    sortByModifier = false
  }: {
    character: CharacterRecord;
    groupByAbility?: boolean;
    sortByModifier?: boolean;
  } = $props();

  const allSkills = $derived(
    Object.entries(SKILL_ABILITY).map(([skill, ability]) => {
      const isProficient = character.skill_proficiencies?.[skill as import('$lib/contracts/records').Skill] === true;
      const isExpertise = character.expertise?.[skill as import('$lib/contracts/records').Skill] === true;
      const abilityMod = computeAbilityModifier(character.ability_scores[ability] ?? 10);
      const total = computeSkillTotal(
        abilityMod,
        isProficient,
        isExpertise,
        character.proficiency_bonus
      );
      const profLevel: 'none' | 'proficient' | 'expertise' = isExpertise
        ? 'expertise'
        : isProficient
          ? 'proficient'
          : 'none';
      return { skill, ability, total, profLevel };
    })
  );

  const displaySkills = $derived(
    sortByModifier ? [...allSkills].sort((a, b) => b.total - a.total) : allSkills
  );

  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
</script>

<section class="skills-section">
  <CastSectionHeader title="SKILLS" meta="18 TOTAL" />

  <div class="skills-grid-container">
    {#if groupByAbility}
      <div class="ability-groups">
        {#each ABILITIES as ab}
          {#if SKILLS_BY_ABILITY[ab].length > 0}
            <div class="ability-group-box">
              <div class="ability-group-header">
                <span class="group-attr">{ABILITY_LABELS[ab]}</span>
                <span class="group-line"></span>
              </div>
              <div class="skills-subgrid">
                {#each displaySkills.filter((s) => s.ability === ab) as s}
                  <div class="skill-row" class:is-proficient={s.profLevel !== 'none'}>
                    <div class="prof-indicator">
                      <ProficiencyDot level={s.profLevel} />
                    </div>
                    <span class="skill-name">{SKILL_LABELS[s.skill]}</span>
                    <span class="skill-total">{formatMod(s.total)}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div class="skills-list">
        {#each displaySkills as s}
          <div class="skill-row" class:is-proficient={s.profLevel !== 'none'}>
            <div class="prof-indicator">
              <ProficiencyDot level={s.profLevel} />
            </div>
            <span class="skill-name">{SKILL_LABELS[s.skill]}</span>
            <span class="skill-ability-hint">{ABILITY_LABELS[s.ability]}</span>
            <span class="skill-total">{formatMod(s.total)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .skills-grid-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ability-groups {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ability-group-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .ability-group-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 0.25rem;
  }

  .group-attr {
    font-family: var(--cast-font-chrome);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--cast-amber);
    text-transform: uppercase;
  }

  .group-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--cast-amber-border), transparent);
  }

  .skills-subgrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1px;
    background-color: var(--cast-border-subtle);
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background-color: var(--cast-border-subtle);
  }

  .skill-row {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 0.5rem;
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    padding: 0 0.75rem;
    height: 40px;
    border-left: 2px solid transparent;
    transition: background var(--cast-t-transition);
  }

  .skill-row.is-proficient {
    border-left: 2px solid var(--cast-amber);
    background: rgba(200, 148, 74, 0.04);
  }

  .prof-indicator {
    display: flex;
    justify-content: center;
  }

  .skill-name {
    font-family: var(--cast-font-chrome);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: var(--cast-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .skill-ability-hint {
    font-family: var(--cast-font-chrome);
    font-size: 9px;
    letter-spacing: 0.05em;
    color: rgba(186, 201, 204, 0.4);
    text-transform: uppercase;
    padding-right: 0.5rem;
  }

  .skill-total {
    font-family: var(--cast-font-data);
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--cast-text-primary);
    min-width: 2rem;
    text-align: right;
  }

  @media (max-width: 480px) {
    .skills-subgrid {
      grid-template-columns: 1fr;
    }
  }
</style>
