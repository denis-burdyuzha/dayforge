import { describe, expect, it } from "vitest";

import { getAvatarAssetInfo } from "./avatarAssetInfo";

describe("getAvatarAssetInfo", () => {
  it("asset file, tier and aspect accent count per class and level", () => {
    expect(getAvatarAssetInfo("creator", 1)).toMatchObject({
      source: "bearL1.svg",
      tier: 1,
      fallbackFrom: null,
    });
    expect(getAvatarAssetInfo("creator", 1).aspectAccentCount).toBeGreaterThan(0);
    expect(getAvatarAssetInfo("warrior", 50)).toMatchObject({
      source: "wolfL5.svg",
      aspectAccentCount: 0,
    });
    expect(getAvatarAssetInfo("wanderer", 40)).toMatchObject({
      source: "deerL3.svg",
      tier: 4,
      fallbackFrom: 3,
    });
    const fox = getAvatarAssetInfo("explorer", 50);
    expect(fox).toMatchObject({ source: "foxL5.svg", tier: 5, fallbackFrom: null });
    expect(fox.aspectAccentCount).toBeGreaterThan(0);
  });
});
