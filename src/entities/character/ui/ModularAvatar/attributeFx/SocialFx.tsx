import type React from "react";
import { useId } from "react";

import { computeSocialConstellation } from "./computeSocial";
import type { FxContext } from "./fxContext";

/**
 * Social — static constellation behind the avatar: `light` stars (r 1.5–2.5, opacity 0.6, soft glow),
 * MST threads 0.6px / 0.3, one thread to the chest point (hidden behind the body). No motion at all.
 */
export function SocialFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const rawId = useId();
  const c = computeSocialConstellation(ctx);
  if (!c || c.stars.length === 0) return null;
  const glowId = `attr-fx-social-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { light } = ctx.palette;
  const f = (n: number) => n.toFixed(2);
  const lines = c.chestLink ? [...c.threads, c.chestLink] : c.threads;

  return (
    <g className="attr-fx-social">
      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={1.2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke={light} strokeOpacity={0.3} strokeWidth={0.6} strokeLinecap="round">
        {lines.map(([a, b], i) => (
          <line key={`soc-t-${i}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} />
        ))}
      </g>
      <g fill={light} fillOpacity={0.6} filter={`url(#${glowId})`}>
        {c.stars.map((s, i) => (
          <circle key={`soc-s-${i}`} cx={f(s.p[0])} cy={f(s.p[1])} r={s.r.toFixed(2)} />
        ))}
      </g>
    </g>
  );
}
