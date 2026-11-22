/**
 * runeGlyphs — the 7 attribute runes. viewBox 24×24, straight lines only, stroke-width 2,
 * stroke-linecap round, no fill (the only filled element is the Intelligence centre dot, r = 1.5).
 */

import type { AttributeKey } from "../../model/types";

export type GlyphShape =
  | { kind: "polygon"; points: string }
  | { kind: "polyline"; points: string }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "circle"; cx: number; cy: number; r: number; filled?: boolean };

export const RUNE_GLYPHS: Record<AttributeKey, GlyphShape[]> = {
  // Triangle apex up + horizontal bar through its middle
  strength: [
    { kind: "polygon", points: "12,4 20,19 4,19" },
    { kind: "line", x1: 7.5, y1: 12.5, x2: 16.5, y2: 12.5 },
  ],
  // Shield: pentagon with the sharp corner down
  endurance: [{ kind: "polygon", points: "5,4 19,4 19,12 12,21 5,12" }],
  // Rhombus with a filled dot in the centre
  intelligence: [
    { kind: "polygon", points: "12,3 21,12 12,21 3,12" },
    { kind: "circle", cx: 12, cy: 12, r: 1.5, filled: true },
  ],
  // Circle r = 7 + crosshair of 4 short segments outside it
  focus: [
    { kind: "circle", cx: 12, cy: 12, r: 7 },
    { kind: "line", x1: 12, y1: 1, x2: 12, y2: 3.5 },
    { kind: "line", x1: 12, y1: 20.5, x2: 12, y2: 23 },
    { kind: "line", x1: 1, y1: 12, x2: 3.5, y2: 12 },
    { kind: "line", x1: 20.5, y1: 12, x2: 23, y2: 12 },
  ],
  // Square + vertical line through the centre
  discipline: [
    { kind: "polygon", points: "5,5 19,5 19,19 5,19" },
    { kind: "line", x1: 12, y1: 5, x2: 12, y2: 19 },
  ],
  // Two small rhombi left and right joined by a horizontal line
  social: [
    { kind: "polygon", points: "6,8.5 9.5,12 6,15.5 2.5,12" },
    { kind: "polygon", points: "18,8.5 21.5,12 18,15.5 14.5,12" },
    { kind: "line", x1: 9.5, y1: 12, x2: 14.5, y2: 12 },
  ],
  // Four-pointed star: outline of a tall and a wide rhombus crossed at 90°
  creativity: [
    { kind: "polygon", points: "12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" },
  ],
};

/** Pointy-top hexagon frame around the glyph (centre 12,12, vertex radius 15) */
export const RUNE_FRAME_POINTS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return `${(12 + 15 * Math.cos(a)).toFixed(2)},${(12 + 15 * Math.sin(a)).toFixed(2)}`;
}).join(" ");

/** 4 short ticks outside the frame (top, bottom, left, right) — value 18 only */
export const RUNE_TICKS: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 12, y1: -4.5, x2: 12, y2: -7.5 },
  { x1: 12, y1: 28.5, x2: 12, y2: 31.5 },
  { x1: -2, y1: 12, x2: -5, y2: 12 },
  { x1: 26, y1: 12, x2: 29, y2: 12 },
];

/**
 * Centre and outer radius of a glyph (max distance of any point / circle edge from the centre of the glyph's
 * bounding box), in glyph units. Used to fit the glyph into a circle (aspect sigil).
 */
export function getGlyphExtent(shapes: GlyphShape[]): { cx: number; cy: number; radius: number } {
  const pts: Array<[number, number, number]> = []; // x, y, extra radius
  for (const s of shapes) {
    if (s.kind === "line") {
      pts.push([s.x1, s.y1, 0], [s.x2, s.y2, 0]);
    } else if (s.kind === "circle") {
      pts.push([s.cx, s.cy, s.r]);
    } else {
      for (const pair of s.points.trim().split(/\s+/)) {
        const [x, y] = pair.split(",").map(Number);
        if (x !== undefined && y !== undefined) pts.push([x, y, 0]);
      }
    }
  }
  const xs = pts.flatMap(([x, , r]) => [x - r, x + r]);
  const ys = pts.flatMap(([, y, r]) => [y - r, y + r]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const radius = Math.max(...pts.map(([x, y, r]) => Math.hypot(x - cx, y - cy) + r));
  return { cx, cy, radius };
}
