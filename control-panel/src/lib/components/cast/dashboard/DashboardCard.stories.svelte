<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DashboardCard from "./DashboardCard.svelte";

  const fullCharacter = {
    id: "CH101",
    name: "Kael Stoneblade",
    player: "Mara",
    hp_current: 12,
    hp_max: 18,
    hp_temp: 3,
    armor_class: 16,
    speed_walk: 30,
    photo: null,
    class_primary: { name: "Guerrero", level: 5 },
    ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
    conditions: [
      { id: "cond1", condition_name: "Envenenado", intensity_level: 1 },
    ],
    resources: [
      { id: "r1", name: "Surges", pool_current: 3, pool_max: 5, recharge: "SHORT_REST" },
    ],
  };

  const minimalCharacter = {
    id: "CH002",
    name: "Lyra",
    player: "Nico",
    hp_current: 8,
    hp_max: 8,
    hp_temp: 0,
    armor_class: 14,
    speed_walk: 35,
    photo: null,
    ability_scores: { str: 8, dex: 18, con: 12, int: 14, wis: 13, cha: 16 },
    conditions: [],
    resources: [],
  };

  const criticalCharacter = {
    id: "CH003",
    name: "Brum Ironfist",
    player: "Iris",
    hp_current: 1,
    hp_max: 9,
    hp_temp: 0,
    armor_class: 11,
    speed_walk: 25,
    photo: null,
    ability_scores: { str: 8, dex: 10, con: 12, int: 18, wis: 15, cha: 10 },
    conditions: [
      { id: "c1", condition_name: "Aturdido", intensity_level: null },
      { id: "c2", condition_name: "Asustado", intensity_level: 2 },
    ],
    resources: [
      { id: "r2", name: "Slots Nv.1", pool_current: 0, pool_max: 4, recharge: "LONG_REST" },
    ],
  };

  const { Story } = defineMeta({
    title: "Components/DashboardCard",
    component: DashboardCard,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Read-only dashboard view of a character. Monitor-first layout showing all stats, conditions, and resources.",
        },
      },
    },
  });
</script>

<Story name="Full Character" args={{ character: fullCharacter }} />

<Story name="No Conditions or Resources" args={{ character: minimalCharacter }} />

<Story name="Critical HP" args={{ character: criticalCharacter }} />

<Story name="Empty / Undefined Data" args={{ character: {} }} />

<Story name="Party Dashboard">
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; padding: 16px;">
    <DashboardCard character={fullCharacter} />
    <DashboardCard character={minimalCharacter} />
    <DashboardCard character={criticalCharacter} />
  </div>
</Story>
