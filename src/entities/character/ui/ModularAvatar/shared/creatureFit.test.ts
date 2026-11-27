import { describe, expect, it } from "vitest";

import { CREATURE_REGISTRY } from "../creatures/creatureRegistry";
import { FOX_TIER_CONFIG } from "../creatures/fox/foxEvolutionConfig";
import { getTierPolys } from "../creatures/fox/foxZones";
import { computeCanvasFit, fieldShare, FIT_FIELD, polygonBBox } from "./creatureFit";

describe("canvas fit rule", () => {
  it("height 86 % of the field unless the width limits; bottom on the ground line; centred on x = 100", () => {
    const tall = [{ points: "0,0 50,0 50,200" }];
    const fit = computeCanvasFit(tall);
    expect(fit.scale).toBeCloseTo((208 * 0.86) / 200, 6);
    expect(fit.ty + 200 * fit.scale).toBeCloseTo(212, 6);
    expect(fit.tx + 25 * fit.scale).toBeCloseTo(100, 6);
    const wide = computeCanvasFit([{ points: "0,0 400,0 400,100" }]);
    expect(wide.scale).toBeCloseTo(168 / 400, 6);
  });

  it("every fox tier config equals the rule applied to its polygon data", () => {
    for (const config of Object.values(FOX_TIER_CONFIG)) {
      const fit = computeCanvasFit(getTierPolys(config.tierIndex));
      expect(config.scale, `fox L${config.tierIndex} scale`).toBeCloseTo(fit.scale, 3);
      expect(config.tx, `fox L${config.tierIndex} tx`).toBeCloseTo(fit.tx, 1);
      expect(config.ty, `fox L${config.tierIndex} ty`).toBeCloseTo(fit.ty, 1);
    }
  });

  it("every generated creature tier (own SVG) equals the rule applied to its polygons; share table", () => {
    const rows: string[] = [];
    for (const creature of Object.values(CREATURE_REGISTRY)) {
      for (const asset of creature.tierAssets) {
        if (asset.fallbackFrom !== null) continue;
        const fit = computeCanvasFit(asset.polygons);
        expect(asset.fit.scale, `${creature.animal} L${asset.tierIndex}`).toBeCloseTo(fit.scale, 3);
        expect(asset.fit.tx).toBeCloseTo(fit.tx, 1);
        expect(asset.fit.ty).toBeCloseTo(fit.ty, 1);
        const share = fieldShare(asset.polygons, asset.fit);
        // the animal fills the field: 86 % of the height, or 100 % of the width when the width limits
        expect(
          Math.abs(share.height - FIT_FIELD.heightShare) < 0.005 ||
            Math.abs(share.width - 1) < 0.005,
          `${creature.animal} L${asset.tierIndex}`,
        ).toBe(true);
        const b = polygonBBox(asset.polygons);
        rows.push(
          `${creature.animal} L${asset.tierIndex}: h ${Math.round(share.height * 100)}% w ${Math.round(share.width * 100)}% (${b.w}x${b.h})`,
        );
      }
    }
    expect(rows.length).toBe(5 + 5 + 5 + 3); // wolf, bear, lion, deer (own SVGs)
  });
});
