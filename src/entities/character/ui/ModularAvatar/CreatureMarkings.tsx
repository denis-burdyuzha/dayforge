import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureMarkings({ params }: { params: AvatarParams }) {
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

  return (
    <g className="creature-markings" filter="url(#avatar-glow-filter)">
      {/* Cranial Neural Marking Lines (Intelligence: Integrated into biology) */}
      {patternType === "dots" && (
        <g opacity={baseOpacity}>
          <circle
            cx={100 + asymShift * 0.3}
            cy="82"
            r={1.2 + complexity * 0.8}
            fill={palette.markingColor}
          />
          <circle
            cx={94 + asymShift * 0.5}
            cy="85"
            r={0.8 + complexity * 0.6}
            fill={palette.markingColor}
          />
          <circle
            cx={106 - asymShift * 0.2}
            cy="85"
            r={0.8 + complexity * 0.6}
            fill={palette.markingColor}
          />
          {/* Extra dots at higher intelligence */}
          {complexity > 0.4 && (
            <>
              <circle
                cx={90 + asymShift * 0.4}
                cy="88"
                r={0.6 + complexity * 0.4}
                fill={palette.markingColor}
              />
              <circle
                cx={110 - asymShift * 0.3}
                cy="88"
                r={0.6 + complexity * 0.4}
                fill={palette.markingColor}
              />
            </>
          )}
          {complexity > 0.7 && (
            <>
              <circle
                cx={86 + asymShift * 0.5}
                cy="82"
                r={0.5 + complexity * 0.3}
                fill={palette.markingColor}
              />
              <circle
                cx={114 - asymShift * 0.4}
                cy="82"
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
            d={`M ${100 + asymShift * 0.2} 76 L ${100 + asymShift * 0.2} 86 M ${94 + asymShift * 0.4} 82 L ${106 - asymShift * 0.3} 82`}
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
            strokeLinecap="round"
          />
          {/* Extra rune strokes at higher intelligence */}
          {complexity > 0.5 && (
            <path
              d={`M ${92 + asymShift * 0.5} 78 L ${96 + asymShift * 0.3} 86 M ${108 - asymShift * 0.4} 78 L ${104 - asymShift * 0.2} 86`}
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
            d={`M ${100 + asymShift * 0.15} 74 L ${94 + asymShift * 0.3} 82 L ${100 + asymShift * 0.15} 86 L ${106 - asymShift * 0.2} 82 Z`}
            fill="none"
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
          />
          <circle
            cx={100 + asymShift * 0.15}
            cy="80"
            r={1 + complexity * 0.8}
            fill={palette.accent}
          />
          {/* Outer geometric frame at high intelligence */}
          {complexity > 0.6 && (
            <path
              d={`M ${100 + asymShift * 0.1} 71 L ${91 + asymShift * 0.35} 80 L ${100 + asymShift * 0.1} 89 L ${109 - asymShift * 0.25} 80 Z`}
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
            d={`M ${100 + asymShift * 0.1} 72 L ${93 + asymShift * 0.3} 81 L ${100 + asymShift * 0.1} 84 L ${107 - asymShift * 0.2} 81 Z`}
            fill={palette.accent}
            opacity={0.6 + complexity * 0.3}
          />
          <path
            d={`M ${88 + asymShift * 0.4} 81 L ${112 - asymShift * 0.3} 81 M ${100 + asymShift * 0.1} 70 L ${100 + asymShift * 0.1} 88`}
            stroke={palette.markingColor}
            strokeWidth={baseStrokeWidth}
            strokeLinecap="round"
          />
          {/* Celestial rays at high intelligence */}
          {complexity > 0.5 && (
            <g opacity={complexity * 0.6}>
              <path
                d={`M ${84 + asymShift * 0.5} 76 L ${88 + asymShift * 0.4} 80`}
                stroke={palette.markingColor}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d={`M ${116 - asymShift * 0.4} 76 L ${112 - asymShift * 0.3} 80`}
                stroke={palette.markingColor}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d={`M ${100 + asymShift * 0.1} 68 L ${100 + asymShift * 0.1} 72`}
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
          d={`M ${100 + asymShift * 0.1} 130 L ${100 + asymShift * 0.1} 178`}
          stroke={palette.markingColor}
          strokeWidth={baseStrokeWidth}
          strokeDasharray="4 6"
          opacity={0.4 + complexity * 0.3}
        />
      )}
    </g>
  );
}
