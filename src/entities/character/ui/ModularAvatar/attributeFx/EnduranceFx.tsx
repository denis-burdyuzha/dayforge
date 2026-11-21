import type React from "react";

import { computeEnduranceScars } from "./computeEndurance";
import type { FxContext } from "./fxContext";

/** Endurance — fxStep(v, 4) stitched scars, colour `light`, opacity 0.55, 1.2px, static. No veins. */
export function EnduranceFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const scars = computeEnduranceScars(ctx);
  if (scars.length === 0) return null;
  const w = 1.2 * ctx.unit;
  const f = (n: number) => n.toFixed(2);
  return (
    <g
      className="attr-fx-endurance"
      stroke={ctx.palette.light}
      strokeOpacity={0.55}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {scars.map((s, i) => (
        <g key={`scar-${i}`}>
          <polyline points={s.points.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")} />
          {s.stitches.map(([a, b], k) => (
            <line key={`st-${k}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} />
          ))}
        </g>
      ))}
    </g>
  );
}
