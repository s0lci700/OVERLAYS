<!--
  StripCard
  =========
  Compact expandable character card for the left strip.
  Shows photo, name, HP bar, and condition dots in compact mode.
  Expands to reveal DMG/HEAL controls and full condition management.
-->
<script lang="ts">
  import './StripCard.css';
  import type { CharacterRecord } from '$lib/contracts/records';
  import { HP_THRESHOLDS } from '$lib/contracts/stage.js';
  import { mutateHp, addCondition, removeCondition } from '$lib/derived/stage.svelte';
  import { resolvePhotoSrc } from '$lib/services/utils.js';
  import { SERVER_URL } from '$lib/services/socket.svelte.js';
  import dwarfFallback from '$lib/assets/img/dwarf.webp';
  import { Stepper } from '$lib/components/shared/stepper/index';
  import { ConditionPill } from '$lib/components/shared/condition-pill/index';
  import ConditionDot from './ConditionDot.svelte';
  import ConditionPopover from './ConditionPopover.svelte';
  import { animate } from 'animejs';
  import { onMount } from 'svelte';

  let {
    character,
    isExpanded = false,
    onExpandRequest,
  }: {
    character: CharacterRecord;
    isExpanded?: boolean;
    onExpandRequest: (id: string) => void;
  } = $props();

  let amount = $state(1);
  let showConditionPopover = $state(false);
  let hitFlashEl: HTMLElement | undefined;
  let critFlashEl: HTMLElement | undefined;
  let cardEl: HTMLElement | undefined;
  let prevHp = 0;

  onMount(() => {
    prevHp = character.hp_current;
  });

  $effect(() => {
    const hp = character.hp_current;
    const delta = hp - prevHp;
    const isDmg = delta < 0;
    const isHeal = delta > 0;

    if (isDmg && hitFlashEl) {
      // Regular hit flash
      hitFlashEl.style.opacity = '0.5';
      animate(hitFlashEl, { opacity: 0, duration: 900, ease: 'outCubic' });

      // Critical Damage (>30% max HP)
      if (Math.abs(delta) >= character.hp_max * 0.3) {
        if (cardEl) {
          cardEl.classList.add('shake');
          setTimeout(() => cardEl?.classList.remove('shake'), 300);
        }
        if (critFlashEl) {
          critFlashEl.className = 'critical-flash critical-flash--dmg';
          animate(critFlashEl, { opacity: [0, 0.8, 0], duration: 1200, ease: 'outExpo' });
        }
      }
    }

    if (isHeal && hp === character.hp_max && critFlashEl) {
      // Critical Heal (Restored to Full)
      critFlashEl.className = 'critical-flash critical-flash--heal';
      animate(critFlashEl, { opacity: [0, 0.6, 0], duration: 1500, ease: 'outExpo' });
    }

    prevHp = hp;
  });

  const hpPercent = $derived(character.hp_current / character.hp_max);
  const hpClass = $derived(
    hpPercent * 100 > HP_THRESHOLDS.HEALTHY
      ? 'hp--healthy'
      : hpPercent * 100 > HP_THRESHOLDS.INJURED
        ? 'hp--injured'
        : 'hp--critical'
  );

  const isCritical = $derived(hpPercent * 100 <= HP_THRESHOLDS.INJURED);
  const isDead = $derived(character.hp_current <= 0);

  const photoSrc = $derived(resolvePhotoSrc(character.portrait, SERVER_URL) ?? dwarfFallback);
</script>

<article
  bind:this={cardEl}
  class="strip-card"
  class:is-expanded={isExpanded}
  class:is-critical={isCritical}
  class:is-dead={isDead}
  data-char-id={character.id}
>
  <!-- Flash overlays -->
  <div class="hit-flash" bind:this={hitFlashEl}></div>
  <div class="critical-flash" bind:this={critFlashEl}></div>

  {#if isDead}
    <div class="death-marker" title="Inconsciente / Muerto">💀</div>
  {/if}

  <!-- Compact row -->
  <div class="strip-card__compact">
    <img 
      src={photoSrc} 
      alt={character.name} 
      class="strip-card__photo" 
      loading="lazy" 
      decoding="async"
    />
    <div class="strip-card__identity">
      <span class="strip-card__name">{character.name}</span>
      <div class="strip-card__hp-nums">
        <span class="hp-cur" class:is-critical={isCritical}>{character.hp_current}</span>
        <span class="hp-sep">/</span>
        <span class="hp-max">{character.hp_max}</span>
      </div>
    </div>
    <button
      class="strip-card__expand-btn"
      onclick={() => onExpandRequest(character.id)}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
    >
      {isExpanded ? '▴' : '▾'}
    </button>
  </div>

  <!-- HP bar (always visible) -->
  <div
    class="hp-track"
    role="progressbar"
    aria-valuenow={character.hp_current}
    aria-valuemax={character.hp_max}
    aria-label="Puntos de vida"
  >
    <div class="hp-ghost" style="transform: scaleX({hpPercent})"></div>
    <div class="hp-fill {hpClass}" style="transform: scaleX({hpPercent})"></div>
  </div>

  <!-- Condition dots (compact, hidden when expanded) -->
  {#if !isExpanded && (character.conditions?.length ?? 0) > 0}
    <div class="strip-card__dots">
      {#each (character.conditions ?? []).slice(0, 8) as condition (condition.id)}
        <ConditionDot {condition} />
      {/each}
      {#if (character.conditions?.length ?? 0) > 8}
        <span class="dots-overflow">+{(character.conditions?.length ?? 0) - 8}</span>
      {/if}
    </div>
  {/if}

  <!-- Expanded section -->
  {#if isExpanded}
    <div class="strip-card__expanded">
      <hr class="strip-card__divider" />

      <!-- DMG / HEAL controls -->
      <div class="strip-card__controls">
        <button 
          class="btn-dmg" 
          onclick={() => mutateHp(character.id, { delta: -amount })}
          aria-label={`Aplicar ${amount} de daño a ${character.name}`}
        >
          DAÑO
        </button>
        <Stepper bind:value={amount} min={1} max={999} size="sm" />
        <button 
          class="btn-heal" 
          onclick={() => mutateHp(character.id, { delta: amount })}
          aria-label={`Aplicar ${amount} de sanación a ${character.name}`}
        >
          CURAR
        </button>
      </div>

      <!-- Conditions -->
      <div class="strip-card__conditions">
        {#each character.conditions ?? [] as condition (condition.id)}
          <ConditionPill
            label={condition.condition_name}
            variant="condition"
            interactive
            onRemove={() => removeCondition(character.id, condition.id)}
          />
        {/each}
        <div class="condition-add-wrapper">
          <button
            class="btn-add-condition"
            onclick={() => (showConditionPopover = !showConditionPopover)}
          >
            + condición
          </button>
          {#if showConditionPopover}
            <ConditionPopover
              characterId={character.id}
              onSelect={(conditionName) => {
                addCondition(character.id, conditionName);
                showConditionPopover = false;
              }}
              onClose={() => (showConditionPopover = false)}
            />
          {/if}
        </div>
      </div>
    </div>
  {/if}
</article>
