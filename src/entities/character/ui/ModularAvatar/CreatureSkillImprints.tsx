import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureSkillImprints({ params }: { params: AvatarParams }) {
  const { skillImprints, palette } = params;

  if (skillImprints.length === 0) return null;

  return (
    <g className="creature-skill-imprints" filter="url(#avatar-glow-filter)">
      {skillImprints.map((imprint, idx) => {
        const glowColor = imprint.color || palette.accent;

        if (imprint.type === "pulse-band") {
          return (
            <g key={imprint.id}>
              {/* Paw Pulse Bands */}
              <ellipse
                cx="76"
                cy="162"
                rx="10"
                ry="3"
                fill="none"
                stroke={glowColor}
                strokeWidth="2"
              />
              <ellipse
                cx="124"
                cy="162"
                rx="10"
                ry="3"
                fill="none"
                stroke={glowColor}
                strokeWidth="2"
              />
            </g>
          );
        }

        if (imprint.type === "crystal") {
          return (
            <g key={imprint.id}>
              {/* Chest Crystal Core */}
              <polygon
                points="100,135 94,143 100,150 106,143"
                fill={glowColor}
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          );
        }

        if (imprint.type === "halo") {
          return (
            <g key={imprint.id}>
              {/* Head Resonance Halo */}
              <ellipse
                cx="100"
                cy="72"
                rx="28"
                ry="8"
                fill="none"
                stroke={glowColor}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
            </g>
          );
        }

        if (imprint.type === "rune") {
          return (
            <g key={imprint.id} transform={`translate(${idx === 0 ? 0 : 8}, 0)`}>
              {/* Body Rune Imprint */}
              <circle cx="100" cy="148" r="4" fill="none" stroke={glowColor} strokeWidth="1.5" />
              <polygon points="100,145 97,150 103,150" fill={glowColor} />
            </g>
          );
        }

        return null;
      })}
    </g>
  );
}
