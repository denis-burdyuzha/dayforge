import type React from "react";

import { FoxZonedAsset } from "../../../assets/FoxZonedAsset";
import type { WolfBaseAssetProps } from "./wolfAssetTypes";
import { withoutZones } from "./wolfAssetTypes";
import { WOLF_L4_POLYGONS } from "./WolfL4AssetData";

const POLYGONS = withoutZones(WOLF_L4_POLYGONS);

/**
 * WolfL4BaseAsset — wolfL4.svg rendered 1:1 (original coordinates, order and colours), like the fox
 * assets. Supports silhouette / overrideFill / overrideStroke for the rim light.
 */
export const WolfL4BaseAsset: React.FC<WolfBaseAssetProps> = (props) => (
  <FoxZonedAsset {...props} polygons={POLYGONS} rootId="wolf-l4-asset-root" />
);
