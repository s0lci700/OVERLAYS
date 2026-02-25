<!--
  DiceRoller Component
  ====================
  Mobile-first D&D dice roller interface for the control panel.
  
  Features:
  - Select active character for rolls
  - Apply modifiers to rolls
  - Roll d4, d6, d8, d10, d12, and d20 dice
  - Display results with visual feedback (critical/fail states)
  - Broadcast rolls to server via REST API
  - Sync with all connected clients via Socket.io
  - Smooth elastic bounce animation on roll results
  
  The component sends roll data to the server, which broadcasts it
  to OBS overlays and other connected clients in real-time.
-->
<script>
  import "./DiceRoller.css";
  import { characters, SERVER_URL, lastRoll } from "./socket";
  import { get } from "svelte/store";
  import { animate } from "animejs";
  // Keep existing animate(element, options) callsites working.
  // const animate = (el, opts) => anime(Object.assign({ targets: el }, opts));
  import { tick } from "svelte";

  // ═══════════════════════════════════════════════════════════════
  // State Management
  // ═══════════════════════════════════════════════════════════════

  /** Currently selected character ID from the dropdown. Defaults to first character. */
  let selectedCharId = $state(get(characters)[0]?.id);

  /** Modifier to apply to all rolls (range: -20 to +20). */
  let modifier = $state(0);

  const MIN_MODIFIER = -20;
  const MAX_MODIFIER = 20;
  const HOLD_DELAY_MS = 250;
  const HOLD_INTERVAL_MS = 80;

  let holdTimeoutId = null;
  let holdIntervalId = null;

  /** Stores the current anime.js animation instance to allow cancellation on rapid rolls. */
  let lastAnimation = null;

  // ═══════════════════════════════════════════════════════════════
  // Utility Functions
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generates a random dice roll result.
   * @param {number} diceType - Number of sides on the die (e.g., 20 for d20)
   * @returns {number} Random result between 1 and diceType (inclusive)
   */
  function roll(diceType) {
    return Math.floor(Math.random() * diceType) + 1;
  }

  function clampModifier(value) {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      modifier = 0;
      return;
    }
    modifier = Math.max(MIN_MODIFIER, Math.min(MAX_MODIFIER, parsedValue));
  }

  function incrementModifier() {
    modifier = Math.min(MAX_MODIFIER, modifier + 1);
  }

  function decrementModifier() {
    modifier = Math.max(MIN_MODIFIER, modifier - 1);
  }

  function clearHold() {
    if (holdTimeoutId) {
      clearTimeout(holdTimeoutId);
      holdTimeoutId = null;
    }
    if (holdIntervalId) {
      clearInterval(holdIntervalId);
      holdIntervalId = null;
    }
  }

  function startHold(action) {
    clearHold();
    action();
    holdTimeoutId = setTimeout(() => {
      holdIntervalId = setInterval(action, HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
  }

  /**
   * Handles dice roll: generates result, sends to server, and broadcasts to all clients.
   * Server responds with computed rollResult (result + modifier) which updates the
   * lastRoll store and triggers the animation effect.
   * @param {number} diceType - Number of sides on the die
   */
  async function rollDice(diceType) {
    if (navigator.vibrate) navigator.vibrate(50);
    let rollValue = roll(diceType);

    const payload = {
      charId: selectedCharId,
      result: rollValue,
      modifier: modifier,
      sides: diceType,
    };
    console.log("Sending payload:", payload);

    const response = await fetch(`${SERVER_URL}/api/rolls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charId: selectedCharId,
        result: rollValue,
        modifier: modifier,
        sides: diceType,
      }),
    });
    if (!response.ok) {
      console.error("Failed to log roll", response.status);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Derived Reactive State
  // ═══════════════════════════════════════════════════════════════

  /** True if last roll was a natural 20. Used for critical styling/visual feedback. */
  const isCrit = $derived($lastRoll?.result === 20 && $lastRoll?.sides === 20);

  /** True if last roll natural result was 1. Used for failure styling/visual feedback. */
  const isFail = $derived($lastRoll?.result === 1);

  // ═══════════════════════════════════════════════════════════════
  // Animation Logic
  // ═══════════════════════════════════════════════════════════════

  /**
   * Animates the dice result container sliding in and the number bouncing with elastic effect.
   * Cancels any in-flight animation to prevent scale accumulation on rapid clicks.
   *
   * Animation Timeline:
   * - Result container: fade in + slide up (200ms)
   * - Number: elastic bounce scale 0.3→1 (450ms, delayed 70ms)
   *
   * @param {HTMLElement} resultElement - The .roll-result container
   * @param {HTMLElement|null} numberElement - The .roll-number display
   */
  function diceAnimation(resultElement, numberElement) {
    // Cancel any in-flight animations to prevent overlapping scale effects
    if (lastAnimation) {
      lastAnimation.pause();
    }

    // Reset element styles to baseline state before starting new animation
    // This prevents scale from accumulating when rolling rapidly
    if (numberElement) {
      numberElement.style.transform = "scale(1)";
    }
    resultElement.style.opacity = "0";
    resultElement.style.transform = "translateY(12px)";

    // Animate result container sliding in from below
    animate(resultElement, {
      opacity: 1,
      translateY: { from: 12 },
      duration: 200,
      ease: "outCubic",
    });

    // Animate number with elastic bounce effect
    if (numberElement) {
      lastAnimation = animate(numberElement, {
        scale: { from: 0.3 },
        duration: 450,
        delay: 70,
        ease: "outElastic(1, .6)",
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Reactive Effects
  // ═══════════════════════════════════════════════════════════════

  /**
   * Watches for new rolls from the server and triggers the animation effect.
   * Uses tick() to ensure DOM elements are rendered before querying them.
   */
  $effect(() => {
    const roll = $lastRoll;
    if (!roll) return;
    tick().then(() => {
      const resultElement = /** @type {HTMLElement | null} */ (
        document.querySelector(".roll-result")
      );
      const numberElement = /** @type {HTMLElement | null} */ (
        document.querySelector(".roll-number")
      );
      if (!resultElement) return;
      diceAnimation(resultElement, numberElement);
    });
  });
</script>

<!-- ═══════════════════════════════════════════════════════════════
     Dice Roller UI
     ═════════════════════════════════════════════════════════════════ -->
<div class="dice-panel">
  <!-- Character Selection Dropdown -->
  <div class="char-selector">
    <label class="label-caps" for="char-select">PERSONAJE ACTIVO</label>
    <div class="select-wrap">
      <select id="char-select" bind:value={selectedCharId}>
        {#each $characters as character (character.id)}
          <option value={character.id}>{character.name}</option>
        {/each}
      </select>
      <span class="select-arrow" aria-hidden="true">▾</span>
    </div>
  </div>

  <!-- Roll Modifier Input -->
  <div class="modifier-input">
    <label class="label-caps" for="modifier">MODIFICADOR</label>
    <div class="modifier-stepper-cluster">
      <button
        class="modifier-stepper"
        onpointerdown={() => startHold(decrementModifier)}
        onpointerup={clearHold}
        onpointerleave={clearHold}
        onpointercancel={clearHold}
        aria-label="Reducir modificador">−</button
      >
      <input
        id="modifier"
        class="modifier-value"
        type="number"
        bind:value={modifier}
        min="-20"
        max="20"
        onblur={() => clampModifier(modifier)}
      />
      <button
        class="modifier-stepper"
        onpointerdown={() => startHold(incrementModifier)}
        onpointerup={clearHold}
        onpointerleave={clearHold}
        onpointercancel={clearHold}
        aria-label="Aumentar modificador">+</button
      >
    </div>
  </div>

  <!-- Dice Button Grid -->
  <div class="dice-grid">
    {#each [4, 6, 8, 10, 12] as diceType (diceType)}
      <button class="dice-btn" onclick={() => rollDice(diceType)}>
        <span class={`dice-icon dice-icon--d${diceType}`} aria-hidden="true"
        ></span>
        <span class="dice-label">d{diceType}</span>
      </button>
    {/each}
    <button class="dice-btn d20-btn" onclick={() => rollDice(20)}>
      <span class="dice-icon dice-icon--d20" aria-hidden="true"></span>
      <span class="dice-label">d20</span>
    </button>
  </div>

  <!-- Roll Result Display (shows when a roll is active) -->
  {#if $lastRoll}
    <div class="roll-result" class:is-crit={isCrit} class:is-fail={isFail}>
      <div class="roll-die-label">D{$lastRoll.sides}</div>
      <div class="roll-number" class:is-crit={isCrit} class:is-fail={isFail}>
        {$lastRoll.rollResult}
      </div>
      <div class="roll-label" class:is-crit={isCrit} class:is-fail={isFail}>
        {#if isCrit}¡CRÍTICO!{:else if isFail}¡PIFIA!{:else}{$lastRoll.characterName ??
            $lastRoll.charId}{/if}
      </div>
    </div>
  {/if}
</div>
