<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import CharacterHeader from './CharacterHeader.svelte';
  import AbilityScoresPanel from './AbilityScoresPanel.svelte';
  import SavingThrowsPanel from './SavingThrowsPanel.svelte';
  import SkillsPanel from './SkillsPanel.svelte';
  import ResourceTracker from './ResourceTracker.svelte';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import { ConditionPill } from '$lib/components/shared/condition-pill';

  let {
    character,
    portraitUrl = null
  }: {
    character: CharacterRecord | null;
    portraitUrl?: string | null;
  } = $props();
</script>

{#if character}
  <div class="home-canvas">
    <!-- ── Identity Hero ────────────────────────────────────────── -->
    <div class="character-hero">
      <div class="hero-portrait-frame">
        {#if portraitUrl}
          <img src={portraitUrl} alt={character.name} class="hero-portrait-img" />
        {:else}
          <div class="hero-portrait-placeholder">
            <span class="material-symbols-outlined" aria-hidden="true">person</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── Identity + Stats ──────────────────────────────────────── -->
    <CharacterHeader {character} />

    <!-- ── Conditions ──────────────────────────────────────────── -->
    {#if character.conditions.length > 0}
      <div class="conditions-row">
        {#each character.conditions as cond}
          <ConditionPill variant="cast" label={cond.condition_name.toUpperCase()} />
        {/each}
      </div>
    {/if}

    <!-- ── Core Panels ─────────────────────────────────────────── -->
    <AbilityScoresPanel {character} />
    <SavingThrowsPanel {character} />

    <!-- ── Resources ───────────────────────────────────────────── -->
    <ResourceTracker {character} readonly={true} />

    <!-- ── Full Skill List ─────────────────────────────────────── -->
    <SkillsPanel {character} />
  </div>
{:else}
  <div class="home-canvas home-canvas--empty">
    <p class="empty-state">Character not found.</p>
  </div>
{/if}

<style>
  /* ── Hero ───────────────────────────────────────────────────── */
  .character-hero {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .hero-portrait-frame {
    width: 140px;
    height: 160px;
    background: rgba(27, 27, 35, 0.8);
    backdrop-filter: blur(var(--cast-blur));
    border: 1px solid rgba(200, 148, 74, 0.2);
    clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .hero-portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-portrait-placeholder {
    color: rgba(200, 148, 74, 0.2);
  }

  .hero-portrait-placeholder .material-symbols-outlined {
    font-size: 4rem;
  }

  /* ── Canvas ─────────────────────────────────────────────────── */
  .home-canvas {
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 640px;
    margin: 0 auto;
  }

  .home-canvas--empty {
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .empty-state {
    font-family: var(--cast-font-chrome);
    font-size: 12px;
    color: var(--cast-text-secondary);
    letter-spacing: 0.1em;
  }

  /* ── Conditions ─────────────────────────────────────────────── */
  .conditions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Tablet/Desktop optimization */
  @media (min-width: 768px) {
    .home-canvas {
      gap: 2rem;
      padding: 2.5rem 1.5rem;
    }
  }
</style>
