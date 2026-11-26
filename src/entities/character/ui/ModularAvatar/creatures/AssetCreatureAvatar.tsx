import type React from "react";
import { useId } from "react";

import { applyAspectGlow } from "../../../model/aspect";
import type { AvatarParams } from "../../../model/avatarTypes";
import type { FoxZonePoly } from "../assets/foxAssetTypes";
import { FoxZonedAsset } from "../assets/FoxZonedAsset";
import { CreatureAura } from "../CreatureAura";
import { CreatureShadow } from "../CreatureShadow";
import styles from "../ModularAvatar.module.scss";
import type { CreatureTierAsset } from "../shared/creatureAssetTypes";
import { assetTierForLevel, pickTierFx } from "../tierFx";
import { tierSparkPositions } from "../tierSparks";
import { type CreatureDefinition, creatureTierAsset } from "./creatureRegistry";

export interface AssetCreatureAvatarProps {
  creature: CreatureDefinition;
  params: AvatarParams;
  isSilhouette?: boolean;
}

/** The fit rule centres every asset on the canvas point (100, 120) — the tier particles orbit it */
const BODY_CENTER = [100, 120] as const;

// The shared polygon renderer expects a zone; SVG-pipeline creatures have none. Built once per tier asset
// (a stable array also keeps the aspect accent cache hot).
const zonedCache = new WeakMap<CreatureTierAsset, FoxZonePoly[]>();
function zonedPolygons(asset: CreatureTierAsset): FoxZonePoly[] {
  let polys = zonedCache.get(asset);
  if (!polys) {
    polys = asset.polygons.map((p) => ({ ...p, zone: "unassigned" }));
    zonedCache.set(asset, polys);
  }
  return polys;
}

/**
 * AssetCreatureAvatar — every creature built from SVG assets (wolf, bear, lion, deer): one asset per tier
 * (own colours, fitted by the shared rule) + the creature's tier FX matrix (rim light, aura, particles,
 * colour grading). Rim light and aura take the aspect colour (neutral soft white without an aspect); the
 * aspectAccent polygons of the asset are recoloured into it with light and shade kept.
 */
export const AssetCreatureAvatar: React.FC<AssetCreatureAvatarProps> = ({
  creature,
  params,
  isSilhouette = false,
}) => {
  const level = params.evolution.level ?? 1;
  const tier = assetTierForLevel(level);
  const asset = creatureTierAsset(creature, tier);
  const polygons = zonedPolygons(asset);
  const fx = pickTierFx(creature.fxMatrix, level);
  const { scale, tx, ty } = asset.fit;
  const bodyTransform = `translate(${tx}, ${ty}) scale(${scale})`;
  const rootId = `${creature.animal}-l${tier}-asset-root`;

  const glow = applyAspectGlow(
    {
      rimOpacity: fx.rimGlowOpacity,
      rimStrokeWidth: fx.rimStrokeWidth,
      auraOpacity: fx.auraOpacity,
      auraRadius: fx.auraRadius,
    },
    params.aspect,
  );
  const aspectColor = params.aspect?.color ?? null;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const auraGradientId = `${creature.animal}-aura-${uid}`;
  const glowFilterId = `${creature.animal}-glow-${uid}`;

  const sparks = tierSparkPositions(fx.particles.count, BODY_CENTER, fx.particles.radius);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgRoot}
        aria-label={`Dayforge ${creature.label} Avatar (${creature.tierNames[tier - 1]} Lvl ${level})`}
        role="img"
        overflow="visible"
        data-creature={creature.animal}
        data-asset-tier={tier}
        data-asset-source={asset.source}
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
            <CreatureAura
              opacity={glow.auraOpacity}
              radius={glow.auraRadius}
              gradientId={auraGradientId}
            />

            {glow.rimStrokeWidth > 0 && glow.rimOpacity > 0 && (
              <g
                className="avatar-rim-light"
                filter={`url(#${glowFilterId})`}
                opacity={glow.rimOpacity}
                style={{ pointerEvents: "none" }}
              >
                <g transform={bodyTransform}>
                  <FoxZonedAsset
                    polygons={polygons}
                    rootId={`${rootId}-rim`}
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
            <FoxZonedAsset
              polygons={polygons}
              rootId={rootId}
              isSilhouette={isSilhouette}
              aspectAccentIds={asset.aspectAccentIds}
              aspectColor={aspectColor}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
