<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import CharacterHeader from './CharacterHeader.svelte';
  import AbilityScoresPanel from './AbilityScoresPanel.svelte';
  import SavingThrowsPanel from './SavingThrowsPanel.svelte';
  import SkillsPanel from './SkillsPanel.svelte';
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
            <span class="material-symbols-outlined">person</span>
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
    {#if character.resources.length > 0}
      <section class="resources-section">
        <CastSectionHeader
          title="RESOURCES"
          meta="{character.resources.length} TRACKED"
        />
        <div class="resources-list">
          {#each character.resources as res}
            {@const pct =
              res.pool_max > 0 ? Math.round((res.pool_current / res.pool_max) * 100) : 0}
            {@const isDepleted = res.pool_current === 0}
            <div class="resource-row" class:resource-row--depleted={isDepleted}>
              <div class="resource-info">
                <span class="resource-name">{res.name.toUpperCase()}</span>
                <span class="resource-reset"
                  >/ {res.reset_on.replace('_', ' ').toUpperCase()} REST</span
                >
              </div>
              <div class="resource-track">
                <div class="resource-bar" style="width: {pct}%"></div>
              </div>
              <span class="resource-count">{res.pool_current}/{res.pool_max}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}

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

  /* ── Resources ──────────────────────────────────────────────── */
  .resources-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .resource-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    padding: 0.625rem 0.75rem;
    border-left: 2px solid var(--cast-amber);
    min-height: 48px;
  }

  .resource-row--depleted {
    border-left-color: transparent;
  }

  .resource-row--depleted .resource-name,
  .resource-row--depleted .resource-count {
    color: var(--cast-text-secondary);
    opacity: 0.6;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .resource-name {
    font-family: var(--cast-font-chrome);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--cast-text-primary);
  }

  .resource-reset {
    font-family: var(--cast-font-chrome);
    font-size: 9px;
    letter-spacing: 0.05em;
    color: var(--cast-text-secondary);
  }

  .resource-track {
    width: 64px;
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .resource-bar {
    height: 100%;
    background: var(--cast-amber);
    transition: width 300ms ease;
    box-shadow: 0 0 8px rgba(200, 148, 74, 0.15);
    animation: cast-breathing-glow 4s ease-in-out infinite;
  }

  @keyframes cast-breathing-glow {
    0%,
    100% {
      opacity: 0.8;
      box-shadow: 0 0 4px rgba(200, 148, 74, 0.1);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 12px rgba(200, 148, 74, 0.3);
    }
  }

  .resource-count {
    font-family: var(--cast-font-data);
    font-size: 12px;
    font-weight: 700;
    color: var(--cast-amber-pale);
    min-width: 2.5rem;
    text-align: right;
  }

  /* Tablet/Desktop optimization */
  @media (min-width: 768px) {
    .home-canvas {
      gap: 2rem;
      padding: 2.5rem 1.5rem;
    }
  }
</style>
