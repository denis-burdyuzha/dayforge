import { describe, expect, it } from "vitest";

import type { DaySummary, FriendCard } from "./friendTypes";
import { friendAvatarParams, friendTitleSkill, summaryLine } from "./friendView";

const day = (o: Partial<DaySummary>): DaySummary => ({
  date: "2026-11-26",
  plannedCount: 0,
  completedCount: 0,
  completedHours: 0,
  skills: [],
  ...o,
});

const card: FriendCard = {
  userId: "u1",
  name: "Бета",
  classId: "warrior",
  level: 12,
  tier: 3,
  aspect: "strength",
  attributes: { strength: 11, endurance: 3 },
  titleSkill: { name: "зал", level: 8, icon: null, primaryAttribute: "strength" },
  streak: 4,
  todayDone: true,
  summary: null,
};

describe("summaryLine", () => {
  it("plan, hours, skills", () => {
    expect(
      summaryLine(
        day({
          plannedCount: 5,
          completedCount: 4,
          completedHours: 3.5,
          skills: ["английский", "Зал"],
        }),
      ),
    ).toBe("План 4/5 · 3,5 ч · Английский, Зал");
  });

  it("no hours / no skills are left out", () => {
    expect(summaryLine(day({ plannedCount: 3, completedCount: 0 }))).toBe("План 0/3");
    expect(summaryLine(day({ plannedCount: 2, completedCount: 2, completedHours: 2 }))).toBe(
      "План 2/2 · 2 ч",
    );
  });

  it("empty day and hidden", () => {
    expect(summaryLine(day({}))).toBe("Сегодня пока ничего");
    expect(summaryLine(day({}), "Ничего")).toBe("Ничего");
    expect(summaryLine(null)).toBe("Скрыто");
  });
});

describe("friend view", () => {
  it("title skill: rank by level, capitalised name, full form", () => {
    expect(friendTitleSkill(card)).toMatchObject({
      name: "Зал",
      rank: "Подмастерье",
      form: 100,
      primaryAttribute: "strength",
    });
    expect(friendTitleSkill({ ...card, titleSkill: null })).toBeNull();
  });

  it("avatar params from the shared fields", () => {
    const p = friendAvatarParams(card);
    expect(p.attributeValues.strength).toBe(11);
    expect(p.attributeValues.focus).toBe(1);
  });
});
