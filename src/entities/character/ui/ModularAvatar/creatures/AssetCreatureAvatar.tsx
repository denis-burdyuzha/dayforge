import type React from "react";
import { useId } from "react";

import { applyAspectGlow } from "../../../model/aspect";
import type { AvatarParams } from "../../../model/avatarTypes";
import type { FoxZonePoly } from "../assets/foxAssetTypes";
import { FoxZonedAsset } from "../assets/FoxZonedAsset";
import { CreatureAura } from "../CreatureAura";
import { CreatureShadow } from "../CreatureShadow";
import styles from "../ModularAvatar.module.scss";
import type { CreatureTierData, CreatureTierMeta } from "../shared/creatureAssetTypes";
import { type TierRequest, useLoadedTier } from "../shared/tierAssetStore";
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
const zonedCache = new WeakMap<CreatureTierData, FoxZonePoly[]>();
function zonedPolygons(data: CreatureTierData): FoxZonePoly[] {
  let polys = zonedCache.get(data);
  if (!polys) {
    polys = data.polygons.map((p) => ({ ...p, zone: "unassigned" }));
    zonedCache.set(data, polys);
  }
  return polys;
}

const request = (meta: CreatureTierMeta): TierRequest<CreatureTierData, CreatureTierMeta> => ({
  key: meta.dataKey,
  meta,
  load: meta.load,
});

/**
 * AssetCreatureAvatar — every creature built from SVG assets (wolf, bear, lion, deer): one asset per tier
 * (own colours, fitted by the shared rule) + the creature's tier FX matrix (rim light, aura, particles,
 * colour grading). Rim light and aura take the aspect colour (neutral soft white without an aspect); the
 * aspectAccent polygons of the asset are recoloured into it with light and shade kept.
 *
 * The polygon data of a (creature, tier) is a lazy chunk: while it loads the canvas is empty (same size, with
 * the ground shadow); on a tier change the previous tier stays until the new one is loaded, then the new one
 * fades in; the next tier is preloaded in the background.
 */
export const AssetCreatureAvatar: React.FC<AssetCreatureAvatarProps> = ({
  creature,
  params,
  isSilhouette = false,
}) => {
  const level = params.evolution.level ?? 1;
  const tier = assetTierForLevel(level);
  const requested = creatureTierAsset(creature, tier);
  const next = tier < 5 ? creatureTierAsset(creature, (tier + 1) as 2 | 3 | 4 | 5) : null;
  const shown = useLoadedTier(request(requested), next ? request(next) : null);
  // the tier on screen: the requested one, or the previous one until the requested one is loaded
  const asset = shown?.meta ?? requested;
  const polygons = shown ? zonedPolygons(shown.data) : null;
  const fx = pickTierFx(creature.fxMatrix, level);
  const { scale, tx, ty } = asset.fit;
  const bodyTransform = `translate(${tx}, ${ty}) scale(${scale})`;
  const rootId = `${creature.animal}-l${asset.tierIndex}-asset-root`;

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
        aria-busy={shown ? undefined : true}
        role="img"
        overflow="visible"
        data-creature={creature.animal}
        data-asset-tier={asset.tierIndex}
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
        {!isSilhouette && <CreatureShadow params={params} />}
        {!isSilhouette && polygons && (
          <>
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

        {/* ── Body group (breathing animation); keyed by tier: a new tier fades in once it is loaded ── */}
        {polygons && shown && (
          <g
            key={shown.meta.dataKey + shown.meta.tierIndex}
            className={isSilhouette ? "" : "avatar-body-group"}
            style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
          >
            <g
              className="creature-tier-in"
              transform={bodyTransform}
              style={fx.filterStyle !== "none" ? { filter: fx.filterStyle } : undefined}
            >
              <FoxZonedAsset
                polygons={polygons}
                rootId={rootId}
                isSilhouette={isSilhouette}
                aspectAccentIds={shown.data.aspectAccentIds}
                aspectColor={aspectColor}
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
