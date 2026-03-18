/**
 * Storybook socket mock
 * ====================
 * Replaces the real socket.js in Storybook context via Vite alias.
 * Exports the same interface as src/lib/stores/socket.js but uses static
 * writable stores populated with demo data — no server connection required.
 */
import { writable } from "svelte/store";

export const SERVER_URL = "http://localhost:3000";

/** Mock character data matching the full character schema. */
const MOCK_CHARACTERS = [
  {
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
    species: {
      name: "human",
      size: "medium",
      speed_walk: 30,
      traits: [],
    },
    languages: ["common", "dwarvish", "orc"],
    alignment: "lg",
    proficiencies: {
      skills: ["athletics", "intimidation"],
      saving_throws: ["str", "con"],
      armor: ["light", "medium", "heavy", "shields"],
      weapons: ["simple", "martial"],
      tools: ["gaming_set"],
    },
    equipment: {
      items: ["chain_mail", "shield", "longsword"],
      coins: { gp: 15, sp: 0, cp: 0 },
      trinket: "",
    },
    notes: {
      appearance: "Tall, scarred, calm",
      personality: "Disciplined and loyal",
      ideals: "Protect the weak",
      bonds: "Old unit",
      flaws: "Slow to trust",
    },
    ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
    conditions: [
      { id: "cond1", condition_name: "Envenenado", intensity_level: 1 },
    ],
    resources: [
      {
        id: "r1",
        name: "Surges",
        pool_current: 3,
        pool_max: 5,
        recharge: "SHORT_REST",
      },
    ],
  },
  {
    id: "CH102",
    name: "Lyra",
    player: "Nico",
    hp_current: 6,
    hp_max: 8,
    hp_temp: 0,
    armor_class: 14,
    speed_walk: 35,
    photo: null,
    class_primary: { name: "bard", level: 4, subclass: "" },
    background: {
      name: "acolyte",
      feat: "",
      skill_proficiencies: ["insight", "persuasion"],
      tool_proficiency: "musical_instrument",
    },
    species: {
      name: "elf",
      size: "medium",
      speed_walk: 35,
      traits: [],
    },
    languages: ["common", "elvish", "celestial"],
    alignment: "ng",
    proficiencies: {
      skills: ["insight", "persuasion"],
      saving_throws: ["dex", "cha"],
      armor: ["light"],
      weapons: ["simple"],
      tools: ["musical_instrument"],
    },
    equipment: {
      items: ["leather_armor", "rapier", "lute"],
      coins: { gp: 10, sp: 5, cp: 0 },
      trinket: "",
    },
    notes: {
      appearance: "Silver hair, bright eyes",
      personality: "Curious and optimistic",
      ideals: "Knowledge",
      bonds: "Temple mentor",
      flaws: "Overconfident",
    },
    ability_scores: { str: 8, dex: 18, con: 12, int: 14, wis: 13, cha: 16 },
    conditions: [],
    resources: [],
  },
  {
    id: "CH103",
    name: "Brum",
    player: "Iris",
    hp_current: 2,
    hp_max: 9,
    hp_temp: 3,
    armor_class: 13,
    speed_walk: 25,
    photo: null,
    class_primary: { name: "cleric", level: 3, subclass: "" },
    background: {
      name: "sage",
      feat: "",
      skill_proficiencies: ["history", "medicine"],
      tool_proficiency: "herbalism_kit",
    },
    species: {
      name: "dwarf",
      size: "medium",
      speed_walk: 25,
      traits: [],
    },
    languages: ["common", "dwarvish", "giant"],
    alignment: "ln",
    proficiencies: {
      skills: ["history", "medicine"],
      saving_throws: ["wis", "cha"],
      armor: ["light", "medium", "shields"],
      weapons: ["simple"],
      tools: ["herbalism_kit"],
    },
    equipment: {
      items: ["scale_mail", "shield", "mace"],
      coins: { gp: 5, sp: 0, cp: 10 },
      trinket: "",
    },
    notes: {
      appearance: "Broad shoulders, braided beard",
      personality: "Patient and methodical",
      ideals: "Duty",
      bonds: "Clan archive",
      flaws: "Stubborn",
    },
    ability_scores: { str: 8, dex: 10, con: 12, int: 18, wis: 15, cha: 10 },
    conditions: [
      { id: "cond2", condition_name: "Aturdido", intensity_level: null },
      { id: "cond3", condition_name: "Asustado", intensity_level: 2 },
    ],
    resources: [
      { id: "r2", name: "Slots Nv.1", pool_current: 2, pool_max: 4, recharge: "LONG_REST" },
      { id: "r3", name: "Slots Nv.2", pool_current: 0, pool_max: 2, recharge: "LONG_REST" },
    ],
  },
];

export const characters = writable(MOCK_CHARACTERS);
export const lastRoll = writable(null);

/** No-op mock socket — same shape, no real events. */
export const socket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  connected: false,
};
