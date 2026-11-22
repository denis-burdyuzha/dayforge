import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxEars — Volumetric 3D Funnel Ears Mesh (12-16 Contiguous Polygons).
 *
 * Curled: Funnel ears pointing back-up.
 * Quadruped: Volumetric 3D funnel ears pointing FORWARD-UP with dark inner cavity facing viewer.
 * Bipedal: Tall elegant frontal anthro ears with outer ridge highlight, dark inner shadow, and side facet.
 */
export function FoxEars({
  params,
  isSilhouette = false,
  poseMode = "bipedal",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
}) {
  const { palette } = params;

  const wireStroke = isSilhouette ? "none" : "rgba(56, 189, 248, 0.25)";
  const strokeWidth = "0.4";
  const fE = (pts: string, isHl = false) => getFacetFill("head", pts, palette, isSilhouette, isHl);
  const darkInnerFill = isSilhouette ? "#020617" : "#090e17";

  // ── 1. CURLED EARS (12 Contiguous Polygons) ──
  if (poseMode === "curled") {
    return (
      <g className="fox-ears-curled-anatomical-3d" strokeLinejoin="round">
        {/* Left Ear Outer Facets */}
        <polygon
          points="46,72 54,82 62,94 52,86"
          fill={fE("46,72 54,82 62,94 52,86", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="46,72 58,78 68,90 54,82"
          fill={fE("46,72 58,78 68,90 54,82")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="58,78 72,90 68,90 62,94"
          fill={fE("58,78 72,90 68,90 62,94")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Left Ear Inner Cavity */}
        <polygon
          points="48,74 56,82 62,90 54,84"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="56,82 66,88 62,90"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Right Ear Outer Facets */}
        <polygon
          points="78,82 72,92 70,102 66,94"
          fill={fE("78,82 72,92 70,102 66,94", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="78,82 82,90 84,104 72,92"
          fill={fE("78,82 82,90 84,104 72,92")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Right Ear Inner Cavity */}
        <polygon
          points="78,82 74,92 72,100 70,94"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 2. QUADRUPED VOLUMETRIC 3D FUNNEL EARS POINTING FORWARD (14 Contiguous Polygons) ──
  if (poseMode === "quadruped") {
    return (
      <g className="fox-ears-quadruped-anatomical-3d" strokeLinejoin="round">
        {/* Front Ear Outer Ridge Highlight */}
        <polygon
          points="145,36 138,48 132,58 140,52"
          fill={fE("145,36 138,48 132,58 140,52", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Front Ear Side Wall */}
        <polygon
          points="145,36 152,48 148,58 138,48"
          fill={fE("145,36 152,48 148,58 138,48")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Front Ear Volumetric Inner Funnel Cavity Facing Viewer */}
        <polygon
          points="143,40 138,48 144,54 146,46"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="138,48 132,58 142,56 144,54"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Back Ear Outer Ridge */}
        <polygon
          points="158,54 150,62 144,68 152,64"
          fill={fE("158,54 150,62 144,68 152,64")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Back Ear Side Wall */}
        <polygon
          points="158,54 162,62 158,70 150,62"
          fill={fE("158,54 162,62 158,70 150,62")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        {/* Back Ear Inner Shadow */}
        <polygon
          points="156,56 150,62 154,66 158,62"
          fill={darkInnerFill}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 3. BIPEDAL ANTHRO EARS (16 Contiguous Polygons) ──
  return (
    <g className="fox-ears-bipedal-anatomical-3d" strokeLinejoin="round">
      {/* Left Ear Outer Ridge & Spine (Highlight) */}
      <polygon
        points="70,14 76,28 84,44 78,34"
        fill={fE("70,14 76,28 84,44 78,34", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="70,14 82,26 92,38 76,28"
        fill={fE("70,14 82,26 92,38 76,28")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="82,26 88,36 92,38 84,44"
        fill={fE("82,26 88,36 92,38 84,44")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      {/* Left Ear Inner Cavity Shadow */}
      <polygon
        points="72,18 78,28 84,40 76,32"
        fill={darkInnerFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="78,28 88,36 84,40"
        fill={darkInnerFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Right Ear Outer Ridge & Spine */}
      <polygon
        points="130,14 124,28 108,38 122,34"
        fill={fE("130,14 124,28 108,38 122,34")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="130,14 118,26 116,44 124,28"
        fill={fE("130,14 118,26 116,44 124,28")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="118,26 112,36 108,38 116,44"
        fill={fE("118,26 112,36 108,38 116,44")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      {/* Right Ear Inner Cavity Shadow */}
      <polygon
        points="128,18 122,28 116,40 124,32"
        fill={darkInnerFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="122,28 112,36 116,40"
        fill={darkInnerFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}
