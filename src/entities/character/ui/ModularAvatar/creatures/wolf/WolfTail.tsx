import type { AvatarParams } from "../../../../model/avatarTypes";

export function WolfTail({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette } = params;

  const strokeColor = isSilhouette ? "none" : palette.accent;
  const fillBase = isSilhouette ? "#020617" : palette.secondaryBody;
  const fillMid = isSilhouette ? "#020617" : palette.primaryBody;
  const fillPlume = isSilhouette ? "#020617" : palette.bellyTone;
  const fillTip = isSilhouette ? "#020617" : palette.accent;

  return (
    <g className="wolf-tail" strokeLinejoin="round">
      <polygon
        points="112,152 142,145 134,158"
        fill={fillMid}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <polygon
        points="112,152 134,158 112,160"
        fill={fillBase}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <polygon
        points="112,152 165,142 142,145"
        fill={fillPlume}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <polygon
        points="165,142 172,150 154,158"
        fill={fillTip}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <polygon
        points="142,145 154,158 134,158"
        fill={fillMid}
        stroke={strokeColor}
        strokeWidth="1.2"
      />
    </g>
  );
}
