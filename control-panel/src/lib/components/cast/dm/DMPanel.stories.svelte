<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SessionCard from "./SessionCard.svelte";
  import InitiativeStrip from "./InitiativeStrip.svelte";
  import SessionBar from "./SessionBar.svelte";

  /* ── Shared mock characters ── */

  const kael = {
    id: "CH101",
    name: "Kael",
    player: "Mara",
    hp_current: 38,
    hp_max: 45,
    photo: null,
    class_primary: { name: "Guerrero", level: 7 },
    conditions: [],
    resources: [
      { id: "r1", name: "Action Surge", pool_current: 1, pool_max: 1, recharge: "SHORT_REST" },
    ],
  };

  const lyra = {
    id: "CH102",
    name: "Lyra",
    player: "Nico",
    hp_current: 14,
    hp_max: 32,
    photo: null,
    class_primary: { name: "Pícaro", level: 5 },
    conditions: [
      { id: "c1", condition_name: "Envenenado", intensity_level: 1 },
    ],
    resources: [],
  };

  const brum = {
    id: "CH103",
    name: "Brum",
    player: "Iris",
    hp_current: 2,
    hp_max: 28,
    photo: null,
    class_primary: { name: "Mago", level: 5 },
    conditions: [
      { id: "c2", condition_name: "Aturdido", intensity_level: null },
    ],
    resources: [],
  };

  const allCharacters = [kael, lyra, brum];

  const combatants = [
    { charId: "CH101", roll: 18, initiative: 18 },
    { charId: "CH103", roll: 15, initiative: 15 },
    { charId: "CH102", roll: 9, initiative: 9 },
  ];

  const { Story } = defineMeta({
    title: "Cast/DM Panel",
    component: SessionCard,
    tags: ["autodocs"],
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "DM-facing components: SessionCard (per-character combat card), " +
            "InitiativeStrip (initiative tracker), and SessionBar (action commit bar).",
        },
      },
    },
  });
</script>

<!-- ── SessionCard stories ── -->

<Story name="SessionCard — Healthy">
  <div style="max-width: 360px;">
    <SessionCard character={kael} />
  </div>
</Story>

<Story name="SessionCard — Injured">
  <div style="max-width: 360px;">
    <SessionCard character={lyra} />
  </div>
</Story>

<Story name="SessionCard — Critical">
  <div style="max-width: 360px;">
    <SessionCard character={brum} />
  </div>
</Story>

<Story name="SessionCard — Active Turn">
  <div style="max-width: 360px;">
    <SessionCard character={kael} isActive={true} />
  </div>
</Story>

<Story name="SessionCard — Selectable">
  <div style="max-width: 360px;">
    <SessionCard character={lyra} isSelectable={true} />
  </div>
</Story>

<Story name="SessionCard — Selected">
  <div style="max-width: 360px;">
    <SessionCard character={kael} isSelectable={true} isSelected={true} />
  </div>
</Story>

<!-- ── InitiativeStrip stories ── -->

<Story name="InitiativeStrip — Pre-Combat">
  <div style="padding: 16px;">
    <InitiativeStrip characters={allCharacters} inCombat={false} />
  </div>
</Story>

<Story name="InitiativeStrip — In Combat Round 1">
  <div style="padding: 16px;">
    <InitiativeStrip
      characters={allCharacters}
      {combatants}
      inCombat={true}
      activeIndex={0}
      round={1}
    />
  </div>
</Story>

<Story name="InitiativeStrip — Round 3 Second Turn">
  <div style="padding: 16px;">
    <InitiativeStrip
      characters={allCharacters}
      {combatants}
      inCombat={true}
      activeIndex={1}
      round={3}
    />
  </div>
</Story>

<!-- ── SessionBar stories ── -->

<Story name="SessionBar — Idle">
  <SessionBar />
</Story>

<Story name="SessionBar — Pending Damage">
  <SessionBar pendingAction="damage" pendingTarget="CH101" />
</Story>

<Story name="SessionBar — Pending Heal">
  <SessionBar pendingAction="heal" pendingTarget="CH102" />
</Story>

<Story name="SessionBar — Pending Condition">
  <SessionBar pendingAction="condition" pendingTarget="CH103" />
</Story>

<Story name="SessionBar — Pending Rest">
  <SessionBar pendingAction="rest" pendingTarget="CH101" />
</Story>
