import type React from "react";

import { FoxZonedAsset } from "../../../assets/FoxZonedAsset";
import type { WolfBaseAssetProps } from "./wolfAssetTypes";
import { withoutZones } from "./wolfAssetTypes";
import { WOLF_L2_POLYGONS } from "./WolfL2AssetData";

const POLYGONS = withoutZones(WOLF_L2_POLYGONS);

/**
 * WolfL2BaseAsset — wolfL2.svg rendered 1:1 (original coordinates, order and colours), like the fox
 * assets. Supports silhouette / overrideFill / overrideStroke for the rim light.
 */
export const WolfL2BaseAsset: React.FC<WolfBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={POLYGONS} rootId="wolf-l2-asset-root" />
);
