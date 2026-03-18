<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CharacterCard from "./CharacterCard.svelte";

  /** Reusable base character — healthy fighter. */
  const healthyCharacter = {
    id: "CH101",
    name: "Kael",
    player: "Mara",
    hp_current: 18,
    hp_max: 18,
    armor_class: 16,
    speed_walk: 30,
    photo: null,
    class_primary: { name: "Guerrero", level: 5 },
    conditions: [],
    resources: [
      { id: "r1", name: "Surges", pool_current: 4, pool_max: 5, recharge: "SHORT_REST" },
    ],
  };

  const injuredCharacter = {
    ...healthyCharacter,
    id: "CH102",
    name: "Lyra",
    player: "Nico",
    hp_current: 5,
    hp_max: 14,
    class_primary: { name: "Pícaro", level: 4 },
    conditions: [
      { id: "cond1", condition_name: "Envenenado", intensity_level: 1 },
    ],
    resources: [],
  };

  const criticalCharacter = {
    ...healthyCharacter,
    id: "CH103",
    name: "Brum",
    player: "Iris",
    hp_current: 2,
    hp_max: 9,
    class_primary: { name: "Mago", level: 3 },
    conditions: [
      { id: "cond2", condition_name: "Aturdido", intensity_level: null },
      { id: "cond3", condition_name: "Asustado", intensity_level: 2 },
    ],
    resources: [
      { id: "r2", name: "Slots Nv.1", pool_current: 0, pool_max: 4, recharge: "LONG_REST" },
      { id: "r3", name: "Slots Nv.2", pool_current: 0, pool_max: 2, recharge: "LONG_REST" },
    ],
  };

  const { Story } = defineMeta({
    title: "Components/CharacterCard",
    component: CharacterCard,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Real-time character card. Damage/heal buttons call the server API — they will show an error toast in Storybook since no server is running.",
        },
      },
    },
    argTypes: {
      selectable: { control: "boolean" },
      selected: { control: "boolean" },
    },
  });
</script>

<Story name="Healthy" args={{ character: healthyCharacter }} />

<Story name="Injured" args={{ character: injuredCharacter }} />

<Story name="Critical" args={{ character: criticalCharacter }} />

<Story name="Selectable" args={{ character: healthyCharacter, selectable: true, selected: false }} />

<Story name="Selected" args={{ character: healthyCharacter, selectable: true, selected: true }} />

<Story name="Party View">
  <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px; max-width: 480px;">
    <CharacterCard character={healthyCharacter} />
    <CharacterCard character={injuredCharacter} />
    <CharacterCard character={criticalCharacter} />
  </div>
</Story>
