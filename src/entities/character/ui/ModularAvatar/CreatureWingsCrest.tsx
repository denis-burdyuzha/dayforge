import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureWingsCrest({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, evolution } = params;
  const { classArchetype, tier } = evolution;

  if (tier < 2) return null;

  const fillSecondary = isSilhouette ? "#020617" : palette.secondaryBody;
  const fillMembrane = isSilhouette ? "#020617" : "url(#creature-membrane-grad)";
  const strokeAccent = isSilhouette ? "none" : palette.accent;

  return (
    <g className="creature-wings-crest">
      {classArchetype === "explorer" && (
        <g opacity={tier >= 4 ? 0.95 : 0.75}>
          {/* Left Wing Membrane */}
          <path
            d="M 74 124 C 36 96, 18 116, 28 142 C 48 136, 64 132, 74 136 Z"
            fill={fillMembrane}
            stroke={strokeAccent}
            strokeWidth="0.8"
          />
          {/* Right Wing Membrane */}
          <path
            d="M 126 124 C 164 96, 182 116, 172 142 C 152 136, 136 132, 126 136 Z"
            fill={fillMembrane}
            stroke={strokeAccent}
            strokeWidth="0.8"
          />
          {tier >= 4 && !isSilhouette && (
            <>
              <path d="M 74 124 L 28 142" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
              <path d="M 126 124 L 172 142" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            </>
          )}
        </g>
      )}

      {classArchetype === "warrior" && (
        <g>
          {/* Dorsal Carapace Plates & Spikes */}
          <path
            d="M 100 102 L 94 92 L 106 92 Z"
            fill={fillSecondary}
            stroke={strokeAccent}
            strokeWidth="1"
          />
          <path
            d="M 100 118 L 90 100 L 110 100 Z"
            fill={fillSecondary}
            stroke={strokeAccent}
            strokeWidth="1"
          />
          {tier >= 4 && (
            <path
              d="M 100 136 L 88 114 L 112 114 Z"
              fill={isSilhouette ? "#020617" : palette.accent}
            />
          )}
        </g>
      )}

      {classArchetype === "creator" && tier >= 3 && !isSilhouette && (
        <g filter="url(#avatar-glow-filter)">
          <circle cx="64" cy="98" r="3.5" fill={palette.accent} />
          <circle cx="136" cy="98" r="3.5" fill={palette.accent} />
          <path
            d="M 64 98 Q 100 84 136 98"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.7"
          />
        </g>
      )}

      {classArchetype === "strategist" && tier >= 3 && (
        <g>
          <polygon
            points="100,74 88,86 100,84 112,86"
            fill={isSilhouette ? "#020617" : palette.accent}
          />
          <line
            x1="100"
            y1="74"
            x2="100"
            y2="64"
            stroke={isSilhouette ? "#020617" : palette.accent}
            strokeWidth="2"
          />
        </g>
      )}

      {classArchetype === "wanderer" && (
        <g opacity={isSilhouette ? 1 : 0.5}>
          <path
            d="M 58 118 Q 100 98 142 118 Q 152 158 142 188 Q 100 172 58 188 Z"
            fill={fillMembrane}
          />
        </g>
      )}
    </g>
  );
}
