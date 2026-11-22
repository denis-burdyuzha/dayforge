import React from "react";

import type { FoxBaseAssetProps } from "./foxAssetTypes";
import { FOX_L1_POLYGONS } from "./FoxL1AssetData";
import { FoxZonedAsset } from "./FoxZonedAsset";

export type { FoxBaseAssetProps } from "./foxAssetTypes";
export type FoxL1BaseAssetProps = FoxBaseAssetProps;

/**
 * FoxL1BaseAsset — pure asset renderer for Spark / Larval (foxL1.svg).
 * Polygons are rendered 1:1 in original coordinates/order. Supports overrideFill/Stroke
 * (silhouette rim light) and zone-level transform/fill (attribute FX, geometry untouched).
 */
export const FoxL1BaseAsset: React.FC<FoxBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={FOX_L1_POLYGONS} rootId="fox-l1-asset-root" />
);
