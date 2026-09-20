import type { AvatarParams } from "../../model/avatarTypes";
import { CreatureEarsHorns } from "./CreatureEarsHorns";

export function CreatureHead({
  params,
  isSilhouette = false,
  yTorsoTop,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  yTorsoTop?: number;
}) {
  const { palette, body } = params;
  const headScale = body.headScale ?? 1.0;
  const yHeadCenter = yTorsoTop !== undefined ? yTorsoTop - 20 : 95;

  const fillPrimary = isSilhouette ? "#020617" : "url(#creature-body-grad)";
  const fillSecondary = isSilhouette ? "#020617" : palette.secondaryBody;
  const strokeBorder = isSilhouette ? "none" : palette.secondaryBody;

  return (
    <g
      className="creature-head"
      transform={`translate(100, ${yHeadCenter}) scale(${headScale}) translate(-100, -95)`}
    >
      {/* Ears & Horns Layer behind head base */}
      <CreatureEarsHorns params={params} isSilhouette={isSilhouette} />

      {/* Main Biological Head Structure (Sleek Cranium & Cheekbones) */}
      <path
        d="M 72 98 
           C 64 72, 136 72, 128 98 
           C 134 114, 118 122, 100 122 
           C 82 122, 66 114, 72 98 Z"
        fill={fillPrimary}
        stroke={strokeBorder}
        strokeWidth="1"
      />

      {/* Cheekbone Contours & Jawline Shading */}
      {!isSilhouette && (
        <>
          <path
            d="M 76 102 C 84 112, 116 112, 124 102 C 114 118, 86 118, 76 102 Z"
            fill={fillSecondary}
            opacity="0.6"
          />

          {/* Rim-Light Edge Highlight on Upper Cranium */}
          <path
            d="M 73 95 C 66 73, 134 73, 127 95"
            fill="none"
            stroke="url(#creature-rim-light-grad)"
            strokeWidth="1.2"
            filter="url(#avatar-rim-glow)"
          />

          {/* Organic Snout / Nostril Region */}
          <path
            d="M 97 108 C 99 110, 101 110, 103 108"
            fill="none"
            stroke={palette.secondaryBody}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}
