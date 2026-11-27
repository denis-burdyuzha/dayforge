import type React from "react";
import { useId } from "react";

import { applyAspectGlow } from "../../../../model/aspect";
import type { AvatarParams } from "../../../../model/avatarTypes";
import { FoxZonedAsset } from "../../assets/FoxZonedAsset";
import { AttributeFxLayer } from "../../attributeFx/AttributeFxLayer";
import { createBodyToneResolver } from "../../attributeFx/bodyTone";
import { createFxContext } from "../../attributeFx/fxContext";
import { CreatureAura } from "../../CreatureAura";
import { CreatureShadow } from "../../CreatureShadow";
import styles from "../../ModularAvatar.module.scss";
import { type TierRequest, useLoadedTier } from "../../shared/tierAssetStore";
import { tierSparkPositions } from "../../tierSparks";
import { getFoxAnatomy } from "./foxAnatomy";
import {
  type FoxTierConfigItem,
  getFoxTierConfig,
  getFoxTierConfigByIndex,
} from "./foxEvolutionConfig";
import { getFoxFxConfig } from "./foxFxMatrix";
import { FOX_TIER_LOADERS, type FoxTierData, type FoxTierIndex, foxTierKey } from "./foxZones";

type FillPoly = { id: string; zone: string; defaultFill: string };

export interface FoxAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
  /** Dev-only: render the archived on-body attribute FX v2 (playground toggle) */
  legacyAttributeFx?: boolean;
}

const request = (tier: FoxTierIndex): TierRequest<FoxTierData, FoxTierConfigItem> => ({
  key: foxTierKey(tier),
  meta: getFoxTierConfigByIndex(tier),
  load: FOX_TIER_LOADERS[tier],
});

/**
 * FoxAvatar — level-driven 5-tier asset architecture + tier FX matrix (rim glow, aura, particles)
 * + universal attribute FX (../../attributeFx). ZERO mesh mutation: attribute effects are overlays
 * and fill-tone modifiers only.
 *
 * The polygon data of a tier is a lazy chunk (shared/tierAssetStore): while it loads the canvas is empty
 * (same size, with the ground shadow); on a tier change the previous tier stays until the new one is loaded;
 * the next tier is preloaded in the background.
 */
export const FoxAvatar: React.FC<FoxAvatarProps> = (props) => {
  const { params } = props;
  const level = params.evolution.level ?? 1;
  const requested = getFoxTierConfig({ level, tier: params.evolution.tier });
  const nextIndex = requested.tierIndex < 5 ? ((requested.tierIndex + 1) as FoxTierIndex) : null;
  const shown = useLoadedTier(request(requested.tierIndex), nextIndex ? request(nextIndex) : null);

  if (!shown) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg
          viewBox="0 0 200 240"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svgRoot}
          aria-label={`Dayforge Explorer Fox Avatar (${requested.name} Lvl ${level})`}
          aria-busy="true"
          role="img"
          overflow="visible"
        >
          {!props.isSilhouette && <CreatureShadow params={params} />}
        </svg>
      </div>
    );
  }
  return <FoxAvatarLoaded {...props} tierConfig={shown.meta} tierData={shown.data} />;
};

interface FoxAvatarLoadedProps extends FoxAvatarProps {
  /** the tier on screen (the requested one, or the previous one while the requested loads) */
  tierConfig: FoxTierConfigItem;
  tierData: FoxTierData;
}

const FoxAvatarLoaded: React.FC<FoxAvatarLoadedProps> = ({
  params,
  isSilhouette = false,
  legacyAttributeFx = false,
  tierConfig,
  tierData,
}) => {
  const { evolution } = params;
  const level = evolution.level ?? 1;
  const classId = evolution.classArchetype ?? "explorer";

  // 1. Tier asset (loaded) + tier FX matrix
  const fx = getFoxFxConfig(level);
  const { scale, tx, ty, tierIndex } = tierConfig;
  const bodyTransform = `translate(${tx}, ${ty}) scale(${scale})`;
  const rootId = `fox-l${tierIndex}-asset-root`;
  const renderAsset = (
    props: Omit<React.ComponentProps<typeof FoxZonedAsset>, "polygons" | "rootId">,
  ) => <FoxZonedAsset polygons={tierData.polygons} rootId={rootId} {...props} />;

  // 1b. Aspect (dominant attribute) recolours rim light + aura; without it — neutral soft white
  const glow = applyAspectGlow(
    {
      rimOpacity: fx.rimGlowOpacity,
      rimStrokeWidth: fx.rimStrokeWidth,
      auraOpacity: fx.auraOpacity,
      auraRadius: fx.auraRadius,
    },
    params.aspect,
  );
  const auraGradientId = `fox-aura-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // 2. Universal attribute FX context (anatomy + geometry + palette + seed)
  const anatomy = getFoxAnatomy(tierIndex);
  const values = params.attributeValues;
  const seedKey = params.identity.seedKey;
  const ctx = createFxContext({ anatomy, classId, values, seedKey, transform: { tx, ty, scale } });
  // Eyes + tail tips take the aspect colour via the shared aspect accent (tierData.aspectAccentIds,
  // recoloured by the asset renderer with the light and shade kept). Without an aspect — asset colours.
  const aspectColor = params.aspect?.color ?? null;
  // On-body attribute FX v2 are archived: only the playground toggle turns them (and the Strength
  // torso tone) on. The body carries no attribute effects in the app.
  const bodyTone = legacyAttributeFx
    ? createBodyToneResolver({ torsoZones: anatomy.zones.torso, strength: values.strength })
    : null;
  const resolveFill = bodyTone ? (poly: FillPoly) => bodyTone(poly) : undefined;

  // 3. Tier particles: count, radius and centre depend ONLY on the tier
  const bodyCenter = ctx.toCanvas(ctx.geo.torsoCenter);
  const sparks = tierSparkPositions(fx.particles.count, bodyCenter, fx.particles.radius);

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

            <CreatureAura
              opacity={glow.auraOpacity}
              radius={glow.auraRadius}
              gradientId={auraGradientId}
            />

            {glow.rimStrokeWidth > 0 && glow.rimOpacity > 0 && (
              <g
                className="avatar-rim-light"
                filter="url(#avatar-glow-filter)"
                opacity={glow.rimOpacity}
                style={{ pointerEvents: "none" }}
              >
                <g transform={bodyTransform}>
                  {renderAsset({
                    isSilhouette: true,
                    overrideFill: glow.color,
                    overrideStroke: glow.color,
                    overrideStrokeWidth: glow.rimStrokeWidth,
                  })}
                </g>
              </g>
            )}

            {sparks.length > 0 && (
              <g className="creature-ember-sparks" filter="url(#avatar-glow-filter)">
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
            {isSilhouette
              ? renderAsset({ isSilhouette: true })
              : renderAsset({
                  ...(resolveFill ? { resolveFill } : {}),
                  aspectAccentIds: tierData.aspectAccentIds,
                  aspectColor,
                })}
          </g>

          {!isSilhouette && legacyAttributeFx && <AttributeFxLayer ctx={ctx} layer="front" />}
        </g>
      </svg>

      {/* ── Foreground: Discipline crystals (HTML/CSS-3D overlay) ── */}
      {!isSilhouette && legacyAttributeFx && <AttributeFxLayer ctx={ctx} layer="overlay" />}
    </div>
  );
};
