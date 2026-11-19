import React from "react";
import { FOX_L5_POLYGONS } from "./FoxL5AssetData";
import type { FoxBaseAssetProps } from "./foxAssetTypes";
import { FoxZonedAsset } from "./FoxZonedAsset";

export type FoxL5BaseAssetProps = FoxBaseAssetProps;

/**
 * FoxL5BaseAsset — pure asset renderer for Mythic (foxL5.svg).
 * Polygons are rendered 1:1 in original coordinates/order. Supports overrideFill/Stroke
 * (silhouette rim light) and zone-level transform/fill (attribute FX, geometry untouched).
 */
export const FoxL5BaseAsset: React.FC<FoxBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={FOX_L5_POLYGONS} rootId="fox-l5-asset-root" />
);
