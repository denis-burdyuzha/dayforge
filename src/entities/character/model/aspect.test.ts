import { describe, expect, it } from "vitest";

import {
  applyAspectGlow,
  ATTRIBUTE_COLORS,
  getAspect,
  getAspectIntensity,
  isWarmAccent,
  NEUTRAL_GLOW_COLOR,
  NEUTRAL_GLOW_INTENSITY,
  resolveAvatarAspect,
  tintToColor,
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
  it("picks the maximum attribute when it is ≥ 3 and strictly above the second", () => {
    expect(getAspect({ ...base, strength: 14, endurance: 12, discipline: 10 })).toBe("strength");
    expect(getAspect({ ...base, intelligence: 15, focus: 12, creativity: 8 })).toBe("intelligence");
    expect(getAspect({ ...base, social: 15, creativity: 12 })).toBe("social");
    expect(getAspect({ ...base, creativity: 3 })).toBe("creativity");
  });

  it("returns null when the maximum is < 3", () => {
    expect(getAspect(base)).toBeNull();
    expect(getAspect({ ...base, strength: 1 })).toBeNull();
    expect(getAspect({})).toBeNull();
  });

  it("any tie at the top → null (no order-based tie-break)", () => {
    const all = (v: number) => Object.fromEntries(Object.keys(base).map((k) => [k, v]));
    expect(getAspect(all(9))).toBeNull();
    expect(getAspect(all(18))).toBeNull();
    expect(getAspect({ ...base, social: 7, creativity: 7 })).toBeNull();
    expect(getAspect({ ...base, strength: 12, focus: 12, social: 3 })).toBeNull();
    expect(getAspect({ ...base, strength: 12, focus: 11 })).toBe("strength");
  });

  it("intensity: 3 → 0.35, 18 → 1, linear", () => {
    expect(getAspectIntensity(3)).toBeCloseTo(0.35);
    expect(getAspectIntensity(18)).toBeCloseTo(1);
    expect(getAspectIntensity(10.5)).toBeCloseTo(0.675);
  });

  it("focus is teal; intelligence keeps the only cyan", () => {
    expect(ATTRIBUTE_COLORS.focus).toBe("#2dd4bf");
    expect(Object.values(ATTRIBUTE_COLORS).filter((c) => c === "#38bdf8")).toHaveLength(1);
  });

  it("glow: no aspect → neutral soft white at 0.5; aspect recolours, floors and scales", () => {
    const tier = { rimOpacity: 0, rimStrokeWidth: 0, auraOpacity: 0, auraRadius: 0 };
    const neutral = applyAspectGlow(tier, null);
    expect(neutral.color).toBe(NEUTRAL_GLOW_COLOR);
    expect(neutral.rimOpacity).toBeCloseTo(0.85 * NEUTRAL_GLOW_INTENSITY);
    const aspect = resolveAvatarAspect({ ...base, social: 18 });
    const g = applyAspectGlow(tier, aspect);
    expect(g.color).toBe(ATTRIBUTE_COLORS.social);
    expect(g.rimOpacity).toBeGreaterThan(neutral.rimOpacity);
    const weak = applyAspectGlow(tier, resolveAvatarAspect({ ...base, social: 3 }));
    expect(weak.rimOpacity).toBeCloseTo(g.rimOpacity * 0.35);
  });

  it("tail tip tint: warm accents detected; tint keeps lightness and takes the aspect hue", () => {
    expect(isWarmAccent("#fc762d")).toBe(true);
    expect(isWarmAccent("#3a4a6e")).toBe(false);
    const red = tintToColor("#fc762d", ATTRIBUTE_COLORS.strength);
    expect(isWarmAccent(red)).toBe(true);
    const pink = tintToColor("#fc762d", ATTRIBUTE_COLORS.social);
    expect(pink).not.toBe("#fc762d");
    const green = tintToColor("#fc762d", ATTRIBUTE_COLORS.endurance);
    expect(isWarmAccent(green)).toBe(false);
  });
});
