import { getBodyArchetype } from "../../model/avatarEngine";
import type { AvatarParams } from "../../model/avatarTypes";
import { CreatureAura } from "./CreatureAura";
import { CreatureBody } from "./CreatureBody";
import { CreatureCollarCrest } from "./CreatureCollarCrest";
import { CreatureFace } from "./CreatureFace";
import { CreatureHead } from "./CreatureHead";
import { CreatureMarkings } from "./CreatureMarkings";
import { CreatureShadow } from "./CreatureShadow";
import { CreatureSkillImprints } from "./CreatureSkillImprints";
import { CreatureTail } from "./CreatureTail";
import { CreatureWingsCrest } from "./CreatureWingsCrest";
import styles from "./ModularAvatar.module.scss";

export type ModularAvatarSize = "sm" | "md" | "lg" | "xl";

export interface ModularAvatarProps {
  params: AvatarParams;
  size?: ModularAvatarSize | number;
  className?: string;
  silhouetteOnly?: boolean;
}

export function ModularAvatar({
  params,
  size = "lg",
  className,
  silhouetteOnly = false,
}: ModularAvatarProps) {
  const { palette, posture, body, evolution } = params;
  const isSilhouette = silhouetteOnly || Boolean(params.silhouetteOnly);

  const containerClasses = [
    styles.avatarContainer,
    typeof size === "string" ? styles[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const customStyle =
    typeof size === "number"
      ? { width: `${size}px`, height: `${Math.round(size * 1.2)}px` }
      : undefined;

  // Posture tilt angle in degrees
  const tiltAngle = posture.tiltAngle;
  // Overall evolution scale
  const scale = body.scale * body.proportionScale;

  const archetype = getBodyArchetype(evolution.tier);
  const yTorsoTop = 160 - archetype.torsoHeight * 0.45;

  return (
    <div className={containerClasses} style={customStyle}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgRoot}
        aria-label="Dayforge Fantasy Creature Avatar"
        role="img"
      >
        <defs>
          {/* Glow filter used by aura, glowing eyes, and neural imprints */}
          <filter id="avatar-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Radial aura background gradient */}
          <radialGradient id="creature-aura-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Single Luminescent Chest Core Ember Gradient */}
          <radialGradient id="creature-core-ember-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" stopOpacity="1" />
            <stop offset="35%" stopColor={palette.accent} stopOpacity="1" />
            <stop offset="85%" stopColor="#9f1239" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#240c15" stopOpacity="0" />
          </radialGradient>

          {/* Soft Rim-Light Silhouette Contour Gradient */}
          <linearGradient id="creature-rim-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8c38" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#e11d48" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#240c15" stopOpacity="0.0" />
          </linearGradient>

          {/* Rim Glow Filter */}
          <filter id="avatar-rim-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Body Primary Organic Gradient */}
          <linearGradient id="creature-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primaryBody} />
            <stop offset="100%" stopColor={palette.secondaryBody} />
          </linearGradient>

          {/* Belly Ventral Shading Gradient */}
          <linearGradient id="creature-belly-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.bellyTone} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.secondaryBody} stopOpacity="0.8" />
          </linearGradient>

          {/* Membrane Translucent Gradient */}
          <linearGradient id="creature-membrane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={palette.primaryBody} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {!isSilhouette && (
          <>
            {/* ── Layer 1: Ground Shadow ── */}
            <CreatureShadow params={params} />

            {/* ── Layer 2: Ambient Aura ── */}
            <CreatureAura params={params} />

            {/* ── Layer 2.5: Ethereal Floating Ember Sparks (6 particles) ── */}
            <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
              <circle cx="48" cy="105" r="3.2" fill={palette.accent} opacity="0.8" />
              <circle cx="156" cy="82" r="2.4" fill="#ffaa00" opacity="0.65" />
              <circle cx="38" cy="172" r="3.8" fill="#ff5500" opacity="0.45" />
              <circle cx="164" cy="162" r="2.0" fill="#ffbb00" opacity="0.85" />
              <circle cx="96" cy="40" r="2.8" fill="#ff8800" opacity="0.75" />
              <circle cx="140" cy="202" r="2.2" fill="#ff6600" opacity="0.55" />
            </g>
          </>
        )}

        {/* ── Creature Main Group (Breathing, Scaling, Posture Tilt & Hover) ── */}
        <g
          className={isSilhouette ? "" : "avatar-body-group"}
          transform={`translate(100, ${160 + (posture.hoverOffsetY ?? 0)}) scale(${scale}) translate(-100, -160) rotate(${tiltAngle} 100 210)`}
          style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
        >
          {/* ── Layer 3: Wings / Carapace / Back Crest ── */}
          <CreatureWingsCrest params={params} isSilhouette={isSilhouette} />

          {/* ── Layer 4: Tail ── */}
          <CreatureTail params={params} isSilhouette={isSilhouette} />

          {/* ── Layer 5: Torso, Ventral Plate & Limbs ── */}
          <CreatureBody params={params} isSilhouette={isSilhouette} />

          {/* ── Layer 5.5: Social Collar Crest ── */}
          <CreatureCollarCrest params={params} isSilhouette={isSilhouette} />

          {/* ── Layer 6: Head & Ears/Horns ── */}
          <CreatureHead params={params} isSilhouette={isSilhouette} yTorsoTop={yTorsoTop} />

          {!isSilhouette && (
            <>
              {/* ── Layer 7: Face & Eyes ── */}
              <CreatureFace params={params} />

              {/* ── Layer 8: Bioluminescent Markings ── */}
              <CreatureMarkings params={params} />

              {/* ── Layer 9: Organic Skill Imprints ── */}
              <CreatureSkillImprints params={params} />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
