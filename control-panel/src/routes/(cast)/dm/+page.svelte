<script lang="ts">
  import { connectSocket, getSocket, SERVER_URL } from "$lib/services/socket.svelte.ts";
  import type { PageData } from "./$types";
  import InitiativeStrip from "$lib/components/cast/dm/InitiativeStrip.svelte";
  import SessionCard from "$lib/components/cast/dm/SessionCard.svelte";
  import SessionBar from "$lib/components/cast/dm/SessionBar.svelte";

  let { data }: { data: PageData } = $props();

  // ── Character state — seeded from SSR, kept live via socket ──
  let characters = $state(data.characters ?? []);

  // ── Initiative state ──────────────────────────────────────────
  let combatants  = $state<{ character: any; roll: number }[]>([]);
  let activeIndex = $state(0);
  let round       = $state(1);
  let inCombat    = $state(false);

  // ── Action state ──────────────────────────────────────────────
  let pendingAction = $state<string | null>(null);
  let pendingTarget = $state<string | null>(null);

  // ── Socket — connect and keep characters in sync ──────────────
  $effect(() => {
    connectSocket('default', 'dm');
    const socket = getSocket();

    socket.on('initialData', ({ characters: chars }) => {
      characters = chars;
    });
    socket.on('hp_updated', ({ character }) => {
      characters = characters.map((c) => c.id === character.id ? character : c);
    });
    socket.on('character_updated', ({ character }) => {
      characters = characters.map((c) => c.id === character.id ? character : c);
    });
    socket.on('condition_added', ({ charId, condition }) => {
      characters = characters.map((c) =>
        c.id === charId ? { ...c, conditions: [...(c.conditions ?? []), condition] } : c
      );
    });
    socket.on('condition_removed', ({ charId, conditionId }) => {
      characters = characters.map((c) =>
        c.id === charId
          ? { ...c, conditions: (c.conditions ?? []).filter((cond: any) => cond.id !== conditionId) }
          : c
      );
    });

    return () => {
      socket.off('initialData');
      socket.off('hp_updated');
      socket.off('character_updated');
      socket.off('condition_added');
      socket.off('condition_removed');
    };
  });

  // ── Initiative handlers ───────────────────────────────────────
  function handleStart(rollsArray: { charId: string; roll: number }[]) {
    const charMap = Object.fromEntries(characters.map((c) => [c.id, c]));
    const dexMod = (c: any) => Math.floor(((c.stats?.dex ?? 10) - 10) / 2);

    combatants = rollsArray
      .map(({ charId, roll }) => ({ character: charMap[charId], roll }))
      .filter((e) => e.character)
      .sort((a, b) => {
        if (b.roll !== a.roll) return b.roll - a.roll;
        return dexMod(b.character) - dexMod(a.character);
      });

    activeIndex = 0;
    round       = 1;
    inCombat    = true;
  }

  function handleNextTurn() {
    if (combatants.length === 0) return;
    activeIndex = (activeIndex + 1) % combatants.length;
    if (activeIndex === 0) round += 1;
  }

  // ── Action handlers ───────────────────────────────────────────
  function handleAction(type: string) {
    pendingAction = type;
    pendingTarget = null;
  }

  function handleCancel() {
    pendingAction = null;
    pendingTarget = null;
  }

  function handleSelectTarget(charId: string) {
    if (pendingAction) pendingTarget = charId;
  }

  async function handleConfirm({ action, targetId, value }: { action: string; targetId: string; value: any }) {
    try {
      if (action === "damage" || action === "heal") {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount <= 0) return;

        const char = characters.find((c) => c.id === targetId);
        if (!char) return;

        const delta = action === "damage" ? -amount : amount;
        const hp_current = Math.min(Math.max(char.hp_current + delta, 0), char.hp_max);

        await fetch(`${SERVER_URL}/api/characters/${targetId}/hp`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hp_current }),
        });
      } else if (action === "condition") {
        const condition_name = String(value ?? "").trim();
        if (!condition_name) return;

        await fetch(`${SERVER_URL}/api/characters/${targetId}/conditions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ condition_name }),
        });
      } else if (action === "rest") {
        await fetch(`${SERVER_URL}/api/characters/${targetId}/rest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: value }),
        });
      }
    } catch (err) {
      console.error("[SessionPanel] action failed:", err);
    } finally {
      pendingAction = null;
      pendingTarget = null;
    }
  }
</script>

<div class="session-page">
  <InitiativeStrip
    characters={characters ?? []}
    {combatants}
    {activeIndex}
    {round}
    {inCombat}
    onStart={handleStart}
  />

  <div class="session-cards">
    {#each characters ?? [] as character (character.id)}
      <SessionCard
        {character}
        isActive={inCombat && combatants[activeIndex]?.character.id === character.id}
        isSelectable={!!pendingAction}
        isSelected={pendingTarget === character.id}
        onSelect={handleSelectTarget}
      />
    {/each}
  </div>

  <SessionBar
    {pendingAction}
    {pendingTarget}
    onAction={handleAction}
    onCancel={handleCancel}
    onConfirm={handleConfirm}
    onNextTurn={handleNextTurn}
  />
</div>

<style>
  .session-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); /* PAGE-1: iOS safe-area aware clearance */
  }

  .session-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-3);
  }
</style>
