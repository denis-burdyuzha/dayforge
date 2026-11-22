import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ATTRIBUTE_COLORS, NEUTRAL_GLOW_COLOR } from "../../../../model/aspect";
import { computeAvatarParams } from "../../../../model/avatarEngine";
import type { CharacterAttribute } from "../../../../model/characterTypes";
import { ModularAvatar } from "../../ModularAvatar";
import { getWolfTierConfig } from "./wolfEvolutionConfig";

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

const render = (level: number, v: Partial<Record<string, number>>, legacy = false) =>
  renderToStaticMarkup(
    <ModularAvatar
      params={computeAvatarParams(
        { id: "w", profileId: "p", name: "n", class: "warrior", level, totalXp: 0, createdAt: "" },
        attrs(v),
        [],
        null,
      )}
      size={300}
      legacyAttributeFx={legacy}
    />,
  );

describe("WolfAvatar (warrior)", () => {
  for (const level of [1, 3, 5, 10, 20, 35, 50]) {
    it(`level ${level}: renders its tier asset with all polygons`, () => {
      const html = render(level, {});
      const tier = getWolfTierConfig(level);
      expect(html).toContain("Warrior Wolf Avatar");
      expect(html).toContain(`wolf-l${tier.tierIndex}-asset-root`);
      // main body copy: exactly one polygon per asset polygon inside the asset root
      const bodyRoot = html.split(`id="wolf-l${tier.tierIndex}-asset-root"`).pop() ?? "";
      expect((bodyRoot.match(/<polygon /g) ?? []).length).toBeGreaterThanOrEqual(tier.polygonCount);
    });
  }

  it("rim light + aura take the aspect colour; neutral white without an aspect", () => {
    expect(render(10, { strength: 15 })).toContain(`fill="${ATTRIBUTE_COLORS.strength}"`);
    expect(render(10, { social: 15 })).toContain(`fill="${ATTRIBUTE_COLORS.social}"`);
    expect(render(1, {})).toContain(`fill="${NEUTRAL_GLOW_COLOR}"`);
  });

  it("the archived v2 FX toggle does nothing for the wolf", () => {
    const html = render(50, Object.fromEntries(["strength", "social"].map((k) => [k, 18])), true);
    expect(html).not.toMatch(/attr-fx-/);
  });
});
