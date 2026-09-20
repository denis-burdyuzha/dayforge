import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureFace({ params }: { params: AvatarParams }) {
  const { palette, face } = params;
  const { expression, eyebrowAngle, hasFocusRing, focusLevel, mouthVariant } = face;

  // ── EXPRESSION → Eye Physiology & Dimensions ──
  let baseEyeRx = 5.5;
  let baseEyeRy = 3.8;

  if (expression === "scared") {
    baseEyeRx = 6.8; // Wide open frightened eyes
    baseEyeRy = 5.8;
  } else if (expression === "cautious") {
    baseEyeRx = 6.0;
    baseEyeRy = 4.2;
  } else if (expression === "edgy") {
    baseEyeRx = 5.2;
    baseEyeRy = 3.2; // Sullen narrowed eyes
  } else if (expression === "berserk") {
    baseEyeRx = 5.8;
    baseEyeRy = 3.5;
  } else if (expression === "sovereign" || expression === "mythic") {
    baseEyeRx = 6.2;
    baseEyeRy = 3.6; // Serene wide almond eyes
  }

  // Focus → Eyelid squint
  const eyeRx = baseEyeRx;
  const eyeRy = baseEyeRy * (1 - focusLevel * 0.25);

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

      {/* Left Eye */}
      <g>
        {/* Eye Sclera Base */}
        <ellipse cx="85" cy="95" rx={eyeRx} ry={eyeRy} fill="#090306" />
        {/* Warm Muted Iris */}
        <ellipse cx="85" cy="95" rx={eyeRx * 0.75} ry={eyeRy * 0.78} fill="#38121f" />
        {/* Single Luminescent Ember Pupil Spark */}
        <circle cx="85" cy="95.5" r={2.2} fill={palette.accent} filter="url(#avatar-glow-filter)" />
        <circle cx="85" cy="95.5" r={1.0} fill="#fff7ed" />
        {/* Upper Heavy Eyelid Cover (Calm, Dignified, Composed Gaze) */}
        <path
          d={`M ${85 - eyeRx - 1} 95 C 80 91, 90 91, ${85 + eyeRx + 1} 95 C 91 93, 79 93, ${85 - eyeRx - 1} 95 Z`}
          fill={palette.primaryBody}
        />
        <path
          d={`M ${85 - eyeRx} 95 C 80 91, 90 91, ${85 + eyeRx} 95`}
          fill="none"
          stroke={palette.secondaryBody}
          strokeWidth="1.2"
        />
        <circle cx="83" cy="94" r="0.9" fill="#ffffff" opacity="0.85" />
      </g>

      {/* Right Eye */}
      <g>
        {/* Eye Sclera Base */}
        <ellipse cx="115" cy="95" rx={eyeRx} ry={eyeRy} fill="#090306" />
        {/* Warm Muted Iris */}
        <ellipse cx="115" cy="95" rx={eyeRx * 0.75} ry={eyeRy * 0.78} fill="#38121f" />
        {/* Single Luminescent Ember Pupil Spark */}
        <circle
          cx="115"
          cy="95.5"
          r={2.2}
          fill={palette.accent}
          filter="url(#avatar-glow-filter)"
        />
        <circle cx="115" cy="95.5" r={1.0} fill="#fff7ed" />
        {/* Upper Heavy Eyelid Cover (Calm, Dignified, Composed Gaze) */}
        <path
          d={`M ${115 - eyeRx - 1} 95 C 110 91, 120 91, ${115 + eyeRx + 1} 95 C 121 93, 109 93, ${115 - eyeRx - 1} 95 Z`}
          fill={palette.primaryBody}
        />
        <path
          d={`M ${115 - eyeRx} 95 C 110 91, 120 91, ${115 + eyeRx} 95`}
          fill="none"
          stroke={palette.secondaryBody}
          strokeWidth="1.2"
        />
        <circle cx="113" cy="94" r="0.9" fill="#ffffff" opacity="0.85" />
      </g>

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
