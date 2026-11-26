import { describe, expect, it } from "vitest";

import { ATTRIBUTE_COLORS } from "../../../model/aspect";
import { getFoxAspectAccentIds } from "../creatures/fox/foxAspectAccent";
import { getTierPolys } from "../creatures/fox/foxZones";
import { createAspectAccentResolver, hexToOklch, recolorAccentGroup } from "./aspectAccent";

const hueDist = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

// a warm tail-tip gradient: dark rust → orange → light amber, plus two facets of equal lightness that
// differ only by hue / saturation (crystal faces)
const GRADIENT = [
  { id: "a", defaultFill: "#5a2410" },
  { id: "b", defaultFill: "#a8441a" },
  { id: "c", defaultFill: "#fc762d" },
  { id: "d", defaultFill: "#ffb15c" },
  { id: "e", defaultFill: "#ffe2a8" },
];
const SAME_L = [
  { id: "x", defaultFill: "#e0702a" },
  { id: "y", defaultFill: "#d98a4a" },
];

describe("aspect accent recolour", () => {
  it("nothing to do: no aspect, no ids, empty list → null (no crash)", () => {
    expect(createAspectAccentResolver(GRADIENT, ["a"], null)).toBeNull();
    expect(createAspectAccentResolver(GRADIENT, [], ATTRIBUTE_COLORS.strength)).toBeNull();
    expect(createAspectAccentResolver(GRADIENT, undefined, ATTRIBUTE_COLORS.strength)).toBeNull();
    expect(createAspectAccentResolver([], ["a"], ATTRIBUTE_COLORS.strength)).toBeNull();
  });

  it("only the listed polygons are recoloured", () => {
    const resolve = createAspectAccentResolver(
      GRADIENT,
      ["b", "c"],
      ATTRIBUTE_COLORS.intelligence,
    )!;
    expect(resolve(GRADIENT[0]!)).toBeUndefined();
    expect(resolve(GRADIENT[1]!)).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolve(GRADIENT[4]!)).toBeUndefined();
  });

  it.each(Object.entries(ATTRIBUTE_COLORS))(
    "%s: perceptual lightness of every facet kept (gradient stays a gradient), hue → aspect",
    (_, color) => {
      const out = recolorAccentGroup(GRADIENT, color);
      const target = hexToOklch(color)!;
      const srcL = GRADIENT.map((p) => hexToOklch(p.defaultFill)!.L);
      const dst = GRADIENT.map((p) => hexToOklch(out.get(p.id)!)!);
      dst.forEach((c, i) => expect(c.L).toBeCloseTo(srcL[i]!, 2));
      // the order dark → light is kept
      for (let i = 1; i < dst.length; i++) expect(dst[i]!.L).toBeGreaterThan(dst[i - 1]!.L);
      // saturated mid-tones carry the aspect hue (very dark / very light ones may lose chroma in gamut)
      for (const c of dst.slice(1, 4)) {
        if (c.C > 0.03) expect(hueDist(c.h, target.h)).toBeLessThanOrEqual(26);
      }
    },
  );

  it("facets of equal lightness that differed by hue / saturation stay distinct", () => {
    for (const color of Object.values(ATTRIBUTE_COLORS)) {
      const out = recolorAccentGroup(SAME_L, color);
      expect(out.get("x")).not.toBe(out.get("y"));
    }
  });

  it("real fox data: eyes on every tier, warm tail tips where the asset has them, no collapse", () => {
    const tailTips: number[] = [];
    for (const tier of [1, 2, 3, 4, 5] as const) {
      const ids = getFoxAspectAccentIds(tier);
      const polys = getTierPolys(tier).filter((p) => ids.includes(p.id));
      expect(
        polys.some((p) => p.zone === "eyes"),
        `L${tier} eyes`,
      ).toBe(true);
      tailTips.push(polys.filter((p) => p.zone !== "eyes").length);
      const before = new Set(polys.map((p) => p.defaultFill.toLowerCase())).size;
      for (const color of [
        ATTRIBUTE_COLORS.strength,
        ATTRIBUTE_COLORS.intelligence,
        ATTRIBUTE_COLORS.social,
      ]) {
        const after = new Set(recolorAccentGroup(polys, color).values()).size;
        expect(after, `L${tier} ${color}`).toBeGreaterThanOrEqual(Math.floor(before * 0.85));
      }
    }
    // L1 (curled spark) has an all-navy tail — no warm tips, as before; the grown tiers have them
    expect(tailTips[0]).toBe(0);
    expect(tailTips[1]! + tailTips[3]! + tailTips[4]!).toBeGreaterThan(0);
  });
});
