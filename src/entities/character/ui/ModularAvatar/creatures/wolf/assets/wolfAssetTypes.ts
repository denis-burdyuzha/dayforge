import type { FoxBaseAssetProps, FoxZonePoly } from "../../../assets/foxAssetTypes";
import type { WolfPolygonDef } from "./WolfL1AssetData";

/** Same render contract as the fox assets (silhouette / override fill-stroke for the rim light) */
export type WolfBaseAssetProps = FoxBaseAssetProps;

/**
 * The wolf is NOT zone-annotated. The shared polygon renderer (FoxZonedAsset) expects a `zone` field, so
 * every wolf polygon gets the constant zone "unassigned" (no zone transforms / zone fills are ever used).
 */
export function withoutZones(polys: ReadonlyArray<WolfPolygonDef>): FoxZonePoly[] {
  return polys.map((p) => ({ ...p, zone: "unassigned" }));
}
