/**
 * Swap-friendly character fixtures for local demo/test sessions.
 * Replace this array to quickly load a different party without touching API logic.
 */
module.exports = [
  {
    id: "CH001",
    name: "El verdadero",
    player: "Lucas",
    hp_current: 28,
    hp_max: 35,
    hp_temp: 0,
    armor_class: 17,
    speed_walk: 30,
    ability_scores: { str: 16, dex: 14, con: 14, int: 12, wis: 13, cha: 16 },
    conditions: [],
    resources: [
      {
        id: "RS001",
        name: "RAGE",
        pool_max: 3,
        pool_current: 3,
        recharge: "LONG_REST",
      },
      {
        id: "RS002",
        name: "INSPIRACIÓN",
        pool_max: 1,
        pool_current: 0,
        recharge: "DM",
      },
    ],
  },
  {
    id: "CH002",
    name: "B12",
    player: "Sol",
    hp_current: 30,
    hp_max: 30,
    hp_temp: 0,
    armor_class: 16,
    speed_walk: 35,
    ability_scores: { str: 14, dex: 18, con: 12, int: 11, wis: 14, cha: 13 },
    conditions: [],
    resources: [
      {
        id: "RS003",
        name: "KI",
        pool_max: 5,
        pool_current: 5,
        recharge: "SHORT_REST",
      },
      {
        id: "RS004",
        name: "SNEAK ATK",
        pool_max: 1,
        pool_current: 1,
        recharge: "TURN",
      },
    ],
  },
];



