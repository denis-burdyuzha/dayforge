import type { AvatarParams } from "../../../../model/avatarTypes";

export function WolfLimbs({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, posture } = params;
  const { limbAngles } = posture;

  const archetypeLimbScale: Record<string, number> = {
    larval: 0.65,
    juvenile: 0.85,
    adult: 1.0,
    apex: 1.15,
  };
  const limbScale = archetypeLimbScale[params.body.archetypeId] ?? 1.0;

  const foreL1 = 26 * limbScale;
  const foreL2 = 22 * limbScale;
  const hindL1 = 28 * limbScale;
  const hindL2 = 24 * limbScale;

  const armLeftAnchorX = 84;
  const armRightAnchorX = 116;
  const armAnchorY = 120;
  const legLeftAnchorX = 87;
  const legRightAnchorX = 113;
  const legAnchorY = 150;

  const {
    armLeftUpper = -35,
    armLeftBend = 45,
    armRightUpper = 35,
    armRightBend = -45,
    legLeftUpper = 18,
    legLeftBend = 22,
    legRightUpper = -18,
    legRightBend = -22,
  } = limbAngles;

  const strokeColor = isSilhouette ? "none" : palette.accent;
  const fillLight = isSilhouette ? "#020617" : palette.primaryBody;
  const fillDark = isSilhouette ? "#020617" : palette.secondaryBody;
  const fillJoint = isSilhouette ? "#020617" : palette.accent;
  const fillPaw = isSilhouette ? "#020617" : palette.accent;

  return (
    <g className="wolf-limbs-rig" strokeLinejoin="round">
      {/* Hind Limbs */}
      <g className="wolf-hind-limbs">
        <g transform={`translate(${legLeftAnchorX}, ${legAnchorY}) rotate(${legLeftUpper})`}>
          <polygon
            points={`0,0 -8,${hindL1 * 0.4} 0,${hindL1}`}
            fill={fillLight}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,0 8,${hindL1 * 0.4} 0,${hindL1}`}
            fill={fillDark}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,${hindL1 - 3} -4,${hindL1} 0,${hindL1 + 3} 4,${hindL1}`}
            fill={fillJoint}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <g transform={`translate(0, ${hindL1}) rotate(${legLeftBend})`}>
            <polygon
              points={`0,0 -6,${hindL2 * 0.5} 0,${hindL2}`}
              fill={fillLight}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`0,0 6,${hindL2 * 0.5} 0,${hindL2}`}
              fill={fillDark}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`-5,${hindL2} 0,${hindL2 + 5} 5,${hindL2}`}
              fill={fillPaw}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        </g>
        <g transform={`translate(${legRightAnchorX}, ${legAnchorY}) rotate(${legRightUpper})`}>
          <polygon
            points={`0,0 -8,${hindL1 * 0.4} 0,${hindL1}`}
            fill={fillDark}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,0 8,${hindL1 * 0.4} 0,${hindL1}`}
            fill={fillLight}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,${hindL1 - 3} -4,${hindL1} 0,${hindL1 + 3} 4,${hindL1}`}
            fill={fillJoint}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <g transform={`translate(0, ${hindL1}) rotate(${legRightBend})`}>
            <polygon
              points={`0,0 -6,${hindL2 * 0.5} 0,${hindL2}`}
              fill={fillDark}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`0,0 6,${hindL2 * 0.5} 0,${hindL2}`}
              fill={fillLight}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`-5,${hindL2} 0,${hindL2 + 5} 5,${hindL2}`}
              fill={fillPaw}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        </g>
      </g>

      {/* Forelimbs */}
      <g className="wolf-forelimbs">
        <g transform={`translate(${armLeftAnchorX}, ${armAnchorY}) rotate(${armLeftUpper})`}>
          <polygon
            points={`0,0 -8,${foreL1 * 0.4} 0,${foreL1}`}
            fill={fillLight}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,0 8,${foreL1 * 0.4} 0,${foreL1}`}
            fill={fillDark}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,${foreL1 - 3} -4,${foreL1} 0,${foreL1 + 3} 4,${foreL1}`}
            fill={fillJoint}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <g transform={`translate(0, ${foreL1}) rotate(${armLeftBend})`}>
            <polygon
              points={`0,0 -6,${foreL2 * 0.5} 0,${foreL2}`}
              fill={palette.bellyTone}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`0,0 6,${foreL2 * 0.5} 0,${foreL2}`}
              fill={fillDark}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`-5,${foreL2} 0,${foreL2 + 5} 5,${foreL2}`}
              fill={fillPaw}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        </g>
        <g transform={`translate(${armRightAnchorX}, ${armAnchorY}) rotate(${armRightUpper})`}>
          <polygon
            points={`0,0 -8,${foreL1 * 0.4} 0,${foreL1}`}
            fill={fillDark}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,0 8,${foreL1 * 0.4} 0,${foreL1}`}
            fill={fillLight}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <polygon
            points={`0,${foreL1 - 3} -4,${foreL1} 0,${foreL1 + 3} 4,${foreL1}`}
            fill={fillJoint}
            stroke={strokeColor}
            strokeWidth="1"
          />
          <g transform={`translate(0, ${foreL1}) rotate(${armRightBend})`}>
            <polygon
              points={`0,0 -6,${foreL2 * 0.5} 0,${foreL2}`}
              fill={fillDark}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`0,0 6,${foreL2 * 0.5} 0,${foreL2}`}
              fill={palette.bellyTone}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <polygon
              points={`-5,${foreL2} 0,${foreL2 + 5} 5,${foreL2}`}
              fill={fillPaw}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        </g>
      </g>
    </g>
  );
}
