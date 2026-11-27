import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  computeFit,
  defaultExists,
  findBackgroundLeftovers,
  parseCreatureSvg,
  resolveTierFiles,
} from "./creatureAssets.lib.mjs";
import { CREATURES } from "./creatures.config.mjs";

const read = (file: string) => fs.readFileSync(file, "utf8");
const config = (classId: string) => CREATURES.find((c) => c.classId === classId)!;

describe("creature SVG parsing", () => {
  it("real bear SVG: aspectAccentIds not empty, every id is one of the polygons, ids unique", () => {
    const c = config("creator");
    for (const tier of [1, 2, 3, 4, 5]) {
      const parsed = parseCreatureSvg(
        read(path.join(c.sourceDir, `bearL${tier}.svg`)),
        `bearL${tier}`,
      );
      const ids = new Set(parsed.polygons.map((p) => p.id));
      expect(ids.size, `L${tier} unique ids`).toBe(parsed.polygons.length);
      expect(parsed.aspectAccentIds.length, `L${tier} accent`).toBeGreaterThan(0);
      expect(
        parsed.aspectAccentIds.every((id) => ids.has(id)),
        `L${tier} accent ⊂ polygons`,
      ).toBe(true);
      expect(parsed.warnings).toEqual([]);
    }
  });

  it("real wolf SVG (not marked up yet): all polygons, aspectAccentIds = [] with a warning; fit as before", () => {
    const parsed = parseCreatureSvg(
      read(path.join(config("warrior").sourceDir, "wolfL1.svg")),
      "wolfL1",
    );
    expect(parsed.polygons).toHaveLength(672);
    expect(parsed.aspectAccentIds).toEqual([]);
    expect(parsed.warnings.join()).toMatch(/no <g id="aspectAccent">/);
    // the wolf pup is wide: the 168 width is the limit, bottom on the ground line y = 212
    const fit = computeFit(parsed.polygons);
    expect(parsed.filtered).toBe(0);
    const [x0, , x1, y1] = fit.bbox as [number, number, number, number];
    expect(fit.scale * (x1 - x0)).toBeCloseTo(168, 0);
    expect(fit.ty + y1 * fit.scale).toBeCloseTo(212, 1);
  });

  it("aspectAccent at any nesting depth; polygons without id get stable generated ids; order kept", () => {
    const svg = `<svg viewBox="0 0 100 100">
      <polygon id="a" points="0,0 1,0 1,1" fill="#111111"/>
      <g id="body"><g id="aspectAccent">
        <polygon points="0,0 2,0 2,2" fill="#FC762D"/>
        <g id="inner"><polygon id="b" points="0,0 3,0 3,3" style="stroke:none;fill:#ffaa00"/></g>
      </g></g>
      <polygon points="0,0 4,0 4,4" fill="#222222"></polygon>
      <polygon id="a" points="0,0 5,0 5,5" fill="#333333"/>
    </svg>`;
    const first = parseCreatureSvg(svg, "testL1");
    expect(first.polygons.map((p) => p.id)).toEqual(["a", "testL1_p1", "b", "testL1_p3", "a_1"]);
    expect(first.aspectAccentIds).toEqual(["testL1_p1", "b"]);
    expect(first.polygons[1]!.defaultFill).toBe("#fc762d");
    expect(first.polygons[2]!.defaultFill).toBe("#ffaa00");
    expect(parseCreatureSvg(svg, "testL1").polygons.map((p) => p.id)).toEqual(
      first.polygons.map((p) => p.id),
    );
  });

  it("a transform is refused (geometry would be wrong)", () => {
    expect(() =>
      parseCreatureSvg(
        '<svg><g transform="translate(5,5)"><polygon points="0,0 1,1 1,0" fill="#000"/></g></svg>',
        "x",
      ),
    ).toThrow(/transform/);
  });
});

describe("fit and background filter", () => {
  const poly = (id: string, points: string, defaultFill: string, opacity?: number) => ({
    id,
    points,
    defaultFill,
    ...(opacity === undefined ? {} : { opacity }),
  });

  it("scale = min(208·0.86 / h, 168 / w); centred on x = 100; bottom on y = 212", () => {
    const tall = computeFit([poly("a", "10,20 60,20 60,220", "#888888")]); // 50 × 200
    expect(tall.scale).toBeCloseTo((208 * 0.86) / 200, 4);
    expect(tall.tx + 35 * tall.scale).toBeCloseTo(100, 2);
    expect(tall.ty + 220 * tall.scale).toBeCloseTo(212, 2);
    const wide = computeFit([poly("a", "0,0 400,0 400,100", "#888888")]); // 400 × 100: width-limited
    expect(wide.scale).toBeCloseTo(168 / 400, 4);
    expect(wide.scale * 100).toBeLessThan(208 * 0.86);
  });

  it("drops near-black / transparent polygons sticking out of the animal; keeps dark ones inside", () => {
    const body = poly("body", "0,0 100,0 100,100", "#403020");
    const inside = poly("pupil", "40,40 50,40 50,50", "#050505"); // dark, but inside the body: stays
    const bg = poly("bg", "-50,-50 300,-50 300,300", "#000000"); // background leftover
    const ghost = poly("ghost", "0,0 90,0 90,400", "#808080", 0.05); // transparent, sticks out
    expect(findBackgroundLeftovers([body, inside, bg, ghost]).sort()).toEqual(["bg", "ghost"]);
    expect(findBackgroundLeftovers([body, inside])).toEqual([]);
    expect(findBackgroundLeftovers([inside, bg])).toEqual([]); // nothing but dark ones: nothing to compare
  });

  it("the parser applies it: svg with a black background polygon", () => {
    const svg = `<svg viewBox="0 0 10 10"><polygon id="bg" points="-9,-9 99,-9 99,99" fill="#000000"/>
      <polygon id="a" points="0,0 10,0 10,10" fill="#aa8844"/><polygon id="eye" points="2,2 3,2 3,3" fill="#010101"/></svg>`;
    const parsed = parseCreatureSvg(svg, "t");
    expect(parsed.polygons.map((p) => p.id)).toEqual(["a", "eye"]);
    expect(parsed.filtered).toBe(1);
    expect(parsed.polygons[0]).toEqual({
      id: "a",
      points: "0,0 10,0 10,10",
      defaultFill: "#aa8844",
    });
  });
});

describe("tier files", () => {
  it("deer: L1–L3 own SVGs, L4 and L5 fall back to L3", () => {
    const c = config("wanderer");
    const resolved = resolveTierFiles(c.sourceDir, c.filePrefix, defaultExists);
    expect(resolved.map((r) => [r.tier, path.basename(r.file!), r.fallbackFrom])).toEqual([
      [1, "deerL1.svg", null],
      [2, "deerL2.svg", null],
      [3, "deerL3.svg", null],
      [4, "deerL3.svg", 3],
      [5, "deerL3.svg", 3],
    ]);
  });

  it("a newly added tier file is picked up without code changes; gaps use the nearest lower tier", () => {
    const present = new Set(
      ["d/deerL1.svg", "d/deerL3.svg", "d/deerL5.svg"].map((p) => path.normalize(p)),
    );
    const resolved = resolveTierFiles("d", "deer", (f: string) => present.has(path.normalize(f)));
    expect(resolved.map((r) => [r.tier, r.fallbackFrom])).toEqual([
      [1, null],
      [2, 1],
      [3, null],
      [4, 3],
      [5, null],
    ]);
  });
});
