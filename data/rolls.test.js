const { describe, test, expect } = require("bun:test");
const { getAll, logRoll } = require("./rolls");

describe("logRoll", () => {
  test("returns a record with all expected fields", () => {
    const roll = logRoll({
      charId: "CH101",
      characterName: "Zara",
      result: 15,
      sides: 20,
      modifier: 3,
    });
    expect(roll).toHaveProperty("id");
    expect(roll).toHaveProperty("charId", "CH101");
    expect(roll).toHaveProperty("characterName", "Zara");
    expect(roll).toHaveProperty("result", 15);
    expect(roll).toHaveProperty("modifier", 3);
    expect(roll).toHaveProperty("rollResult", 18);
    expect(roll).toHaveProperty("sides", 20);
    expect(roll).toHaveProperty("timestamp");
  });

  test("rollResult equals result + modifier", () => {
    const roll = logRoll({
      charId: "CH101",
      characterName: "Test",
      result: 10,
      sides: 12,
      modifier: -2,
    });
    expect(roll.rollResult).toBe(8);
  });

  test("modifier defaults to 0 when omitted", () => {
    const roll = logRoll({
      charId: "CH102",
      characterName: "Thane",
      result: 7,
      sides: 6,
    });
    expect(roll.modifier).toBe(0);
    expect(roll.rollResult).toBe(7);
  });

  test("id is a 5-character string", () => {
    const roll = logRoll({
      charId: "CH101",
      characterName: "Test",
      result: 5,
      sides: 8,
    });
    expect(typeof roll.id).toBe("string");
    expect(roll.id).toHaveLength(5);
  });

  test("timestamp is a valid ISO 8601 string", () => {
    const roll = logRoll({
      charId: "CH101",
      characterName: "Test",
      result: 3,
      sides: 4,
    });
    expect(new Date(roll.timestamp).toISOString()).toBe(roll.timestamp);
  });

  test("each call generates a distinct id", () => {
    const ids = new Set();
    for (let i = 0; i < 50; i++) {
      ids.add(
        logRoll({ charId: "CH101", characterName: "Test", result: 1, sides: 20 })
          .id,
      );
    }
    expect(ids.size).toBe(50);
  });
});

describe("getAll", () => {
  test("returns an array", () => {
    expect(Array.isArray(getAll())).toBe(true);
  });

  test("includes rolls added by logRoll", () => {
    const countBefore = getAll().length;
    logRoll({
      charId: "CH999",
      characterName: "Ghost",
      result: 1,
      sides: 20,
    });
    expect(getAll().length).toBe(countBefore + 1);
  });

  test("returns the same array reference on successive calls", () => {
    expect(getAll()).toBe(getAll());
  });
});
