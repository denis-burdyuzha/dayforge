import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  computeFit,
  defaultExists,
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
    expect(computeFit(parsed.polygons)).toMatchObject({ scale: 0.0997, tx: -36.4439, ty: 37.695 });
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
