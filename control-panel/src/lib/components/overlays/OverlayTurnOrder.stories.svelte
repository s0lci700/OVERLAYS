<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayTurnOrder from "./OverlayTurnOrder.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Persistent/OverlayTurnOrder",
    component: OverlayTurnOrder,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Initiative strip for active encounters. Pass mockEncounter to render without a server.",
        },
      },
    },
  });

  const midEncounter = {
    participants: [
      { id: "CH101", name: "Kael",  initiative: 18, hp_current: 45, hp_max: 45, isPlayer: true,  photo: null },
      { id: "e1",    name: "Goblin A", initiative: 14, hp_current: 7,  hp_max: 7,  isPlayer: false, photo: null },
      { id: "CH102", name: "Lyra",  initiative: 12, hp_current: 28, hp_max: 38, isPlayer: true,  photo: null },
      { id: "e2",    name: "Goblin B", initiative: 9,  hp_current: 5,  hp_max: 7,  isPlayer: false, photo: null },
    ],
    currentTurnIndex: 1,
    round: 2,
  };

  const betweenEncounters = {
    participants: [],
    currentTurnIndex: 0,
    round: 0,
  };
</script>

<Story name="Mid-Encounter (Round 2)">
  <OverlayTurnOrder mockEncounter={midEncounter} />
</Story>

<Story name="Between Encounters (Empty)">
  <OverlayTurnOrder mockEncounter={betweenEncounters} />
</Story>
