import type React from "react";

import { computeStrengthSpikes } from "./computeStrength";
import type { FxContext } from "./fxContext";

/**
 * Strength — nape crest: fxStep(v, 7) spikes, fill = body +15%, 1px accent outline (opacity 0.8).
 * Torso facet contrast (×1.0 → ×1.25) is applied to the asset fill in bodyTone.ts. No scaling.
 */
export function StrengthFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const spikes = computeStrengthSpikes(ctx);
  if (spikes.length === 0) return null;
  const f = (n: number) => n.toFixed(2);
  return (
    <g className="attr-fx-strength">
      {spikes.map((s, i) => (
        <polygon
          key={`str-spike-${i}`}
          points={`${f(s.base1[0])},${f(s.base1[1])} ${f(s.tip[0])},${f(s.tip[1])} ${f(s.base2[0])},${f(s.base2[1])}`}
          fill={ctx.palette.bodyLight}
          stroke={ctx.palette.accent}
          strokeOpacity={0.8}
          strokeWidth={1 * ctx.unit}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}
