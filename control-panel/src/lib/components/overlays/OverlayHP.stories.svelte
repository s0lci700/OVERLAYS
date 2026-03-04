<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayHP from "./OverlayHP.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Persistent/OverlayHP",
    component: OverlayHP,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "HP bar overlay for OBS (1920×1080 transparent source). Pass mockCharacters to bypass socket setup in Storybook.",
        },
      },
    },
  });

  const healthy = [
    { id: "CH101", name: "Kael",  hp_current: 45, hp_max: 45, conditions: [], photo: null },
    { id: "CH102", name: "Lyra",  hp_current: 38, hp_max: 38, conditions: [], photo: null },
    { id: "CH103", name: "Brum",  hp_current: 52, hp_max: 52, conditions: [], photo: null },
    { id: "CH104", name: "Zara",  hp_current: 30, hp_max: 30, conditions: [], photo: null },
  ];

  const injured = [
    { id: "CH101", name: "Kael",  hp_current: 22, hp_max: 45, conditions: [{ id: "c1", condition_name: "poisoned" }], photo: null },
    { id: "CH102", name: "Lyra",  hp_current: 38, hp_max: 38, conditions: [], photo: null },
  ];

  const critical = [
    { id: "CH101", name: "Kael",  hp_current: 4,  hp_max: 45, conditions: [{ id: "c1", condition_name: "unconscious" }], photo: null },
    { id: "CH102", name: "Lyra",  hp_current: 9,  hp_max: 38, conditions: [{ id: "c2", condition_name: "poisoned" }], photo: null },
  ];
</script>

<Story name="Full Party — Healthy">
  <OverlayHP mockCharacters={healthy} />
</Story>

<Story name="Single Character">
  <OverlayHP mockCharacters={[healthy[0]]} />
</Story>

<Story name="Injured + Poisoned">
  <OverlayHP mockCharacters={injured} />
</Story>

<Story name="Critical + Unconscious">
  <OverlayHP mockCharacters={critical} />
</Story>

<Story name="Empty Party">
  <OverlayHP mockCharacters={[]} />
</Story>
