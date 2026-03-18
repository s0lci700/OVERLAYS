<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CharacterProfileForm from "./CharacterProfileForm.svelte";
  import characterOptions from "$lib/data/character-options.template.json";

  const SERVER_URL = "http://localhost:3000";

  /** Full fighter character for edit-mode testing. */
  const kael = {
    id: "CH101",
    name: "Kael",
    player: "Mara",
    hp_current: 12,
    hp_max: 18,
    hp_temp: 0,
    armor_class: 16,
    speed_walk: 30,
    photo: null,
    class_primary: { name: "fighter", level: 5, subclass: "" },
    background: {
      name: "soldier",
      feat: "",
      skill_proficiencies: ["athletics", "intimidation"],
      tool_proficiency: "gaming_set",
    },
    species: { name: "human", size: "medium", speed_walk: 30, traits: [] },
    alignment: "lg",
    languages: ["common", "dwarvish"],
    proficiencies: {
      skills: ["athletics", "intimidation", "perception"],
      armor: ["light_armor", "medium_armor", "heavy_armor", "shields"],
      weapons: ["simple_weapons", "martial_weapons"],
      tools: ["gaming_set"],
    },
    equipment: {
      items: ["chain_mail", "longsword", "shield"],
      trinket: "",
      coins: { gp: 25, sp: 14, cp: 8 },
    },
    notes: { personality: "Stoic and loyal.", ideals: "Protect the weak." },
    conditions: [],
    resources: [],
  };

  /** Rogue with different class/species for contrast. */
  const lyra = {
    id: "CH102",
    name: "Lyra",
    player: "Nico",
    hp_current: 14,
    hp_max: 32,
    hp_temp: 0,
    armor_class: 15,
    speed_walk: 35,
    photo: null,
    class_primary: { name: "rogue", level: 5, subclass: "thief" },
    background: { name: "criminal", feat: "", skill_proficiencies: ["deception", "stealth"], tool_proficiency: "thieves_tools" },
    species: { name: "elf", size: "medium", speed_walk: 35, traits: ["darkvision"] },
    alignment: "cn",
    languages: ["common", "elvish"],
    proficiencies: {
      skills: ["acrobatics", "deception", "perception", "stealth"],
      armor: ["light_armor"],
      weapons: ["simple_weapons", "hand_crossbows"],
      tools: ["thieves_tools"],
    },
    equipment: {
      items: ["leather_armor", "rapier", "shortbow"],
      trinket: "",
      coins: { gp: 62, sp: 0, cp: 0 },
    },
    notes: {},
    conditions: [],
    resources: [],
  };

  const { Story } = defineMeta({
    title: "Stage/CharacterProfileForm",
    component: CharacterProfileForm,
    tags: ["autodocs"],
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "Edit form for an existing character's profile. " +
            "Accepts `character`, `SERVER_URL`, and `characterOptions` as props. " +
            "Save/level-up will fail gracefully (no server in Storybook).",
        },
      },
    },
    argTypes: {},
  });
</script>

<Story
  name="Fighter — Kael"
  args={{ character: kael, SERVER_URL, characterOptions }}
/>

<Story
  name="Rogue — Lyra"
  args={{ character: lyra, SERVER_URL, characterOptions }}
/>
