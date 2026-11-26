import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ATTRIBUTE_COLORS, NEUTRAL_GLOW_COLOR } from "../../../model/aspect";
import { computeAvatarParams } from "../../../model/avatarEngine";
import type { CharacterAttribute } from "../../../model/characterTypes";
import type { CharacterClassId } from "../../../model/types";
import { ModularAvatar } from "../ModularAvatar";
import { createAspectAccentResolver } from "../shared/aspectAccent";
import { assetTierForLevel } from "../tierFx";
import {
  type AssetCreatureClassId,
  CREATURE_REGISTRY,
  creatureTierAsset,
} from "./creatureRegistry";

const attrs = (v: Partial<Record<string, number>>): CharacterAttribute[] =>
  ["strength", "endurance", "intelligence", "focus", "discipline", "social", "creativity"].map(
    (code, i) => ({
      id: `a${i}`,
      attributeId: `attr-${code}`,
      code,
      name: code,
      value: v[code] ?? 2,
    }),
  );

const render = (
  classId: CharacterClassId,
  level: number,
  v: Partial<Record<string, number>> = {},
  legacy = false,
) =>
  renderToStaticMarkup(
    <ModularAvatar
      params={computeAvatarParams(
        { id: "c", profileId: "p", name: "n", class: classId, level, totalXp: 0, createdAt: "" },
        attrs(v),
      )}
      size={300}
      legacyAttributeFx={legacy}
    />,
  );

/** fills of the main body copy (the rim pass is the `-rim` root) */
const bodyFills = (html: string, rootId: string) => {
  const body = html.split(`id="${rootId}"`).pop() ?? "";
  return new Map(
    [...body.matchAll(/<polygon id="([^"]+)"[^>]*?fill="([^"]+)"/g)].map((m) => [m[1]!, m[2]!]),
  );
};

const CLASSES = Object.keys(CREATURE_REGISTRY) as AssetCreatureClassId[];
const LEVELS = [1, 3, 5, 10, 20, 35, 50];

describe("AssetCreatureAvatar — every SVG-pipeline class", () => {
  for (const classId of CLASSES) {
    const creature = CREATURE_REGISTRY[classId];
    it(`${classId} (${creature.animal}): every level renders its tier asset with all polygons`, () => {
      for (const level of LEVELS) {
        const tier = assetTierForLevel(level);
        const asset = creatureTierAsset(creature, tier);
        const html = render(classId, level);
        expect(html, `${classId} L${level}`).toContain(`${creature.label} Avatar`);
        expect(html).toContain(`data-asset-source="${asset.source}"`);
        const fills = bodyFills(html, `${creature.animal}-l${tier}-asset-root`);
        expect(fills.size, `${classId} L${level} polygons`).toBe(
          new Set(asset.polygons.map((p) => p.id)).size,
        );
      }
    });
  }

  it("the aspect recolours exactly the aspectAccent polygons; without an aspect — asset colours", () => {
    const creature = CREATURE_REGISTRY.creator; // the bear is marked up on every tier
    for (const level of [1, 10, 50]) {
      const tier = assetTierForLevel(level);
      const asset = creatureTierAsset(creature, tier);
      const rootId = `bear-l${tier}-asset-root`;
      const plain = bodyFills(render("creator", level), rootId);
      const strong = bodyFills(render("creator", level, { strength: 15 }), rootId);
      const expected = createAspectAccentResolver(
        asset.polygons,
        asset.aspectAccentIds,
        ATTRIBUTE_COLORS.strength,
      )!;
      const accent = new Set(asset.aspectAccentIds);
      for (const p of asset.polygons) {
        expect(plain.get(p.id)).toBe(p.defaultFill);
        expect(strong.get(p.id), p.id).toBe(accent.has(p.id) ? expected(p) : p.defaultFill);
      }
    }
  });

  it("the wolf (no aspectAccent markup yet) keeps its colours with an aspect; nothing breaks", () => {
    const asset = creatureTierAsset(CREATURE_REGISTRY.warrior, 3);
    expect(asset.aspectAccentIds).toEqual([]);
    const fills = bodyFills(render("warrior", 10, { strength: 15 }), "wolf-l3-asset-root");
    for (const p of asset.polygons) expect(fills.get(p.id)).toBe(p.defaultFill);
  });

  it("deer L4 / L5 fall back to the L3 asset until the owner adds the SVGs", () => {
    const deer = CREATURE_REGISTRY.wanderer;
    expect(creatureTierAsset(deer, 4)).toMatchObject({ source: "deerL3.svg", fallbackFrom: 3 });
    expect(creatureTierAsset(deer, 5)).toMatchObject({ source: "deerL3.svg", fallbackFrom: 3 });
    expect(render("wanderer", 50)).toContain('data-asset-source="deerL3.svg"');
  });

  it("rim light + aura take the aspect colour; neutral white without an aspect", () => {
    for (const classId of CLASSES) {
      expect(render(classId, 10, { strength: 15 })).toContain(
        `fill="${ATTRIBUTE_COLORS.strength}"`,
      );
      expect(render(classId, 10, { social: 15 })).toContain(`fill="${ATTRIBUTE_COLORS.social}"`);
      expect(render(classId, 10)).toContain(`fill="${NEUTRAL_GLOW_COLOR}"`);
    }
  });

  it("explorer stays on the fox renderer; the archived v2 FX toggle does nothing for other classes", () => {
    expect(render("explorer", 10)).toContain("Explorer Fox Avatar");
    for (const classId of CLASSES) {
      const html = render(classId, 50, { strength: 18, social: 18 }, true);
      expect(html).not.toMatch(/attr-fx-/);
      expect(html).not.toContain("Fantasy Creature Avatar"); // the removed organic renderer
    }
  });
});
