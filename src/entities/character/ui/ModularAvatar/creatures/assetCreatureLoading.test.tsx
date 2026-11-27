/**
 * Lazy loading of the creature data: this file never preloads, so the first render sees an empty cache
 * (each test file gets its own module instances).
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { computeAvatarParams } from "../../../model/avatarEngine";
import type { Character } from "../../../model/characterTypes";
import type { CharacterClassId } from "../../../model/types";
import { ModularAvatar } from "../ModularAvatar";
import { loadTier, peekTier } from "../shared/tierAssetStore";
import { CREATURE_REGISTRY, creatureTierAsset } from "./creatureRegistry";
import { foxTierKey, loadFoxTier } from "./fox/foxZones";

const character = (cls: CharacterClassId, level: number): Character => ({
  id: "c",
  profileId: "p",
  name: "n",
  class: cls,
  level,
  totalXp: 0,
  createdAt: "",
});

const render = (cls: CharacterClassId, level: number) =>
  renderToStaticMarkup(
    <ModularAvatar params={computeAvatarParams(character(cls, level), [])} size={300} />,
  );

describe("lazy creature data", () => {
  it("before the data is loaded: an empty canvas of the same size with the shadow, no polygons", () => {
    for (const cls of ["warrior", "creator", "strategist", "wanderer", "explorer"] as const) {
      const html = render(cls, 10);
      expect(html, cls).toContain("<svg");
      expect(html, cls).toContain('viewBox="0 0 200 240"');
      expect(html, cls).toContain("<ellipse"); // the ground shadow
      expect(html, cls).toContain('aria-busy="true"');
      expect(html, cls).not.toContain("<polygon");
    }
  });

  it("a tier is fetched once (cache by key), and a fallback tier shares the data of its source tier", async () => {
    const deer = CREATURE_REGISTRY.wanderer;
    const l3 = creatureTierAsset(deer, 3);
    const l4 = creatureTierAsset(deer, 4);
    expect(l4.dataKey).toBe(l3.dataKey);
    expect(peekTier(l3.dataKey)).toBeUndefined();
    let calls = 0;
    const counting = () => {
      calls++;
      return l3.load();
    };
    const [a, b] = await Promise.all([
      loadTier(l3.dataKey, counting),
      loadTier(l3.dataKey, counting),
    ]);
    expect(a).toBe(b);
    expect(calls).toBe(1);
    await loadTier(l4.dataKey, l4.load); // already cached → no second chunk request
    expect(calls).toBe(1);
  });

  it("once loaded, the same render contains the polygons (no empty canvas)", async () => {
    const bear = creatureTierAsset(CREATURE_REGISTRY.creator, 3);
    await loadTier(bear.dataKey, bear.load);
    const html = render("creator", 10);
    expect(html).toContain("<polygon");
    expect(html).not.toContain("aria-busy");
    await loadFoxTier(3);
    expect(peekTier(foxTierKey(3))).toBeDefined();
    expect(render("explorer", 10)).toContain("<polygon");
  });
});
