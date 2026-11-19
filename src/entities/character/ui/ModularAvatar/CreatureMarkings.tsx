import type { AvatarParams } from "../../model/avatarTypes";

interface L1MarkingsOffset {
  /** Override centre-X for all marking coordinates (Larval tier, asset-bound) */
  cx: number;
  /** Override centre-Y for markings (Larval tier — head/collar zone of foxL1 mesh) */
  cy: number;
}

/**
 * CreatureMarkings — Bioluminescent anatomical marking patterns driven by Intelligence / Creativity.
 *
 * For non-Larval tiers (l1Offset is undefined) coordinates are the legacy hardcoded positions
 * in viewBox (0 0 200 240) that match the procedural mesh.
 *
 * For Larval tier (l1Offset provided) coordinates are shifted to match foxL1.svg mesh geometry
 * as projected into viewBox space via FoxAvatar's scale(0.42) transform.
 */
export function CreatureMarkings({
  params,
  l1Offset,
}: {
  params: AvatarParams;
  l1Offset?: L1MarkingsOffset;
}) {
  const { palette, markings, evolution, creativity } = params;
  const { patternType, complexity } = markings;
  const { tier } = evolution;
  const { asymmetryIntensity, asymmetrySeed } = creativity;

  if (tier < 2 && complexity < 0.2) return null;

  // ── Intelligence → Continuous intensity within each style ──
  // complexity (0..1) controls opacity, stroke weight, and number of elements
  const baseOpacity = 0.5 + complexity * 0.45;
  const baseStrokeWidth = 0.8 + complexity * 0.8;

  // ── Creativity → Pattern asymmetry ──
  // Shifts marks off-center based on asymmetrySeed direction
  const asymDir = asymmetrySeed > 0.5 ? 1 : -1;
  const asymShift = asymmetryIntensity * 6 * asymDir; // ±6px horizontal shift

  // ── Coordinate anchors ──
  // For Larval tier: use l1Offset (asset-bound coords in viewBox space).
  // For other tiers: legacy hardcoded coords referencing procedural mesh.
  const baseCx = l1Offset ? l1Offset.cx : 100;
  // Head marking Y for runes/dots/celestial — on forehead region
  const headMarkY0 = l1Offset ? l1Offset.cy - 8 : 82;
  const headMarkY1 = l1Offset ? l1Offset.cy - 5 : 85;
  const headMarkY2 = l1Offset ? l1Offset.cy - 2 : 88;
  // Spinal line Y range (only shown for tier >= 4)
  const spineY0 = l1Offset ? l1Offset.cy + 20 : 130;
  const spineY1 = l1Offset ? l1Offset.cy + 40 : 178;

  return (
    <g className="creature-markings" filter="url(#avatar-glow-filter)">
      {/* Cranial Neural Marking Lines (Intelligence: Integrated into biology) */}
      {patternType === "dots" && (
        <g opacity={baseOpacity}>
          <circle
            cx={baseCx + asymShift * 0.3}
            cy={headMarkY0}
            r={1.2 + complexity * 0.8}
            fill={palette.markingColor}
          />
          <circle
            cx={baseCx - 6 + asymShift * 0.5}
            cy={headMarkY1}
            r={0.8 + complexity * 0.6}
            fill={palette.markingColor}
          />
          <circle
            cx={baseCx + 6 - asymShift * 0.2}
            cy={headMarkY1}
            r={0.8 + complexity * 0.6}
            fill={palette.markingColor}
          />
          {/* Extra dots at higher intelligence */}
          {complexity > 0.4 && (
            <>
              <circle
                cx={baseCx - 10 + asymShift * 0.4}
                cy={headMarkY2}
                r={0.6 + complexity * 0.4}
                fill={palette.markingColor}
              />
              <circle
                cx={baseCx + 10 - asymShift * 0.3}
                cy={headMarkY2}
                r={0.6 + complexity * 0.4}
                fill={palette.markingColor}
              />
            </>
          )}
          {complexity > 0.7 && (
            <>
              <circle
                cx={baseCx - 14 + asymShift * 0.5}
                cy={headMarkY0}
                r={0.5 + complexity * 0.3}
                fill={palette.markingColor}
              />
              <circle
                cx={baseCx + 14 - asymShift * 0.4}
                cy={headMarkY0}
                r={0.5 + complexity * 0.3}
                fill={palette.markingColor}
              />
            </>
          )}
        </g>
      )}

      {patternType === "runes" && (
        <g opacity={baseOpacity}>
          <path
            d={`M ${baseCx + asymShift * 0.2} ${headMarkY0 - 6} L ${baseCx + asymShift * 0.2} ${headMarkY1} M ${baseCx - 6 + asymShift * 0.4} ${headMarkY0} L ${baseCx + 6 - asymShift * 0.3} ${headMarkY0}`}
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
            strokeLinecap="round"
          />
          {/* Extra rune strokes at higher intelligence */}
          {complexity > 0.5 && (
            <path
              d={`M ${baseCx - 8 + asymShift * 0.5} ${headMarkY0 - 4} L ${baseCx - 4 + asymShift * 0.3} ${headMarkY1} M ${baseCx + 8 - asymShift * 0.4} ${headMarkY0 - 4} L ${baseCx + 4 - asymShift * 0.2} ${headMarkY1}`}
              stroke={palette.markingColor}
              strokeWidth={baseStrokeWidth * 0.7}
              strokeLinecap="round"
              opacity="0.7"
            />
          )}
        </g>
      )}

      {patternType === "geometric" && (
        <g opacity={baseOpacity}>
          <path
            d={`M ${baseCx + asymShift * 0.15} ${headMarkY0 - 8} L ${baseCx - 6 + asymShift * 0.3} ${headMarkY0} L ${baseCx + asymShift * 0.15} ${headMarkY0 + 4} L ${baseCx + 6 - asymShift * 0.2} ${headMarkY0} Z`}
            fill="none"
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
          />
          <circle
            cx={baseCx + asymShift * 0.15}
            cy={headMarkY0 - 2}
            r={1 + complexity * 0.8}
            fill={palette.accent}
          />
          {/* Outer geometric frame at high intelligence */}
          {complexity > 0.6 && (
            <path
              d={`M ${baseCx + asymShift * 0.1} ${headMarkY0 - 11} L ${baseCx - 9 + asymShift * 0.35} ${headMarkY0 - 2} L ${baseCx + asymShift * 0.1} ${headMarkY0 + 7} L ${baseCx + 9 - asymShift * 0.25} ${headMarkY0 - 2} Z`}
              fill="none"
              stroke={palette.markingColor}
              strokeWidth={baseStrokeWidth * 0.6}
              opacity="0.5"
            />
          )}
        </g>
      )}

      {patternType === "celestial" && (
        <g opacity={0.7 + complexity * 0.25}>
          <path
            d={`M ${baseCx + asymShift * 0.1} ${headMarkY0 - 10} L ${baseCx - 7 + asymShift * 0.3} ${headMarkY0 - 1} L ${baseCx + asymShift * 0.1} ${headMarkY0 + 2} L ${baseCx + 7 - asymShift * 0.2} ${headMarkY0 - 1} Z`}
            fill={palette.accent}
            opacity={0.6 + complexity * 0.3}
          />
          <path
            d={`M ${baseCx - 12 + asymShift * 0.4} ${headMarkY0 - 1} L ${baseCx + 12 - asymShift * 0.3} ${headMarkY0 - 1} M ${baseCx + asymShift * 0.1} ${headMarkY0 - 12} L ${baseCx + asymShift * 0.1} ${headMarkY0 + 6}`}
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
            strokeLinecap="round"
          />
          {/* Celestial rays at high intelligence */}
          {complexity > 0.5 && (
            <g opacity={complexity * 0.6}>
              <path
                d={`M ${baseCx - 16 + asymShift * 0.5} ${headMarkY0 - 6} L ${baseCx - 12 + asymShift * 0.4} ${headMarkY0 - 2}`}
                stroke={palette.markingColor}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d={`M ${baseCx + 16 - asymShift * 0.4} ${headMarkY0 - 6} L ${baseCx + 12 - asymShift * 0.3} ${headMarkY0 - 2}`}
                stroke={palette.markingColor}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d={`M ${baseCx + asymShift * 0.1} ${headMarkY0 - 14} L ${baseCx + asymShift * 0.1} ${headMarkY0 - 10}`}
                stroke={palette.markingColor}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      )}

      {/* Dorsal Bioluminescent Spinal Line for Mature Organism */}
      {tier >= 4 && (
        <path
          d={`M ${baseCx + asymShift * 0.1} ${spineY0} L ${baseCx + asymShift * 0.1} ${spineY1}`}
          stroke={palette.markingColor}
          strokeWidth={baseStrokeWidth}
          strokeDasharray="4 6"
          opacity={0.4 + complexity * 0.3}
        />
      )}
    </g>
  );
}
