import React from "react";

import type { FoxBaseAssetProps } from "./foxAssetTypes";
import { FOX_L3_POLYGONS } from "./FoxL3AssetData";
import { FoxZonedAsset } from "./FoxZonedAsset";

export type FoxL3BaseAssetProps = FoxBaseAssetProps;

/**
 * FoxL3BaseAsset — pure asset renderer for Young (foxL3.svg).
 * Polygons are rendered 1:1 in original coordinates/order. Supports overrideFill/Stroke
 * (silhouette rim light) and zone-level transform/fill (attribute FX, geometry untouched).
 */
export const FoxL3BaseAsset: React.FC<FoxBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={FOX_L3_POLYGONS} rootId="fox-l3-asset-root" />
);
