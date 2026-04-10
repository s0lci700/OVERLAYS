#!/usr/bin/env bun
/**
 * seed-full-demo.js
 * =================
 * Seeds ALL collections for the advisor meeting demo:
 *   abilities, campaigns, sessions, party, encounters
 *
 * Already-seeded collections (npc_templates, npc_instances, conditions_library)
 * are skipped — run seed-demo-data.js first if they're empty.
 *
 * Safe to re-run — idempotent (skips non-empty collections).
 */

require("dotenv").config();
const PocketBase = require("pocketbase/cjs");
const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

async function connect() {
  await pb.collection("_superusers").authWithPassword(process.env.PB_MAIL, process.env.PB_PASS);
}

async function isEmpty(col) {
  return (await pb.collection(col).getList(1, 1)).totalItems === 0;
}

async function getIds(col) {
  const res = await pb.collection(col).getList(1, 10);
  return res.items.map((r) => r.id);
}

// ── ABILITIES (D&D 5e class features + spells) ─────────────────────────────
const abilities = [
  // Cynthia — Rogue / Warlock
  {
    name: "Sneak Attack",
    type: "class_feature",
    action_cost: "none",
    resource_cost: { uses: "once_per_turn" },
    target: "single_enemy",
    effects: { damage: "1d6 extra", condition: "none" },
    concentration: "false",
    overlay_animation: "sneak",
  },
  {
    name: "Eldritch Blast",
    type: "cantrip",
    action_cost: "action",
    resource_cost: {},
    target: "single_enemy",
    effects: { damage: "1d10 force", range: "120ft" },
    concentration: "false",
    overlay_animation: "arcane",
  },
  {
    name: "Hex",
    type: "spell_1st",
    action_cost: "bonus_action",
    resource_cost: { spell_slots: 1 },
    target: "single_enemy",
    effects: { damage: "+1d6 necrotic", disadvantage_ability: "choice" },
    concentration: "true",
    overlay_animation: "curse",
  },
  // Hector — Barbarian
  {
    name: "Rage",
    type: "class_feature",
    action_cost: "bonus_action",
    resource_cost: { rages: 2 },
    target: "self",
    effects: { damage_bonus: "+2 melee", resistance: "bludgeoning,piercing,slashing", advantage: "strength_checks" },
    concentration: "false",
    overlay_animation: "rage",
  },
  {
    name: "Reckless Attack",
    type: "class_feature",
    action_cost: "none",
    resource_cost: {},
    target: "single_enemy",
    effects: { advantage_self: true, advantage_enemy: true },
    concentration: "false",
    overlay_animation: "reckless",
  },
  // Luis — Fighter / Ranger
  {
    name: "Action Surge",
    type: "class_feature",
    action_cost: "none",
    resource_cost: { uses: 1 },
    target: "self",
    effects: { extra_action: true },
    concentration: "false",
    overlay_animation: "surge",
  },
  {
    name: "Hunter's Mark",
    type: "spell_1st",
    action_cost: "bonus_action",
    resource_cost: { spell_slots: 1 },
    target: "single_enemy",
    effects: { damage: "+1d6", advantage: "perception_tracking" },
    concentration: "true",
    overlay_animation: "mark",
  },
  // Marcelo — Cleric
  {
    name: "Cure Wounds",
    type: "spell_1st",
    action_cost: "action",
    resource_cost: { spell_slots: 1 },
    target: "single_ally",
    effects: { heal: "1d8+mod", range: "touch" },
    concentration: "false",
    overlay_animation: "heal",
  },
  {
    name: "Channel Divinity: Preserve Life",
    type: "class_feature",
    action_cost: "action",
    resource_cost: { channel_divinity: 1 },
    target: "multi_ally",
    effects: { heal: "5x_level_distributed", range: "30ft" },
    concentration: "false",
    overlay_animation: "divine",
  },
  {
    name: "Sacred Flame",
    type: "cantrip",
    action_cost: "action",
    resource_cost: {},
    target: "single_enemy",
    effects: { damage: "1d8 radiant", save: "dex_dc13", range: "60ft" },
    concentration: "false",
    overlay_animation: "divine",
  },
];

// ── CAMPAIGN ───────────────────────────────────────────────────────────────
const campaignData = {
  name: "La Mina del Susurro Roto",
  setting: "Forgotten Realms — Sword Coast frontier. Abandoned dwarven mine overrun by goblin clan Rompepiedras. Party hired by merchants' guild to clear the route and recover stolen cargo.",
  status: "active",
  party_level: "1",
  dm_notes: "Session 3 — party reached the Amber Cavern. Boss Skarrik guards the stolen shipment. Possible ally: captured dwarf Borin Ironveil in cell block east.",
};

// ── SESSIONS (log of past sessions) ───────────────────────────────────────
const sessionsData = (campaignId) => [
  {
    campaign_id: campaignId,
    session_number: "1",
    date_played: "2026-02-17",
    session_log: "Party met at The Stumped Ox tavern. Accepted contract from Merchants' Guild rep Elara Voss. Traveled to mine entrance, dispatched two goblin sentries. Discovered clan Rompepiedras insignia carved into walls.",
    highlights: [
      "Hector rage-charged the north sentry, one-shotted it",
      "Cynthia pickpocketed map from sleeping goblin",
      "Marcelo stabilized Gnash instead of killing — possible info source",
      "Party earned 35 XP each",
    ],
  },
  {
    campaign_id: campaignId,
    session_number: "2",
    date_played: "2026-02-24",
    session_log: "Explored the Eastern Tunnels. Found the rusted mine cart puzzle. Luis scouted the Amber Cavern entrance — spotted Skarrik's camp through a crack in the rock. Goblin patrol ambushed the party in the narrow passage.",
    highlights: [
      "Luis critical hit with longbow — Wort fled and is now Frightened",
      "Cynthia used Hex for first time, burned only spell slot",
      "Party took rest in the cart depot — resources partially restored",
      "Discovered Borin Ironveil's name scratched into cell door",
    ],
  },
  {
    campaign_id: campaignId,
    session_number: "3",
    date_played: "2026-03-03",
    session_log: "CURRENT SESSION — Amber Cavern assault. Party pushed through Gnash and Wort into the main chamber. Cynthia critically wounded (2 HP). Skarrik the Pickaxe is using terrain advantage from the elevated platform.",
    highlights: [
      "Cynthia down to 2 HP — Marcelo burned Channel Divinity to keep her alive",
      "Hector poisoned by Giant Rat Tunnel Crawler bite",
      "Luis Frightened by Skarrik's terrifying shout, but keeping distance with bow",
      "Round 4 of combat — Skarrik still at full HP",
    ],
  },
];

// ── PARTY ──────────────────────────────────────────────────────────────────
const partyData = (campaignId, characterIds) => ({
  campaign_id: campaignId,
  characters_ids: characterIds,
  inspiration_pool: 1,
});

// ── ACTIVE ENCOUNTER ───────────────────────────────────────────────────────
const encounterData = (campaignId) => ({
  campaign_id: campaignId,
  status: "active",
  round: 4,
  turn_index: "2",
  combat_order: [
    { name: "Skarrik the Pickaxe", type: "enemy", initiative: 14 },
    { name: "Gnash", type: "enemy", initiative: 11 },
    { name: "HECTOR", type: "player", initiative: 10 },
    { name: "Wort", type: "enemy", initiative: 9 },
    { name: "MARCELO", type: "player", initiative: 8 },
    { name: "CYNTHIA", type: "player", initiative: 7 },
    { name: "Tunnel Crawler", type: "enemy", initiative: 6 },
    { name: "LUIS", type: "player", initiative: 5 },
  ],
});

// ── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  await connect();
  console.log("Connected to PocketBase\n");

  // 1. Abilities
  if (await isEmpty("abilities")) {
    for (const a of abilities) {
      const r = await pb.collection("abilities").create(a);
      console.log(`  Ability: ${r.name} [${r.type}]`);
    }
  } else {
    console.log("abilities: already seeded, skipping");
  }

  // 2. Campaign (must exist before sessions/party/encounters)
  let campaignId;
  if (await isEmpty("campaigns")) {
    const r = await pb.collection("campaigns").create(campaignData);
    campaignId = r.id;
    console.log(`\n  Campaign: "${r.name}" [${r.status}]`);
  } else {
    const existing = await pb.collection("campaigns").getList(1, 1);
    campaignId = existing.items[0].id;
    console.log(`\ncampaigns: already seeded (id: ${campaignId}), skipping`);
  }

  // 3. Sessions
  if (await isEmpty("sessions")) {
    for (const s of sessionsData(campaignId)) {
      const r = await pb.collection("sessions").create(s);
      console.log(`  Session ${r.session_number}: ${r.date_played}`);
    }
  } else {
    console.log("sessions: already seeded, skipping");
  }

  // 4. Party (link to existing characters)
  if (await isEmpty("party")) {
    const characterIds = await getIds("characters");
    if (characterIds.length > 0) {
      const r = await pb.collection("party").create(partyData(campaignId, characterIds));
      console.log(`\n  Party: ${characterIds.length} characters linked (inspiration pool: ${r.inspiration_pool})`);
    } else {
      console.log("\n  Party: no characters found — run seed.js first");
    }
  } else {
    console.log("\nparty: already seeded, skipping");
  }

  // 5. Encounter (active combat)
  if (await isEmpty("encounters")) {
    const r = await pb.collection("encounters").create(encounterData(campaignId));
    console.log(`\n  Encounter: round ${r.round}, ${r.combat_order.length} combatants, status: ${r.status}`);
  } else {
    console.log("\nencounters: already seeded, skipping");
  }

  console.log("\n✅ Full demo seeding complete!");
  console.log("\nPocketBase admin: http://localhost:8090/_/");
  console.log("Collections populated: abilities(10), campaigns(1), sessions(3), party(1), encounters(1)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  });
