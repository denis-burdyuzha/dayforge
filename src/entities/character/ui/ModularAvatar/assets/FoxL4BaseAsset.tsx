import React from "react";

import type { FoxBaseAssetProps } from "./foxAssetTypes";
import { FOX_L4_POLYGONS } from "./FoxL4AssetData";
import { FoxZonedAsset } from "./FoxZonedAsset";

export type FoxL4BaseAssetProps = FoxBaseAssetProps;

/**
 * FoxL4BaseAsset — pure asset renderer for Ascended (foxL4.svg).
 * Polygons are rendered 1:1 in original coordinates/order. Supports overrideFill/Stroke
 * (silhouette rim light) and zone-level transform/fill (attribute FX, geometry untouched).
 */
export const FoxL4BaseAsset: React.FC<FoxBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={FOX_L4_POLYGONS} rootId="fox-l4-asset-root" />
);
