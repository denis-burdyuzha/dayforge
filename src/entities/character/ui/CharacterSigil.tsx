/**
 * CharacterSigil — deterministic procedural SVG emblem for a character.
 *
 * Rules:
 * - Input: userId (string) + level (number) + accentColor (string) + optional avatarParams
 * - Seed derived from userId via FNV-1a hash (no random() calls)
 * - Pattern complexity scales with level:
 *     1-4   → tier 1 (minimal: 1 outer ring, 2-3 spoke lines, 1 polygon)
 *     5-9   → tier 2 (+ arc layers, extra polygon)
 *     10+   → tier 3 (maximum density: triple rings, 6+ spokes, nested shapes)
 * - accentColor drives stroke + glow
 * - avatarParams (optional):
 *     topSkill1/topSkill2 → emoji badges in top corners
 *     postureVariant 'confident' → sharper polygon edges (miter join, thicker outer ring)
 *     clothingTier → extra decoration rings / stronger glow
 */

import type { AvatarParams } from "../model/avatarParams";

interface CharacterSigilProps {
  userId: string;
  level: number;
  accentColor: string;
  size?: number;
  className?: string;
  avatarParams?: AvatarParams;
}

// ---------------------------------------------------------------------------
// Hash helpers
// ---------------------------------------------------------------------------

/** Simple deterministic hash → integer in [0, 2^31).  No crypto, no rand. */
function hashString(s: string): number {
  let h = 0x811c9dc5; // FNV offset basis (32-bit)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
    h >>>= 0; // keep unsigned 32-bit
  }
  return h >>> 1; // keep in [0, 2^31)
}

/** Extract a pseudo-random float [0,1) from a hash + index so we can get
 *  multiple independent values from a single seed. */
function seededFloat(seed: number, index: number): number {
  const mixed = hashString(String(seed) + ":" + String(index));
  return mixed / 0x7fffffff;
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const CX = 50; // SVG viewport centre x
const CY = 50; // SVG viewport centre y

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** Generate a regular-ish polygon with a slight seed-based twist */
function polygonPoints(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rotationOffset: number,
): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i + rotationOffset;
    const [x, y] = polarToXY(cx, cy, r, angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Arc path helper (SVG arc) */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [sx, sy] = polarToXY(cx, cy, r, startDeg);
  const [ex, ey] = polarToXY(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

function getTier(level: number): 1 | 2 | 3 {
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterSigil({
  userId,
  level,
  accentColor,
  size = 160,
  className,
  avatarParams,
}: CharacterSigilProps) {
  const seed = hashString(userId);
  const tier = getTier(level);
  const filterId = `sigil-glow-${seed}`;
  const filterIdStrong = `sigil-glow-strong-${seed}`;

  // Derived values from seed
  const outerR = 38;
  const midR = 27;
  const innerR = 15;

  const spokeCount = tier === 1 ? 3 : tier === 2 ? 5 : 7;
  const polyRotation = seededFloat(seed, 0) * 60; // [0°, 60°)
  const outerPolySides = tier === 1 ? 3 : tier === 2 ? 5 : 6;
  const innerPolySides = tier === 2 ? 3 : tier === 3 ? 4 : 0;
  const arcGapFraction = 0.15 + seededFloat(seed, 1) * 0.25; // [15%, 40%) gap

  // Spokes: lines from inner edge to outer ring
  const spokeBaseAngle = seededFloat(seed, 2) * (360 / spokeCount);
  const spokes: Array<[number, number, number, number]> = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = spokeBaseAngle + (360 / spokeCount) * i;
    const [x1, y1] = polarToXY(CX, CY, innerR + 2, angle);
    const [x2, y2] = polarToXY(CX, CY, outerR - 2, angle);
    spokes.push([x1, y1, x2, y2]);
  }

  // Arcs around midR (tier 2+)
  const arcSegments: Array<[number, number]> = [];
  if (tier >= 2) {
    const segCount = tier === 2 ? 3 : 4;
    const segSize = (360 / segCount) * (1 - arcGapFraction);
    const arcBaseAngle = seededFloat(seed, 3) * (360 / segCount);
    for (let i = 0; i < segCount; i++) {
      const start = arcBaseAngle + (360 / segCount) * i;
      arcSegments.push([start, start + segSize]);
    }
  }

  // Additional detail rings (tier 3)
  const showDoubleOuter = tier === 3;
  const showCenterDot = tier >= 2;

  const strokeW = tier === 1 ? 0.8 : tier === 2 ? 0.7 : 0.6;
  const glowColor = accentColor;

  // ── avatarParams-driven visuals ──────────────────────────────────────────

  // postureVariant: 'confident' → sharper/heavier outer polygon edges
  const isConfident = avatarParams?.postureVariant === "confident";

  // clothingTier: extra glow rings based on avatar tier (independent of sigil tier)
  const clothingTier = avatarParams?.clothingTier ?? 1;
  // Glow intensity: stronger at higher clothing tiers
  const glowStdDev = clothingTier === 3 ? 3.5 : clothingTier === 2 ? 2.8 : 2.0;
  const showClothingRing2 = clothingTier >= 2;
  const showClothingRing3 = clothingTier >= 3;

  // Skill badges in top corners
  const skill1 = avatarParams?.topSkill1 ?? null;
  const skill2 = avatarParams?.topSkill2 ?? null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        {/* Standard glow filter — intensity driven by clothingTier */}
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowStdDev} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Strong glow for clothing tier 3 rings */}
        <filter id={filterIdStrong} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Clothing tier 3: extra outermost decorative ring ── */}
      {showClothingRing3 && (
        <circle
          cx={CX}
          cy={CY}
          r={outerR + 7}
          fill="none"
          stroke={glowColor}
          strokeWidth={0.5}
          strokeOpacity={0.4}
          strokeDasharray="1.5 4"
          filter={`url(#${filterIdStrong})`}
        />
      )}

      {/* ── Clothing tier 2+: extra decorative ring ── */}
      {showClothingRing2 && (
        <circle
          cx={CX}
          cy={CY}
          r={outerR + 4}
          fill="none"
          stroke={glowColor}
          strokeWidth={0.4}
          strokeOpacity={0.3}
          strokeDasharray="3 5"
          filter={`url(#${filterId})`}
        />
      )}

      {/* ── Background circle (subtle, neutral) ── */}
      <circle
        cx={CX}
        cy={CY}
        r={outerR + 4}
        fill="currentColor"
        fillOpacity={0.04}
        stroke={glowColor}
        strokeWidth={0.3}
        strokeOpacity={0.2}
      />

      {/* ── Outer ring with glow ── */}
      <circle
        cx={CX}
        cy={CY}
        r={outerR}
        fill="none"
        stroke={glowColor}
        strokeWidth={isConfident ? strokeW + 0.8 : strokeW + 0.4}
        strokeOpacity={isConfident ? 0.9 : 0.7}
        filter={`url(#${filterId})`}
      />

      {/* ── Double outer ring (tier 3 only) ── */}
      {showDoubleOuter && (
        <circle
          cx={CX}
          cy={CY}
          r={outerR - 4}
          fill="none"
          stroke={glowColor}
          strokeWidth={0.4}
          strokeOpacity={0.35}
          strokeDasharray="2 3"
        />
      )}

      {/* ── Outer polygon
           postureVariant 'confident' → miter join + thicker stroke (sharper look)
           'neutral' → round join (softer) ── */}
      <polygon
        points={polygonPoints(CX, CY, outerR - 6, outerPolySides, polyRotation)}
        fill="none"
        stroke={glowColor}
        strokeWidth={isConfident ? strokeW + 0.4 : strokeW}
        strokeOpacity={isConfident ? 0.8 : 0.6}
        strokeLinejoin={isConfident ? "miter" : "round"}
      />

      {/* ── Mid-ring arcs (tier 2+) ── */}
      {arcSegments.map(([start, end], i) => (
        <path
          key={i}
          d={arcPath(CX, CY, midR, start, end)}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeW + 0.2}
          strokeOpacity={0.8}
          strokeLinecap="round"
        />
      ))}

      {/* ── Spokes ── */}
      {spokes.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1.toFixed(2)}
          y1={y1.toFixed(2)}
          x2={x2.toFixed(2)}
          y2={y2.toFixed(2)}
          stroke={glowColor}
          strokeWidth={strokeW - 0.1}
          strokeOpacity={0.45}
          strokeLinecap="round"
        />
      ))}

      {/* ── Inner polygon (tier 2+) ── */}
      {innerPolySides > 0 && (
        <polygon
          points={polygonPoints(CX, CY, innerR, innerPolySides, polyRotation + 30)}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeW}
          strokeOpacity={0.55}
          strokeLinejoin="round"
        />
      )}

      {/* ── Inner ring ── */}
      <circle
        cx={CX}
        cy={CY}
        r={innerR}
        fill="none"
        stroke={glowColor}
        strokeWidth={strokeW - 0.1}
        strokeOpacity={0.5}
      />

      {/* ── Centre dot (tier 2+) ── */}
      {showCenterDot && (
        <circle
          cx={CX}
          cy={CY}
          r={2.5}
          fill={glowColor}
          fillOpacity={0.7}
          filter={`url(#${filterId})`}
        />
      )}

      {/* ── Minimal centre mark (tier 1) ── */}
      {!showCenterDot && <circle cx={CX} cy={CY} r={1.5} fill={glowColor} fillOpacity={0.5} />}

      {/* ── Skill badges — top-left and top-right corners ── */}
      {skill1 && (
        <text
          x="10"
          y="16"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
          aria-label={skill1.name}
        >
          {skill1.icon}
        </text>
      )}
      {skill2 && (
        <text
          x="90"
          y="16"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
          aria-label={skill2.name}
        >
          {skill2.icon}
        </text>
      )}
    </svg>
  );
}
