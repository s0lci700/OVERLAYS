<!--
  CharacterCard Component
  =======================
  Displays and manages a single D&D character's vital stats and resources.
  
  Features:
  - Real-time HP tracking with damage flash animation
  - Visual HP bar with color thresholds (healthy/injured/critical)
  - Armor Class and movement speed display
  - Condition management (add/remove status effects)
  - Resource pool management (spell slots, action economy, etc.)
  - Short/long rest functionality
  - Damage/healing controls with adjustable amounts
  - Broadcasts all changes to server which syncs across clients
  
  The component is a controlled component—all state updates go through
  the server API and arrive back via Socket.io, ensuring true sync.
-->
<script>
  import "./CharacterCard.css";
  import LevelPill from "$lib/components/ui/pills/LevelPill.svelte";
  import CardActions from "./CardActions.svelte";

  import { StatDisplay } from "$lib/components/ui/stat-display/index.js";

  import { resolvePhotoSrc } from "$lib/utils.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  import { animate } from "animejs";
  // Helper wrapper to keep existing animate(element, options) usage.
  // const animate = (el, opts) => anime(Object.assign({ targets: el }, opts));
  // Lightweight spring helper that returns an anime easing string.
  const spring = (_opts = {}) => "spring(1, 80, 10, 0)";
  import { onMount } from "svelte";
  import { SERVER_URL } from "$lib/stores/socket";

  // ──────────────────────────────────────────────────────────────────────────
  // Props
  // ──────────────────────────────────────────────────────────────────────────
  // Props
  let {
    character,
    selectable = false,
    selected = false,
    onToggleSelect = () => {},
    prevHp: _prevHp = undefined, // Accept prevHp as a prop for external control (e.g., from parent component)
  } = $props();

  /** Previous HP value for detecting damage and triggering flash animation. */
  let prevHp = 0;

  // Initialize prevHp on mount to avoid capturing `character` at module evaluation time

  onMount(() => {
    prevHp = character.hp_current;
  });

  let cardError = $state("");
  /** Collapsed state for hiding advanced card details. */
  let isCollapsed = $state(false);

  /** Visual collapsed state to sync icon timing with animation. */
  let isVisualCollapsed = $state(false);

  /** Reference to the hit-flash overlay element for damage animation. */
  let hitFlashEl;

  /** Reference to the collapsible body for anime.js height animation. */
  let charBodyEl;

  // ──────────────────────────────────────────────────────────────────────────
  // Reactive Effects
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Watches for HP changes and triggers a flash animation when damage is taken.
   * Compares current HP to previous value—if it decreased, plays a fade-out
   * overlay animation to visually indicate damage.
   */
  $effect(() => {
    const hp = character.hp_current;
    if (hp < prevHp && hitFlashEl) {
      hitFlashEl.style.opacity = "0.5";
      animate(hitFlashEl, { opacity: 0, duration: 900, ease: "outCubic" });
    }
    prevHp = hp;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Collapse Animation
  // ──────────────────────────────────────────────────────────────────────────

  function toggleCollapse() {
    if (!charBodyEl) {
      isCollapsed = !isCollapsed;
      isVisualCollapsed = isCollapsed;
      return;
    }

    // Collapse: animate from current height to 0 with a fade-out.
    if (!isCollapsed) {
      const startHeight = charBodyEl.scrollHeight;
      charBodyEl.style.height = `${startHeight}px`;
      charBodyEl.style.opacity = "1";
      charBodyEl.style.overflow = "hidden";
      isCollapsed = true;

      animate(charBodyEl, {
        height: 0,
        duration: 400,
        ease: "inOutCubic",
      });

      animate(charBodyEl, {
        opacity: 0,
        duration: 300,
        delay: 80,
        ease: "linear",
        complete: () => {
          charBodyEl.style.display = "none";
          charBodyEl.style.height = "";
          charBodyEl.style.opacity = "";
          charBodyEl.style.overflow = "";
          isVisualCollapsed = true;
        },
      });
      return;
    }

    // Expand: reveal element, then animate from 0 to scrollHeight with a fade-in.
    charBodyEl.style.display = "block";
    const targetHeight = charBodyEl.scrollHeight;
    charBodyEl.style.height = "0px";
    charBodyEl.style.opacity = "0";
    charBodyEl.style.overflow = "hidden";
    isCollapsed = false;

    animate(charBodyEl, {
      height: targetHeight,
      opacity: 1,
      duration: 250,
      ease: spring({
        bounce: 0.3,
        duration: 300,
      }),
      complete: () => {
        charBodyEl.style.height = "";
        charBodyEl.style.opacity = "";
        charBodyEl.style.overflow = "";
        isVisualCollapsed = false;
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Derived Reactive State
  // ──────────────────────────────────────────────────────────────────────────

  /** Percentage of max HP remaining (0–100). Used for HP bar width and styling. */
  const hpPercent = $derived((character.hp_current / character.hp_max) * 100);

  /** CSS class name for HP bar color based on health threshold (healthy/injured/critical). */
  const hpClass = $derived(
    hpPercent > 60
      ? "hp--healthy"
      : hpPercent > 30
        ? "hp--injured"
        : "hp--critical",
  );

  const photoSrc = $derived(
    resolvePhotoSrc(character.photo, SERVER_URL, character.id),
  );
</script>

<!-- ────────────────────────────────────────────────────────────────────────
     Character Card UI
<-- ──────────────────────────────────────────────────────────────────────── -->
<article
  class="char-card card-base"
  data-char-id={character.id}
  class:is-critical={hpPercent <= 30}
  class:collapsed={isVisualCollapsed}
  class:is-selected={selected}
>
  <!-- Damage flash overlay, animated when HP is reduced -->
  <div class="hit-flash" bind:this={hitFlashEl}></div>

  <!-- Inline error toast (replaces window.alert) -->
  {#if cardError}
    <div class="card-toast" role="alert">
      <span class="card-toast-msg">{cardError}</span>
      <button
        class="card-toast-close"
        onclick={() => (cardError = "")}
        aria-label="Cerrar">&times;</button
      >
    </div>
  {/if}

  <!-- Character name, player name, and current/max HP display -->
  <div class="char-header">
    {#if selectable}
      <label class="char-select">
        <input
          class="char-select-input"
          type="checkbox"
          checked={selected}
          onchange={() => onToggleSelect(character.id)}
          aria-label={`Seleccionar ${character.name}`}
        />
        <span class="char-select-box" aria-hidden="true"></span>
      </label>
    {/if}
    <!-- Character photo -->
    <img
      src={photoSrc}
      alt={character.name}
      class="char-photo"
      loading="lazy"
    />
    <div class="char-identity">
      <h2 class="char-name">{character.name}</h2>
      <span class="char-player">{character.player}</span>
      <LevelPill level={character.class_primary?.level} />
    </div>
    <div class="char-header-actions">
      <button
        class="collapse-toggle"
        type="button"
        aria-expanded={!isCollapsed}
        aria-controls={`char-body-${character.id}`}
        data-state={isCollapsed ? "closed" : "open"}
        onclick={toggleCollapse}
      >
        <span class="collapse-icon" aria-hidden="true">▾</span>
        <span class="sr-only">{isCollapsed ? "Expandir" : "Colapsar"}</span>
      </button>

      <div class="char-hp-nums">
        <span class="hp-cur" class:is-critical={hpPercent <= 30}
          >{character.hp_current}</span
        >
        <span class="hp-sep">/</span>
        <span class="hp-max">{character.hp_max}</span>
      </div>
    </div>
  </div>

  <!-- HP progress bar with dynamic color (healthy/injured/critical) -->
  <!-- Always visible, even when card is collapsed -->
  <div
    class="hp-track"
    role="progressbar"
    aria-valuenow={character.hp_current}
    aria-valuemax={character.hp_max}
    aria-label="Puntos de vida"
  >
    <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
  </div>

  <div
    class="char-body"
    id={`char-body-${character.id}`}
    data-state={isVisualCollapsed ? "closed" : "open"}
    bind:this={charBodyEl}
  >
    <!-- Armor Class and Speed (stat block) -->
    <Tooltip.Provider delayDuration={300}>
      <div class="char-stats">
        <Tooltip.Root>
          <Tooltip.Trigger>
            <StatDisplay
              class="stat-display--ca"
              label="CA"
              value={character.armor_class}
              variant="inline"
            />
          </Tooltip.Trigger>
          <Tooltip.Content class="help">Clase de Armadura</Tooltip.Content>
        </Tooltip.Root>
        <span class="stat-divider">|</span>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <StatDisplay
              class="stat-display--vel"
              label="VEL"
              value="{character.speed_walk}ft"
              variant="inline"
            />
          </Tooltip.Trigger>
          <Tooltip.Content class="help">Velocidad de movimiento</Tooltip.Content
          >
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
    <div>
      <CardActions {character} {selectable} {selected} {onToggleSelect} />
    </div>
  </div>
</article>
