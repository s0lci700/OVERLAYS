<!--
  OverlayHP — Real-time HP bars for all characters.
  Intended for: routes/(audience)/hp/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl {string} — Socket.io server URL (e.g. http://192.168.1.83:3000)

  Socket events consumed:
    initialData      — bootstrap character list
    hp_updated       — efficient bar/text update
    character_updated — full card refresh
    condition_added  — append badge + flash card
    condition_removed — remove badge
-->
<script>
  import { createOverlaySocket } from './shared/overlaySocket.svelte.js';
  import { getConditionClasses } from '$lib/components/overlays/shared/conditionEffects.js';
  import '$lib/components/overlays/overlays.css';

  let { serverUrl = "http://localhost:3000", mockCharacters = null } = $props();

  /** @param {Event} e */
  function handleImageError(e) {
    const img = /** @type {HTMLElement} */ (e.currentTarget);
    img.style.display = 'none';
    const sib = /** @type {HTMLElement | null} */ (img.nextElementSibling);
    if (sib) sib.style.display = '';
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let characters = $state(mockCharacters ?? []);
  let statusText = $state("");
  let statusVisible = $state(false);
  let statusTimer = null;
  let flashTimers = {};

  // ── Socket setup (skipped in Storybook when mockCharacters is provided) ─────
  if (!mockCharacters) {
  const { socket } = createOverlaySocket(serverUrl);

  socket.on("connect", () => showStatus("✓ Conectado"));
  socket.on("disconnect", () => showStatus("✗ Desconectado"));
  socket.on("connect_error", () => showStatus("✗ Error de conexión"));

  socket.on("initialData", ({ characters: chars }) => {
    characters = chars;
  });

  socket.on("hp_updated", ({ character }) => {
    const prev = characters.find((c) => c.id === character.id);
    const delta = character.hp_current - (prev?.hp_current ?? character.hp_current);
    characters = characters.map((c) => (c.id === character.id ? character : c));
    showStatus(`${character.name}: ${character.hp_current} HP`);
    // Heal flash: triggered when healed more than 30% of max HP
    if (delta > 0 && character.hp_max > 0 && delta / character.hp_max > 0.3) {
      const el = document.querySelector(`[data-char-id="${character.id}"] .hp-bar-fill`);
      if (el) {
        el.classList.add('heal-flash');
        setTimeout(() => el.classList.remove('heal-flash'), 800);
      }
    }
  });

  socket.on("character_updated", ({ character }) => {
    characters = characters.map((c) => (c.id === character.id ? character : c));
  });

  socket.on("condition_added", ({ charId, condition }) => {
    characters = characters.map((c) =>
      c.id === charId
        ? { ...c, conditions: [...(c.conditions || []), condition] }
        : c
    );
    flashCard(charId);
    showStatus(`${condition.condition_name} → ${charId}`);
  });

  socket.on("condition_removed", ({ charId, conditionId }) => {
    characters = characters.map((c) =>
      c.id === charId
        ? { ...c, conditions: (c.conditions || []).filter((cond) => cond.id !== conditionId) }
        : c
    );
  });

  } // end if (!mockCharacters)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showStatus(msg) {
    statusText = msg;
    statusVisible = true;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (statusVisible = false), 2000);
  }

  function flashCard(charId) {
    clearTimeout(flashTimers[charId]);
    const el = document.querySelector(`[data-char-id="${charId}"]`);
    if (!el) return;
    el.classList.remove("flash-condition");
    void /** @type {HTMLElement} */ (el).offsetWidth;
    el.classList.add("flash-condition");
    flashTimers[charId] = setTimeout(() => el.classList.remove("flash-condition"), 800);
  }

  function hpPct(current, max) {
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.max(0, (current / max) * 100));
  }

  function hpClass(pct) {
    if (pct > 60) return "healthy";
    if (pct > 30) return "injured";
    return "critical";
  }

  function initials(name) {
    return (name || "?")
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function classLabel(c) {
    if (!c?.name) return "";
    return `${c.name.toUpperCase()} • LV${c.level || 1}`;
  }

  function tempWidth(char) {
    const temp = char.hp_temp || 0;
    if (temp <= 0) return 0;
    return (temp / (char.hp_max + temp)) * 100;
  }
</script>

<!-- Status banner (connection / HP change notices) -->
{#if statusVisible}
  <div class="status-message show">{statusText}</div>
{/if}

<!-- Character HP card column (top-right) -->
<div class="hp-container">
  {#each characters as char (char.id)}
    {@const pct = hpPct(char.hp_current, char.hp_max)}
    {@const tw = tempWidth(char)}
    <div class="character-hp" data-char-id={char.id}>
      <div class="card-header">
        <div class="char-avatar">
          {#if char.photo}
            <img
              src="{serverUrl}{char.photo}"
              alt={char.name}
              onerror={handleImageError}
            />
            <span class="char-avatar-initials" style="display:none">{initials(char.name)}</span>
          {:else}
            <span class="char-avatar-initials">{initials(char.name)}</span>
          {/if}
        </div>
        <div class="card-header-info">
          <div class="char-name">{char.name}</div>
          {#if classLabel(char.class_primary)}
            <div class="char-class">{classLabel(char.class_primary)}</div>
          {/if}
          <div class="char-meta">
            <div class="char-player">{char.player}</div>
            <div class="ac-badge">CA {char.armor_class ?? "—"}</div>
          </div>
        </div>
      </div>

      <div class="hp-bar-container">
        <div class="hp-bar-fill {hpClass(pct)} {getConditionClasses(char.conditions ?? [])}" style="width: {pct}%"></div>
        {#if tw > 0}
          <div class="hp-bar-temp" style="width: {tw}%"></div>
        {/if}
      </div>

      <div class="hp-text">
        {char.hp_current} / {char.hp_max}
        {#if (char.hp_temp || 0) > 0}
          <span class="hp-temp-label">+{char.hp_temp} tmp</span>
        {/if}
      </div>

      {#if char.conditions?.length}
        <div class="conditions-row">
          {#each char.conditions.slice(0, 3) as cond (cond.id)}
            <span class="condition-badge" data-cond-id={cond.id}>
              {cond.condition_name}
            </span>
          {/each}
          {#if char.conditions.length > 3}
            <span class="condition-badge">+{char.conditions.length - 3}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  /* HP Container — absolute top-right column */
  .hp-container {
    position: absolute;
    top: 50px;
    right: 50px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .character-hp {
    background: rgba(0, 0, 0, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 14px 16px;
    min-width: 380px;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.6);
    transition: background 0.5s ease;
  }

  @keyframes cardFlash {
    0%   { background: rgba(255, 77, 106, 0.28); border-color: rgba(255, 77, 106, 0.6); }
    100% { background: rgba(0, 0, 0, 0.88); border-color: rgba(255, 255, 255, 0.12); }
  }

  :global(.character-hp.flash-condition) {
    animation: cardFlash 0.7s ease-out forwards;
  }

  /* Card header */
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card-header-info {
    flex: 1;
    min-width: 0;
  }

  /* Avatar */
  .char-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(40, 40, 40, 0.9);
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .char-avatar :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .char-avatar-initials {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 20px;
    line-height: 1;
    letter-spacing: 0.05em;
  }

  /* Character info */
  .char-name {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 26px;
    font-weight: normal;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .char-class {
    color: #00d4e8;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 5px;
  }

  .char-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .char-player {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .ac-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: rgba(80, 13, 245, 0.2);
    border: 1px solid rgba(80, 13, 245, 0.5);
    border-radius: 4px;
    padding: 1px 6px;
    color: rgba(180, 150, 255, 1);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  /* HP bar */
  .hp-bar-container {
    background: rgba(30, 30, 30, 0.9);
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }

  .hp-bar-fill {
    height: 100%;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
    border-radius: 999px;
    position: relative;
    z-index: 1;
  }

  .hp-bar-fill.healthy {
    background: linear-gradient(90deg, #16a34a, #22c55e);
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  }

  .hp-bar-fill.injured {
    background: linear-gradient(90deg, #b45309, #f59e0b);
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  }

  .hp-bar-fill.critical {
    background: linear-gradient(90deg, #be123c, #ff4d6a);
    box-shadow: 0 0 8px rgba(255, 77, 106, 0.5);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .hp-bar-temp {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.32);
    border-radius: 0 999px 999px 0;
    z-index: 2;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  /* HP text */
  .hp-text {
    color: #fff;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 700;
    margin-top: 6px;
    text-align: right;
    letter-spacing: 0.04em;
  }

  .hp-temp-label {
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
    margin-left: 4px;
  }

  /* Conditions row */
  .conditions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .condition-badge {
    display: inline-block;
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

  /* Status message */
  .status-message {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: #00d4e8;
    padding: 10px 20px;
    border-radius: 4px;
    border: 1px solid rgba(0, 212, 232, 0.4);
    font-family: "JetBrains Mono", monospace;
    font-size: 16px;
    pointer-events: none;
    animation: fadeInOut 2s ease forwards;
  }

  @keyframes fadeInOut {
    0%   { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    20%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    80%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
</style>
