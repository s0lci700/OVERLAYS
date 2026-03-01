const { describe, test, expect, beforeEach } = require("bun:test");
const {
  characters,
  getAll,
  findById,
  getCharacterName,
  updateHp,
  updatePhoto,
  updateCharacterData,
  addCondition,
  removeCondition,
  removeCharacter,
  updateResource,
  restoreResources,
  createCharacter,
} = require("./characters");

/** Build a minimal valid character fixture. */
function makeChar(overrides = {}) {
  return {
    id: "TEST1",
    name: "Zara",
    player: "Sol",
    hp_current: 20,
    hp_max: 30,
    hp_temp: 0,
    armor_class: 15,
    speed_walk: 30,
    class_primary: { name: "Barbarian", level: 3, subclass: "" },
    background: {
      name: "Outlander",
      feat: "",
      skill_proficiencies: [],
      tool_proficiency: "",
    },
    species: { name: "Human", size: "Medium", speed_walk: 30, traits: [] },
    languages: ["Common"],
    alignment: "neutral",
    proficiencies: {
      skills: [],
      saving_throws: [],
      armor: [],
      weapons: [],
      tools: [],
    },
    equipment: { items: [], coins: { gp: 0, sp: 0, cp: 0 }, trinket: "" },
    ability_scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    conditions: [],
    resources: [],
    photo: "/assets/img/barbarian.png",
    ...overrides,
  };
}

beforeEach(() => {
  // Reset shared module state before every test.
  characters.splice(0);
  characters.push(makeChar());
});

// ── getAll ───────────────────────────────────────────────────

describe("getAll", () => {
  test("returns the live characters array", () => {
    const result = getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });
});

// ── findById ─────────────────────────────────────────────────

describe("findById", () => {
  test("returns the character with the matching id", () => {
    const char = findById("TEST1");
    expect(char).toBeTruthy();
    expect(char.id).toBe("TEST1");
  });

  test("returns undefined for an unknown id", () => {
    expect(findById("ZZZZZ")).toBeUndefined();
  });
});

// ── getCharacterName ─────────────────────────────────────────

describe("getCharacterName", () => {
  test("returns the character name for a known id", () => {
    expect(getCharacterName("TEST1")).toBe("Zara");
  });

  test("returns 'Unknown' for an id that does not exist", () => {
    expect(getCharacterName("ZZZZZ")).toBe("Unknown");
  });
});

// ── updateHp ─────────────────────────────────────────────────

describe("updateHp", () => {
  test("updates hp_current to the given value", () => {
    expect(updateHp("TEST1", 15).hp_current).toBe(15);
  });

  test("clamps to 0 for negative values", () => {
    expect(updateHp("TEST1", -10).hp_current).toBe(0);
  });

  test("clamps to hp_max for values above the maximum", () => {
    expect(updateHp("TEST1", 999).hp_current).toBe(30);
  });

  test("allows exactly 0", () => {
    expect(updateHp("TEST1", 0).hp_current).toBe(0);
  });

  test("allows exactly hp_max", () => {
    expect(updateHp("TEST1", 30).hp_current).toBe(30);
  });

  test("returns null for an unknown id", () => {
    expect(updateHp("ZZZZZ", 10)).toBeNull();
  });
});

// ── updatePhoto ──────────────────────────────────────────────

describe("updatePhoto", () => {
  test("sets photo to the given URL", () => {
    const char = updatePhoto("TEST1", "https://example.com/new.png");
    expect(char.photo).toBe("https://example.com/new.png");
  });

  test("trims whitespace from the photo string", () => {
    const char = updatePhoto("TEST1", "  https://example.com/new.png  ");
    expect(char.photo).toBe("https://example.com/new.png");
  });

  test("assigns a fallback photo when given an empty string", () => {
    const char = updatePhoto("TEST1", "");
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("returns null for an unknown id", () => {
    expect(updatePhoto("ZZZZZ", "https://example.com/img.png")).toBeNull();
  });
});

// ── updateCharacterData ──────────────────────────────────────

describe("updateCharacterData", () => {
  test("updates name and trims whitespace", () => {
    const char = updateCharacterData("TEST1", { name: "  New Name  " });
    expect(char.name).toBe("New Name");
  });

  test("does not change name when the field is absent", () => {
    updateCharacterData("TEST1", { player: "Other" });
    expect(findById("TEST1").name).toBe("Zara");
  });

  test("enforces hp_max minimum of 1", () => {
    const char = updateCharacterData("TEST1", { hp_max: 0 });
    expect(char.hp_max).toBeGreaterThanOrEqual(1);
  });

  test("re-clamps hp_current when hp_max is lowered below it", () => {
    // hp_current starts at 20, hp_max at 30 → lower hp_max to 10
    const char = updateCharacterData("TEST1", { hp_max: 10 });
    expect(char.hp_max).toBe(10);
    expect(char.hp_current).toBe(10);
  });

  test("ignores a non-finite hp_max", () => {
    const before = findById("TEST1").hp_max;
    updateCharacterData("TEST1", { hp_max: NaN });
    expect(findById("TEST1").hp_max).toBe(before);
  });

  test("updates class_primary fields", () => {
    const char = updateCharacterData("TEST1", {
      class_primary: { name: "Wizard", level: 5, subclass: "Evoker" },
    });
    expect(char.class_primary.name).toBe("Wizard");
    expect(char.class_primary.level).toBe(5);
    expect(char.class_primary.subclass).toBe("Evoker");
  });

  test("normalizes proficiency lists — filters non-string and empty entries", () => {
    const char = updateCharacterData("TEST1", {
      proficiencies: { skills: ["Acrobatics", "  ", 42, "Stealth"] },
    });
    expect(char.proficiencies.skills).toEqual(["Acrobatics", "Stealth"]);
  });

  test("returns null for an unknown id", () => {
    expect(updateCharacterData("ZZZZZ", { name: "Ghost" })).toBeNull();
  });
});

// ── addCondition ─────────────────────────────────────────────

describe("addCondition", () => {
  test("appends a condition to the character", () => {
    const char = addCondition("TEST1", { condition_name: "Poisoned" });
    expect(char.conditions).toHaveLength(1);
    expect(char.conditions[0].condition_name).toBe("Poisoned");
  });

  test("condition id is a 5-character string", () => {
    addCondition("TEST1", { condition_name: "Blinded" });
    const id = findById("TEST1").conditions[0].id;
    expect(typeof id).toBe("string");
    expect(id).toHaveLength(5);
  });

  test("intensity_level defaults to 1", () => {
    addCondition("TEST1", { condition_name: "Stunned" });
    expect(findById("TEST1").conditions[0].intensity_level).toBe(1);
  });

  test("uses the provided intensity_level", () => {
    addCondition("TEST1", { condition_name: "Frightened", intensity_level: 3 });
    expect(findById("TEST1").conditions[0].intensity_level).toBe(3);
  });

  test("applied_at is a valid ISO 8601 timestamp", () => {
    addCondition("TEST1", { condition_name: "Cursed" });
    const ts = findById("TEST1").conditions[0].applied_at;
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  test("returns null for an unknown character id", () => {
    expect(addCondition("ZZZZZ", { condition_name: "Cursed" })).toBeNull();
  });
});

// ── removeCondition ──────────────────────────────────────────

describe("removeCondition", () => {
  test("removes the condition with the matching id", () => {
    addCondition("TEST1", { condition_name: "Paralyzed" });
    const condId = findById("TEST1").conditions[0].id;
    removeCondition("TEST1", condId);
    expect(findById("TEST1").conditions).toHaveLength(0);
  });

  test("only removes the targeted condition when multiple exist", () => {
    addCondition("TEST1", { condition_name: "Blinded" });
    addCondition("TEST1", { condition_name: "Deafened" });
    const condId = findById("TEST1").conditions[0].id;
    removeCondition("TEST1", condId);
    expect(findById("TEST1").conditions).toHaveLength(1);
    expect(findById("TEST1").conditions[0].condition_name).toBe("Deafened");
  });

  test("is a no-op when conditionId does not match any condition", () => {
    addCondition("TEST1", { condition_name: "Charmed" });
    removeCondition("TEST1", "ZZZZZ");
    expect(findById("TEST1").conditions).toHaveLength(1);
  });

  test("returns null for an unknown character id", () => {
    expect(removeCondition("ZZZZZ", "ABC12")).toBeNull();
  });
});

// ── removeCharacter ──────────────────────────────────────────

describe("removeCharacter", () => {
  test("returns true and removes the character", () => {
    const result = removeCharacter("TEST1");
    expect(result).toBe(true);
    expect(findById("TEST1")).toBeUndefined();
  });

  test("returns false for an unknown id", () => {
    expect(removeCharacter("ZZZZZ")).toBe(false);
  });

  test("does not affect other characters in the list", () => {
    characters.push(makeChar({ id: "TEST2", name: "Brom" }));
    removeCharacter("TEST1");
    expect(findById("TEST2")).toBeTruthy();
    expect(getAll()).toHaveLength(1);
  });
});

// ── updateResource ───────────────────────────────────────────

describe("updateResource", () => {
  beforeEach(() => {
    findById("TEST1").resources = [
      { id: "RS001", name: "Rage", pool_max: 3, pool_current: 3, recharge: "SHORT_REST" },
    ];
  });

  test("sets pool_current to the given value", () => {
    const resource = updateResource("TEST1", "RS001", 1);
    expect(resource.pool_current).toBe(1);
  });

  test("clamps pool_current to 0 for negative values", () => {
    expect(updateResource("TEST1", "RS001", -5).pool_current).toBe(0);
  });

  test("clamps pool_current to pool_max for values above the maximum", () => {
    expect(updateResource("TEST1", "RS001", 999).pool_current).toBe(3);
  });

  test("returns null for an unknown character id", () => {
    expect(updateResource("ZZZZZ", "RS001", 1)).toBeNull();
  });

  test("returns null for an unknown resource id", () => {
    expect(updateResource("TEST1", "RS999", 1)).toBeNull();
  });
});

// ── restoreResources ─────────────────────────────────────────

describe("restoreResources", () => {
  beforeEach(() => {
    findById("TEST1").resources = [
      { id: "RS001", name: "Rage",       pool_max: 3, pool_current: 0, recharge: "SHORT_REST" },
      { id: "RS002", name: "SpellSlots", pool_max: 4, pool_current: 0, recharge: "LONG_REST"  },
      { id: "RS003", name: "Inspiration",pool_max: 1, pool_current: 0, recharge: "DM"         },
    ];
  });

  test("short rest refills SHORT_REST resources to pool_max", () => {
    restoreResources("TEST1", "short");
    expect(findById("TEST1").resources[0].pool_current).toBe(3);
  });

  test("short rest does NOT refill LONG_REST resources", () => {
    restoreResources("TEST1", "short");
    expect(findById("TEST1").resources[1].pool_current).toBe(0);
  });

  test("short rest does NOT refill DM resources", () => {
    restoreResources("TEST1", "short");
    expect(findById("TEST1").resources[2].pool_current).toBe(0);
  });

  test("long rest refills both SHORT_REST and LONG_REST resources", () => {
    restoreResources("TEST1", "long");
    const { resources } = findById("TEST1");
    expect(resources[0].pool_current).toBe(3);
    expect(resources[1].pool_current).toBe(4);
  });

  test("long rest does NOT refill DM resources", () => {
    restoreResources("TEST1", "long");
    expect(findById("TEST1").resources[2].pool_current).toBe(0);
  });

  test("returns the names of restored resources", () => {
    const result = restoreResources("TEST1", "long");
    expect(result.restored).toContain("Rage");
    expect(result.restored).toContain("SpellSlots");
    expect(result.restored).not.toContain("Inspiration");
  });

  test("short rest restored list only includes SHORT_REST names", () => {
    const result = restoreResources("TEST1", "short");
    expect(result.restored).toEqual(["Rage"]);
  });

  test("result includes the updated character", () => {
    const result = restoreResources("TEST1", "short");
    expect(result.character.id).toBe("TEST1");
  });

  test("returns null for an unknown character id", () => {
    expect(restoreResources("ZZZZZ", "short")).toBeNull();
  });
});

// ── createCharacter ──────────────────────────────────────────

describe("createCharacter", () => {
  test("creates a character with a 5-char string id", () => {
    const char = createCharacter({ name: "Hero", player: "Player 1", hp_max: 25 });
    expect(typeof char.id).toBe("string");
    expect(char.id).toHaveLength(5);
  });

  test("hp_current defaults to hp_max when omitted", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 20 });
    expect(char.hp_current).toBe(20);
  });

  test("hp_current is clamped to hp_max when above it", () => {
    const char = createCharacter({
      name: "Hero",
      player: "Player",
      hp_max: 10,
      hp_current: 50,
    });
    expect(char.hp_current).toBe(10);
  });

  test("hp_max is at minimum 1 even if 0 is passed", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 0 });
    expect(char.hp_max).toBeGreaterThanOrEqual(1);
  });

  test("armor_class defaults to 10", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(char.armor_class).toBe(10);
  });

  test("speed_walk defaults to 30", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(char.speed_walk).toBe(30);
  });

  test("conditions is an empty array", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(char.conditions).toEqual([]);
  });

  test("resources is an empty array", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(char.resources).toEqual([]);
  });

  test("appends the new character to the list", () => {
    const countBefore = getAll().length;
    createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(getAll().length).toBe(countBefore + 1);
  });

  test("assigns a fallback photo when photo is omitted", () => {
    const char = createCharacter({ name: "Hero", player: "Player", hp_max: 10 });
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("normalizes class_primary level to minimum 1", () => {
    const char = createCharacter({
      name: "Hero",
      player: "Player",
      hp_max: 10,
      class_primary: { name: "Fighter", level: 0 },
    });
    expect(char.class_primary.level).toBeGreaterThanOrEqual(1);
  });
});
