import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";
import { FoxEars } from "./FoxEars";

/**
 * FoxHead — Anatomical 3D Low-Poly Fox Head Mesh (25-30 Contiguous Polygons).
 *
 * Curled: 3/4 front-down head resting over front paw with extended wedge snout.
 * Quadruped: Raised 3/4 profile head looking forward-up with volumetric 3D funnel ears.
 * Bipedal: Frontal Kitsune head with clear crown, brow ridge, eye sockets, cheekbones, and snout bridge.
 */
export function FoxHead({
  params,
  isSilhouette = false,
  poseMode = "bipedal",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
}) {
  const { palette, markings } = params;
  const { hasSensoryCrown } = markings;

  const wireStroke = isSilhouette ? "none" : "rgba(56, 189, 248, 0.25)";
  const strokeWidth = "0.4";
  const fL = (pts: string, isHl = false) => getFacetFill("head", pts, palette, isSilhouette, isHl);
  const gemFill = hasSensoryCrown ? "#fff7ed" : (palette.eyeColor ?? "#ffaa00");

  // ── 1. CURLED SLEEPING PUP HEAD (26 Contiguous Polygons) ──
  if (poseMode === "curled") {
    return (
      <g className="fox-head-curled-anatomical-3d">
        <FoxEars params={params} isSilhouette={isSilhouette} poseMode="curled" />
        <g className="lowpoly-fox-head-mesh-curled" strokeLinejoin="round">
          {/* Forehead Ridge & Temples */}
          <polygon
            points="62,90 74,84 84,86 72,94"
            fill={fL("62,90 74,84 84,86 72,94", true)}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="74,84 84,86 92,90 84,96"
            fill={fL("74,84 84,86 92,90 84,96", true)}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="62,90 72,94 64,102 54,98"
            fill={fL("62,90 72,94 64,102 54,98")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="84,86 92,90 98,98 88,102"
            fill={fL("84,86 92,90 98,98 88,102")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Brow Ridge & Eye Socket Cavities */}
          <polygon
            points="72,94 84,96 78,104 66,102"
            fill={fL("72,94 84,96 78,104 66,102")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="84,96 92,90 96,100 86,102"
            fill={fL("84,96 92,90 96,100 86,102")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Wedge-Shaped Fox Snout Bridge */}
          <polygon
            points="78,104 86,102 82,114 74,112"
            fill={fL("78,104 86,102 82,114 74,112")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="74,112 82,114 78,124 70,122"
            fill={fL("74,112 82,114 78,124 70,122")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="70,122 78,124 72,132 64,128"
            fill={fL("70,122 78,124 72,132 64,128")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="64,128 72,132 66,136 60,132"
            fill={fL("64,128 72,132 66,136 60,132")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Left Cheekbones & Jaw */}
          <polygon
            points="54,98 64,102 58,112 48,106"
            fill={fL("54,98 64,102 58,112 48,106")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="64,102 66,102 78,104 74,112 62,116"
            fill={fL("64,102 66,102 78,104 74,112 62,116")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="58,112 62,116 56,124 48,118"
            fill={fL("58,112 62,116 56,124 48,118")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="62,116 74,112 70,122 58,124"
            fill={fL("62,116 74,112 70,122 58,124")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="58,124 70,122 64,128 54,128"
            fill={fL("58,124 70,122 64,128 54,128")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Right Cheekbone & Shadow Jaw */}
          <polygon
            points="96,100 100,106 92,114 86,102"
            fill={fL("96,100 100,106 92,114 86,102")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="86,102 92,114 82,114 78,104"
            fill={fL("86,102 92,114 82,114 78,104")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="92,114 96,120 88,124 82,114"
            fill={fL("92,114 96,120 88,124 82,114")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="82,114 88,124 78,124 74,112"
            fill={fL("82,114 88,124 78,124 74,112")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
        </g>
      </g>
    );
  }

  // ── 2. QUADRUPED 3/4 PROFILE HEAD (Raised Forward-Up — 26 Contiguous Polygons) ──
  if (poseMode === "quadruped") {
    return (
      <g className="fox-head-quadruped-anatomical-3d">
        <FoxEars params={params} isSilhouette={isSilhouette} poseMode="quadruped" />
        <g className="lowpoly-fox-head-mesh-quadruped" strokeLinejoin="round">
          {/* Top Crown Ridge */}
          <polygon
            points="132,48 142,42 150,46 142,54"
            fill={fL("132,48 142,42 150,46 142,54", true)}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="142,42 150,46 156,52 148,58"
            fill={fL("142,42 150,46 156,52 148,58", true)}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Forehead Bridge */}
          <polygon
            points="132,48 142,54 136,62 126,58"
            fill={fL("132,48 142,54 136,62 126,58")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="142,54 148,58 156,58 148,65"
            fill={fL("142,54 148,58 156,58 148,65")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="148,58 156,52 164,58 156,65"
            fill={fL("148,58 156,52 164,58 156,65")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Forward-Up Fox Muzzle / Snout Bridge */}
          <polygon
            points="148,65 156,65 166,66 158,72"
            fill={fL("148,65 156,65 166,66 158,72")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="156,65 164,58 174,66 166,66"
            fill={fL("156,65 164,58 174,66 166,66")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="158,72 166,66 174,66 168,74"
            fill={fL("158,72 166,66 174,66 168,74")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="168,74 174,66 176,74 170,78"
            fill={fL("168,74 174,66 176,74 170,78")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Lower Muzzle & Chin */}
          <polygon
            points="158,72 168,74 162,78 152,76"
            fill={fL("158,72 168,74 162,78 152,76")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="168,74 170,78 166,82 162,78"
            fill={fL("168,74 170,78 166,82 162,78")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Cheeks & Jaw Structure */}
          <polygon
            points="126,58 136,62 132,70 122,66"
            fill={fL("126,58 136,62 132,70 122,66")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="136,62 148,65 142,74 132,70"
            fill={fL("136,62 148,65 142,74 132,70")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="148,65 158,72 152,76 142,74"
            fill={fL("148,65 158,72 152,76 142,74")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="122,66 132,70 128,78 118,74"
            fill={fL("122,66 132,70 128,78 118,74")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="132,70 142,74 136,82 128,78"
            fill={fL("132,70 142,74 136,82 128,78")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="142,74 152,76 144,84 136,82"
            fill={fL("142,74 152,76 144,84 136,82")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
        </g>
      </g>
    );
  }

  // ── 3. BIPEDAL FRONTAL KITSUNE HEAD (30 Contiguous Polygons) ──
  return (
    <g className="fox-head-bipedal-anatomical-3d">
      <FoxEars params={params} isSilhouette={isSilhouette} poseMode="bipedal" />
      <g className="lowpoly-fox-head-mesh-bipedal" strokeLinejoin="round">
        {/* Crown & Upper Forehead Peak */}
        <polygon
          points="94,36 100,30 106,36 100,42"
          fill={fL("94,36 100,30 106,36 100,42", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="86,42 94,36 100,42 92,48"
          fill={fL("86,42 94,36 100,42 92,48", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="106,36 114,42 108,48 100,42"
          fill={fL("106,36 114,42 108,48 100,42", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Forehead Center Facets */}
        <polygon
          points="92,48 100,42 108,48 100,54"
          fill={fL("92,48 100,42 108,48 100,54")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="84,52 92,48 100,54 90,58"
          fill={fL("84,52 92,48 100,54 90,58")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="108,48 116,52 110,58 100,54"
          fill={fL("108,48 116,52 110,58 100,54")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Brow Ridge & Eye Sockets */}
        <polygon
          points="90,58 100,54 100,64 88,62"
          fill={fL("90,58 100,54 100,64 88,62")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="100,54 110,58 112,62 100,64"
          fill={fL("100,54 110,58 112,62 100,64")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="80,56 84,52 90,58 84,64"
          fill={fL("80,56 84,52 90,58 84,64")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="116,52 120,56 116,64 110,58"
          fill={fL("116,52 120,56 116,64 110,58")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Snout Nose Bridge */}
        <polygon
          points="100,64 92,66 100,74 108,66"
          fill={fL("100,64 92,66 100,74 108,66")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="92,66 100,74 96,78 90,72"
          fill={fL("92,66 100,74 96,78 90,72")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="108,66 100,74 104,78 110,72"
          fill={fL("108,66 100,74 104,78 110,72")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="96,78 100,74 104,78 100,80"
          fill={fL("96,78 100,74 104,78 100,80")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Upper Cheekbones */}
        <polygon
          points="84,64 90,58 88,62 78,66"
          fill={fL("84,64 90,58 88,62 78,66")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="110,58 116,64 122,66 112,62"
          fill={fL("110,58 116,64 122,66 112,62")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="88,62 100,64 92,66 84,70"
          fill={fL("88,62 100,64 92,66 84,70")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="112,62 100,64 108,66 116,70"
          fill={fL("112,62 100,64 108,66 116,70")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Lower Cheeks & Jawline */}
        <polygon
          points="78,66 88,62 84,70 74,72"
          fill={fL("78,66 88,62 84,70 74,72")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="122,66 112,62 116,70 126,72"
          fill={fL("122,66 112,62 116,70 126,72")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="84,70 92,66 90,72 82,76"
          fill={fL("84,70 92,66 90,72 82,76")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="116,70 108,66 110,72 118,76"
          fill={fL("116,70 108,66 110,72 118,76")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="90,72 96,78 94,82 86,78"
          fill={fL("90,72 96,78 94,82 86,78")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="110,72 104,78 106,82 114,78"
          fill={fL("110,72 104,78 106,82 114,78")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
      {!isSilhouette && (
        <g className="fox-forehead-gem">
          <polygon
            points="100,38 96,43 100,48 104,43"
            fill={gemFill}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
            filter="url(#avatar-glow-filter)"
          />
        </g>
      )}
    </g>
  );
}
