import React, { useMemo } from "react";

import { createAspectAccentResolver } from "../shared/aspectAccent";
import type { FoxBaseAssetProps, FoxZonePoly } from "./foxAssetTypes";

interface FoxZonedAssetProps extends FoxBaseAssetProps {
  polygons: ReadonlyArray<FoxZonePoly>;
  rootId: string;
}

/**
 * Shared polygon renderer of the creature assets (fox tiers and the SVG-pipeline creatures).
 * Renders polygons in original data order (z-order preserved) in original coordinates. Fill priority:
 * silhouette / override (rim pass) → aspect accent recolour → resolveFill → asset colour.
 */
export const FoxZonedAsset: React.FC<FoxZonedAssetProps> = ({
  polygons,
  rootId,
  isSilhouette = false,
  overrideFill,
  overrideStroke,
  overrideStrokeWidth,
  zoneTransforms,
  resolveFill,
  aspectAccentIds,
  aspectColor,
}) => {
  const accentFill = useMemo(
    () => createAspectAccentResolver(polygons, aspectAccentIds, aspectColor),
    [polygons, aspectAccentIds, aspectColor],
  );
  return (
    <g id={rootId} shapeRendering="geometricPrecision">
      {polygons.map((poly) => {
        const baseFill = accentFill?.(poly) ?? resolveFill?.(poly) ?? poly.defaultFill;
        const fill = overrideFill ?? (isSilhouette ? "#020617" : baseFill);
        const stroke = overrideStroke ?? (isSilhouette ? "none" : fill);
        const strokeWidth =
          overrideStrokeWidth !== undefined
            ? String(overrideStrokeWidth)
            : isSilhouette && !overrideStroke
              ? "none"
              : "0.4";
        const transform = zoneTransforms?.[poly.zone];

        return (
          <polygon
            key={poly.id}
            id={poly.id}
            data-zone={poly.zone}
            points={poly.points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            shapeRendering="geometricPrecision"
            strokeLinejoin="round"
            {...(transform ? { transform } : {})}
          />
        );
      })}
    </g>
  );
};
