import { describe, expect, it } from "vitest";

import {
  applyAspectGlow,
  ATTRIBUTE_COLORS,
  getAspect,
  getAspectIntensity,
  resolveAvatarAspect,
} from "./aspect";

const base = {
  strength: 2,
  endurance: 2,
  intelligence: 2,
  focus: 2,
  discipline: 2,
  social: 2,
  creativity: 2,
};

describe("aspect", () => {
  it("picks the maximum attribute when it is ≥ 3", () => {
    expect(getAspect({ ...base, strength: 14, endurance: 12, discipline: 10 })).toBe("strength");
    expect(getAspect({ ...base, intelligence: 15, focus: 12, creativity: 8 })).toBe("intelligence");
    expect(getAspect({ ...base, social: 15, creativity: 12 })).toBe("social");
  });

  it("returns null when the maximum is < 3", () => {
    expect(getAspect(base)).toBeNull();
    expect(getAspect({ ...base, strength: 1 })).toBeNull();
    expect(getAspect({})).toBeNull();
  });

  it("tie: first in strength → creativity order wins", () => {
    const all9 = Object.fromEntries(Object.keys(base).map((k) => [k, 9]));
    expect(getAspect(all9)).toBe("strength");
    expect(getAspect({ ...base, social: 7, creativity: 7, focus: 7 })).toBe("focus");
    expect(getAspect({ ...base, social: 7, creativity: 7 })).toBe("social");
  });

  it("intensity: 3 → 0.35, 18 → 1, linear", () => {
    expect(getAspectIntensity(3)).toBeCloseTo(0.35);
    expect(getAspectIntensity(18)).toBeCloseTo(1);
    expect(getAspectIntensity(10.5)).toBeCloseTo(0.675);
  });

  it("glow: no aspect keeps tier values and default colour; aspect recolours, floors and scales", () => {
    const tier = { rimOpacity: 0, rimStrokeWidth: 0, auraOpacity: 0, auraRadius: 0 };
    expect(applyAspectGlow(tier, "#38bdf8", null)).toEqual({ ...tier, color: "#38bdf8" });
    const aspect = resolveAvatarAspect({ ...base, social: 18 });
    const g = applyAspectGlow(tier, "#38bdf8", aspect);
    expect(g.color).toBe(ATTRIBUTE_COLORS.social);
    expect(g.rimOpacity).toBeGreaterThan(0);
    expect(g.auraOpacity).toBeGreaterThan(0);
    const weak = applyAspectGlow(tier, "#38bdf8", resolveAvatarAspect({ ...base, social: 3 }));
    expect(weak.rimOpacity).toBeCloseTo(g.rimOpacity * 0.35);
  });
});
