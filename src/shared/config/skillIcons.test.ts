import { Sparkles } from "lucide-react";
import { describe, expect, it } from "vitest";

import list from "../../../supabase/functions/_shared/skillIcons.json" with { type: "json" };
import { getSkillIconByKey, SKILL_ICON_OPTIONS } from "./skillIcons";

describe("skill icons", () => {
  it("~50 unique keys shared with the Edge Function, each mapped to its own lucide icon", () => {
    expect(list.length).toBeGreaterThanOrEqual(45);
    expect(new Set(list.map((i) => i.key)).size).toBe(list.length);
    expect(SKILL_ICON_OPTIONS.map((o) => o.key)).toEqual(list.map((i) => i.key));
    for (const item of list) {
      const option = getSkillIconByKey(item.key);
      // only "misc" is Sparkles on purpose; any other Sparkles means a lucide name is not mapped
      if (item.lucide !== "Sparkles") expect(option?.Icon, item.key).not.toBe(Sparkles);
    }
    expect(getSkillIconByKey("misc")?.Icon).toBe(Sparkles);
    expect(getSkillIconByKey("dragon")).toBeUndefined();
    expect(getSkillIconByKey(null)).toBeUndefined();
  });
});
