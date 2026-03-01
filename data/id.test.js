const { describe, test, expect } = require("bun:test");
const { createShortId } = require("./id");

const SHORT_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

describe("createShortId", () => {
  test("returns a string", () => {
    expect(typeof createShortId()).toBe("string");
  });

  test("is always 5 characters long", () => {
    for (let i = 0; i < 50; i++) {
      expect(createShortId()).toHaveLength(5);
    }
  });

  test("only uses characters from the allowed alphabet", () => {
    const validChars = new Set(SHORT_ID_ALPHABET);
    for (let i = 0; i < 100; i++) {
      for (const char of createShortId()) {
        expect(validChars.has(char)).toBe(true);
      }
    }
  });

  test("never contains ambiguous characters (0, 1, I, O)", () => {
    const ambiguous = new Set(["0", "1", "I", "O"]);
    for (let i = 0; i < 200; i++) {
      for (const char of createShortId()) {
        expect(ambiguous.has(char)).toBe(false);
      }
    }
  });

  test("generates unique IDs across 1 000 calls", () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(createShortId());
    }
    expect(ids.size).toBe(1000);
  });
});
