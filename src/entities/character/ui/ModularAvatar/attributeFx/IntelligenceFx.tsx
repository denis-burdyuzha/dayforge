import type React from "react";
import { useId } from "react";

import { computeIntelligenceNetwork, INTELLIGENCE_WAVE_PERIOD_S } from "./computeIntelligence";
import type { FxContext } from "./fxContext";

const NODE_OPACITY = 0.7;
const WAVE_BOOST = 0.25;
const WAVE_PULSE_S = 0.3;

/**
 * Intelligence — forehead neural network: depth-1 subdivision lines (light, 0.7, 0.9px, glow 0.6 on lines
 * only) + nodes r=1.2px. The ONLY animation: one wave every 4 s from foreheadCenter outward, raising each
 * node's opacity by +0.25 for 300 ms. Head fill is not changed.
 */
export function IntelligenceFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const rawId = useId();
  const net = computeIntelligenceNetwork(ctx);
  if (!net) return null;
  const filterId = `attr-fx-int-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const u = ctx.unit;
  const f = (n: number) => n.toFixed(2);
  const T = INTELLIGENCE_WAVE_PERIOD_S;
  const up = WAVE_PULSE_S / 2 / T;
  const base = NODE_OPACITY.toFixed(2);
  const peak = (NODE_OPACITY + WAVE_BOOST).toFixed(2);

  return (
    <g className="attr-fx-intelligence">
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={0.6 * u} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter={`url(#${filterId})`}
        stroke={ctx.palette.light}
        strokeOpacity={0.7}
        strokeWidth={0.9 * u}
        strokeLinecap="round"
        fill="none"
      >
        {net.lines.map(([a, b], i) => (
          <line key={`int-l-${i}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} />
        ))}
      </g>
      <g fill={ctx.palette.light}>
        {net.nodes.map((node, i) => {
          const t0 = node.delay / T;
          const keyTimes = [0, t0, t0 + up, t0 + 2 * up, 1].map((k) => k.toFixed(4)).join(";");
          return (
            <circle
              key={`int-n-${i}`}
              cx={f(node.p[0])}
              cy={f(node.p[1])}
              r={1.2 * u}
              opacity={base}
            >
              <animate
                attributeName="opacity"
                values={`${base};${base};${peak};${base};${base}`}
                keyTimes={keyTimes}
                dur={`${T}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </g>
    </g>
  );
}
