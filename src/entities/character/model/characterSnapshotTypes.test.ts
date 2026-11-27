import { describe, expect, it } from "vitest";

import { mapSnapshotRow } from "./characterSnapshotTypes";

describe("mapSnapshotRow", () => {
  it("maps a database row to the snapshot model", () => {
    expect(
      mapSnapshotRow({
        snapshot_date: "2026-11-20",
        level: 12,
        tier: 3,
        total_xp: 1500,
        attributes: { strength: 4, endurance: 2, unknown: 9 },
        aspect: "strength",
        top_skills: [
          { id: "s1", name: "Бег", icon: "run", level: 3, total_xp: 70, total_hours: 3.5 },
          "junk",
        ],
        skills_count: 4,
        relics: [],
      }),
    ).toEqual({
      date: "2026-11-20",
      level: 12,
      tier: 3,
      totalXp: 1500,
      attributes: { strength: 4, endurance: 2 },
      aspect: "strength",
      topSkills: [{ id: "s1", name: "Бег", icon: "run", level: 3, totalXp: 70, totalHours: 3.5 }],
      skillsCount: 4,
      relics: [],
    });
  });

  it("tolerates unexpected json shapes and unknown aspect codes", () => {
    const s = mapSnapshotRow({
      snapshot_date: "2026-11-21",
      level: 1,
      tier: 1,
      total_xp: 0,
      attributes: null,
      aspect: "luck",
      top_skills: {},
      skills_count: 0,
      relics: null,
    });
    expect(s.attributes).toEqual({});
    expect(s.aspect).toBeNull();
    expect(s.topSkills).toEqual([]);
    expect(s.relics).toEqual([]);
  });
});
