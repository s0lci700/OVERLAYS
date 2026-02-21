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
  import { animate } from "animejs";
  import { onMount } from "svelte";
  import { serverPort } from "./socket";

  // ──────────────────────────────────────────────────────────────────────────
  // Props
  // ──────────────────────────────────────────────────────────────────────────

  /** Character object from server, contains all stats, resources, conditions. */
  let { character } = $props();

  // ──────────────────────────────────────────────────────────────────────────
  // State Management
  // ──────────────────────────────────────────────────────────────────────────

  /** Amount of HP to apply per damage/heal action (range: 1-999). */
  let amount = $state(5);

  /** Reference to the hit-flash overlay element for damage animation. */
  let hitFlashEl;

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
      animate(hitFlashEl, { opacity: 0, duration: 700, ease: "outCubic" });
    }
    prevHp = hp;
  });

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
    const response = await fetch(
      `${serverPort}/api/characters/${character.id}/hp`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hp_current: newHp }),
      },
    );
    if (!response.ok) console.error("Failed to update HP", response.status);
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
      `${serverPort}/api/characters/${character.id}/conditions/${conditionId}`,
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
      `${serverPort}/api/characters/${character.id}/resources/${resource.id}`,
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
      `${serverPort}/api/characters/${character.id}/rest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      },
    );
    if (!response.ok) console.error("Failed to take rest", response.status);
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
</script>

<!-- ────────────────────────────────────────────────────────────────────────
     Character Card UI
     ──────────────────────────────────────────────────────────────────────── -->
<article
  class="char-card card-base"
  data-char-id={character.id}
  class:is-critical={hpPercent <= 30}
>
  <!-- Damage flash overlay, animated when HP is reduced -->
  <div class="hit-flash" bind:this={hitFlashEl}></div>

  <!-- Character name, player name, and current/max HP display -->
  <div class="char-header">
    <div class="char-identity">
      <h2 class="char-name">{character.name}</h2>
      <span class="char-player">{character.player}</span>
    </div>
    <div class="char-hp-nums">
      <span class="hp-cur" class:critical={hpPercent <= 30}
        >{character.hp_current}</span
      >
      <span class="hp-sep">/</span>
      <span class="hp-max">{character.hp_max}</span>
    </div>
  </div>

  <!-- HP progress bar with dynamic color (healthy/injured/critical) -->
  <div
    class="hp-track"
    role="progressbar"
    aria-valuenow={character.hp_current}
    aria-valuemax={character.hp_max}
    aria-label="Puntos de vida"
  >
    <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
  </div>

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
            {#each Array(resource.pool_max) as _, i}
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
    <div class="rest-buttons">
      <button class="btn-base btn-rest" onclick={() => takeRest("short")}
        >CORTO</button
      >
      <button class="btn-base btn-rest" onclick={() => takeRest("long")}
        >LARGO</button
      >
    </div>
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
        aria-label="Reducir">−</button
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
        aria-label="Aumentar">+</button
      >
    </div>

    <button class="btn-base btn-heal" onclick={() => updateHp("heal")}>
      + CURAR
    </button>
  </div>
</article>
