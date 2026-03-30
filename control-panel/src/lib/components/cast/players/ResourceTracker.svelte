<script lang="ts">
  import type { CharacterRecord, ResourceSlot } from '$lib/contracts/records';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';

  let {
    character,
    readonly = true
  }: {
    character: CharacterRecord;
    readonly?: boolean;
  } = $props();

  const parsedResources = $derived.by(() => {
    const spellSlots: { level: number; slot: ResourceSlot }[] = [];
    const other: ResourceSlot[] = [];

    const spellRegex = /(?:nv\.?\s*|level\s*)(\d)/i;

    for (const res of character?.resources || []) {
      const match = res.name.match(spellRegex);
      if (match && /slot|nv/i.test(res.name)) {
        spellSlots.push({ level: parseInt(match[1], 10), slot: res });
      } else {
        other.push(res);
      }
    }

    spellSlots.sort((a, b) => a.level - b.level);

    return { spellSlots, other };
  });

  function getOrdinal(n: number) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function getShapeForLevel(level: number) {
    if (level === 1) return 'polygon(50% 0%, 0% 100%, 100% 100%)';
    if (level === 2) return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    // L3 and above default to Hexagon
    return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  }
</script>

<div class="resource-tracker">
  {#if !character?.resources || character.resources.length === 0}
    <p class="empty-state">No resources tracked</p>
  {:else}
    <!-- Other Resources -->
    {#if parsedResources.other.length > 0}
      <section class="resources-section">
        <CastSectionHeader title="RESOURCES" meta="{parsedResources.other.length} TRACKED" />
        <div class="resources-list">
          {#each parsedResources.other as res (res.id)}
            {@const pct = res.pool_max > 0 ? Math.round((res.pool_current / res.pool_max) * 100) : 0}
            {@const isDepleted = res.pool_current === 0}
            <div class="resource-row" class:resource-row--depleted={isDepleted}>
              <div class="resource-info">
                <span class="resource-name">{res.name.toUpperCase()}</span>
                <span class="resource-reset">/ {res.reset_on.replace('_', ' ').toUpperCase()} REST</span>
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

    <!-- Spell Slots -->
    {#if parsedResources.spellSlots.length > 0}
      <section class="resources-section spell-slots-section">
        <CastSectionHeader title="SPELL SLOTS" meta="{parsedResources.spellSlots.length} LEVELS" />
        <div class="resources-list">
          {#each parsedResources.spellSlots as { level, slot } (slot.id)}
            {@const isDepleted = slot.pool_current === 0}
            <div class="resource-row spell-row" class:resource-row--depleted={isDepleted}>
              <div class="resource-info">
                <span class="resource-name">{getOrdinal(level).toUpperCase()} LEVEL</span>
                <span class="resource-reset">/ {slot.reset_on.replace('_', ' ').toUpperCase()} REST</span>
              </div>
              
              <div class="spell-pips">
                {#each Array(slot.pool_max) as _, i}
                  {@const isFilled = i < slot.pool_current}
                  <div 
                    class="spell-pip" 
                    class:spell-pip--filled={isFilled}
                    style="clip-path: {getShapeForLevel(level)};"
                  ></div>
                {/each}
              </div>
              
              <span class="resource-count">{slot.pool_current}/{slot.pool_max}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .resource-tracker {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .empty-state {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 12px;
    color: var(--cast-text-secondary, #bac9cc);
    letter-spacing: 0.1em;
    text-align: center;
    padding: 2rem 0;
  }

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
    backdrop-filter: blur(var(--cast-blur, 40px));
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.625rem 0.75rem;
    border-left: 2px solid var(--cast-amber, #C8944A);
    min-height: 48px;
    transition: border-color 0.3s ease;
  }

  .resource-row--depleted {
    border-left-color: transparent;
  }

  .resource-row--depleted .resource-name,
  .resource-row--depleted .resource-count {
    color: var(--cast-text-secondary, #bac9cc);
    opacity: 0.6;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .resource-name {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--cast-text-primary, #f0f0f0);
  }

  .resource-reset {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 9px;
    letter-spacing: 0.05em;
    color: var(--cast-text-secondary, #bac9cc);
  }

  .resource-track {
    width: 64px;
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .resource-bar {
    height: 100%;
    background: var(--cast-amber, #C8944A);
    transition: width 300ms ease;
    box-shadow: 0 0 8px rgba(200, 148, 74, 0.15);
  }
  
  /* Luminous economy: avoid glowing aggressively unless it's live update, but keep the amber hue */

  .resource-count {
    font-family: var(--cast-font-data, 'JetBrains Mono');
    font-size: 12px;
    font-weight: 700;
    color: var(--cast-amber-pale, #E8B060);
    min-width: 2.5rem;
    text-align: right;
  }

  /* ── Spell Slots ────────────────────────────────────────────── */
  
  .spell-row {
    grid-template-columns: 1fr auto auto;
  }

  .spell-pips {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
  }

  .spell-pip {
    width: 14px;
    height: 14px;
    background: transparent;
    border: 1px solid rgba(200, 148, 74, 0.4);
    /* Hollow state */
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .spell-pip--filled {
    background: var(--cast-cyan, #00E5FF);
    border: none;
    box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
    animation: breathing-glow 3s ease-in-out infinite;
  }

  @keyframes breathing-glow {
    0%, 100% {
      opacity: 0.9;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }
</style>
