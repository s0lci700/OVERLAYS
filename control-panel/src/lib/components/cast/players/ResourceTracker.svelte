<script lang="ts">
  import type { CharacterRecord, ResourceSlot } from '$lib/contracts/records';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import * as Tooltip from '$lib/components/shared/tooltip/index';
  import { RESET_TOOLTIPS } from '$lib/data/tooltips';

  let {
    character,
    readonly = true
  }: {
    character: CharacterRecord;
    readonly?: boolean;
  } = $props();

  const MAX_VISIBLE_PIPS = 6;

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
    return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  }
</script>

<Tooltip.Provider delayDuration={300}>
<div class="resource-tracker">
  {#if !character?.resources || character.resources.length === 0}
    <p class="empty-state">No resources tracked</p>
  {:else}
    <!-- Other Resources -->
    {#if parsedResources.other.length > 0}
      <section class="resources-section" aria-label="Resources">
        <CastSectionHeader title="RESOURCES" meta="{parsedResources.other.length} TRACKED" />
        <div class="resources-list">
          {#each parsedResources.other as res (res.id)}
            {@const scale = res.pool_max > 0 ? res.pool_current / res.pool_max : 0}
            {@const isDepleted = res.pool_current === 0}
            <div class="resource-row" class:resource-row--depleted={isDepleted}>
              <div class="resource-info">
                <!-- Keep semantic casing; text-transform: uppercase in CSS -->
                <span class="resource-name">{res.name}</span>
                <Tooltip.Root>
                  <Tooltip.Trigger class="reset-trigger">
                    <span class="resource-reset">/ {res.reset_on.replace('_', ' ')} rest</span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    class="!bg-[#1b1b23] !text-[#f0f0f0] !rounded-none border border-[rgba(255,255,255,0.08)] !px-3 !py-2"
                  >
                    <p class="tip-desc">{RESET_TOOLTIPS[res.reset_on] ?? res.reset_on}</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
              <div class="resource-track" role="presentation">
                <div class="resource-bar" style="transform: scaleX({scale});"></div>
              </div>
              <span class="resource-count" aria-label="{res.pool_current} of {res.pool_max}">{res.pool_current}/{res.pool_max}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Spell Slots -->
    {#if parsedResources.spellSlots.length > 0}
      <section class="resources-section spell-slots-section" aria-label="Spell Slots">
        <CastSectionHeader title="SPELL SLOTS" meta="{parsedResources.spellSlots.length} LEVELS" />
        <div class="resources-list">
          {#each parsedResources.spellSlots as { level, slot } (slot.id)}
            {@const isDepleted = slot.pool_current === 0}
            {@const visiblePips = Math.min(slot.pool_max, MAX_VISIBLE_PIPS)}
            {@const overflow = slot.pool_max > MAX_VISIBLE_PIPS ? slot.pool_max - MAX_VISIBLE_PIPS : 0}
            <div class="resource-row spell-row" class:resource-row--depleted={isDepleted}>
              <div class="resource-info">
                <span class="resource-name">{getOrdinal(level)} level</span>
                <Tooltip.Root>
                  <Tooltip.Trigger class="reset-trigger">
                    <span class="resource-reset">/ {slot.reset_on.replace('_', ' ')} rest</span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    class="!bg-[#1b1b23] !text-[#f0f0f0] !rounded-none border border-[rgba(255,255,255,0.08)] !px-3 !py-2"
                  >
                    <p class="tip-desc">{RESET_TOOLTIPS[slot.reset_on] ?? slot.reset_on}</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>

              <Tooltip.Root>
              <Tooltip.Trigger class="spell-pips-trigger">
              <div
                class="spell-pips"
                role="img"
                aria-label="{getOrdinal(level)} level spell slots: {slot.pool_current} of {slot.pool_max} remaining"
              >
                {#each Array(visiblePips) as _, i (i)}
                  {@const isFilled = i < slot.pool_current}
                  <div
                    class="spell-pip"
                    class:spell-pip--filled={isFilled}
                    style="clip-path: {getShapeForLevel(level)};"
                    aria-hidden="true"
                  ></div>
                {/each}
                {#if overflow > 0}
                  <span class="pip-overflow" aria-hidden="true">+{overflow}</span>
                {/if}
              </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                class="!bg-[#1b1b23] !text-[#f0f0f0] !rounded-none border border-[rgba(255,255,255,0.08)] !px-3 !py-2"
              >
                <p class="tip-desc">▲ Nv.1 &nbsp;◆ Nv.2 &nbsp;⬡ Nv.3+</p>
              </Tooltip.Content>
              </Tooltip.Root>

              <span class="resource-count" aria-hidden="true">{slot.pool_current}/{slot.pool_max}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>
</Tooltip.Provider>

<style>
  .resource-tracker {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    container-type: inline-size;
  }

  .empty-state {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 12px;
    color: var(--cast-text-secondary, #bac9cc);
    letter-spacing: 0.1em;
    text-align: center;
    padding: 2rem 0;
  }

  /* Single blur layer per section — not per row */

  .resources-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: var(--cast-border-subtle);
  }

  .resource-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--cast-border-subtle, rgba(255, 255, 255, 0.05));
    padding: 0.625rem 0.75rem;
    border-left: 2px solid var(--cast-amber, #C8944A);
    min-height: 48px;
    transition: border-color 0.3s ease;
    overflow: hidden;
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
    min-width: 0;
  }

  .resource-name {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--cast-text-primary, #f0f0f0);
    text-transform: uppercase;       /* screen readers see semantic casing */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .resource-reset {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 9px;
    letter-spacing: 0.05em;
    color: var(--cast-text-secondary, #bac9cc);
    text-transform: uppercase;
  }

  /* Bar: scaleX() instead of width — no layout recalc per frame */
  .resource-track {
    width: 64px;
    height: 6px;
    background: var(--cast-border-subtle, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--cast-border-subtle, rgba(255, 255, 255, 0.05));
    overflow: hidden;
    flex-shrink: 0;
  }

  .resource-bar {
    height: 100%;
    width: 100%;
    background: var(--cast-amber, #C8944A);
    transform-origin: left center;
    transition: transform 300ms ease;
    box-shadow: 0 0 8px var(--cast-amber-glow, rgba(200, 148, 74, 0.15));
  }

  .resource-count {
    font-family: var(--cast-font-data, 'JetBrains Mono');
    font-size: 12px;
    font-weight: 700;
    color: var(--cast-amber-pale, #E8B060);
    min-width: 2.5rem;
    text-align: right;
    flex-shrink: 0;
  }

  /* ── Spell Slots ────────────────────────────────────────────── */

  .spell-pips {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
    overflow: hidden;
  }

  .spell-pip {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    background: var(--cast-border-subtle, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--cast-amber-glow, rgba(200, 148, 74, 0.4));
    /* No animation at idle — luminous economy */
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }

  .spell-pip--filled {
    background: var(--cast-cyan, #00E5FF);
    border: none;
    box-shadow: 0 0 8px var(--cast-cyan-glow, rgba(0, 229, 255, 0.4));
    /* breathing-glow removed: animate only on socket state-change via JS class */
  }

  .pip-overflow {
    font-family: var(--cast-font-chrome, 'Space Grotesk');
    font-size: 10px;
    font-weight: 700;
    color: var(--cast-text-secondary, #bac9cc);
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  /* ── Tooltip trigger resets ─────────────────────────────────── */

  :global(.reset-trigger) {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: default;
    font: inherit;
    color: inherit;
    display: block;
    text-align: left;
  }

  :global(.spell-pips-trigger) {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: default;
    display: flex;
    align-items: center;
  }

  /* ── Responsive ─────────────────────────────────────────────── */

  /* Narrow panels (e.g. portrait phone, sidebar widget):
     - Regular rows: hide redundant bar, keep info | count
     - Spell rows: pips wrap to second line below info */
  @container (max-width: 400px) {
    .resource-row {
      grid-template-columns: 1fr auto;
    }

    .resource-track {
      display: none;
    }

    .spell-row {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      row-gap: 0.4rem;
    }

    .spell-row .spell-pips {
      grid-column: 1;
      grid-row: 2;
      justify-content: flex-start;
    }

    .spell-row .resource-count {
      grid-column: 2;
      grid-row: 2;
      align-self: center;
    }
  }

  /* Wide panels (desktop stage view or tablet landscape):
     info column gets more breathing room */
  @container (min-width: 600px) {
    .resource-row {
      gap: 1.25rem;
    }

    .resource-track {
      width: 96px;
    }
  }
</style>
