import type React from "react";

import { FoxZonedAsset } from "../../../assets/FoxZonedAsset";
import type { WolfBaseAssetProps } from "./wolfAssetTypes";
import { withoutZones } from "./wolfAssetTypes";
import { WOLF_L5_POLYGONS } from "./WolfL5AssetData";

const POLYGONS = withoutZones(WOLF_L5_POLYGONS);

/**
 * WolfL5BaseAsset — wolfL5.svg rendered 1:1 (original coordinates, order and colours), like the fox
 * assets. Supports silhouette / overrideFill / overrideStroke for the rim light.
 */
export const WolfL5BaseAsset: React.FC<WolfBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={POLYGONS} rootId="wolf-l5-asset-root" />
);
