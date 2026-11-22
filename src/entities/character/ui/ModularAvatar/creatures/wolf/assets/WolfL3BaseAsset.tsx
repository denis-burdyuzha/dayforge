import type React from "react";

import { FoxZonedAsset } from "../../../assets/FoxZonedAsset";
import type { WolfBaseAssetProps } from "./wolfAssetTypes";
import { withoutZones } from "./wolfAssetTypes";
import { WOLF_L3_POLYGONS } from "./WolfL3AssetData";

const POLYGONS = withoutZones(WOLF_L3_POLYGONS);

/**
 * WolfL3BaseAsset — wolfL3.svg rendered 1:1 (original coordinates, order and colours), like the fox
 * assets. Supports silhouette / overrideFill / overrideStroke for the rim light.
 */
export const WolfL3BaseAsset: React.FC<WolfBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={POLYGONS} rootId="wolf-l3-asset-root" />
);
