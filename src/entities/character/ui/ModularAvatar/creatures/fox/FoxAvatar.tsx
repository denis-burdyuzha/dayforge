import type React from "react";
import { useId } from "react";

import { applyAspectGlow } from "../../../../model/aspect";
import type { AvatarParams } from "../../../../model/avatarTypes";
import { AttributeFxLayer } from "../../attributeFx/AttributeFxLayer";
import { createBodyToneResolver } from "../../attributeFx/bodyTone";
import { createFxContext } from "../../attributeFx/fxContext";
import { CreatureAura } from "../../CreatureAura";
import { CreatureShadow } from "../../CreatureShadow";
import styles from "../../ModularAvatar.module.scss";
import { getFoxAnatomy } from "./foxAnatomy";
import { getFoxTierConfig } from "./foxEvolutionConfig";
import { getFoxFxConfig } from "./foxFxMatrix";

export interface FoxAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
  /** Dev-only: render the archived on-body attribute FX v2 (playground toggle) */
  legacyAttributeFx?: boolean;
}

/** Rim light / aura colour of the fox when the character has no aspect */
const FOX_DEFAULT_GLOW = "#38bdf8";

// ── Static spark position templates (tier particles) ──
const SPARK_DEFS = [
  { cx: 28, cy: 95, r: 3.2, color: "#ff8800", opacity: 0.8 },
  { cx: 174, cy: 68, r: 2.4, color: "#38bdf8", opacity: 0.85 },
  { cx: 22, cy: 165, r: 3.8, color: "#ff5500", opacity: 0.65 },
  { cx: 178, cy: 152, r: 2.0, color: "#38bdf8", opacity: 0.9 },
  { cx: 100, cy: 24, r: 2.8, color: "#ffaa00", opacity: 0.75 },
  { cx: 162, cy: 198, r: 2.2, color: "#ff6600", opacity: 0.55 },
  { cx: 40, cy: 45, r: 2.6, color: "#38bdf8", opacity: 0.8 },
  { cx: 155, cy: 110, r: 3.0, color: "#ff8800", opacity: 0.7 },
  { cx: 30, cy: 130, r: 2.5, color: "#ffbb00", opacity: 0.6 },
  { cx: 170, cy: 35, r: 3.4, color: "#38bdf8", opacity: 0.85 },
  { cx: 115, cy: 15, r: 2.3, color: "#ff7700", opacity: 0.75 },
  { cx: 145, cy: 215, r: 2.7, color: "#38bdf8", opacity: 0.65 },
];

/**
 * FoxAvatar — level-driven 5-tier asset architecture + tier FX matrix (rim glow, aura, particles)
 * + universal attribute FX (../../attributeFx). ZERO mesh mutation: attribute effects are overlays
 * and fill-tone modifiers only.
 */
export const FoxAvatar: React.FC<FoxAvatarProps> = ({
  params,
  isSilhouette = false,
  legacyAttributeFx = false,
}) => {
  const { evolution } = params;
  const level = evolution.level ?? 1;
  const classId = evolution.classArchetype ?? "explorer";

  // 1. Level-driven SVG asset router + tier FX matrix
  const tierConfig = getFoxTierConfig({ level, tier: evolution.tier });
  const fx = getFoxFxConfig(level);
  const AssetComponent = tierConfig.component;
  const { scale, tx, ty, tierIndex } = tierConfig;
  const bodyTransform = `translate(${tx}, ${ty}) scale(${scale})`;

  // 1b. Aspect (dominant attribute) recolours rim light + aura; without it the fox keeps its cyan
  const glow = applyAspectGlow(
    {
      rimOpacity: fx.rimGlowOpacity,
      rimStrokeWidth: fx.rimStrokeWidth,
      auraOpacity: fx.auraOpacity,
      auraRadius: fx.auraRadius,
    },
    FOX_DEFAULT_GLOW,
    params.aspect,
  );
  const auraGradientId = `fox-aura-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // 2. Universal attribute FX context (anatomy + geometry + palette + seed)
  const anatomy = getFoxAnatomy(tierIndex);
  const values = params.attributeValues;
  const seedKey = params.identity.seedKey;
  const ctx = createFxContext({ anatomy, classId, values, seedKey, transform: { tx, ty, scale } });
  // On-body attribute FX v2 are archived: only the playground toggle turns them (and the Strength
  // torso tone) on. The body carries no attribute effects in the app.
  const resolveFill = legacyAttributeFx
    ? createBodyToneResolver({ torsoZones: anatomy.zones.torso, strength: values.strength })
    : undefined;

  // 3. Tier particles: count, radius and centre depend ONLY on the tier
  const bodyCenter = ctx.toCanvas(ctx.geo.torsoCenter);
  const ringRadius = fx.particles.radius;
  const sparkPositions = Array.from({ length: fx.particles.count }, (_, i) => {
    const s = SPARK_DEFS[i % SPARK_DEFS.length] ?? { cx: 100, cy: 90 };
    return {
      cx: bodyCenter[0] + (s.cx - 100) * (ringRadius / 85),
      cy: bodyCenter[1] + (s.cy - 90) * (ringRadius / 85),
    };
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgRoot}
        aria-label={`Dayforge Explorer Fox Avatar (${tierConfig.name} Lvl ${level})`}
        role="img"
        overflow="visible"
      >
        <defs>
          {/* Glow filter for ambient cyan rim light & particles */}
          <filter id="avatar-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Radial aura background gradient */}
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
                filter="url(#avatar-glow-filter)"
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

            {sparkPositions.length > 0 && (
              <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
                {sparkPositions.map((pos, i) => {
                  const src = SPARK_DEFS[i % SPARK_DEFS.length];
                  return (
                    <circle
                      key={`evo-spark-${i}`}
                      cx={Math.round(pos.cx * 10) / 10}
                      cy={Math.round(pos.cy * 10) / 10}
                      r={src?.r ?? 2.5}
                      fill={src?.color ?? "#38bdf8"}
                      opacity={src?.opacity ?? 0.7}
                    />
                  );
                })}
              </g>
            )}

            {/* Attribute FX behind the body (Social constellation) */}
            {legacyAttributeFx && <AttributeFxLayer ctx={ctx} layer="back" />}
          </>
        )}

        {/* ── Body group (breathing animation moves mesh + front attribute FX together) ── */}
        <g
          className={isSilhouette ? "" : "avatar-body-group"}
          style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
        >
          <g
            transform={bodyTransform}
            style={fx.filterStyle !== "none" ? { filter: fx.filterStyle } : undefined}
          >
            {isSilhouette ? (
              <AssetComponent isSilhouette={true} />
            ) : (
              <AssetComponent {...(resolveFill ? { resolveFill } : {})} />
            )}
          </g>

          {!isSilhouette && legacyAttributeFx && <AttributeFxLayer ctx={ctx} layer="front" />}
        </g>
      </svg>

      {/* ── Foreground: Discipline crystals (HTML/CSS-3D overlay) ── */}
      {!isSilhouette && legacyAttributeFx && <AttributeFxLayer ctx={ctx} layer="overlay" />}
    </div>
  );
};
