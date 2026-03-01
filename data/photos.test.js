const { describe, test, expect } = require("bun:test");
const {
  normalizePhotoValue,
  getRandomPhoto,
  ensureCharacterPhoto,
  ensureCharactersPhotos,
  AVAILABLE_PHOTOS,
} = require("./photos");

describe("normalizePhotoValue", () => {
  test("returns empty string for null", () => {
    expect(normalizePhotoValue(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(normalizePhotoValue(undefined)).toBe("");
  });

  test("returns empty string for a number", () => {
    expect(normalizePhotoValue(42)).toBe("");
  });

  test("returns empty string for an object", () => {
    expect(normalizePhotoValue({})).toBe("");
  });

  test("returns empty string for an empty string", () => {
    expect(normalizePhotoValue("")).toBe("");
  });

  test("returns empty string for a whitespace-only string", () => {
    expect(normalizePhotoValue("   ")).toBe("");
  });

  test("trims leading and trailing whitespace", () => {
    expect(normalizePhotoValue("  /assets/img/wizard.png  ")).toBe(
      "/assets/img/wizard.png",
    );
  });

  test("returns a valid URL unchanged", () => {
    expect(normalizePhotoValue("https://example.com/portrait.png")).toBe(
      "https://example.com/portrait.png",
    );
  });

  test("returns a data URI unchanged", () => {
    const dataUri = "data:image/png;base64,abc123";
    expect(normalizePhotoValue(dataUri)).toBe(dataUri);
  });
});

describe("getRandomPhoto", () => {
  test("returns a value from AVAILABLE_PHOTOS", () => {
    for (let i = 0; i < 30; i++) {
      expect(AVAILABLE_PHOTOS).toContain(getRandomPhoto());
    }
  });

  test("returns a non-empty string", () => {
    expect(getRandomPhoto().length).toBeGreaterThan(0);
  });
});

describe("ensureCharacterPhoto", () => {
  test("assigns a /assets/img/ path when photo is empty string", () => {
    const char = { photo: "" };
    ensureCharacterPhoto(char);
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("assigns a /assets/img/ path when photo is undefined", () => {
    const char = {};
    ensureCharacterPhoto(char);
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("assigns a /assets/img/ path when photo is null", () => {
    const char = { photo: null };
    ensureCharacterPhoto(char);
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("assigns a /assets/img/ path when photo is whitespace only", () => {
    const char = { photo: "   " };
    ensureCharacterPhoto(char);
    expect(char.photo).toMatch(/^\/assets\/img\//);
  });

  test("preserves an existing valid URL", () => {
    const char = { photo: "https://example.com/hero.png" };
    ensureCharacterPhoto(char);
    expect(char.photo).toBe("https://example.com/hero.png");
  });

  test("trims whitespace from an existing photo URL", () => {
    const char = { photo: "  /assets/img/wizard.png  " };
    ensureCharacterPhoto(char);
    expect(char.photo).toBe("/assets/img/wizard.png");
  });

  test("returns the same character object (mutates in place)", () => {
    const char = { photo: "https://example.com/img.png" };
    const result = ensureCharacterPhoto(char);
    expect(result).toBe(char);
  });
});

describe("ensureCharactersPhotos", () => {
  test("assigns fallback photos to characters with empty photo", () => {
    const chars = [{ photo: "" }, { photo: "" }];
    ensureCharactersPhotos(chars);
    expect(chars[0].photo).toMatch(/^\/assets\/img\//);
    expect(chars[1].photo).toMatch(/^\/assets\/img\//);
  });

  test("preserves existing photos", () => {
    const chars = [
      { photo: "https://example.com/a.png" },
      { photo: "" },
    ];
    ensureCharactersPhotos(chars);
    expect(chars[0].photo).toBe("https://example.com/a.png");
  });

  test("returns an array of the same length", () => {
    const chars = [{ photo: "a" }, { photo: "b" }, { photo: "c" }];
    const result = ensureCharactersPhotos(chars);
    expect(result).toHaveLength(3);
  });

  test("returns an empty array when given an empty array", () => {
    expect(ensureCharactersPhotos([])).toEqual([]);
  });
});
