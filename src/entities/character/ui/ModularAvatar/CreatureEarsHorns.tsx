import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureEarsHorns({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, posture, evolution, creativity } = params;
  const { classArchetype, tier } = evolution;
  const earTilt = (1 - posture.earAlertness) * 12; // degrees droop if relaxed

  // ── CREATIVITY → Asymmetry ──
  // asymmetryIntensity 0..1 → how pronounced the asymmetry
  // asymmetrySeed → deterministic direction/magnitude (from identity hash)
  const { asymmetryIntensity, asymmetrySeed } = creativity;
  // Left horn/ear gets offset; right stays baseline (or inverse)
  const asymDir = asymmetrySeed > 0.5 ? 1 : -1;
  const asymHeightOffset = asymmetryIntensity * 12 * asymDir; // ±12px max
  const asymAngleOffset = asymmetryIntensity * 8 * asymDir; // ±8° max
  const asymScaleLeft = 1 + asymmetryIntensity * 0.15 * (asymmetrySeed > 0.5 ? 1 : -0.5);
  const asymScaleRight = 1 + asymmetryIntensity * 0.15 * (asymmetrySeed > 0.5 ? -0.5 : 1);

  const fillPrimary = isSilhouette ? "#020617" : "url(#creature-body-grad)";
  const fillSecondary = isSilhouette ? "#020617" : palette.secondaryBody;
  const fillMembrane = isSilhouette ? "#020617" : "url(#creature-membrane-grad)";
  const accentStroke = isSilhouette ? "none" : palette.accent;

  // Horn Scale factor by Tier (T1 = 0.35 small nubs, T7 = 1.38 epic crown)
  const hornScaleMap: Record<number, number> = {
    1: 0.35,
    2: 0.55,
    3: 0.75,
    4: 0.95,
    5: 1.15,
    6: 1.28,
    7: 1.38,
  };
  const hScale = hornScaleMap[tier] ?? 1.0;

  return (
    <g className="creature-ears-horns">
      {/* ── Explorer: Sleek Articulated Radar Sensors / Ears ── */}
      {classArchetype === "explorer" && (
        <g transform={`translate(100, 80) scale(${hScale}) translate(-100, -80)`}>
          {/* Left Sensor Ear — with creativity asymmetry */}
          <g
            transform={`rotate(${-18 - earTilt + asymAngleOffset} 72 82) scale(${asymScaleLeft}) translate(0, ${asymHeightOffset * 0.3})`}
          >
            {/* Outer Chitin Spine */}
            <path
              d="M 80 96 C 55 58, 38 40, 32 60 C 48 80, 68 94, 76 100 Z"
              fill={fillPrimary}
              stroke={accentStroke}
              strokeWidth="1"
            />
            {/* Inner Translucent Radar Membrane */}
            <path d="M 76 94 C 58 62, 44 48, 38 64 C 50 78, 66 90, 72 96 Z" fill={fillMembrane} />
          </g>

          {/* Right Sensor Ear */}
          <g
            transform={`rotate(${18 + earTilt - asymAngleOffset * 0.3} 128 82) scale(${asymScaleRight})`}
          >
            {/* Outer Chitin Spine */}
            <path
              d="M 120 96 C 145 58, 162 40, 168 60 C 152 80, 132 94, 124 100 Z"
              fill={fillPrimary}
              stroke={accentStroke}
              strokeWidth="1"
            />
            {/* Inner Translucent Radar Membrane */}
            <path
              d="M 124 94 C 142 62, 156 48, 162 64 C 150 78, 134 90, 128 96 Z"
              fill={fillMembrane}
            />
          </g>

          {/* Tier 5+ Additional Secondary Radar Fins */}
          {tier >= 5 && (
            <g opacity="0.8">
              <path
                d="M 70 85 C 50 55, 30 45, 24 55 C 38 70, 58 82, 66 88 Z"
                fill={palette.accent}
              />
              <path
                d="M 130 85 C 150 55, 170 45, 176 55 C 162 70, 142 82, 134 88 Z"
                fill={palette.accent}
              />
            </g>
          )}
        </g>
      )}

      {/* ── Warrior: Heavy Broad Swept-Back Keratin Horns & Occipital Crest Mantle ── */}
      {classArchetype === "warrior" && (
        <g transform={`translate(100, 80) scale(${hScale}) translate(-100, -80)`}>
          {/* Central Heavy Dinosaur/Dragon Skull Crest */}
          <path
            d="M 100 56 C 93 62, 91 76, 91 84 C 97 82, 103 82, 109 84 C 109 76, 107 62, 100 56 Z"
            fill={fillPrimary}
            stroke={fillSecondary}
            strokeWidth="1.2"
          />
          {!isSilhouette && (
            <path
              d="M 100 58 C 95 64, 94 74, 94 82"
              fill="none"
              stroke="url(#creature-rim-light-grad)"
              strokeWidth="1.2"
              filter="url(#avatar-rim-glow)"
            />
          )}

          {/* Left Broad Swept-Back Horn */}
          <path
            d={`M 78 82 C 60 ${66 - asymHeightOffset * 0.4}, 40 ${64 - asymHeightOffset * 0.8}, 36 ${74 - asymHeightOffset * 0.8} C 46 84, 66 86, 76 90 Z`}
            fill={fillPrimary}
            stroke={fillSecondary}
            strokeWidth="1.2"
          />
          {/* Left Horn Rim-Light Highlight */}
          {!isSilhouette && (
            <path
              d={`M 77 80 C 59 ${64 - asymHeightOffset * 0.4}, 39 ${62 - asymHeightOffset * 0.8}, 35 ${72 - asymHeightOffset * 0.8}`}
              fill="none"
              stroke="url(#creature-rim-light-grad)"
              strokeWidth="1.2"
              filter="url(#avatar-rim-glow)"
            />
          )}

          {/* Right Broad Swept-Back Horn */}
          <path
            d={`M 122 82 C 140 ${66 + asymHeightOffset * 0.2}, 160 ${64 + asymHeightOffset * 0.4}, 164 ${74 + asymHeightOffset * 0.4} C 154 84, 134 86, 124 90 Z`}
            fill={fillPrimary}
            stroke={fillSecondary}
            strokeWidth="1.2"
          />
          {/* Right Horn Rim-Light Highlight */}
          {!isSilhouette && (
            <path
              d={`M 123 80 C 141 ${64 + asymHeightOffset * 0.2}, 161 ${62 + asymHeightOffset * 0.4}, 165 ${72 + asymHeightOffset * 0.4}`}
              fill="none"
              stroke="url(#creature-rim-light-grad)"
              strokeWidth="1.2"
              filter="url(#avatar-rim-glow)"
            />
          )}

          {/* Occipital Hood Armor Plate framing Skull */}
          <path
            d="M 72 88 C 68 94, 66 100, 74 102 C 86 104, 114 104, 126 102 C 134 100, 132 94, 128 88 Z"
            fill={fillSecondary}
            stroke={fillPrimary}
            strokeWidth="0.8"
          />

          {/* Tier 4+ Awakened & Signature Inner Horn Ridge Volume */}
          {tier >= 4 && (
            <g opacity="0.6">
              <path
                d={`M 76 84 C 62 72, 48 70, 44 76 C 52 82, 66 84, 74 86 Z`}
                fill={fillSecondary}
              />
              <path
                d={`M 124 84 C 138 72, 152 70, 156 76 C 148 82, 134 84, 126 86 Z`}
                fill={fillSecondary}
              />
            </g>
          )}
        </g>
      )}

      {/* ── Creator: Branching Chitinous Pincers / Manipulator Spines ── */}
      {classArchetype === "creator" && (
        <g transform={`translate(100, 80) scale(${hScale}) translate(-100, -80)`}>
          {/* Left Pincer Spine — with asymmetric branching */}
          <path
            d={`M 76 86 Q 52 ${54 - asymHeightOffset * 0.4} ${42 - asymmetryIntensity * 4} ${34 - asymHeightOffset * 0.6} Q 60 40 70 56 Q 58 48 50 38 Q 66 58 78 78 Z`}
            fill={fillSecondary}
            stroke={accentStroke}
            strokeWidth="1.2"
          />
          {/* Right Pincer Spine */}
          <path
            d={`M 124 86 Q 148 ${54 + asymHeightOffset * 0.2} ${158 + asymmetryIntensity * 2} ${34 + asymHeightOffset * 0.3} Q 140 40 130 56 Q 142 48 150 38 Q 134 58 122 78 Z`}
            fill={fillSecondary}
            stroke={accentStroke}
            strokeWidth="1.2"
          />
          {/* Extra creative branch at high asymmetry */}
          {asymmetryIntensity > 0.4 && (
            <path
              d={`M ${asymDir > 0 ? 64 : 136} ${52 - asymmetryIntensity * 6} Q ${asymDir > 0 ? 56 : 144} ${44 - asymmetryIntensity * 8} ${asymDir > 0 ? 60 : 140} ${38 - asymmetryIntensity * 6}`}
              fill="none"
              stroke={accentStroke}
              strokeWidth={1 + asymmetryIntensity}
              strokeLinecap="round"
            />
          )}

          {/* Tier 5+ Demiurge Glowing Pincer Tips */}
          {tier >= 5 && !isSilhouette && (
            <g style={{ filter: `drop-shadow(0 0 5px ${palette.accent})` }}>
              <circle cx="40" cy="32" r="3.5" fill={palette.accent} />
              <circle cx="160" cy="32" r="3.5" fill={palette.accent} />
            </g>
          )}

          {/* Tier 7 Mythic Fractal Matrix Spires */}
          {tier >= 7 && (
            <g opacity="0.85">
              <polygon
                points="100,75 88,40 100,52 112,40"
                fill={palette.accent}
                stroke={palette.secondaryBody}
              />
            </g>
          )}
        </g>
      )}

      {/* ── Strategist: Symmetrical Faceted Crystal Crown Horns (Outer Cranial Contour) ── */}
      {classArchetype === "strategist" && (
        <g transform={`translate(100, 80) scale(${hScale}) translate(-100, -80)`}>
          {/* Left Outer Crystal Spire — height affected by asymmetry */}
          <polygon
            points={`76,86 54,${38 - asymHeightOffset * 0.5} 72,70`}
            fill={fillSecondary}
            stroke={accentStroke}
            strokeWidth="1.2"
          />
          <polygon
            points={`84,80 70,${30 - asymHeightOffset * 0.6} 88,72`}
            fill={isSilhouette ? "#020617" : palette.accent}
          />
          {/* Right Outer Crystal Spire */}
          <polygon
            points={`124,86 146,${38 + asymHeightOffset * 0.2} 128,70`}
            fill={fillSecondary}
            stroke={accentStroke}
            strokeWidth="1.2"
          />
          <polygon
            points={`116,80 130,${30 + asymHeightOffset * 0.3} 112,72`}
            fill={isSilhouette ? "#020617" : palette.accent}
          />
          {/* Extra facet at high creativity */}
          {asymmetryIntensity > 0.5 && (
            <polygon
              points={`${asymDir > 0 ? 78 : 122},82 ${asymDir > 0 ? 66 - asymmetryIntensity * 4 : 134 + asymmetryIntensity * 4},${46 - asymmetryIntensity * 8} ${asymDir > 0 ? 82 : 118},74`}
              fill={isSilhouette ? "#020617" : palette.accent}
              opacity="0.7"
            />
          )}

          {/* Tier 4+ Central Crystal Tiara */}
          {tier >= 4 && (
            <polygon
              points="100,72 92,45 100,32 108,45"
              fill={isSilhouette ? "#020617" : palette.accent}
            />
          )}

          {/* Tier 6+ Floating Levitating Crystal Orbs */}
          {tier >= 6 && !isSilhouette && (
            <g style={{ filter: `drop-shadow(0 0 6px ${palette.accent})` }}>
              <polygon points="60,25 55,15 65,15" fill={palette.accent} />
              <polygon points="140,25 135,15 145,15" fill={palette.accent} />
            </g>
          )}
        </g>
      )}

      {/* ── Wanderer: Translucent Ethereal Tufts ── */}
      {classArchetype === "wanderer" && (
        <g
          opacity={isSilhouette ? 1 : 0.8}
          transform={`translate(100, 80) scale(${hScale}) translate(-100, -80)`}
        >
          {/* Left tuft — asymmetry stretches one side */}
          <path
            d={`M 78 86 C ${52 - asymmetryIntensity * 6} ${56 - asymHeightOffset * 0.3}, ${32 - asymmetryIntensity * 4} 62, 40 76 C 58 84, 70 88, 78 92 Z`}
            fill={fillMembrane}
          />
          {/* Right tuft */}
          <path
            d={`M 122 86 C ${148 + asymmetryIntensity * 3} ${56 + asymHeightOffset * 0.15}, ${168 + asymmetryIntensity * 2} 62, 160 76 C 142 84, 130 88, 122 92 Z`}
            fill={fillMembrane}
          />
          {/* Extra wisp at high creativity */}
          {asymmetryIntensity > 0.5 && (
            <path
              d={`M ${asymDir > 0 ? 72 : 128} 84 C ${asymDir > 0 ? 58 - asymmetryIntensity * 8 : 142 + asymmetryIntensity * 8} ${52 - asymmetryIntensity * 10}, ${asymDir > 0 ? 48 : 152} ${66 - asymmetryIntensity * 4}, ${asymDir > 0 ? 54 : 146} 80`}
              fill={fillMembrane}
              opacity={0.5 + asymmetryIntensity * 0.3}
            />
          )}

          {/* Tier 4+ Long Draped Streamers */}
          {tier >= 4 && (
            <g opacity="0.85">
              <path
                d="M 76 90 C 45 110, 30 140, 38 165 C 50 145, 65 120, 78 95 Z"
                fill={fillMembrane}
              />
              <path
                d="M 124 90 C 155 110, 170 140, 162 165 C 150 145, 135 120, 122 95 Z"
                fill={fillMembrane}
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
}
