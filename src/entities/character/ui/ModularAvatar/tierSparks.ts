/**
 * Static tier-particle templates shared by the low-poly creature renderers (fox, wolf).
 * Positions are relative to (100, 90) and scaled by particles.radius / 85 around the body centre.
 * Cool sparks are neutral white: cyan is reserved for the Intelligence aspect.
 */
export const TIER_SPARK_DEFS = [
  { cx: 28, cy: 95, r: 3.2, color: "#ff8800", opacity: 0.8 },
  { cx: 174, cy: 68, r: 2.4, color: "#e2e8f0", opacity: 0.85 },
  { cx: 22, cy: 165, r: 3.8, color: "#ff5500", opacity: 0.65 },
  { cx: 178, cy: 152, r: 2.0, color: "#e2e8f0", opacity: 0.9 },
  { cx: 100, cy: 24, r: 2.8, color: "#ffaa00", opacity: 0.75 },
  { cx: 162, cy: 198, r: 2.2, color: "#ff6600", opacity: 0.55 },
  { cx: 40, cy: 45, r: 2.6, color: "#e2e8f0", opacity: 0.8 },
  { cx: 155, cy: 110, r: 3.0, color: "#ff8800", opacity: 0.7 },
  { cx: 30, cy: 130, r: 2.5, color: "#ffbb00", opacity: 0.6 },
  { cx: 170, cy: 35, r: 3.4, color: "#e2e8f0", opacity: 0.85 },
  { cx: 115, cy: 15, r: 2.3, color: "#ff7700", opacity: 0.75 },
  { cx: 145, cy: 215, r: 2.7, color: "#e2e8f0", opacity: 0.65 },
] as const;

/** Particle centres for `count` sparks around `center` with orbit `radius` (tier-only, deterministic) */
export function tierSparkPositions(
  count: number,
  center: readonly [number, number],
  radius: number,
): Array<{ cx: number; cy: number; r: number; color: string; opacity: number }> {
  return Array.from({ length: count }, (_, i) => {
    const s = TIER_SPARK_DEFS[i % TIER_SPARK_DEFS.length]!;
    return {
      cx: Math.round((center[0] + (s.cx - 100) * (radius / 85)) * 10) / 10,
      cy: Math.round((center[1] + (s.cy - 90) * (radius / 85)) * 10) / 10,
      r: s.r,
      color: s.color,
      opacity: s.opacity,
    };
  });
}
