<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayConditions from "./OverlayConditions.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Persistent/OverlayConditions",
    component: OverlayConditions,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Active conditions panel. Fades in when any character has conditions or depleted resources.",
        },
      },
    },
  });

  const noConditions = [
    { id: "CH101", name: "Kael", conditions: [], resources: [] },
    { id: "CH102", name: "Lyra", conditions: [], resources: [] },
  ];

  const oneCondition = [
    { id: "CH101", name: "Kael", conditions: [{ id: "c1", condition_name: "poisoned" }], resources: [] },
    { id: "CH102", name: "Lyra", conditions: [], resources: [] },
  ];

  const multipleConditions = [
    { id: "CH101", name: "Kael",  conditions: [{ id: "c1", condition_name: "poisoned" }, { id: "c2", condition_name: "frightened" }], resources: [] },
    { id: "CH102", name: "Lyra",  conditions: [{ id: "c3", condition_name: "blinded" }], resources: [{ pool_current: 0, pool_max: 3, name: "Ki" }] },
  ];
</script>

<Story name="No Conditions (hidden)">
  <OverlayConditions mockCharacters={noConditions} />
</Story>

<Story name="One Condition">
  <OverlayConditions mockCharacters={oneCondition} />
</Story>

<Story name="Multiple Conditions + Depleted Resource">
  <OverlayConditions mockCharacters={multipleConditions} />
</Story>
