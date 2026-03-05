<!--
  OverlayCharacterFocus — Large character panel (left side of screen).
  Intended for: routes/(audience)/focus/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl {string} — Socket.io server URL

  Socket events consumed:
    initialData          — bootstrap focused character
    character_focused    — slide panel in with character data
    character_unfocused  — slide panel out
    hp_updated           — live HP sync
    condition_added      — append condition badge
    condition_removed    — remove condition badge
-->
<script>
  import { io } from "socket.io-client";
  import { onDestroy, tick } from "svelte";
  import { animate, utils } from "animejs";

  let { serverUrl = "http://localhost:3000", preview = null } = $props();

  /** @param {Event} e */
  function handleImageError(e) {
    const img = /** @type {HTMLElement} */ (e.currentTarget);
    img.style.display = 'none';
    const sib = /** @type {HTMLElement | null} */ (img.nextElementSibling);
    if (sib) sib.style.display = '';
  }

  let char = $state(preview ?? null);
  let panelEl = $state();

  if (!preview) {
  const socket = io(serverUrl);

  socket.on("initialData", ({ focusedChar }) => {
    if (focusedChar) char = focusedChar;
  });

  socket.on("character_focused", async ({ character }) => {
    char = character;
    await tick();
    if (panelEl) {
      animate(panelEl, { translateX: [-340, 0], opacity: [0, 1], duration: 700, ease: "outExpo" });
    }
  });

  socket.on("character_unfocused", () => {
    if (panelEl) {
      animate(panelEl, {
        translateX: [0, -340],
        opacity: [1, 0],
        duration: 500,
        ease: "inExpo",
        onComplete: () => { char = null; },
      });
    } else {
      char = null;
    }
  });

  socket.on("hp_updated", ({ character }) => {
    if (char && char.id === character.id) char = character;
  });

  socket.on("condition_added", ({ charId, condition }) => {
    if (char && char.id === charId) {
      char = { ...char, conditions: [...(char.conditions || []), condition] };
    }
  });

  socket.on("condition_removed", ({ charId, conditionId }) => {
    if (char && char.id === charId) {
      char = { ...char, conditions: (char.conditions || []).filter((c) => c.id !== conditionId) };
    }
  });

  onDestroy(() => socket.disconnect());
  } // end if (!preview)

  function hpPct(c) {
    if (!c || !c.hp_max) return 0;
    return Math.min(100, Math.max(0, (c.hp_current / c.hp_max) * 100));
  }

  function hpClass(pct) {
    if (pct > 60) return "healthy";
    if (pct > 30) return "injured";
    return "critical";
  }

  function classLabel(c) {
    if (!c?.name) return "";
    return `${c.name.toUpperCase()} • LV${c.level || 1}`;
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

{#if char}
  {@const pct = hpPct(char)}
  <div class="focus-panel" bind:this={panelEl}>
    <div class="focus-photo">
      {#if char.photo}
        <img
          src="{serverUrl}{char.photo}"
          alt={char.name}
          onerror={handleImageError}
        />
        <div class="focus-initials" style="display:none">{initials(char.name)}</div>
      {:else}
        <div class="focus-initials">{initials(char.name)}</div>
      {/if}
    </div>

    <div class="focus-info">
      <div class="focus-name">{char.name}</div>
      {#if char.class_primary?.name}
        <div class="focus-class">{classLabel(char.class_primary)}</div>
      {/if}
      <div class="focus-player">{char.player}</div>

      <div class="focus-hp-bar-wrap">
        <div class="focus-hp-bar">
          <div class="focus-hp-fill {hpClass(pct)}" style="width:{pct}%"></div>
        </div>
        <div class="focus-hp-text">{char.hp_current} / {char.hp_max} HP</div>
      </div>

      {#if char.conditions?.length}
        <div class="focus-conditions">
          {#each char.conditions as cond (cond.id)}
            <span class="cond-badge">{cond.condition_name}</span>
          {/each}
        </div>
      {/if}

      <div class="focus-stats">
        <div class="focus-stat">
          <span class="stat-val">{char.armor_class ?? "—"}</span>
          <span class="stat-label">CA</span>
        </div>
        <div class="focus-stat">
          <span class="stat-val">{char.speed_walk ?? "—"}</span>
          <span class="stat-label">VELOC</span>
        </div>
        {#if char.ability_scores}
          {#each [["FUE", "str"], ["DES", "dex"], ["CON", "con"]] as [lbl, key] (lbl)}
            <div class="focus-stat">
              <span class="stat-val">{char.ability_scores[key] ?? "—"}</span>
              <span class="stat-label">{lbl}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .focus-panel {
    position: absolute;
    top: 50%;
    left: 40px;
    transform: translateY(-50%);
    width: 320px;
    background: rgba(0, 0, 0, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.6);
  }

  .focus-photo {
    width: 100%;
    height: 320px;
    overflow: hidden;
    background: rgba(20, 20, 20, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .focus-photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .focus-initials {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 64px;
    line-height: 1;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .focus-info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .focus-name {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 36px;
    font-weight: normal;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
  }

  .focus-class {
    color: #00d4e8;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: -6px;
  }

  .focus-player {
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: -4px;
  }

  .focus-hp-bar-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .focus-hp-bar {
    background: rgba(30, 30, 30, 0.9);
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
  }

  .focus-hp-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .focus-hp-fill.healthy { background: linear-gradient(90deg, #16a34a, #22c55e); }
  .focus-hp-fill.injured { background: linear-gradient(90deg, #b45309, #f59e0b); }
  .focus-hp-fill.critical {
    background: linear-gradient(90deg, #be123c, #ff4d6a);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  .focus-hp-text {
    color: rgba(255, 255, 255, 0.7);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    text-align: right;
    letter-spacing: 0.04em;
  }

  .focus-conditions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .cond-badge {
    background: rgba(255, 77, 106, 0.15);
    border: 1px solid rgba(255, 77, 106, 0.6);
    border-radius: 999px;
    color: #ff4d6a;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    letter-spacing: 0.1em;
  }

  .focus-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .focus-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 6px 10px;
    min-width: 44px;
  }

  .stat-val {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 20px;
    line-height: 1;
  }

  .stat-label {
    color: #555;
    font-family: "JetBrains Mono", monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
</style>
