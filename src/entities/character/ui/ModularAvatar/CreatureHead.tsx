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

  return (
    <g
      className="creature-head"
      transform={`translate(100, ${yHeadCenter}) scale(${headScale}) translate(-100, -95)`}
    >
      {/* Ears & Horns Layer behind head base */}
      <CreatureEarsHorns params={params} isSilhouette={isSilhouette} />

      {/* Default Biological Cranium for other classes */}
      <path
        d="M 72 98 C 64 72, 136 72, 128 98 C 134 114, 118 122, 100 122 C 82 122, 66 114, 72 98 Z"
        fill={isSilhouette ? "#020617" : "url(#creature-body-grad)"}
        stroke={isSilhouette ? "none" : palette.secondaryBody}
        strokeWidth="1.2"
      />
    </g>
  );
}
