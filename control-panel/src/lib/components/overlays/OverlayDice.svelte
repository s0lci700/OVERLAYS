<!--
  OverlayDice — Animated dice roll results.
  Intended for: routes/(audience)/dice/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl {string} — Socket.io server URL

  Socket events consumed:
    initialData      — load character map for photo lookups
    character_updated — keep character map fresh
    dice_rolled      — show animated result card
-->
<script>
  import { createOverlaySocket } from './shared/overlaySocket.svelte.js';
  import { onMount } from "svelte";
  import { animate, utils } from "animejs";

  let { serverUrl = "http://localhost:3000", preview = null } = $props();

  /** @param {Event} e */
  function handleImageError(e) {
    const img = /** @type {HTMLElement} */ (e.currentTarget);
    img.style.display = 'none';
    const sib = /** @type {HTMLElement | null} */ (img.nextElementSibling);
    if (sib) sib.style.display = '';
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let visible = $state(false);
  let isCrit = $state(false);
  let isFail = $state(false);
  let charName = $state("—");
  let diceFormula = $state("d20");
  let diceBreakdown = $state("—");
  let diceResultVal = $state("—");
  let diceLabel = $state("—");
  let avatarPhoto = $state(null);
  let avatarInitialsText = $state("?");
  let flashColor = $state(null);
  let flashing = $state(false);

  // Local character map for photo lookups
  const characterMap = {};
  let hideTimer = null;
  let containerEl = $state();
  let resultEl = $state();
  let flashEl = $state();

  // ── Socket setup (skipped in Storybook when preview provided) ───────────────
  if (!preview) {
  const { socket } = createOverlaySocket(serverUrl);

  socket.on("initialData", ({ characters }) => {
    characters.forEach((c) => { characterMap[c.id] = c; });
  });

  socket.on("character_updated", ({ character }) => {
    characterMap[character.id] = character;
  });

  socket.on("dice_rolled", (data) => showRoll(data));

  } // end if (!preview)

  // ── Preview support ─────────────────────────────────────────────────────────
  onMount(() => {
    if (preview) setTimeout(() => showRoll(preview), 100);
  });

  // ── Display logic ──────────────────────────────────────────────────────────
  function initials(name) {
    return (name || "?").split(" ").map((w) => w[0] || "").join("").toUpperCase().slice(0, 2);
  }

  function showRoll(data) {
    if (hideTimer) clearTimeout(hideTimer);

    // Avatar
    const char = characterMap[data.charId];
    const photo = char?.portrait ? serverUrl + char.portrait : null;
    avatarPhoto = photo;
    avatarInitialsText = initials(data.characterName);

    // Card content
    charName = data.characterName || "Unknown";
    diceFormula = `d${data.sides ?? "?"}`;
    diceResultVal = String(data.rollResult);

    if (data.modifier > 0) {
      diceBreakdown = `${data.result} + ${data.modifier}`;
    } else if (data.modifier < 0) {
      diceBreakdown = `${data.result} − ${Math.abs(data.modifier)}`;
    } else {
      diceBreakdown = String(data.result);
    }

    // Crit / Fail
    isCrit = false;
    isFail = false;
    let hideDelay = 4000;

    if (data.result === 20 && data.sides === 20) {
      isCrit = true;
      diceLabel = "¡CRÍTICO!";
      triggerFlash("rgba(0, 212, 232, 0.45)");
      hideDelay = 6000;
    } else if (data.result === 1 && data.sides === 20) {
      isFail = true;
      diceLabel = "¡PIFIA!";
      triggerFlash("rgba(255, 77, 106, 0.45)");
    } else {
      diceLabel = `Total: ${data.rollResult}`;
    }

    // Animate in
    visible = true;
    // Wait a tick for DOM
    setTimeout(() => {
      if (!containerEl) return;
      utils.set(containerEl, { opacity: 0, translateY: 40, translateX: 0 });
      animate(containerEl, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 500,
        ease: "inOutQuad",
      });
      // Bounce result number
      setTimeout(() => {
        if (!resultEl) return;
        animate(resultEl, {
          opacity: [0, 1],
          scale: isCrit ? [0.2, 1.45, 1] : [0.3, 1.15, 1],
          duration: isCrit ? 800 : 600,
          ease: "outElastic(1, .5)",
        });
      }, 100);

      if (isFail) {
        animate(containerEl, {
          translateX: [0, -14, 14, -9, 9, -5, 5, 0],
          duration: 520,
          ease: "inOutSine",
        });
      }
    }, 0);

    // Auto-hide
    hideTimer = setTimeout(() => {
      if (!containerEl) return;
      animate(containerEl, {
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 500,
        ease: "inOutQuad",
        onComplete: () => {
          visible = false;
          isCrit = false;
          isFail = false;
        },
      });
    }, hideDelay);
  }

  function triggerFlash(color) {
    flashColor = color;
    flashing = true;
    setTimeout(() => {
      if (!flashEl) return;
      animate(flashEl, {
        opacity: [0, 0.75, 0],
        duration: 450,
        ease: "inOutQuad",
        onComplete: () => { flashing = false; },
      });
    }, 0);
  }
</script>

<!-- Full-canvas flash (crit / fail) -->
{#if flashing}
  <div
    bind:this={flashEl}
    class="flash-overlay"
    style="background: {flashColor}; opacity: 0"
  ></div>
{/if}

<!-- Dice result card -->
{#if visible}
  <div
    bind:this={containerEl}
    class="dice-container"
    class:is-crit={isCrit}
    class:is-fail={isFail}
  >
    <div class="dice-card">
      <!-- Avatar -->
      <div class="dice-avatar">
        {#if avatarPhoto}
          <img
            src={avatarPhoto}
            alt={charName}
            onerror={handleImageError}
          />
          <span class="dice-avatar-initials" style="display:none">{avatarInitialsText}</span>
        {:else}
          <span class="dice-avatar-initials">{avatarInitialsText}</span>
        {/if}
      </div>

      <div class="dice-character">{charName}</div>
      <div class="dice-formula">{diceFormula}</div>
      <div class="dice-breakdown">{diceBreakdown}</div>
      <div
        bind:this={resultEl}
        class="dice-result"
        class:crit={isCrit}
        class:fail={isFail}
        style="opacity: 0"
      >
        {diceResultVal}
      </div>
      <div class="dice-label" class:crit={isCrit} class:fail={isFail}>
        {diceLabel}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Flash overlay */
  .flash-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
  }

  /* Dice container — bottom center */
  .dice-container {
    position: fixed;
    bottom: 80px;
    left: 50%;
    width: fit-content;
    transform: translateX(-50%);
    z-index: 100;
  }

  .dice-card {
    background: rgba(0, 0, 0, 0.93);
    border: 1px solid rgba(0, 212, 232, 0.35);
    border-top: 3px solid #00d4e8;
    border-radius: 12px;
    padding: 20px 52px 24px;
    text-align: center;
    min-width: 340px;
    box-shadow: 4px 4px 0px rgba(0, 212, 232, 0.35);
  }

  .dice-container.is-crit .dice-card {
    border-top-color: #00d4e8;
    border-color: rgba(0, 212, 232, 0.5);
    box-shadow: 4px 4px 0px rgba(0, 212, 232, 0.35), 0 0 40px rgba(0, 212, 232, 0.25);
  }

  .dice-container.is-fail .dice-card {
    border-top-color: #ff4d6a;
    border-color: rgba(255, 77, 106, 0.5);
    box-shadow: 4px 4px 0px #ff4d6a, 0 0 40px rgba(255, 77, 106, 0.25);
  }

  /* Avatar */
  .dice-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    margin: 0 auto 10px;
    background: rgba(40, 40, 40, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dice-avatar :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .dice-avatar-initials {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 16px;
    line-height: 1;
  }

  /* Card content */
  .dice-character {
    color: #888;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 6px;
    font-family: "JetBrains Mono", monospace;
  }

  .dice-formula {
    color: #00d4e8;
    font-family: "Bebas Neue", sans-serif;
    font-size: 32px;
    font-weight: normal;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  .dice-breakdown {
    color: #888;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
  }

  .dice-result {
    color: #fff;
    font-family: "JetBrains Mono", monospace;
    font-size: 80px;
    font-weight: 700;
    line-height: 1;
    transition: color 0.2s ease, text-shadow 0.2s ease, font-size 0.1s ease;
  }

  .dice-result.crit {
    color: #00d4e8;
    font-size: 100px;
    text-shadow: 0 0 24px rgba(0, 212, 232, 0.7), 0 0 60px rgba(0, 212, 232, 0.35);
  }

  .dice-result.fail {
    color: #ff4d6a;
    font-size: 100px;
    text-shadow: 0 0 24px rgba(255, 77, 106, 0.7), 0 0 60px rgba(255, 77, 106, 0.35);
  }

  .dice-label {
    color: #888;
    font-family: "Bebas Neue", sans-serif;
    font-size: 18px;
    font-weight: normal;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 10px;
  }

  .dice-label.crit { color: #00d4e8; }
  .dice-label.fail { color: #ff4d6a; }
</style>
