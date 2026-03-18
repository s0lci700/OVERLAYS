<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PlayerSheet from "./PlayerSheet.svelte";

  /* ── Mock characters ── */

  const fullCharacter = {
    id: "CH101",
    name: "Kael Stoneblade",
    player: "Mara",
    hp_current: 38,
    hp_max: 45,
    hp_temp: 5,
    armor_class: 18,
    speed_walk: 30,
    photo: null,
    alignment: "lg",
    class_primary: { name: "Guerrero", level: 7 },
    species: {
      name: "humano",
      speed_walk: 30,
      traits: ["extra_language", "extra_skill", "versatile"],
    },
    ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
    proficiencies: {
      saving_throws: ["str", "con"],
      skills: ["athletics", "intimidation", "perception", "history"],
      armor: ["light_armor", "medium_armor", "heavy_armor", "shields"],
      weapons: ["simple_weapons", "martial_weapons"],
      tools: ["playing_cards"],
    },
    conditions: [
      { id: "cond1", condition_name: "Envenenado", intensity_level: 1 },
    ],
    resources: [
      { id: "r1", name: "Action Surge", pool_current: 1, pool_max: 1, recharge: "SHORT_REST" },
      { id: "r2", name: "Second Wind", pool_current: 0, pool_max: 1, recharge: "SHORT_REST" },
    ],
    equipment: {
      items: ["chain_mail", "longsword", "shield", "handaxe", "explorer_pack"],
      coins: { gp: 25, sp: 14, cp: 8 },
    },
    languages: ["comun", "elficO", "enano"],
    notes: {
      personality: "I can stare down a hell hound without flinching.",
      ideals: "Might makes right. The strong must protect the weak.",
      bonds: "I fight for my home village of Farrow's End.",
      flaws: "I have little respect for anyone who is not a proven warrior.",
    },
  };

  const criticalCharacter = {
    id: "CH103",
    name: "Brum Ironfist",
    player: "Iris",
    hp_current: 2,
    hp_max: 28,
    hp_temp: 0,
    armor_class: 13,
    speed_walk: 25,
    photo: null,
    alignment: "cg",
    class_primary: { name: "Mago", level: 5 },
    species: {
      name: "gnomo",
      speed_walk: 25,
      traits: ["gnome_cunning", "darkvision", "artificers_lore"],
    },
    ability_scores: { str: 8, dex: 10, con: 12, int: 18, wis: 15, cha: 10 },
    proficiencies: {
      saving_throws: ["int", "wis"],
      skills: ["arcana", "history", "investigation", "medicine"],
      armor: [],
      weapons: ["daggers", "darts", "slings", "quarterstaffs", "light_crossbows"],
      tools: [],
    },
    conditions: [
      { id: "c1", condition_name: "Aturdido", intensity_level: null },
      { id: "c2", condition_name: "Asustado", intensity_level: 2 },
      { id: "c3", condition_name: "Concentracion", intensity_level: null },
    ],
    resources: [
      { id: "r3", name: "Slots Nv.1", pool_current: 0, pool_max: 4, recharge: "LONG_REST" },
      { id: "r4", name: "Slots Nv.2", pool_current: 1, pool_max: 3, recharge: "LONG_REST" },
      { id: "r5", name: "Slots Nv.3", pool_current: 0, pool_max: 2, recharge: "LONG_REST" },
      { id: "r6", name: "Arcane Recovery", pool_current: 0, pool_max: 1, recharge: "LONG_REST" },
    ],
    equipment: {
      items: ["spellbook", "dagger", "component_pouch", "scholar_pack"],
      coins: { gp: 4, sp: 0, cp: 3 },
    },
    languages: ["comun", "gnomlsh", "sylvan"],
    notes: {
      personality: "There's nothing I like more than a good mystery.",
      flaws: "I overlook obvious solutions in favor of complicated ones.",
    },
  };

  const woundedCharacter = {
    id: "CH102",
    name: "Lyra Nightwhisper",
    player: "Nico",
    hp_current: 14,
    hp_max: 32,
    hp_temp: 0,
    armor_class: 15,
    speed_walk: 35,
    photo: null,
    alignment: "cn",
    class_primary: { name: "Pícaro", level: 5 },
    species: {
      name: "elfo",
      speed_walk: 35,
      traits: ["darkvision", "fey_ancestry", "trance", "keen_senses"],
    },
    ability_scores: { str: 8, dex: 18, con: 12, int: 14, wis: 13, cha: 16 },
    proficiencies: {
      saving_throws: ["dex", "int"],
      skills: ["acrobatics", "deception", "perception", "sleight_of_hand", "stealth"],
      armor: ["light_armor"],
      weapons: ["simple_weapons", "hand_crossbows", "longswords", "rapiers", "shortswords"],
      tools: ["thieves_tools"],
    },
    conditions: [],
    resources: [
      { id: "r7", name: "Sneak Attack", pool_current: 1, pool_max: 1, recharge: "TURN" },
      { id: "r8", name: "Uncanny Dodge", pool_current: 1, pool_max: 1, recharge: "TURN" },
    ],
    equipment: {
      items: ["leather_armor", "rapier", "shortbow", "thieves_tools", "burglar_pack"],
      coins: { gp: 62, sp: 0, cp: 0 },
    },
    languages: ["comun", "elficO"],
    notes: {
      personality: "I always have a plan for what to do when things go wrong.",
      ideals: "Freedom. Chains are meant to be broken.",
    },
  };

  const fullHealthCharacter = {
    ...woundedCharacter,
    id: "CH104",
    name: "Zara Brightflame",
    hp_current: 32,
    hp_max: 32,
    alignment: "ng",
    conditions: [],
  };

  const { Story } = defineMeta({
    title: "Cast/PlayerSheet",
    component: PlayerSheet,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      viewport: {
        defaultViewport: "mobile1",
      },
      docs: {
        description: {
          component: `
**PlayerSheet** is the mobile character sheet shown to each player during a session.

Read-only — no edits here. Receives live HP updates via Socket.io in production.

### HP States
| Class | Range | Color |
|-------|-------|-------|
| _(none)_ | >60% | Green |
| \`is-wounded\` | 31–60% | Yellow |
| \`is-critical\` | 1–30% | Red flash |
| \`is-down\` | 0% | Dark / skull |
          `,
        },
      },
    },
  });
</script>

<Story
  name="Full — Healthy"
  args={{ character: fullCharacter }}
/>

<Story
  name="Wounded (31–60% HP)"
  args={{ character: woundedCharacter }}
/>

<Story
  name="Critical HP under 30pct"
  args={{ character: criticalCharacter }}
/>

<Story
  name="Full Health (100%)"
  args={{ character: fullHealthCharacter }}
/>

<Story name="Not Found — no character">
  <PlayerSheet character={null} />
</Story>
