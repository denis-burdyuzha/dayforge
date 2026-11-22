import React from "react";

import type { FoxBaseAssetProps, FoxZonePoly } from "./foxAssetTypes";

interface FoxZonedAssetProps extends FoxBaseAssetProps {
  polygons: ReadonlyArray<FoxZonePoly>;
  rootId: string;
}

/**
 * Shared polygon renderer for all 5 fox tiers.
 * Renders polygons in original data order (z-order preserved) in original coordinates.
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
}) => {
  return (
    <g id={rootId} shapeRendering="geometricPrecision">
      {polygons.map((poly) => {
        const baseFill = resolveFill?.(poly) ?? poly.defaultFill;
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
