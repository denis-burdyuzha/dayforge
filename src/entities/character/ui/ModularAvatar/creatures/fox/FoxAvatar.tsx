import React, { useMemo } from "react";
import type { AvatarParams } from "../../../../model/avatarTypes";
import { CreatureAura } from "../../CreatureAura";
import { CreatureShadow } from "../../CreatureShadow";
import styles from "../../ModularAvatar.module.scss";
import { FoxAttributeFX } from "./FoxAttributeFX";
import { CLASS_FORMATION_COLOR, type ClassArchetype } from "../../creatureFxPalette";
import { DisciplineFormation } from "./DisciplineFormation";
import { getFoxTierConfig } from "./foxEvolutionConfig";
import { getFoxFxConfig } from "./foxFxMatrix";
import { computeFoxZoneModifiers, getTierPolys, getZonePolys, polysBBox } from "./foxZones";

export interface FoxAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
}

// ── Static spark position templates (used when discipline is low / no formation) ──
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
 * Generates circle formation positions for particles (Focus convergent orbit).
 * When Focus is high, particles orbit tightly near the head in a circle.
 */
export function genCircleOrbit(
  count: number,
  radius: number,
  cx = 100,
  cy = 90,
  jitter = 0.5,
  seed = 0,
): Array<{ cx: number; cy: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const jx = (((seed + i * 0.137) % 1) - 0.5) * jitter * radius * 0.4;
    const jy = (((seed + i * 0.237) % 1) - 0.5) * jitter * radius * 0.4;
    return {
      cx: cx + Math.cos(angle) * radius + jx,
      cy: cy + Math.sin(angle) * radius + jy,
    };
  });
}

/**
 * FoxAvatar — Level-driven 5-Tier Asset Architecture with External FX Matrix
 * + Full 7-attribute visual channel system.
 *
 * CRITICAL RULE: ZERO mesh mutation. All evolution FX (rim glow, energy aura,
 * particles, color grading filter, attribute FX) are rendered purely as outer layers.
 */
export const FoxAvatar: React.FC<FoxAvatarProps> = ({ params, isSilhouette = false }) => {
  const { evolution, foxAttributes } = params;
  const level = evolution.level ?? 1;
  const classArchetype = (evolution.classArchetype as ClassArchetype) ?? "explorer";

  // 1. Level-driven SVG asset router
  const tierConfig = getFoxTierConfig({
    level,
    tier: evolution.tier,
  });

  // 2. Level-driven External FX Config Matrix
  const fx = getFoxFxConfig(level);

  const AssetComponent = tierConfig.component;
  const { scale, tx, ty, tierIndex } = tierConfig;

  // 3. Zone geometry (all from the grouped SVG data of this tier)
  const zoneGeo = useMemo(() => {
    const all = polysBBox(getTierPolys(tierIndex));
    const head = polysBBox(getZonePolys(tierIndex, "head"));
    const torso = polysBBox(getZonePolys(tierIndex, "torso"));
    return { all, head, torso };
  }, [tierIndex]);

  const toCanvas = (x: number, y: number) => ({ cx: tx + x * scale, cy: ty + y * scale });
  const bodyBox = zoneGeo.torso ?? zoneGeo.all;
  const bodyCenter = bodyBox ? toCanvas(bodyBox.cx, bodyBox.cy) : { cx: 100, cy: 90 };
  const headCenter = zoneGeo.head ? toCanvas(zoneGeo.head.cx, zoneGeo.head.cy) : bodyCenter;
  const headRadius = zoneGeo.head ? (Math.max(zoneGeo.head.w, zoneGeo.head.h) / 2) * scale : 20;

  // 4. Discipline posture: rotate/tilt completely disabled per design decision
  // TODO(Discipline): Figure posture tilt disabled to avoid awkward posture angles.
  const bodyTransform = `translate(${tx}, ${ty}) scale(${scale})`;

  // 5. Zone modifiers (torso scale/contrast/patina, head whitening, creativity facet tint, tail warm shift)
  const zoneMods = useMemo(
    () =>
      computeFoxZoneModifiers(
        tierIndex,
        foxAttributes,
        {
          intensity: params.creativity?.asymmetryIntensity ?? 0,
          seed: params.identity.patternSeed,
        },
        classArchetype,
      ),
    [tierIndex, foxAttributes, params.creativity?.asymmetryIntensity, params.identity.patternSeed, classArchetype],
  );

  // 6. Particle Systems & Discipline Crystal Formation:
  // A. Discipline Formation Crystals (ALWAYS 6 triangular facets, centered on AVATAR BBOX, radius = avatarHalfDiag + 22px UNCAPPED)
  // B. Decorative Evolution Sparks (0..N ambient ember points, driven purely by tier matrix fx.particles.count)

  const convergence = foxAttributes?.focus.particleConvergence ?? 0;
  const ringRadius = fx.particles.radius + (headRadius * 1.35 + 6 - fx.particles.radius) * convergence;
  const ringCenter = {
    cx: bodyCenter.cx + (headCenter.cx - bodyCenter.cx) * convergence,
    cy: bodyCenter.cy + (headCenter.cy - bodyCenter.cy) * convergence,
  };
  const particleJitter = foxAttributes?.discipline
    ? fx.particles.jitter * (1 - foxAttributes.discipline.rimJitterReduction * 0.6)
    : fx.particles.jitter;
  const disciplineLerp = foxAttributes?.discipline.poseSymmetryEmphasis ?? 0;
  const seed = params.identity.patternSeed;

  // Avatar BBox Centering & Half-Diagonal calculation for Discipline Orbit
  const avatarBox = zoneGeo.all;
  const avatarCenter = avatarBox
    ? toCanvas(avatarBox.cx, avatarBox.cy)
    : bodyCenter;
  const avatarHalfDiag = avatarBox
    ? (Math.hypot(avatarBox.w, avatarBox.h) / 2) * scale
    : 40;

  // SYSTEM B: Decorative Evolution Sparks (Driven by Tier Matrix: fx.particles.count)
  const evolutionSparkCount = fx.particles.count;
  const evolutionSparkPositions = Array.from({ length: evolutionSparkCount }, (_, i) => {
    const s = SPARK_DEFS[i % SPARK_DEFS.length] ?? { cx: 100, cy: 90 };
    return {
      cx: ringCenter.cx + (s.cx - 100) * (ringRadius / 85),
      cy: ringCenter.cy + (s.cy - 90) * (ringRadius / 85),
    };
  });

  // 7. Rim-light: Discipline stabilises stroke variation (no flicker at high Discipline)
  const disciplineStability = foxAttributes?.discipline.rimJitterReduction ?? 0;
  const effectiveRimStrokeWidth =
    fx.rimStrokeWidth > 0
      ? fx.rimStrokeWidth * (1 - disciplineStability * 0.15) + disciplineStability * 0.3
      : 0;
  const rimFlicker = foxAttributes ? (1 - disciplineStability) * 0.35 : 0;
  const rimOpacityValues = [1, 1 - rimFlicker, 1, 1 - rimFlicker * 0.6, 1]
    .map((k) => (fx.rimGlowOpacity * k).toFixed(3))
    .join(";");

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
          <radialGradient id="creature-aura-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Amber eye gradient */}
          <radialGradient id="fox-eye-amber-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7700" />
            <stop offset="60%" stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ff5500" />
          </radialGradient>
        </defs>

        {/* ── Outer Background FX (Shadow & Aura) ── */}
        {!isSilhouette && (
          <>
            <CreatureShadow params={params} />

            {fx.auraOpacity > 0 && fx.auraRadius > 0 && (
              <CreatureAura
                params={params}
                overrideOpacity={fx.auraOpacity}
                overrideRadius={fx.auraRadius}
              />
            )}

            {/* Solid Silhouette Rim Light (Outer cyan rim outline under main mesh) */}
            {effectiveRimStrokeWidth > 0 && fx.rimGlowOpacity > 0 && (
              <g
                filter="url(#avatar-glow-filter)"
                opacity={fx.rimGlowOpacity}
                style={{ pointerEvents: "none" }}
              >
                {rimFlicker > 0.04 && (
                  <animate
                    attributeName="opacity"
                    values={rimOpacityValues}
                    dur="1.7s"
                    repeatCount="indefinite"
                  />
                )}
                <g transform={bodyTransform}>
                  <AssetComponent
                    isSilhouette={true}
                    overrideFill="#38bdf8"
                    overrideStroke="#38bdf8"
                    overrideStrokeWidth={effectiveRimStrokeWidth}
                    zoneTransforms={zoneMods.zoneTransforms}
                  />
                </g>
              </g>
            )}

            {/* B. Decorative Evolution Sparks Layer (Driven by Tier Matrix) */}
            {evolutionSparkCount > 0 && (
              <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
                {evolutionSparkPositions.map((pos, i) => {
                  const src = SPARK_DEFS[i % SPARK_DEFS.length];
                  const r = src?.r ?? 2.5;
                  const color = src?.color ?? "#38bdf8";
                  const opac = src?.opacity ?? 0.7;
                  return (
                    <circle
                      key={`evo-spark-${i}`}
                      cx={Math.round(pos.cx * 10) / 10}
                      cy={Math.round(pos.cy * 10) / 10}
                      r={r}
                      fill={color}
                      opacity={opac}
                    />
                  );
                })}
              </g>
            )}
          </>
        )}

        {/* ── UNIFIED BODY GROUP (Breathing animation avatarBreathing moves mesh + attribute FX in sync!) ── */}
        <g
          className={isSilhouette ? "" : "avatar-body-group"}
          style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
        >
          {/* Layer 5: Main SVG Base Asset Render (Focus depth-of-field dims body zones via resolveFill; head untouched) */}
          <g
            transform={bodyTransform}
            style={fx.filterStyle !== "none" ? { filter: fx.filterStyle } : undefined}
          >
            {isSilhouette ? (
              <AssetComponent isSilhouette={true} />
            ) : (
              <AssetComponent
                zoneTransforms={zoneMods.zoneTransforms}
                resolveFill={zoneMods.resolveFill}
              />
            )}
          </g>

          {/* Layer 6: Fox Attribute FX Overlays (above mesh, inside breathing group!) */}
          {!isSilhouette && foxAttributes && (
            <FoxAttributeFX
              params={params}
              tier={tierIndex}
              bodyTransform={bodyTransform}
              unit={1 / scale}
              torsoTransform={zoneMods.torsoTransform}
              zoneTransforms={zoneMods.zoneTransforms}
              resolveFill={zoneMods.resolveFill}
            />
          )}
        </g>
      </svg>

      {/* ── TOP-MOST Z-ORDER LAYER: Discipline Formation Crystals (HTML/CSS 3D overlay) ── */}
      {!isSilhouette && (
        <DisciplineFormation
          avatarCenter={avatarCenter}
          avatarHalfDiag={avatarHalfDiag}
          disciplineLerp={disciplineLerp}
          particleJitter={particleJitter}
          seed={seed}
          formationColor={CLASS_FORMATION_COLOR[classArchetype] ?? CLASS_FORMATION_COLOR.explorer}
          tierIndex={tierIndex}
          scale={scale}
          tx={tx}
          ty={ty}
        />
      )}
    </div>
  );
};
