import type { BodyArchetypeConfig } from "../../model/avatarEngine";
import type { AvatarParams } from "../../model/avatarTypes";

interface CreatureLimbsProps {
  params: AvatarParams;
  isSilhouette?: boolean;
  yTorsoTop: number;
  yTorsoBottom: number;
  shoulderWidth: number;
  chestWidth: number;
  archetype: BodyArchetypeConfig;
}

export function CreatureLimbs({
  params,
  isSilhouette = false,
  yTorsoTop,
  yTorsoBottom,
  shoulderWidth,
  chestWidth,
  archetype,
}: CreatureLimbsProps) {
  const { palette, body, posture } = params;
  const { bulk } = body;
  const { limbAngles } = posture;

  const forelimbFill = isSilhouette ? "#020617" : "url(#creature-forelimb-3d-grad)";
  const hindlimbFill = isSilhouette ? "#020617" : "url(#creature-hindlimb-3d-grad)";
  const darkDetailFill = isSilhouette ? "#020617" : palette.secondaryBody;

  // Muscle Relief Factors from Strength (bulk)
  const deltoidBulge = bulk * 5.5;
  const quadBulge = bulk * 4.5;
  const tendonNode = bulk * 3.5;

  const forelimbLen = archetype.forelimbLen;
  const hindlimbLen = archetype.hindlimbLen;

  // ENFORCE MINIMUM SHOULDER WIDTH (>= 16px) to prevent Larval anchors from collapsing
  const effectiveShoulderWidth = Math.max(16, shoulderWidth);

  // Anchor Coordinates
  const armLeftAnchorX = 100 - effectiveShoulderWidth + 2;
  const armRightAnchorX = 100 + effectiveShoulderWidth - 2;
  const armAnchorY = yTorsoTop + 10;

  const legLeftAnchorX = 100 - chestWidth * 0.65;
  const legRightAnchorX = 100 + chestWidth * 0.65;
  const legAnchorY = yTorsoBottom - 12;

  // ── 2-SEGMENT ARTICULATION FORMULA ──
  const foreL1 = forelimbLen * 0.55;
  const foreL2 = forelimbLen * 0.45;

  const hindL1 = hindlimbLen * 0.55;
  const hindL2 = hindlimbLen * 0.45;

  const {
    armLeftUpper,
    armLeftBend,
    armRightUpper,
    armRightBend,
    legLeftUpper,
    legLeftBend,
    legRightUpper,
    legRightBend,
  } = limbAngles;

  return (
    <g className="creature-limbs-rig">
      <defs>
        {/* 3D Cylindrical Light Gradient for Forelimbs */}
        <linearGradient id="creature-forelimb-3d-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.primaryBody} stopOpacity="1" />
          <stop offset="25%" stopColor={palette.bellyTone} stopOpacity="1" />
          <stop offset="70%" stopColor={palette.primaryBody} stopOpacity="1" />
          <stop offset="100%" stopColor={palette.secondaryBody} stopOpacity="1" />
        </linearGradient>

        {/* 3D Cylindrical Light Gradient for Hindlimbs */}
        <linearGradient id="creature-hindlimb-3d-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.secondaryBody} stopOpacity="1" />
          <stop offset="35%" stopColor={palette.primaryBody} stopOpacity="1" />
          <stop offset="100%" stopColor={palette.secondaryBody} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* ── 1. HIND LIMBS (Behind Body Column) ── */}
      <g className="creature-hind-limbs" strokeLinejoin="round">
        {/* Left Hind Limb */}
        <g transform={`translate(${legLeftAnchorX}, ${legAnchorY}) rotate(${legLeftUpper})`}>
          <g>
            <path
              d={`M 4 0 C ${-10 - quadBulge} ${hindL1 * 0.4}, ${-8 - quadBulge * 0.7} ${hindL1 * 0.8}, -3 ${hindL1} C 3 ${hindL1}, 6 ${hindL1 * 0.5}, -2 0 Z`}
              fill={hindlimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <ellipse
              cx="-1.5"
              cy={hindL1}
              rx={5 + bulk * 0.8}
              ry={4.5 + bulk * 0.6}
              fill={hindlimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <g transform={`translate(-1.5, ${hindL1}) rotate(${legLeftBend})`}>
              <path
                d={`M 3 0 C ${-7 - tendonNode * 0.5} ${hindL2 * 0.4}, ${-5 - tendonNode * 0.3} ${hindL2 * 0.85}, -3 ${hindL2} C 3 ${hindL2}, 4 ${hindL2 * 0.5}, -2 0 Z`}
                fill={hindlimbFill}
                stroke={isSilhouette ? "none" : palette.secondaryBody}
                strokeWidth="0.8"
              />
              <ellipse cx={-3} cy={hindL2} rx={7 + bulk * 2} ry="4.5" fill={darkDetailFill} />
            </g>
          </g>
        </g>

        {/* Right Hind Limb */}
        <g transform={`translate(${legRightAnchorX}, ${legAnchorY}) rotate(${legRightUpper})`}>
          <g>
            <path
              d={`M -4 0 C ${10 + quadBulge} ${hindL1 * 0.4}, ${8 + quadBulge * 0.7} ${hindL1 * 0.8}, 3 ${hindL1} C -3 ${hindL1}, -6 ${hindL1 * 0.5}, 2 0 Z`}
              fill={hindlimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <ellipse
              cx="1.5"
              cy={hindL1}
              rx={5 + bulk * 0.8}
              ry={4.5 + bulk * 0.6}
              fill={hindlimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <g transform={`translate(1.5, ${hindL1}) rotate(${legRightBend})`}>
              <path
                d={`M -3 0 C ${7 + tendonNode * 0.5} ${hindL2 * 0.4}, ${5 + tendonNode * 0.3} ${hindL2 * 0.85}, 3 ${hindL2} C -3 ${hindL2}, -4 ${hindL2 * 0.5}, 2 0 Z`}
                fill={hindlimbFill}
                stroke={isSilhouette ? "none" : palette.secondaryBody}
                strokeWidth="0.8"
              />
              <ellipse cx={3} cy={hindL2} rx={7 + bulk * 2} ry="4.5" fill={darkDetailFill} />
            </g>
          </g>
        </g>
      </g>

      {/* ── 2. FORELIMBS (In Front of Body Column) ── */}
      <g className="creature-forelimbs" strokeLinejoin="round">
        {/* Left Forelimb */}
        <g transform={`translate(${armLeftAnchorX}, ${armAnchorY}) rotate(${armLeftUpper})`}>
          <g>
            <path
              d={`M 4 0 C ${-10 - deltoidBulge * 0.8} ${foreL1 * 0.35}, ${-7 - deltoidBulge * 0.4} ${foreL1 * 0.75}, -2 ${foreL1} C 4 ${foreL1 - 1}, 5 ${foreL1 * 0.4}, -2 0 Z`}
              fill={forelimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <ellipse cx="-1" cy={foreL1} rx={4.5} ry={4} fill={forelimbFill} />
            <g transform={`translate(-1, ${foreL1}) rotate(${armLeftBend})`}>
              <path
                d={`M 3 0 C ${-7 - deltoidBulge * 0.3} ${foreL2 * 0.35}, -5 ${foreL2 * 0.75}, 0 ${foreL2} C 4 ${foreL2 - 2}, 4 ${foreL2 * 0.4}, -2 0 Z`}
                fill={forelimbFill}
                stroke={isSilhouette ? "none" : palette.secondaryBody}
                strokeWidth="0.8"
              />
              <ellipse cx="0" cy={foreL2} rx="5.5" ry="4" fill={darkDetailFill} />
            </g>
          </g>
        </g>

        {/* Right Forelimb */}
        <g transform={`translate(${armRightAnchorX}, ${armAnchorY}) rotate(${armRightUpper})`}>
          <g>
            <path
              d={`M -4 0 C ${10 + deltoidBulge * 0.8} ${foreL1 * 0.35}, ${7 + deltoidBulge * 0.4} ${foreL1 * 0.75}, 2 ${foreL1} C -4 ${foreL1 - 1}, -5 ${foreL1 * 0.4}, 2 0 Z`}
              fill={forelimbFill}
              stroke={isSilhouette ? "none" : palette.secondaryBody}
              strokeWidth="0.8"
            />
            <ellipse cx="1" cy={foreL1} rx={4.5} ry={4} fill={forelimbFill} />
            <g transform={`translate(1, ${foreL1}) rotate(${armRightBend})`}>
              <path
                d={`M -3 0 C ${7 + deltoidBulge * 0.3} ${foreL2 * 0.35}, 5 ${foreL2 * 0.75}, 0 ${foreL2} C -4 ${foreL2 - 2}, -4 ${foreL2 * 0.4}, 2 0 Z`}
                fill={forelimbFill}
                stroke={isSilhouette ? "none" : palette.secondaryBody}
                strokeWidth="0.8"
              />
              <ellipse cx="0" cy={foreL2} rx="5.5" ry="4" fill={darkDetailFill} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}
