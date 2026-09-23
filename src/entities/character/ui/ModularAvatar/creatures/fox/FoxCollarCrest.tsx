import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxCollarCrest — Subtle Low-Poly Fox Collar Ruff (Social attribute).
 *
 * Renders 2 clean low-poly neck ruff facets that widen the neck collar
 * when Social is high (> 0.2), without adding congested overlays.
 */
export function FoxCollarCrest({
  params,
  isSilhouette = false,
  poseMode = "bipedal",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
}) {
  if (poseMode !== "bipedal") return null;
  const { palette, social, body } = params;
  const { crestSize } = social;
  if (crestSize < 0.25) return null;

  const yTopMap: Record<string, number> = {
    larval: 128,
    juvenile: 119,
    adult: 110,
    apex: 102,
  };
  const yTop = yTopMap[body.archetypeId] ?? 110;

  const s = crestSize;
  const strokeColor = isSilhouette ? "none" : palette.accent;
  const fHead = (pts: string) => getFacetFill("head", pts, palette, isSilhouette);

  const leftX = 84 - 8 * s;
  const rightX = 116 + 8 * s;
  const ptsL = `84,${yTop} ${leftX},${yTop + 6} 100,${yTop + 12}`;
  const ptsR = `116,${yTop} ${rightX},${yTop + 6} 100,${yTop + 12}`;

  return (
    <g className="fox-collar-ruff" strokeLinejoin="round">
      <polygon points={ptsL} fill={fHead(ptsL)} stroke={strokeColor} strokeWidth="1" />
      <polygon points={ptsR} fill={fHead(ptsR)} stroke={strokeColor} strokeWidth="1" />
    </g>
  );
}
