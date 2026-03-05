<!--
  OverlayTurnOrder — Initiative/turn order strip for active encounters.
  Intended for: routes/(audience)/turn-order/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl {string} — Socket.io server URL

  Socket events consumed:
    initialData      — bootstrap encounter state
    encounter_started — new encounter begins, strip slides in
    turn_advanced    — next participant's turn, current token highlights
    encounter_ended  — encounter over, strip slides out
    hp_updated       — sync HP in strip tokens
-->
<script>
  import { io } from "socket.io-client";
  import { onDestroy } from "svelte";
  import { animate, utils } from "animejs";

  let { serverUrl = "http://localhost:3000", mockEncounter = null } = $props();

  /** @param {Event} e */
  function handleImageError(e) {
    const img = /** @type {HTMLElement} */ (e.currentTarget);
    img.style.display = 'none';
    const sib = /** @type {HTMLElement | null} */ (img.nextElementSibling);
    if (sib) sib.style.display = '';
  }

  let participants = $state(mockEncounter?.participants ?? []);
  let currentTurnIndex = $state(mockEncounter?.currentTurnIndex ?? 0);
  let round = $state(mockEncounter?.round ?? 0);
  let active = $state(mockEncounter != null);
  let stripEl = $state();

  if (!mockEncounter) {
  const socket = io(serverUrl);

  socket.on("initialData", ({ encounter }) => {
    if (encounter) applyEncounterState(encounter);
  });

  socket.on("encounter_started", (state) => {
    applyEncounterState(state);
    active = true;
    // Wait a tick for the DOM, then animate in
    setTimeout(() => {
      if (stripEl) animate(stripEl, { translateY: [80, 0], opacity: [0, 1], duration: 600, ease: "outExpo" });
    }, 0);
  });

  socket.on("turn_advanced", ({ currentTurnIndex: idx, round: r }) => {
    currentTurnIndex = idx;
    round = r;
  });

  socket.on("encounter_ended", () => {
    if (stripEl) {
      animate(stripEl, {
        translateY: [0, 80],
        opacity: [1, 0],
        duration: 400,
        ease: "inExpo",
        onComplete: () => { active = false; },
      });
    } else {
      active = false;
    }
  });

  socket.on("hp_updated", ({ character }) => {
    participants = participants.map((p) =>
      p.charId === character.id
        ? { ...p, hp_current: character.hp_current, hp_max: character.hp_max }
        : p
    );
  });

  onDestroy(() => socket.disconnect());
  } // end if (!mockEncounter)

  function applyEncounterState(state) {
    participants = state.participants || [];
    currentTurnIndex = state.currentTurnIndex ?? 0;
    round = state.round ?? 0;
    active = state.active ?? false;
  }

  function hpPct(p) {
    if (!p.hp_max) return 0;
    return Math.min(100, Math.max(0, (p.hp_current / p.hp_max) * 100));
  }

  function initials(name) {
    return (name || "?")
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

{#if active}
  <div class="turn-strip" bind:this={stripEl}>
    <div class="round-badge">RONDA {round}</div>
    <div class="token-row">
      {#each participants as p, i (p.charId)}
        <div
          class="turn-token"
          class:is-active={i === currentTurnIndex}
          class:is-past={i < currentTurnIndex}
        >
          <div class="token-avatar">
            {#if p.photo}
              <img
                src="{serverUrl}{p.photo}"
                alt={p.name}
                onerror={handleImageError}
              />
              <span class="token-initials" style="display:none">{initials(p.name)}</span>
            {:else}
              <span class="token-initials">{initials(p.name)}</span>
            {/if}
          </div>
          <div class="token-hp-bar">
            <div class="token-hp-fill" style="width:{hpPct(p)}%"></div>
          </div>
          <div class="token-name">{p.name.split(" ")[0]}</div>
          <div class="token-init">{p.initiative}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .turn-strip {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .round-badge {
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(0, 212, 232, 0.5);
    color: #00d4e8;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    padding: 3px 14px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .token-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .turn-token {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: opacity 0.3s;
  }

  .turn-token.is-past { opacity: 0.4; }

  .token-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: rgba(20, 20, 20, 0.9);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.3s, height 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  .turn-token.is-active .token-avatar {
    width: 70px;
    height: 70px;
    border-color: #00d4e8;
    box-shadow: 0 0 20px rgba(0, 212, 232, 0.6);
  }

  .token-avatar :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .token-initials {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 18px;
    pointer-events: none;
  }

  .turn-token.is-active .token-initials { font-size: 22px; }

  .token-hp-bar {
    width: 56px;
    height: 4px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    overflow: hidden;
    transition: width 0.3s;
  }

  .turn-token.is-active .token-hp-bar { width: 70px; }

  .token-hp-fill {
    height: 100%;
    background: #22c55e;
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  .token-name {
    color: rgba(255, 255, 255, 0.85);
    font-family: "Bebas Neue", sans-serif;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    transition: color 0.3s, font-size 0.3s;
  }

  .turn-token.is-active .token-name {
    color: #fff;
    font-size: 15px;
  }

  .token-init {
    color: rgba(255, 255, 255, 0.4);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .turn-token.is-active .token-init { color: #00d4e8; }
</style>
