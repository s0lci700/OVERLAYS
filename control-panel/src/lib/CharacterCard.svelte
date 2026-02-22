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
  import { animate, spring } from "animejs";
  import { onMount } from "svelte";
  import { SERVER_URL } from "./socket";

  const FALLBACK_PHOTO_OPTIONS = [
    "/assets/img/barbarian.png",
    "/assets/img/elf.png",
    "/assets/img/wizard.png",
  ];

  function resolvePhotoSrc(photoPath) {
    if (!photoPath) {
      const randomOption =
        FALLBACK_PHOTO_OPTIONS[
          Math.floor(Math.random() * FALLBACK_PHOTO_OPTIONS.length)
        ];
      return `${SERVER_URL}${randomOption}`;
    }

    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("data:") ||
      photoPath.startsWith("blob:")
    ) {
      return photoPath;
    }

    if (photoPath.startsWith("/")) {
      return `${SERVER_URL}${photoPath}`;
    }

    return `${SERVER_URL}/${photoPath.replace(/^\/+/, "")}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Props
  // ──────────────────────────────────────────────────────────────────────────

  /** Character object from server, contains all stats, resources, conditions. */
  let {
    character,
    selectable = false,
    selected = false,
    onToggleSelect = () => {},
  } = $props();

  // ──────────────────────────────────────────────────────────────────────────
  // State Management
  // ──────────────────────────────────────────────────────────────────────────

  /** Amount of HP to apply per damage/heal action (range: 1-999). */
  let amount = $state(5);

  /** Collapsed state for hiding advanced card details. */
  let isCollapsed = $state(false);

  /** Visual collapsed state to sync icon timing with animation. */
  let isVisualCollapsed = $state(false);

  /** Reference to the hit-flash overlay element for damage animation. */
  let hitFlashEl;

  /** Reference to the collapsible body for anime.js height animation. */
  let charBodyEl;

  /** Previous HP value for detecting damage and triggering flash animation. */
  let prevHp = 0;

  // Initialize prevHp on mount to avoid capturing `character` at module evaluation time
  onMount(() => {
    prevHp = character.hp_current;
  });

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
        duration: 700,
        ease: "inOutCubic",
      });

      animate(charBodyEl, {
        opacity: 0,
        duration: 450,
        delay: 150,
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
  // HP & Damage API
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Updates character HP by applying damage or healing.
   * Clamps result between 0 and max HP, sends to server, which broadcasts
   * the change to all clients and enables the damage flash animation.
   *
   * @param {'damage' | 'heal'} type - Whether to subtract or add HP
   */
  async function updateHp(type) {
    let newHp =
      type === "damage"
        ? character.hp_current - amount
        : character.hp_current + amount;
    newHp = Math.max(0, Math.min(newHp, character.hp_max));
    try {
      const response = await fetch(
        `${SERVER_URL}/api/characters/${character.id}/hp`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hp_current: newHp }),
        },
      );
      if (!response.ok) {
        console.error("Failed to update HP", response.status);
        alert("Failed to update HP. Please try again.");
      }
    } catch (error) {
      console.error("Error while updating HP", error);
      alert(
        "An error occurred while updating HP. Please check your connection and try again.",
      );
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Condition Management
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Removes a condition (status effect) from the character.
   * Sends DELETE request to server, which broadcasts removal to all clients.
   *
   * @param {string} conditionId - ID of the condition to remove
   */
  async function removeCondition(conditionId) {
    const response = await fetch(
      `${SERVER_URL}/api/characters/${character.id}/conditions/${conditionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok)
      console.error("Failed to remove condition", response.status);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Resource Management (Spell Slots, Action Economy, etc.)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Toggles a resource pip (spent/unspent).
   * If pip is filled (spent), decrement pool_current; if empty, increment.
   * Sends update to server, which broadcasts to all clients.
   *
   * @param {Object} resource - The resource object (spell slots, etc.)
   * @param {boolean} isFilled - Whether the pip is currently filled (spent)
   */
  async function togglePip(resource, isFilled) {
    const newCurrent = isFilled
      ? resource.pool_current - 1
      : resource.pool_current + 1;
    const response = await fetch(
      `${SERVER_URL}/api/characters/${character.id}/resources/${resource.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pool_current: newCurrent }),
      },
    );
    if (!response.ok)
      console.error("Failed to update resource", response.status);
  }

  /**
   * Triggers a short or long rest, restoring resources per D&D rules.
   * Server resets pools and distributes hit dice as appropriate.
   *
   * @param {'short' | 'long'} type - Whether a short or long rest
   */
  async function takeRest(type) {
    const response = await fetch(
      `${SERVER_URL}/api/characters/${character.id}/rest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      },
    );
    if (!response.ok) console.error("Failed to take rest", response.status);
  }

  function handlePhotoError(event) {
    const imgEl = event.currentTarget;
    if (imgEl.dataset.fallbackApplied === "true") return;
    imgEl.dataset.fallbackApplied = "true";
    imgEl.src = resolvePhotoSrc("");
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

  const photoSrc = $derived(resolvePhotoSrc(character.photo));
</script>

<!-- ────────────────────────────────────────────────────────────────────────
     Character Card UI
     ──────────────────────────────────────────────────────────────────────── -->
<article
  class="char-card card-base"
  data-char-id={character.id}
  class:is-critical={hpPercent <= 30}
  class:collapsed={isVisualCollapsed}
  class:is-selected={selected}
>
  <!-- Damage flash overlay, animated when HP is reduced -->
  <div class="hit-flash" bind:this={hitFlashEl}></div>

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
      onerror={handlePhotoError}
    />
    <div class="char-identity">
      <h2 class="char-name">{character.name}</h2>
      <span class="char-player">{character.player}</span>
      <span class="char-level">
        NIVEL {Number(character.class_primary?.level ?? 1) || 1}
      </span>
    </div>
    <div class="char-header-actions">
      <div class="char-hp-nums">
        <span class="hp-cur" class:critical={hpPercent <= 30}
          >{character.hp_current}</span
        >
        <span class="hp-sep">/</span>
        <span class="hp-max">{character.hp_max}</span>
      </div>

      <button
        class="collapse-toggle"
        type="button"
        aria-expanded={!isCollapsed}
        aria-controls={`char-body-${character.id}`}
        onclick={toggleCollapse}
      >
        <span class="collapse-icon" aria-hidden="true">▾</span>
        <span class="sr-only">{isCollapsed ? "Expandir" : "Colapsar"}</span>
      </button>
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
    bind:this={charBodyEl}
  >
    <!-- Armor Class and Speed (stat block) -->
    <div class="char-stats">
      <div class="stat-item">
        <span class="stat-label">CA</span>
        <span class="stat-value">{character.armor_class}</span>
      </div>
      <span class="stat-divider">|</span>
      <div class="stat-item">
        <span class="stat-label">VEL</span>
        <span class="stat-value">{character.speed_walk}ft</span>
      </div>
    </div>

    <!-- Conditions/status effects (removable with close button) -->
    {#if character.conditions && character.conditions.length > 0}
      <div class="conditions-row">
        {#each character.conditions as condition (condition.id)}
          <button
            class="condition-pill"
            onclick={() => removeCondition(condition.id)}
            >{condition.condition_name} ×</button
          >
        {/each}
      </div>
    {/if}

    <!-- Resource pools (spell slots, action economy, etc.) with pip UI -->
    {#if character.resources && character.resources.length > 0}
      <div class="resources-section">
        {#each character.resources as resource (resource.id)}
          <div class="resource-row">
            <span class="resource-label">{resource.name}</span>
            <!-- Clickable pip buttons for spending/recovering resources -->
            <div class="resource-pips">
              {#each Array(resource.pool_max) as _, i (i)}
                {@const filled = i < resource.pool_current}
                <button
                  class="pip pip--{resource.recharge.toLowerCase()} {filled
                    ? 'pip--filled'
                    : 'pip--empty'}"
                  onclick={() => togglePip(resource, filled)}
                  aria-label="{filled ? 'Gastar' : 'Recuperar'} {resource.name}"
                ></button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      <!-- Short/long rest buttons to restore resources -->
      <fieldset class="rest-buttons">
        <legend class="rest-label">DESCANSOS</legend>
        <button class="btn-base btn-rest" onclick={() => takeRest("short")}
          >CORTO</button
        >
        <button class="btn-base btn-rest" onclick={() => takeRest("long")}
          >LARGO</button
        >
      </fieldset>
    {/if}

    <!-- HP damage/healing controls -->
    <div class="char-controls">
      <button class="btn-base btn-damage" onclick={() => updateHp("damage")}>
        − DAÑO
      </button>

      <!-- Stepper control for adjusting damage/healing amount -->
      <div class="stepper-cluster">
        <button
          class="stepper"
          onclick={() => (amount = Math.max(1, amount - 1))}
          aria-label="Reducir"><span class="stepper-text">−</span></button
        >
        <input
          class="amount-input"
          type="number"
          bind:value={amount}
          min="1"
          max="999"
          aria-label="Cantidad"
        />
        <button
          class="stepper"
          onclick={() => (amount = Math.min(999, amount + 1))}
          aria-label="Aumentar"><span class="stepper-text">+</span></button
        >
      </div>

      <button class="btn-base btn-heal" onclick={() => updateHp("heal")}>
        + CURAR
      </button>
    </div>
  </div>
</article>
