import { describe, expect, it } from "vitest";

import { characterNameErrorMessage, characterNameSchema } from "./characterName";

describe("characterNameSchema (same rules as the server)", () => {
  it("accepts any alphabet, digits, space, dash, underscore; trims", () => {
    for (const name of ["Ли", "Странник-42", "Ёжик_в_тумане", "Αλέξης", "Jane Doe", "李小龍"]) {
      expect(characterNameSchema.safeParse(`  ${name} `).data, name).toBe(name);
    }
  });

  it("rejects length, symbols and double spaces", () => {
    for (const name of ["Я", "   ", "a".repeat(21), "Имя!", "a.b", "эмодзи🔥", "Два  пробела"]) {
      expect(characterNameSchema.safeParse(name).success, name).toBe(false);
    }
  });

  it("server errors become readable messages", () => {
    expect(characterNameErrorMessage(new Error("NAME_NOT_ALLOWED"))).toMatch(/нельзя/);
    expect(characterNameErrorMessage(new Error("INVALID_NAME"))).toMatch(/от 2 до 20/);
  });
});
