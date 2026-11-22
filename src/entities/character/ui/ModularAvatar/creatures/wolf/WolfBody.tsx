import type { AvatarParams } from "../../../../model/avatarTypes";

export function WolfBody({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, body, endurance } = params;
  const { bellyConvexity, bulk, chestAngularity } = body;
  const chestDepth = endurance?.chestDepth ?? 0;
  const hideThickness = endurance?.hideThickness ?? 0;

  const fillPrimary = isSilhouette ? "#020617" : palette.primaryBody;
  const fillSecondary = isSilhouette ? "#020617" : palette.secondaryBody;
  const fillBelly = isSilhouette ? "#020617" : palette.bellyTone;
  const strokeColor = isSilhouette ? "none" : palette.accent;
  const wireStrokeWidth = isSilhouette ? 0 : 1.2 + hideThickness * 0.6;

  // Warrior wolf has broader shoulders (40..48px)
  const baseSwell = bellyConvexity * 8 + bulk * 6 + chestDepth * 4;
  const shoulderX = 78 - bulk * 4;
  const shoulderXR = 122 + bulk * 4;
  const bellyX = 82 - baseSwell;
  const bellyXR = 118 + baseSwell;

  const showArmorPlate = chestAngularity > 0.4 && !isSilhouette;

  return (
    <g className="wolf-body">
      <g className="lowpoly-wolf-torso-mesh" strokeLinejoin="round">
        {/* Upper Neck Collar */}
        <polygon
          points={`${shoulderX},110 100,110 100,122`}
          fill={fillBelly}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
        <polygon
          points={`${shoulderXR},110 100,110 100,122`}
          fill={fillBelly}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />

        {/* Upper Chest Slopes */}
        <polygon
          points={`${shoulderX},110 ${bellyX},135 100,122`}
          fill={fillPrimary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
        <polygon
          points={`${shoulderXR},110 ${bellyXR},135 100,122`}
          fill={fillPrimary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />

        {/* Mid Belly Core */}
        <polygon
          points={`${bellyX},135 100,135 100,122`}
          fill={fillBelly}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
        <polygon
          points={`${bellyXR},135 100,135 100,122`}
          fill={fillBelly}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />

        {/* Lower Flanks */}
        <polygon
          points={`${bellyX},135 85,148 100,135`}
          fill={fillSecondary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
        <polygon
          points={`${bellyXR},135 115,148 100,135`}
          fill={fillSecondary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />

        {/* Pelvis Base */}
        <polygon
          points="85,148 88,160 100,160"
          fill={fillSecondary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
        <polygon
          points="115,148 112,160 100,160"
          fill={fillSecondary}
          stroke={strokeColor}
          strokeWidth={wireStrokeWidth}
        />
      </g>

      {/* Chest Armor Plate */}
      {showArmorPlate && (
        <g className="wolf-chest-armor" opacity="0.85">
          <polygon
            points="100,114 88,124 100,132 112,124"
            fill={palette.accent}
            stroke={palette.accent}
            strokeWidth="0.8"
          />
        </g>
      )}
    </g>
  );
}
