/**
 * Storybook socket mock
 * ====================
 * Replaces the real socket.js in Storybook context via Vite alias.
 * Exports the same interface as src/lib/socket.js but uses static
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
    class_primary: { name: "Guerrero", level: 5 },
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
    class_primary: { name: "Pícaro", level: 4 },
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
    class_primary: { name: "Mago", level: 3 },
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
