import { describe, expect, it } from "vitest";

import { inviteLink, parseFriendCode } from "./friendCode";
import { friendErrorMessage, isFinalFriendError } from "./friendErrors";
import { mapFriendCard, mapFriendProfile, mapInvitePreview } from "./friendTypes";

describe("parseFriendCode", () => {
  it("accepts any case, spaces and dashes, and a pasted invite link", () => {
    expect(parseFriendCode("abcd2345")).toBe("ABCD2345");
    expect(parseFriendCode(" ABCD-2345 ")).toBe("ABCD2345");
    expect(parseFriendCode("https://dayforge.app/invite/abcd2345?x=1")).toBe("ABCD2345");
  });

  it("rejects wrong length and look-alike characters (0, O, 1, I, L)", () => {
    expect(parseFriendCode("ABC")).toBeNull();
    expect(parseFriendCode("ABCD23456")).toBeNull();
    expect(parseFriendCode("ABCD0O1I")).toBeNull();
    expect(parseFriendCode("")).toBeNull();
  });

  it("builds the invite link", () => {
    expect(inviteLink("ABCD2345", "https://x.test")).toBe("https://x.test/invite/ABCD2345");
  });
});

describe("friend errors", () => {
  it("server codes → Russian texts; final vs retryable", () => {
    expect(friendErrorMessage(new Error("INVALID_CODE"))).toMatch(/Такого кода нет/);
    expect(friendErrorMessage(new Error("CANNOT_FRIEND_SELF"))).toMatch(/собственный код/);
    expect(friendErrorMessage(new Error("FRIEND_LIMIT"))).toMatch(/100/);
    expect(friendErrorMessage(new Error("RATE_LIMIT"))).toMatch(/завтра/);
    expect(friendErrorMessage(new TypeError("Failed to fetch"))).toMatch(/Нет связи/);
    expect(friendErrorMessage(new Error("boom"))).toMatch(/Что-то пошло не так/);
    expect(isFinalFriendError(new Error("INVALID_CODE"))).toBe(true);
    expect(isFinalFriendError(new TypeError("Failed to fetch"))).toBe(false);
  });
});

describe("mappers", () => {
  const raw = {
    user_id: "u1",
    name: "Бета",
    class: "warrior",
    level: 7,
    tier: 2,
    aspect: "strength",
    attributes: { strength: 5, focus: 2 },
    title_skill: { name: "Зал", level: 4, icon: null, primary_attribute: "strength" },
    streak: 3,
    today_done: true,
    summary: {
      date: "2026-11-26",
      planned_count: 5,
      completed_count: 4,
      completed_hours: 3.5,
      skills: ["Зал"],
    },
  };

  it("card", () => {
    expect(mapFriendCard(raw)).toMatchObject({
      userId: "u1",
      classId: "warrior",
      titleSkill: { name: "Зал", level: 4, primaryAttribute: "strength" },
      summary: { plannedCount: 5, completedCount: 4, completedHours: 3.5 },
    });
    expect(mapFriendCard({ ...raw, summary: null, class: "robot" })).toMatchObject({
      summary: null,
      classId: null,
    });
  });

  it("profile: hidden days stay null", () => {
    const p = mapFriendProfile({ ...raw, longest: 9, week: [], days: null });
    expect(p.longest).toBe(9);
    expect(p.days).toBeNull();
  });

  it("invite preview", () => {
    expect(mapInvitePreview({ name: "Бета", class: "warrior" })).toEqual({
      name: "Бета",
      classId: "warrior",
    });
    expect(mapInvitePreview(null)).toBeNull();
  });
});
