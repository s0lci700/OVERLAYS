<!--
  OverlayConditions — Active conditions and depleted resources panel.
  Intended for: routes/(audience)/conditions/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Fades in bottom-left when any character has active conditions or
  depleted resource pools. Fades out when everything clears.

  Props:
    serverUrl {string} — Socket.io server URL

  Socket events consumed:
    initialData       — bootstrap state map
    condition_added   — append condition
    condition_removed — remove condition
    resource_updated  — update resource pool
    rest_taken        — restore resources / clear conditions
    character_updated — full character refresh
-->
<script>
  import { createOverlaySocket } from './shared/overlaySocket.svelte.js';
  import { animate, utils } from "animejs";
  import AlchemicalIcon from '../shared/AlchemicalIcon.svelte';

  let { serverUrl = "http://localhost:3000", mockCharacters = null } = $props();

  // ── State ──────────────────────────────────────────────────────────────────
  // charId → { name, conditions[], resources[] }
  let charState = $state({});
  let panelVisible = $state(false);
  let panelEl = $state();

  // ── Seed state from mockCharacters (Storybook) ──────────────────────────────
  if (mockCharacters) {
    const next = {};
    mockCharacters.forEach((c) => {
      next[c.id] = { name: c.name, conditions: [...(c.conditions || [])], resources: [...(c.resources || [])] };
    });
    charState = next;
    panelVisible = Object.values(next).some((e) => e.conditions.length > 0);
  }

  // ── Socket setup (skipped when mockCharacters provided) ─────────────────────
  if (!mockCharacters) {
  const { socket } = createOverlaySocket(serverUrl);

  socket.on("initialData", ({ characters }) => {
    const next = {};
    characters.forEach((c) => {
      next[c.id] = {
        name: c.name,
        conditions: [...(c.conditions || [])],
        resources: [...(c.resources || [])],
      };
    });
    charState = next;
    updateVisibility();
  });

  socket.on("condition_added", ({ charId, condition }) => {
    if (!charState[charId]) return;
    const already = charState[charId].conditions.some((c) => c.id === condition.id);
    if (!already) {
      charState = {
        ...charState,
        [charId]: {
          ...charState[charId],
          conditions: [...charState[charId].conditions, condition],
        },
      };
    }
    updateVisibility();
  });

  socket.on("condition_removed", ({ charId, conditionId }) => {
    if (!charState[charId]) return;
    charState = {
      ...charState,
      [charId]: {
        ...charState[charId],
        conditions: charState[charId].conditions.filter((c) => c.id !== conditionId),
      },
    };
    updateVisibility();
  });

  socket.on("resource_updated", ({ charId, resource }) => {
    if (!charState[charId]) return;
    const resources = charState[charId].resources;
    const idx = resources.findIndex((r) => r.id === resource.id);
    const next = idx >= 0
      ? resources.map((r) => (r.id === resource.id ? resource : r))
      : [...resources, resource];
    charState = { ...charState, [charId]: { ...charState[charId], resources: next } };
    updateVisibility();
  });

  socket.on("rest_taken", ({ charId, character }) => {
    if (!charState[charId]) return;
    charState = {
      ...charState,
      [charId]: {
        ...charState[charId],
        resources: [...(character.resources || [])],
        conditions: character.conditions ? [...character.conditions] : charState[charId].conditions,
      },
    };
    updateVisibility();
  });

  socket.on("character_updated", ({ character }) => {
    if (!charState[character.id]) return;
    charState = {
      ...charState,
      [character.id]: {
        name: character.name,
        conditions: character.conditions ? [...character.conditions] : charState[character.id].conditions,
        resources: character.resources ? [...character.resources] : charState[character.id].resources,
      },
    };
    updateVisibility();
  });

  } // end if (!mockCharacters)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function hasContent(entry) {
    const hasConditions = entry.conditions.length > 0;
    const hasDepleted = entry.resources.some((r) => r.pool_current === 0 && r.pool_max > 0);
    return hasConditions || hasDepleted;
  }

  function depletedResources(entry) {
    return entry.resources.filter((r) => r.pool_current === 0 && r.pool_max > 0);
  }

  function visibleRows() {
    return Object.entries(charState).filter(([, entry]) => hasContent(entry));
  }

  function updateVisibility() {
    const shouldShow = visibleRows().length > 0;
    if (shouldShow === panelVisible) return;
    panelVisible = shouldShow;

    // Wait tick for DOM
    setTimeout(() => {
      if (!panelEl) return;
      if (shouldShow) {
        animate(panelEl, {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 400,
          ease: "outQuad",
        });
      } else {
        animate(panelEl, {
          opacity: [1, 0],
          translateY: [0, 16],
          duration: 350,
          ease: "inQuad",
        });
      }
    }, 0);
  }
</script>

{#if panelVisible}
  <div bind:this={panelEl} class="conditions-panel" style="opacity: 0">
    <div class="panel-title">Estado activo</div>

    {#each visibleRows() as [charId, entry] (charId)}
      {@const onlyDepleted = entry.conditions.length === 0}
      <div
        class="char-condition-row"
        class:depleted-only={onlyDepleted}
        data-char-id={charId}
      >
        <div class="row-char-name">{entry.name}</div>
        <div class="row-badges">
          {#each entry.conditions as cond (cond.id)}
            <AlchemicalIcon condition={cond} size="sm" />
          {/each}
          {#each depletedResources(entry) as res (res.id)}
            <span class="depleted-badge">{res.name} ✗</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  /* Conditions panel — bottom-left */
  .conditions-panel {
    position: absolute;
    bottom: 50px;
    left: 50px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  .panel-title {
    color: rgba(255, 255, 255, 0.35);
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 2px;
  }

  /* Character rows */
  .char-condition-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.87);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 3px solid #ff4d6a;
    border-radius: 8px;
    padding: 8px 14px 8px 12px;
    min-width: 220px;
    max-width: 480px;
  }

  .char-condition-row.depleted-only {
    border-left-color: #500df5;
  }

  .row-char-name {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 18px;
    font-weight: normal;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
    line-height: 1;
  }

  .row-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  /* Condition badge — red */
  .cond-badge {
    display: inline-block;
    background: rgba(255, 77, 106, 0.15);
    border: 1px solid rgba(255, 77, 106, 0.55);
    border-radius: 999px;
    color: #ff4d6a;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  /* Depleted resource badge — purple */
  .depleted-badge {
    display: inline-block;
    background: rgba(80, 13, 245, 0.15);
    border: 1px solid rgba(80, 13, 245, 0.45);
    border-radius: 999px;
    color: rgba(180, 150, 255, 1);
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
</style>
