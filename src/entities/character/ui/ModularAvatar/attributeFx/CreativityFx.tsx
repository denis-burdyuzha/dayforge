import type React from "react";
import { useId } from "react";

import { computeCreativitySign } from "./computeCreativity";
import type { FxContext } from "./fxContext";

/** Creativity — personal Sign along mesh edges: `accent`, 1.4px, opacity 0.9, glow 1. Static. */
export function CreativityFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const rawId = useId();
  const sign = computeCreativitySign(ctx);
  if (!sign || sign.edges.length === 0) return null;
  const glowId = `attr-fx-creativity-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const u = ctx.unit;
  const f = (n: number) => n.toFixed(2);
  return (
    <g className="attr-fx-creativity">
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={1 * u} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter={`url(#${glowId})`}
        stroke={ctx.palette.accent}
        strokeOpacity={0.9}
        strokeWidth={1.4 * u}
        strokeLinecap="round"
      >
        {sign.edges.map((e, i) => (
          <line key={`cre-e-${i}`} x1={f(e.a[0])} y1={f(e.a[1])} x2={f(e.b[0])} y2={f(e.b[1])} />
        ))}
      </g>
    </g>
  );
}
