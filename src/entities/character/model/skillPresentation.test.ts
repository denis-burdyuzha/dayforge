import {
  BookOpen,
  Car,
  Clapperboard,
  Code2,
  Dumbbell,
  Flower2,
  Footprints,
  Languages,
  type LucideIcon,
  Music,
  Palette,
  TrendingUp,
} from "lucide-react";
import { describe, expect, it } from "vitest";

import { ATTRIBUTE_COLORS } from "./aspect";
import {
  detectSkillIconCategory,
  getSkillIcon,
  getSkillRank,
  pickTitleSkill,
  toSkillView,
} from "./skillPresentation";

describe("skill rank", () => {
  it("level → title", () => {
    expect([1, 2, 3, 5, 6, 9, 10, 14, 15, 40].map(getSkillRank)).toEqual([
      "Новичок",
      "Новичок",
      "Ученик",
      "Ученик",
      "Подмастерье",
      "Подмастерье",
      "Мастер",
      "Мастер",
      "Грандмастер",
      "Грандмастер",
    ]);
  });
});

describe("skill icon", () => {
  it("keywords (ru / en, case-insensitive)", () => {
    const cases: Array<[string, string | null]> = [
      ["Программирование", "code"],
      ["frontend DEV", "code"],
      ["Бег по утрам", "running"],
      ["Running", "running"],
      ["Тренировки в зале", "fitness"],
      ["Gym", "fitness"],
      ["Чтение", "reading"],
      ["Английский язык", "language"],
      ["Вождение", "driving"],
      ["Дизайн", "design"],
      ["Pixel art", "design"],
      ["Видеомонтаж", "video"],
      ["Гитара", "music"],
      ["SEO", "marketing"],
      ["Маркетинг", "marketing"],
      ["Медитация", "meditation"],
      ["Вязание", null],
      ["Startup pitch", null], // "art" only at a word start
    ];
    for (const [name, cat] of cases) expect(detectSkillIconCategory(name), name).toBe(cat);
  });

  it("keyword → lucide icon in the main attribute colour; no match → rune of the attribute", () => {
    const icon = getSkillIcon("Программирование", "intelligence");
    expect(icon).toMatchObject({ kind: "icon", category: "code", Icon: Code2 });
    expect(icon.color).toBe(ATTRIBUTE_COLORS.intelligence);
    const expected: Record<string, LucideIcon> = {
      "Тренировки в зале": Dumbbell,
      Бег: Footprints,
      Чтение: BookOpen,
      "Английский язык": Languages,
      Вождение: Car,
      Дизайн: Palette,
      Видеомонтаж: Clapperboard,
      Гитара: Music,
      SEO: TrendingUp,
      Медитация: Flower2,
    };
    for (const [name, Icon] of Object.entries(expected)) {
      expect(getSkillIcon(name, "focus"), name).toMatchObject({ kind: "icon", Icon });
    }
    expect(getSkillIcon("Вязание", "creativity")).toMatchObject({
      kind: "rune",
      attribute: "creativity",
      category: null,
    });
  });
});

describe("title skill", () => {
  const s = (level: number, totalXp: number, lastPracticedAt: string | null, id: string) => ({
    id,
    level,
    totalXp,
    lastPracticedAt,
  });

  it("max level → max XP → latest practice; none → null", () => {
    expect(pickTitleSkill([])).toBeNull();
    expect(
      pickTitleSkill([s(3, 100, null, "a"), s(12, 50, null, "b"), s(5, 900, null, "c")])!.id,
    ).toBe("b");
    expect(pickTitleSkill([s(5, 100, null, "a"), s(5, 300, null, "b")])!.id).toBe("b");
    expect(
      pickTitleSkill([
        s(5, 100, "2026-11-01T00:00:00Z", "a"),
        s(5, 100, "2026-11-20T00:00:00Z", "b"),
        s(5, 100, null, "c"),
      ])!.id,
    ).toBe("b");
  });

  it("toSkillView maps attribute ids to codes and capitalises the name", () => {
    const v = toSkillView(
      {
        id: "1",
        characterId: "c",
        name: "программирование",
        totalHours: 1,
        totalXp: 10,
        lastPracticedAt: null,
        createdAt: "",
        primaryAttributeId: "def-int",
        secondaryAttributeId: "def-foc",
        level: 12,
        formPercentage: 90,
        formMultiplier: 1,
      },
      [
        { attributeId: "def-int", code: "intelligence" },
        { attributeId: "def-foc", code: "focus" },
      ],
    );
    expect(v).toMatchObject({
      name: "Программирование",
      rank: "Мастер",
      form: 90,
      primaryAttribute: "intelligence",
      attributes: ["intelligence", "focus"],
    });
  });
});
