import type React from "react";
import { useId } from "react";

import { applyAspectGlow } from "../../../../model/aspect";
import type { AvatarParams } from "../../../../model/avatarTypes";
import { CreatureAura } from "../../CreatureAura";
import { CreatureShadow } from "../../CreatureShadow";
import styles from "../../ModularAvatar.module.scss";
import { tierSparkPositions } from "../../tierSparks";
import { getWolfTierConfig } from "./wolfEvolutionConfig";
import { getWolfFxConfig } from "./wolfFxMatrix";

export interface WolfAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
}

/** The fit rule centres every wolf asset on the canvas point (100, 120) — the tier particles orbit it */
const WOLF_BODY_CENTER = [100, 120] as const;

/**
 * WolfAvatar (Warrior) — the same low-poly pipeline as the fox: one SVG asset per tier (own colours, fitted
 * by the fox rule) + tier FX matrix (rim light, aura, particles, colour grading). Rim light and aura take
 * the aspect colour (neutral soft white without an aspect). No zones, no tail-tip recolouring and no
 * archived on-body attribute FX v2.
 */
export const WolfAvatar: React.FC<WolfAvatarProps> = ({ params, isSilhouette = false }) => {
  const level = params.evolution.level ?? 1;

  // 1. Level-driven SVG asset router + tier FX matrix
  const tierConfig = getWolfTierConfig(level);
  const fx = getWolfFxConfig(level);
  const AssetComponent = tierConfig.component;
  const bodyTransform = `translate(${tierConfig.tx}, ${tierConfig.ty}) scale(${tierConfig.scale})`;

  // 2. Aspect recolours rim light + aura (shared rule with the fox)
  const glow = applyAspectGlow(
    {
      rimOpacity: fx.rimGlowOpacity,
      rimStrokeWidth: fx.rimStrokeWidth,
      auraOpacity: fx.auraOpacity,
      auraRadius: fx.auraRadius,
    },
    params.aspect,
  );
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const auraGradientId = `wolf-aura-${uid}`;
  const glowFilterId = `wolf-glow-${uid}`;

  // 3. Tier particles: count, radius and centre depend ONLY on the tier
  const sparks = tierSparkPositions(fx.particles.count, WOLF_BODY_CENTER, fx.particles.radius);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgRoot}
        aria-label={`Dayforge Warrior Wolf Avatar (${tierConfig.name} Lvl ${level})`}
        role="img"
        overflow="visible"
      >
        <defs>
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id={auraGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow.color} stopOpacity="0.8" />
            <stop offset="60%" stopColor={glow.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Background: shadow, aura, rim light, tier particles ── */}
        {!isSilhouette && (
          <>
            <CreatureShadow params={params} />

            {glow.auraOpacity > 0 && glow.auraRadius > 0 && (
              <CreatureAura
                params={params}
                overrideOpacity={glow.auraOpacity}
                overrideRadius={glow.auraRadius}
                gradientId={auraGradientId}
              />
            )}

            {glow.rimStrokeWidth > 0 && glow.rimOpacity > 0 && (
              <g
                className="avatar-rim-light"
                filter={`url(#${glowFilterId})`}
                opacity={glow.rimOpacity}
                style={{ pointerEvents: "none" }}
              >
                <g transform={bodyTransform}>
                  <AssetComponent
                    isSilhouette={true}
                    overrideFill={glow.color}
                    overrideStroke={glow.color}
                    overrideStrokeWidth={glow.rimStrokeWidth}
                  />
                </g>
              </g>
            )}

            {sparks.length > 0 && (
              <g className="creature-ember-sparks" filter={`url(#${glowFilterId})`}>
                {sparks.map((sp, i) => (
                  <circle
                    key={`evo-spark-${i}`}
                    cx={sp.cx}
                    cy={sp.cy}
                    r={sp.r}
                    fill={sp.color}
                    opacity={sp.opacity}
                  />
                ))}
              </g>
            )}
          </>
        )}

        {/* ── Body group (breathing animation) ── */}
        <g
          className={isSilhouette ? "" : "avatar-body-group"}
          style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
        >
          <g
            transform={bodyTransform}
            style={fx.filterStyle !== "none" ? { filter: fx.filterStyle } : undefined}
          >
            <AssetComponent isSilhouette={isSilhouette} />
          </g>
        </g>
      </svg>
    </div>
  );
};
