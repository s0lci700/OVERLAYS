#!/usr/bin/env bun
/**
 * Seeds npc_templates, npc_instances, and conditions_library with
 * mid-combat demo data for the D&D advisor meeting.
 * Safe to re-run — skips if records already exist.
 */
require("dotenv").config();
const PocketBase = require("pocketbase/cjs");
const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

async function connect() {
  await pb.collection("_superusers").authWithPassword(process.env.PB_MAIL, process.env.PB_PASS);
}

async function isEmpty(collection) {
  return (await pb.collection(collection).getList(1, 1)).totalItems === 0;
}

// ── NPC Templates (Monster Manual stat blocks) ─────────────────────────────
const npcTemplates = [
  {
    name: "Goblin",
    cr: "1/4",
    hp_max: 7,
    armor_class: 15,
    ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    resistances: {},
  },
  {
    name: "Goblin Boss",
    cr: "1",
    hp_max: 21,
    armor_class: 17,
    ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 8, cha: 10 },
    resistances: {},
  },
  {
    name: "Giant Rat",
    cr: "1/8",
    hp_max: 7,
    armor_class: 12,
    ability_scores: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 },
    resistances: {},
  },
];

// ── NPC Instances (enemies active in THIS encounter) ───────────────────────
// Note: template_id and encounter_id are relations — left blank for demo
const npcInstances = [
  {
    display_name: "Skarrik the Pickaxe",
    hp_current: 21,
    conditions: [],
  },
  {
    display_name: "Gnash",
    hp_current: 7,
    conditions: [],
  },
  {
    display_name: "Wort",
    hp_current: 4,
    conditions: ["Frightened"],
  },
  {
    display_name: "Tunnel Crawler",
    hp_current: 7,
    conditions: [],
  },
];

// ── Conditions Library (D&D 5e PHB p.290-292) ──────────────────────────────
const conditionsLibrary = [
  {
    name: "Frightened",
    type: "debuff",
    mech_effects: { note: "Disadvantage on ability checks and attack rolls while source of fear is in line of sight. Cannot willingly move closer to the source." },
    duration_type: "concentration",
    is_stackable: "false",
  },
  {
    name: "Poisoned",
    type: "debuff",
    mech_effects: { note: "Disadvantage on attack rolls and ability checks." },
    duration_type: "timed",
    is_stackable: "false",
  },
  {
    name: "Prone",
    type: "debuff",
    mech_effects: { note: "Attack rolls against creature have advantage if within 5ft, otherwise disadvantage. Own attacks have disadvantage. Moving from prone costs half speed." },
    duration_type: "until_action",
    is_stackable: "false",
  },
  {
    name: "Blinded",
    type: "debuff",
    mech_effects: { note: "Fails ability checks requiring sight. Attack rolls against creature have advantage; creature's own attacks have disadvantage." },
    duration_type: "timed",
    is_stackable: "false",
  },
  {
    name: "Restrained",
    type: "debuff",
    mech_effects: { note: "Speed becomes 0. Attack rolls against creature have advantage. Own attacks and Dex saves have disadvantage." },
    duration_type: "until_action",
    is_stackable: "false",
  },
  {
    name: "Stunned",
    type: "debuff",
    mech_effects: { note: "Incapacitated (no actions or reactions). Fails Str and Dex saves. Attack rolls against creature have advantage." },
    duration_type: "timed",
    is_stackable: "false",
  },
];

async function main() {
  await connect();
  console.log("Connected to PocketBase");

  // Seed npc_templates
  if (await isEmpty("npc_templates")) {
    for (const t of npcTemplates) {
      const r = await pb.collection("npc_templates").create(t);
      console.log(`  Template: ${r.name} [CR ${r.cr}]`);
    }
  } else {
    console.log("npc_templates: already seeded, skipping");
  }

  // Seed npc_instances
  if (await isEmpty("npc_instances")) {
    for (const n of npcInstances) {
      const r = await pb.collection("npc_instances").create(n);
      console.log(`  Instance: ${r.display_name} (${r.hp_current} HP)`);
    }
  } else {
    console.log("npc_instances: already seeded, skipping");
  }

  // Seed conditions_library
  if (await isEmpty("conditions_library")) {
    for (const c of conditionsLibrary) {
      const r = await pb.collection("conditions_library").create(c);
      console.log(`  Condition: ${r.name}`);
    }
  } else {
    console.log("conditions_library: already seeded, skipping");
  }

  console.log("\nDemo data seeding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  });
