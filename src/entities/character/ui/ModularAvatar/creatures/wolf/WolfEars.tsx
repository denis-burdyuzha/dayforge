import type { AvatarParams } from "../../../../model/avatarTypes";

export function WolfEars({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, posture, body } = params;
  const alertness = posture.earAlertness ?? 0.7;
  const hScale = body.headScale ?? 1.0;

  // Wolf ears are shorter and wider than fox ears — more triangular but less pointed
  // Ears sit at base: L=(83,76), (93,76) | R=(107,76), (117,76)
  // Tip Y: at alertness=1.0 → tip Y=52 (erect), at alertness=0.2 → Y=65 (pressed down in combat)
  // Wolf combat ears: slightly pressed/angled outward
  const tipY = 76 - 24 * alertness * hScale;
  const leftTipX = 82 - 5 * (1 - alertness); // slightly lateral when pressed
  const rightTipX = 118 + 5 * (1 - alertness);
  const ridgeY = 76 - 14 * alertness * hScale;

  return (
    <g className="wolf-ears" strokeLinejoin="round">
      {/* Left Wolf Ear — Short, wide, slightly angled outward */}
      <g className="wolf-left-ear">
        {/* Outer dark flap */}
        <polygon
          points={`83,76 ${leftTipX},${tipY} 90,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(36, 13, 22, 0.70)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
        {/* Inner ear — subtle warm tone */}
        <polygon
          points={`93,76 ${leftTipX},${tipY} 90,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(255, 107, 0, 0.15)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
        {/* Base connector */}
        <polygon
          points={`83,76 93,76 90,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(66, 24, 40, 0.45)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
      </g>

      {/* Right Wolf Ear */}
      <g className="wolf-right-ear">
        <polygon
          points={`117,76 ${rightTipX},${tipY} 110,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(36, 13, 22, 0.70)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
        <polygon
          points={`107,76 ${rightTipX},${tipY} 110,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(255, 107, 0, 0.15)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
        <polygon
          points={`107,76 117,76 110,${ridgeY}`}
          fill={isSilhouette ? "#020617" : "rgba(66, 24, 40, 0.45)"}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.3"
        />
      </g>
    </g>
  );
}
