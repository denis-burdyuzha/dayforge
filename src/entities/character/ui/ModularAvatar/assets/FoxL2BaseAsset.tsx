import React from "react";
import { FOX_L2_POLYGONS } from "./FoxL2AssetData";
import type { FoxBaseAssetProps } from "./foxAssetTypes";
import { FoxZonedAsset } from "./FoxZonedAsset";

export type FoxL2BaseAssetProps = FoxBaseAssetProps;

/**
 * FoxL2BaseAsset — pure asset renderer for Hatchling (foxL2.svg).
 * Polygons are rendered 1:1 in original coordinates/order. Supports overrideFill/Stroke
 * (silhouette rim light) and zone-level transform/fill (attribute FX, geometry untouched).
 */
export const FoxL2BaseAsset: React.FC<FoxBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={FOX_L2_POLYGONS} rootId="fox-l2-asset-root" />
);
