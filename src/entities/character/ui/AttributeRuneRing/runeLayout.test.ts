import { describe, expect, it } from "vitest";

import { ATTRIBUTE_ORDER } from "../../model/aspect";
import { getGlyphExtent, RUNE_FRAME_POINTS, RUNE_GLYPHS } from "./runeGlyphs";
import {
  computeRingLayout,
  getRuneLevel,
  getRuneVisual,
  getSigilGlowPx,
  getSigilOpacity,
  getSigilStrokePx,
  RUNE_SIZE,
} from "./runeLayout";

describe("rune states", () => {
  it("levels by value", () => {
    expect([1, 2, 5, 6, 11, 12, 17, 18].map(getRuneLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });

  it("visuals follow the spec", () => {
    expect(getRuneVisual(1)).toMatchObject({ active: false, opacity: 0.25, frame: false, glow: 0 });
    expect(getRuneVisual(2).opacity).toBeCloseTo(0.7);
    expect(getRuneVisual(5).opacity).toBeCloseTo(0.85);
    expect(getRuneVisual(8)).toMatchObject({
      opacity: 0.9,
      frame: true,
      frameOpacity: 0.6,
      glow: 0,
    });
    expect(getRuneVisual(14)).toMatchObject({ opacity: 0.9, frame: true, glow: 4, ticks: false });
    expect(getRuneVisual(18)).toMatchObject({ opacity: 1, frameOpacity: 1, glow: 8, ticks: true });
  });

  it("every attribute has a glyph; frame is a hexagon", () => {
    for (const a of ATTRIBUTE_ORDER) expect(RUNE_GLYPHS[a].length).toBeGreaterThan(0);
    expect(RUNE_FRAME_POINTS.split(" ")).toHaveLength(6);
  });
});

describe("ring layout", () => {
  it("strength on top, clockwise order, radius = size × 0.46 when nothing overlaps", () => {
    const l = computeRingLayout(500, { width: 100, height: 100 }, null);
    expect(l.radius).toBeCloseTo(230);
    expect(l.runes.map((r) => r.attribute)).toEqual([...ATTRIBUTE_ORDER]);
    expect(l.runes[0]!.x).toBeCloseTo(0);
    expect(l.runes[0]!.y).toBeCloseTo(-230);
    expect(l.runes[1]!.x).toBeGreaterThan(0); // endurance: to the right → clockwise
  });

  it("radius grows to the smallest value with no rune over the avatar box", () => {
    for (const aspect of [null, ...ATTRIBUTE_ORDER]) {
      const box = { width: 200, height: 240 };
      const l = computeRingLayout(300, box, aspect);
      for (const r of l.runes) {
        const clear =
          Math.abs(r.x) >= box.width / 2 + r.size / 2 ||
          Math.abs(r.y) >= box.height / 2 + r.size / 2;
        expect(clear, `${aspect}:${r.attribute}`).toBe(true);
      }
      // minimal: half a step smaller would overlap
      const smaller = computeRingLayout((l.radius - 0.5) / 0.46, null, aspect);
      expect(
        smaller.runes.some(
          (r) =>
            Math.abs(r.x) < box.width / 2 + r.size / 2 &&
            Math.abs(r.y) < box.height / 2 + r.size / 2,
        ),
      ).toBe(true);
    }
  });

  it("aspect rune is 15% larger", () => {
    const l = computeRingLayout(340, null, "social");
    expect(l.runes.find((r) => r.attribute === "social")!.size).toBeCloseTo(RUNE_SIZE * 1.15);
    expect(l.runes.find((r) => r.attribute === "strength")!.size).toBe(RUNE_SIZE);
  });
});

describe("aspect sigil", () => {
  it("line width 3 → 5px, glow none / 6 / 10px, opacity 0.18 → 0.45", () => {
    expect(getSigilStrokePx(3)).toBeCloseTo(3);
    expect(getSigilStrokePx(18)).toBeCloseTo(5);
    expect(getSigilStrokePx(10.5)).toBeCloseTo(4);
    expect([3, 11, 12, 17, 18].map(getSigilGlowPx)).toEqual([0, 0, 6, 6, 10]);
    expect(getSigilOpacity(3)).toBeCloseTo(0.18);
    expect(getSigilOpacity(18)).toBeCloseTo(0.45);
  });

  it("glyph extent: centre of the bbox and outer radius", () => {
    // focus: circle r 7 at 12,12 + crosshair ticks out to 1 / 23
    expect(getGlyphExtent(RUNE_GLYPHS.focus)).toMatchObject({ cx: 12, cy: 12, radius: 11 });
    // discipline: square 5..19 → corner at hypot(7, 7)
    const d = getGlyphExtent(RUNE_GLYPHS.discipline);
    expect(d.radius).toBeCloseTo(Math.hypot(7, 7));
    for (const a of ATTRIBUTE_ORDER)
      expect(getGlyphExtent(RUNE_GLYPHS[a]).radius).toBeGreaterThan(5);
  });
});
