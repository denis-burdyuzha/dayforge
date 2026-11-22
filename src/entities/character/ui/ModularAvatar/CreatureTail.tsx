import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureTail({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, evolution, posture, skillImprints } = params;
  const { classArchetype, tier } = evolution;
  const { tailStance } = posture;

  const fillSecondary = isSilhouette ? "#020617" : palette.secondaryBody;
  const strokeAccent = isSilhouette ? "none" : palette.accent;

  const hasTailOrbSkill = skillImprints.some((im) => im.location === "tail");

  // Tail stance rotation offset
  let tailRotation = 0;
  if (tailStance === "tucked") tailRotation = 42;
  else if (tailStance === "low") tailRotation = 20;
  else if (tailStance === "raised") tailRotation = -18;
  else if (tailStance === "flowing") tailRotation = -10;

  return (
    <g className="creature-tail" transform={`rotate(${tailRotation} 120 172)`}>
      {classArchetype === "warrior" && (
        <g>
          {/* Dense Armored Carapace Tail */}
          <path
            d="M 122 172 C 152 165, 172 182, 178 194 C 168 204, 142 198, 128 184 Z"
            fill={fillSecondary}
            stroke={strokeAccent}
            strokeWidth="1.2"
          />
          {tier >= 3 && !isSilhouette && (
            <polygon points="165,182 178,172 174,188" fill={palette.accent} />
          )}
        </g>
      )}

      {classArchetype === "creator" && (
        <g>
          {/* Articulated Tendril Tail */}
          <path
            d="M 120 172 C 158 158, 174 132, 154 112 C 144 102, 134 118, 146 128"
            fill="none"
            stroke={isSilhouette ? "#020617" : palette.primaryBody}
            strokeWidth={4 + tier * 0.5}
            strokeLinecap="round"
          />
          {!isSilhouette && (
            <circle
              cx="146"
              cy="128"
              r={4.5 + tier}
              fill={palette.accent}
              filter="url(#avatar-glow-filter)"
            />
          )}
        </g>
      )}

      {classArchetype === "strategist" && (
        <g>
          {/* Segmented Tail */}
          <path
            d="M 120 174 L 142 168 L 158 152 L 172 154"
            fill="none"
            stroke={isSilhouette ? "#020617" : palette.primaryBody}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon
            points="172,149 180,154 172,159 164,154"
            fill={isSilhouette ? "#020617" : palette.accent}
          />
        </g>
      )}

      {classArchetype === "wanderer" && (
        <g opacity={isSilhouette ? 1 : 0.65}>
          {/* Flowing Ethereal Tail */}
          <path
            d="M 120 174 C 160 168, 178 142, 172 126 C 152 148, 132 168, 120 180 Z"
            fill={isSilhouette ? "#020617" : "url(#creature-membrane-grad)"}
          />
        </g>
      )}

      {/* Skill Imprint Orb at tail tip */}
      {hasTailOrbSkill && !isSilhouette && (
        <circle
          cx="172"
          cy="142"
          r="5.5"
          fill="#ffffff"
          stroke={palette.accent}
          strokeWidth="2"
          filter="url(#avatar-glow-filter)"
        />
      )}
    </g>
  );
}
