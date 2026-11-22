import type React from "react";
import { useId } from "react";

import { computeFocusSpotlight } from "./computeFocus";
import { FX_CANVAS, type FxContext } from "./fxContext";

/** Focus — eye glints (over the body) + canvas vignette (over everything). Canvas space. */
export function FocusFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const rawId = useId();
  const s = computeFocusSpotlight(ctx);
  if (!s) return null;
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const vignetteId = `attr-fx-focus-vignette-${id}`;
  const glowId = `attr-fx-focus-glow-${id}`;
  const { light, shadow } = ctx.palette;
  const innerOffset = Math.min(0.99, s.innerR / s.outerR);

  return (
    <g className="attr-fx-focus">
      <defs>
        <radialGradient
          id={vignetteId}
          gradientUnits="userSpaceOnUse"
          cx={s.center[0]}
          cy={s.center[1]}
          r={s.outerR}
        >
          <stop offset={innerOffset} stopColor={shadow} stopOpacity={0} />
          <stop offset={1} stopColor={shadow} stopOpacity={s.edgeOpacity} />
        </radialGradient>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={light} stopOpacity={s.glowOpacity} />
          <stop offset="100%" stopColor={light} stopOpacity={0} />
        </radialGradient>
      </defs>

      <g className="attr-fx-focus-eyes">
        {s.eyes.map((p, i) => (
          <g key={`focus-eye-${i}`}>
            {s.glowR > 0.05 && <circle cx={p[0]} cy={p[1]} r={s.glowR} fill={`url(#${glowId})`} />}
            <circle cx={p[0]} cy={p[1]} r={1.5} fill={light} />
          </g>
        ))}
      </g>

      <rect
        className="attr-fx-focus-vignette"
        x={0}
        y={0}
        width={FX_CANVAS.w}
        height={FX_CANVAS.h}
        fill={`url(#${vignetteId})`}
      />
    </g>
  );
}
