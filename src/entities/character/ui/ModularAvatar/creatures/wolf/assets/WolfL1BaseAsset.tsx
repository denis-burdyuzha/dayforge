import type React from "react";

import { FoxZonedAsset } from "../../../assets/FoxZonedAsset";
import type { WolfBaseAssetProps } from "./wolfAssetTypes";
import { withoutZones } from "./wolfAssetTypes";
import { WOLF_L1_POLYGONS } from "./WolfL1AssetData";

const POLYGONS = withoutZones(WOLF_L1_POLYGONS);

/**
 * WolfL1BaseAsset — wolfL1.svg rendered 1:1 (original coordinates, order and colours), like the fox
 * assets. Supports silhouette / overrideFill / overrideStroke for the rim light.
 */
export const WolfL1BaseAsset: React.FC<WolfBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={POLYGONS} rootId="wolf-l1-asset-root" />
);
