import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureFace({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, face } = params;
  const { expression, eyebrowAngle, hasFocusRing, focusLevel, mouthVariant } = face;

  return (
    <g className="creature-face">
      {/* Focus / Mythic Ring aura around eyes */}
      {(hasFocusRing || expression === "mythic") && (
        <g opacity={0.4 + focusLevel * 0.4} filter="url(#avatar-glow-filter)">
          <ellipse
            cx="85"
            cy="95"
            rx={9 + focusLevel * 2}
            ry={7 + focusLevel * 1}
            fill="none"
            stroke={expression === "mythic" ? palette.accent : palette.eyeColor}
            strokeWidth={1.0 + focusLevel * 0.6}
            strokeDasharray="2 3"
          />
          <ellipse
            cx="115"
            cy="95"
            rx={9 + focusLevel * 2}
            ry={7 + focusLevel * 1}
            fill="none"
            stroke={expression === "mythic" ? palette.accent : palette.eyeColor}
            strokeWidth={1.0 + focusLevel * 0.6}
            strokeDasharray="2 3"
          />
        </g>
      )}

      {/* Eyebrow / Cranial Ridge Contours — angle driven by expression & focus */}
      <path
        d="M 78 88 Q 85 86 92 90"
        fill="none"
        stroke={palette.secondaryBody}
        strokeWidth={1.8 + focusLevel * 0.6}
        strokeLinecap="round"
        transform={`rotate(${eyebrowAngle} 85 88)`}
      />
      <path
        d="M 108 90 Q 115 86 122 88"
        fill="none"
        stroke={palette.secondaryBody}
        strokeWidth={1.8 + focusLevel * 0.6}
        strokeLinecap="round"
        transform={`rotate(${-eyebrowAngle} 115 88)`}
      />

      {/* ── LOW-POLY GEOMETRIC ALMOND EYES & SNOUT TIP (Literal Points) ── */}
      {/* Left Geometric Eye */}
      <g>
        {/* Diamond Outer Eye Polygon: (82,92) (88,88) (94,92) (88,96) */}
        <polygon
          points="82,92 88,88 94,92 88,96"
          fill={isSilhouette ? "#020617" : "#090306"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.2"
        />
        {/* Inner Faceted Iris */}
        <polygon
          points="85,92 88,90 91,92 88,94"
          fill={isSilhouette ? "#020617" : palette.eyeColor}
        />
        {/* Luminescent Core Pupil Spark */}
        <polygon
          points="87,92 88,91 89,92 88,93"
          fill="#fff7ed"
          filter="url(#avatar-glow-filter)"
        />
      </g>

      {/* Right Geometric Eye */}
      <g>
        {/* Diamond Outer Eye Polygon: (106,92) (112,88) (118,92) (112,96) */}
        <polygon
          points="106,92 112,88 118,92 112,96"
          fill={isSilhouette ? "#020617" : "#090306"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.2"
        />
        {/* Inner Faceted Iris */}
        <polygon
          points="109,92 112,90 115,92 112,94"
          fill={isSilhouette ? "#020617" : palette.eyeColor}
        />
        {/* Luminescent Core Pupil Spark */}
        <polygon
          points="111,92 112,91 113,92 112,93"
          fill="#fff7ed"
          filter="url(#avatar-glow-filter)"
        />
      </g>

      {/* Geometric Nose Facet Tip: (97,106) (103,106) (100,110) */}
      <polygon
        points="97,106 103,106 100,110"
        fill={isSilhouette ? "#020617" : palette.accent}
        stroke={isSilhouette ? "none" : palette.secondaryBody}
        strokeWidth="1"
      />

      {/* ── MOUTH & JAW EXPRESSIONS ── */}
      <g className="creature-mouth">
        {mouthVariant === "tucked" && (
          /* Scared/Hatchling: small nervous tucked mouth */
          <path
            d="M 96 109 Q 100 107 104 109"
            fill="none"
            stroke={palette.secondaryBody}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}

        {mouthVariant === "neutral" && (
          /* Neutral mouth line */
          <path
            d="M 95 108 Q 100 109 105 108"
            fill="none"
            stroke={palette.secondaryBody}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )}

        {mouthVariant === "snarl" && (
          /* Awakened fighter snarl with tooth tip */
          <g>
            <path
              d="M 94 108 Q 100 104 106 108"
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <polygon points="97,106 98.5,109 100,106" fill={palette.secondaryBody} />
          </g>
        )}

        {mouthVariant === "fangs" && (
          /* Warrior L20 Berserk: Bared Fangs & Snarl */
          <g>
            {/* Open snarling mouth cavity */}
            <path
              d="M 92 107 C 96 102, 104 102, 108 107 C 105 111, 95 111, 92 107 Z"
              fill="#4c0519"
              stroke={palette.secondaryBody}
              strokeWidth="1.5"
            />
            {/* Left Upper Fang */}
            <polygon points="94,105 96,110 97.5,105" fill="#ffffff" />
            {/* Right Upper Fang */}
            <polygon points="102.5,105 104,110 106,105" fill="#ffffff" />
            {/* Lower Jaw crease line */}
            <path
              d="M 94 112 Q 100 114 106 112"
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1"
            />
          </g>
        )}

        {mouthVariant === "calm" && (
          /* Sovereign/Demiurge/Oracle: serene confident line */
          <path
            d="M 94 107 Q 100 110 106 107"
            fill="none"
            stroke={palette.secondaryBody}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}

        {mouthVariant === "radiant" && (
          /* Mythic: Glowing energy seam */
          <path
            d="M 93 107 Q 100 110 107 107"
            fill="none"
            stroke={palette.accent}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${palette.accent})` }}
          />
        )}
      </g>
    </g>
  );
}
