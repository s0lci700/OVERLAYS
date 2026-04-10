<!--
  CharacterInfoPanel
  ==================
  Collapsible read-only stat summary for a single character.
  Reads from the flat PocketBase `characters` schema.

  Props:
    character – CharacterRecord from the socket store
-->
<script lang="ts">
  import type { CharacterRecord, Skill } from '$lib/contracts/records';
  import { Button } from '$lib/components/shared/button/index.js';
  import { fade } from 'svelte/transition';

  let { character }: { character: CharacterRecord } = $props();

  let infoOpen = $state(false);

  // Extract proficient skill names from Record<Skill, boolean>
  const proficientSkills = $derived<string[]>(
    character.skill_proficiencies
      ? (Object.entries(character.skill_proficiencies) as [Skill, boolean][])
          .filter(([, v]) => v === true)
          .map(([k]) => k)
      : []
  );

  const expertiseSkills = $derived<string[]>(
    character.expertise
      ? (Object.entries(character.expertise) as [Skill, boolean][])
          .filter(([, v]) => v === true)
          .map(([k]) => k)
      : []
  );
</script>

<div class="manage-readonly">
  <Button
    class="btn-base manage-info-toggle"
    type="button"
    onclick={() => (infoOpen = !infoOpen)}
    aria-expanded={infoOpen ? 'true' : 'false'}
  >
    {infoOpen ? 'OCULTAR STATS' : 'VER STATS'}
  </Button>

  {#if infoOpen}
    <div class="manage-readonly-grid" transition:fade={{ duration: 140 }}>
      <!-- Core combat stats -->
      <div class="info-stat-row">
        <div class="info-stat">
          <span class="info-stat-label">HP</span>
          <span class="info-stat-value">{character.hp_current ?? '—'} / {character.hp_max ?? '—'}</span>
        </div>
        <div class="info-stat">
          <span class="info-stat-label">CA</span>
          <span class="info-stat-value">{character.ac_base ?? '—'}</span>
        </div>
        <div class="info-stat">
          <span class="info-stat-label">VEL</span>
          <span class="info-stat-value">{character.speed ?? '—'}</span>
        </div>
        <div class="info-stat">
          <span class="info-stat-label">PROF</span>
          <span class="info-stat-value">+{character.proficiency_bonus ?? '—'}</span>
        </div>
      </div>

      <!-- Subclass -->
      {#if character.subclass_name}
        <div class="manage-readonly-item">
          <span class="manage-readonly-label">Subclase</span>
          <span class="manage-readonly-value">{character.subclass_name}</span>
        </div>
      {/if}

      <!-- Skill proficiencies -->
      {#if proficientSkills.length > 0}
        <div class="manage-readonly-item">
          <span class="manage-readonly-label">
            Skills ({proficientSkills.length}{expertiseSkills.length > 0 ? `, ${expertiseSkills.length} expertise` : ''})
          </span>
          <span class="manage-readonly-value">{proficientSkills.join(', ')}</span>
        </div>
      {/if}

      <!-- HP temp if present -->
      {#if character.hp_temp}
        <div class="manage-readonly-item">
          <span class="manage-readonly-label">HP Temporal</span>
          <span class="manage-readonly-value">{character.hp_temp}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
