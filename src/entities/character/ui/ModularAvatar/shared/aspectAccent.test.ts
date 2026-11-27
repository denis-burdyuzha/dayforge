import { describe, expect, it } from "vitest";

import { ATTRIBUTE_COLORS } from "../../../model/aspect";
import { getFoxAspectAccentIds } from "../creatures/fox/foxAspectAccent";
import { getTierPolys } from "../creatures/fox/foxZones";
import {
  createAspectAccentResolver,
  hexToOklch,
  maxChroma,
  recolorAccentGroup,
} from "./aspectAccent";

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
    "%s: lightness remapped to [0.45, 0.82] in the source order, chroma ≥ 85% of the sRGB maximum, hue → aspect",
    (_, color) => {
      const out = recolorAccentGroup(GRADIENT, color);
      const target = hexToOklch(color)!;
      const dst = GRADIENT.map((p) => hexToOklch(out.get(p.id)!)!);
      // darkest → 0.45, lightest → 0.82 (hex rounding tolerance), order kept
      expect(dst[0]!.L).toBeCloseTo(0.45, 1);
      expect(dst[4]!.L).toBeCloseTo(0.82, 1);
      for (let i = 1; i < dst.length; i++) expect(dst[i]!.L).toBeGreaterThan(dst[i - 1]!.L);
      dst.forEach((c) => {
        expect(c.C).toBeGreaterThanOrEqual(0.85 * maxChroma(c.L, c.h) - 0.01);
        expect(hueDist(c.h, target.h)).toBeLessThanOrEqual(27);
      });
    },
  );

  it("pale crystals (source L ≈ 0.9) still turn saturated: red Strength is clearly red, gold stays gold", () => {
    const pale = [
      { id: "a", defaultFill: "#fff3a0" },
      { id: "b", defaultFill: "#ffe566" },
      { id: "c", defaultFill: "#ffd23d" },
    ];
    const red = recolorAccentGroup(pale, ATTRIBUTE_COLORS.strength);
    for (const hex of red.values()) {
      const c = hexToOklch(hex)!;
      expect(c.C).toBeGreaterThan(0.13); // not pastel pink (the old lightness-keeping tint gave ≈ 0.06)
      expect(hueDist(c.h, hexToOklch(ATTRIBUTE_COLORS.strength)!.h)).toBeLessThan(27);
    }
    const gold = recolorAccentGroup(pale, ATTRIBUTE_COLORS.discipline);
    for (const hex of gold.values()) expect(hexToOklch(hex)!.C).toBeGreaterThan(0.08); // dark yellow is gamut-limited (olive)
  });

  it("a nearly flat group is centred on 0.65 and spread to ±0.08 in its order; one colour → 0.65", () => {
    const flat = recolorAccentGroup(
      [
        { id: "a", defaultFill: "#a0a0a0" },
        { id: "b", defaultFill: "#a4a4a4" },
        { id: "c", defaultFill: "#a8a8a8" },
      ],
      ATTRIBUTE_COLORS.focus,
    );
    const L = ["a", "b", "c"].map((id) => hexToOklch(flat.get(id)!)!.L);
    expect(L[0]).toBeCloseTo(0.57, 1);
    expect(L[2]).toBeCloseTo(0.73, 1);
    expect(L[1]).toBeGreaterThan(L[0]!);
    const one = recolorAccentGroup([{ id: "a", defaultFill: "#336699" }], ATTRIBUTE_COLORS.focus);
    expect(hexToOklch(one.get("a")!)!.L).toBeCloseTo(0.65, 1);
  });

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
