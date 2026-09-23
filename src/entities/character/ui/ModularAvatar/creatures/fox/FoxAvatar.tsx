import type { AvatarParams } from "../../../../model/avatarTypes";
import { CreatureAura } from "../../CreatureAura";
import { CreatureMarkings } from "../../CreatureMarkings";
import { CreatureShadow } from "../../CreatureShadow";
import { CreatureSkillImprints } from "../../CreatureSkillImprints";
import styles from "../../ModularAvatar.module.scss";
import { FoxBackCrest } from "./FoxBackCrest";
import { FoxBody } from "./FoxBody";
import { FoxCollarCrest } from "./FoxCollarCrest";
import { FoxFace } from "./FoxFace";
import { FoxHead } from "./FoxHead";
import { FoxLimbs } from "./FoxLimbs";
import { FoxRimLight } from "./FoxRimLight";
import { FoxTail } from "./FoxTail";

export interface FoxAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
}

export function FoxAvatar({ params, isSilhouette = false }: FoxAvatarProps) {
  const { palette, posture, evolution } = params;
  const tier = evolution.tier;

  let poseMode: "curled" | "quadruped" | "bipedal" = "bipedal";
  if (tier <= 2) {
    poseMode = "curled";
  } else if (tier <= 4) {
    poseMode = "quadruped";
  }

  const hoverY = posture.hoverOffsetY ?? 0;

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svgRoot}
      aria-label="Dayforge Explorer Volumetric Low-Poly Fox Avatar"
      role="img"
    >
      <defs>
        {/* Glow filter */}
        <filter id="avatar-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Amber Eye Lens Gradient (#ff7700 -> #ffcc00) */}
        <linearGradient id="fox-eye-amber-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff7700" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>

        {/* Amber Flame Tip Gradient */}
        <linearGradient id="fox-amber-flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff8800" />
          <stop offset="60%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="#ffe066" />
        </linearGradient>

        {/* Soft Radial Hand Glow */}
        <radialGradient id="fox-hand-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ff7700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#111a26" stopOpacity="0" />
        </radialGradient>

        {/* Radial aura background gradient */}
        <radialGradient id="creature-aura-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!isSilhouette && (
        <>
          {/* Ground Drop Shadow */}
          <CreatureShadow params={params} />

          {/* Ambient Aura Glow */}
          <CreatureAura params={params} />

          {/* 6 Floating Ember Spark Particles */}
          <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
            <circle cx="28" cy="95" r="3.2" fill={palette.accent} opacity="0.8" />
            <circle cx="174" cy="68" r="2.4" fill="#ffaa00" opacity="0.65" />
            <circle cx="22" cy="165" r="3.8" fill="#ff5500" opacity="0.45" />
            <circle cx="178" cy="152" r="2.0" fill="#ffbb00" opacity="0.85" />
            <circle cx="100" cy="24" r="2.8" fill="#ff8800" opacity="0.75" />
            <circle cx="162" cy="198" r="2.2" fill="#ff6600" opacity="0.55" />
          </g>
        </>
      )}

      {/* Main Fox Group */}
      <g
        className={isSilhouette ? "" : "avatar-body-group"}
        transform={hoverY ? `translate(0, ${hoverY})` : undefined}
        style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
      >
        {/* Layer 0: Dedicated Outer Perimeter Silhouette Rim Light (Glow only on outer edge) */}
        {!isSilhouette && <FoxRimLight params={params} poseMode={poseMode} />}

        {/* Layer 1: Tails (Rendered in back layer) */}
        <FoxTail params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

        {/* Layer 2: Back Limbs (Hind legs in bipedal, left legs in quadruped) */}
        <FoxLimbs params={params} isSilhouette={isSilhouette} poseMode={poseMode} layer="back" />

        {/* Layer 3: Spine Plumes & Dorsal Spikes */}
        <FoxBackCrest params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

        {/* Layer 4: Torso Mesh */}
        <FoxBody params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

        {/* Layer 5: Neck Collar Ruff */}
        <FoxCollarCrest params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

        {/* Layer 6: FRONT LIMBS / HUMANOID ARMS (Rendered ON TOP OF TORSO) */}
        <FoxLimbs params={params} isSilhouette={isSilhouette} poseMode={poseMode} layer="front" />

        {/* Layer 7: Head & Ears */}
        <FoxHead params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

        {!isSilhouette && (
          <>
            {/* Layer 8: Face Eyes & Nose */}
            <FoxFace params={params} isSilhouette={isSilhouette} poseMode={poseMode} />

            {/* Layer 9: Bioluminescent Markings */}
            <CreatureMarkings params={params} />

            {/* Layer 10: Skill Imprints */}
            <CreatureSkillImprints params={params} />
          </>
        )}
      </g>
    </svg>
  );
}
