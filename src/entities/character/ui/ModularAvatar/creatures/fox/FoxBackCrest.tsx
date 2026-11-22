import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxBackCrest — Low-Poly Fox Spine Ridge Spikes (Creativity attribute & high tiers).
 */
export function FoxBackCrest({
  params,
  isSilhouette = false,
  poseMode = "bipedal",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
}) {
  if (poseMode !== "bipedal") return null;
  const { palette, evolution, creativity, body } = params;
  const { tier } = evolution;
  const { asymmetryIntensity } = creativity;

  if (tier < 3 && asymmetryIntensity < 0.4) return null;

  const yTopMap: Record<string, number> = {
    larval: 128,
    juvenile: 119,
    adult: 110,
    apex: 102,
  };
  const yTop = yTopMap[body.archetypeId] ?? 110;

  const strokeColor = isSilhouette ? "none" : palette.accent;
  const fTorso = (pts: string) => getFacetFill("torso", pts, palette, isSilhouette);

  const ptsL = `100,${yTop - 6} 94,${yTop + 4} 100,${yTop + 8}`;
  const ptsR = `100,${yTop - 6} 106,${yTop + 4} 100,${yTop + 8}`;

  return (
    <g className="fox-back-crest" strokeLinejoin="round">
      <polygon points={ptsL} fill={fTorso(ptsL)} stroke={strokeColor} strokeWidth="1" />
      <polygon points={ptsR} fill={fTorso(ptsR)} stroke={strokeColor} strokeWidth="1" />
    </g>
  );
}
