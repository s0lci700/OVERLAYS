const characters = require("../data/template-characters.json");
const PocketBase = require("pocketbase/cjs");
const pb = new PocketBase(
  process.env.POCKETBASE_URL || "http://127.0.0.1:8090",
);

async function exists(pb) {
  return (await pb.collection("characters").getList(1, 1)).totalItems > 0;
}

async function connect(pb) {
  return await pb
    .collection("_superusers")
    .authWithPassword(process.env.PB_MAIL, process.env.PB_PASS);
}

function JSONToCharacter(json) {
  return {
    campaign_id: json.campaign_id,
    id: json.id,
    name: json.name,
    player: json.player,
    hp_current: json.hp_current,
    hp_max: json.hp_max,
    hp_temp: json.hp_temp,
    ability_scores: json.ability_scores,
    turn_state: json.turn_state,
    death_state: json.death_state,
    armor_class: json.armor_class,
    speed_walk: json.speed_walk,
    entity_type: json.entity_type,
    visible_to_players: json.visible_to_players,
    class_primary: json.class_primary,
    conditions: json.conditions,
    resources: json.resources,
    background: json.background,
    species: json.species,
    languages: json.languages,
    alignment: json.alignment,
    proficiencies: json.proficiencies,
    equipment: json.equipment,
    photo: json.photo,
  };
}

async function main(pb) {
  await connect(pb).catch((err) => {
    console.error("Failed to connect to PocketBase");
    process.exit(1);
  });

  if (await exists(pb)) {
    console.error("Characters already exist, skipping seeding.");
    process.exit(0);
  }
  // Proceed with seeding
  for (const charJson of characters) {
    const char = JSONToCharacter(charJson);
    await pb.collection("characters").create(char);
  }
  return "Seeding successful";
}

main(pb)
  .then((result) => {
    console.log("Seeding completed:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
