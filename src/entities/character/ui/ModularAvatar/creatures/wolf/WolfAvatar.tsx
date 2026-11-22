import type { AvatarParams } from "../../../../model/avatarTypes";
import { CreatureAura } from "../../CreatureAura";
import { CreatureMarkings } from "../../CreatureMarkings";
import { CreatureShadow } from "../../CreatureShadow";
import { CreatureSkillImprints } from "../../CreatureSkillImprints";
import styles from "../../ModularAvatar.module.scss";
import { WolfBody } from "./WolfBody";
import { WolfFace } from "./WolfFace";
import { WolfHead } from "./WolfHead";
import { WolfLimbs } from "./WolfLimbs";
import { WolfTail } from "./WolfTail";

export interface WolfAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
}

export function WolfAvatar({ params, isSilhouette = false }: WolfAvatarProps) {
  const { palette, posture, body } = params;

  const tiltAngle = posture.tiltAngle;
  const scale = body.scale * body.proportionScale;

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svgRoot}
      aria-label="Dayforge Warrior Low-Poly Wolf Avatar"
      role="img"
    >
      <defs>
        {/* Glow filter */}
        <filter id="avatar-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

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

          {/* 6 Floating Ember Sparks */}
          <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
            <circle cx="38" cy="108" r="3.0" fill={palette.accent} opacity="0.75" />
            <circle cx="168" cy="80" r="2.2" fill="#ff4400" opacity="0.60" />
            <circle cx="32" cy="178" r="3.5" fill="#ff3300" opacity="0.40" />
            <circle cx="170" cy="165" r="1.8" fill="#ff6600" opacity="0.80" />
            <circle cx="95" cy="35" r="2.5" fill="#ff5500" opacity="0.70" />
            <circle cx="148" cy="210" r="2.0" fill="#ff4400" opacity="0.50" />
          </g>
        </>
      )}

      {/* Main Wolf Group */}
      <g
        className={isSilhouette ? "" : "avatar-body-group"}
        transform={`translate(100, ${160 + (posture.hoverOffsetY ?? 0)}) scale(${scale}) translate(-100, -160) rotate(${tiltAngle} 100 210)`}
        style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
      >
        {/* Layer 1: Tail (behind body) */}
        <WolfTail params={params} isSilhouette={isSilhouette} />

        {/* Layer 2: Torso */}
        <WolfBody params={params} isSilhouette={isSilhouette} />

        {/* Layer 3: Limbs */}
        <WolfLimbs params={params} isSilhouette={isSilhouette} />

        {/* Layer 4: Head */}
        <WolfHead params={params} isSilhouette={isSilhouette} />

        {!isSilhouette && (
          <>
            {/* Layer 5: Face */}
            <WolfFace params={params} isSilhouette={isSilhouette} />

            {/* Layer 6: Markings */}
            <CreatureMarkings params={params} />

            {/* Layer 7: Skill Imprints */}
            <CreatureSkillImprints params={params} />
          </>
        )}
      </g>
    </svg>
  );
}
