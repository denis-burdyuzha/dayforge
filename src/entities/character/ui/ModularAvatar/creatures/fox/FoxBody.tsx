import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxBody — High-Density 3D Volumetric Low-Poly Fox Torso Mesh (30-36 Contiguous Polygons).
 *
 * Density: 3-4x subdivision density.
 * Stroke: rgba(56, 189, 248, 0.25) at strokeWidth="0.4".
 * Colors: #325885 (highlight), #27476e / #1f3857 (light), #172a42 / #121f30 (base), #0c1420 / #090e17 (shadow).
 */
export function FoxBody({
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
  const fT = (pts: string, isHl = false) => getFacetFill("torso", pts, palette, isSilhouette, isHl);

  // ── 1. CURLED SLEEPING PUP BODY (32 Contiguous Polygons) ──
  if (poseMode === "curled") {
    return (
      <g className="fox-body-curled-dense-3d" strokeLinejoin="round">
        {/* Upper Spine Arch (Highlighted Top Ridge) */}
        <polygon
          points="76,82 94,80 106,88 90,90"
          fill={fT("76,82 94,80 106,88 90,90", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="94,80 112,80 124,84 106,88"
          fill={fT("94,80 112,80 124,84 106,88", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="112,80 128,82 142,88 124,84"
          fill={fT("112,80 128,82 142,88 124,84", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Mid Spine Slope to Rump */}
        <polygon
          points="128,82 146,92 156,102 142,98"
          fill={fT("128,82 146,92 156,102 142,98", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="146,92 160,105 166,118 152,112"
          fill={fT("146,92 160,105 166,118 152,112")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="160,105 170,122 170,138 160,130"
          fill={fT("160,105 170,122 170,138 160,130")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Upper Flank Layer */}
        <polygon
          points="76,82 90,90 102,100 86,96"
          fill={fT("76,82 90,90 102,100 86,96")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="90,90 106,88 118,98 102,100"
          fill={fT("90,90 106,88 118,98 102,100")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="106,88 124,84 134,96 118,98"
          fill={fT("106,88 124,84 134,96 118,98")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="124,84 142,88 148,102 134,96"
          fill={fT("124,84 142,88 148,102 134,96")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="142,88 156,102 158,116 148,102"
          fill={fT("142,88 156,102 158,116 148,102")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Mid Flank & Ribcage */}
        <polygon
          points="86,96 102,100 110,112 94,108"
          fill={fT("86,96 102,100 110,112 94,108")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="102,100 118,98 126,112 110,112"
          fill={fT("102,100 118,98 126,112 110,112")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="118,98 134,96 140,110 126,112"
          fill={fT("118,98 134,96 140,110 126,112")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="134,96 148,102 152,118 140,110"
          fill={fT("134,96 148,102 152,118 140,110")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="148,102 158,116 162,130 152,118"
          fill={fT("148,102 158,116 162,130 152,118")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Lower Flank & Rump Curve */}
        <polygon
          points="94,108 110,112 116,126 100,122"
          fill={fT("94,108 110,112 116,126 100,122")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="110,112 126,112 132,126 116,126"
          fill={fT("110,112 126,112 132,126 116,126")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="126,112 140,110 144,126 132,126"
          fill={fT("126,112 140,110 144,126 132,126")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="140,110 152,118 154,134 144,126"
          fill={fT("140,110 152,118 154,134 144,126")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="152,118 162,130 162,144 154,134"
          fill={fT("152,118 162,130 162,144 154,134")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Pelvis & Underbelly Shadow Base */}
        <polygon
          points="100,122 116,126 118,140 104,136"
          fill={fT("100,122 116,126 118,140 104,136")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="116,126 132,126 132,142 118,140"
          fill={fT("116,126 132,126 132,142 118,140")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="132,126 144,126 142,144 132,142"
          fill={fT("132,126 144,126 142,144 132,142")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="144,126 154,134 150,150 142,144"
          fill={fT("144,126 154,134 150,150 142,144")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="154,134 162,144 156,158 150,150"
          fill={fT("154,134 162,144 156,158 150,150")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Bottom Underbelly Shadow */}
        <polygon
          points="104,136 118,140 114,152 100,148"
          fill={fT("104,136 118,140 114,152 100,148")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="118,140 132,142 128,154 114,152"
          fill={fT("118,140 132,142 128,154 114,152")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="132,142 142,144 138,158 128,154"
          fill={fT("132,142 142,144 138,158 128,154")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="142,144 150,150 144,162 138,158"
          fill={fT("142,144 150,150 144,162 138,158")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 2. QUADRUPED WILD FOX TORSO (34 Contiguous Polygons) ──
  if (poseMode === "quadruped") {
    return (
      <g className="fox-body-quadruped-dense-3d" strokeLinejoin="round">
        {/* Neck Bridge & Upper Chest (Raised & Athletic) */}
        <polygon
          points="128,52 138,48 144,58 135,62"
          fill={fT("128,52 138,48 144,58 135,62", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="120,70 128,52 135,62 126,76"
          fill={fT("120,70 128,52 135,62 126,76", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="135,62 144,58 152,70 142,76"
          fill={fT("135,62 144,58 152,70 142,76", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Shoulder Blade Ridge & Withers (Highlighted) */}
        <polygon
          points="98,82 110,75 120,70 114,84"
          fill={fT("98,82 110,75 120,70 114,84", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="120,70 126,76 138,82 130,90"
          fill={fT("120,70 126,76 138,82 130,90", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="126,76 142,76 148,86 138,82"
          fill={fT("126,76 142,76 148,86 138,82")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Spine Slope & Upper Ribcage */}
        <polygon
          points="85,92 98,82 114,84 102,96"
          fill={fT("85,92 98,82 114,84 102,96", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="114,84 130,90 124,102 110,98"
          fill={fT("114,84 130,90 124,102 110,98")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="130,90 138,82 146,92 136,102"
          fill={fT("130,90 138,82 146,92 136,102")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="138,82 148,86 154,98 146,92"
          fill={fT("138,82 148,86 154,98 146,92")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Chest Depth & Ribcage Arch */}
        <polygon
          points="102,96 110,98 118,110 104,108"
          fill={fT("102,96 110,98 118,110 104,108")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="110,98 124,102 128,114 118,110"
          fill={fT("110,98 124,102 128,114 118,110")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="124,102 136,102 138,115 128,114"
          fill={fT("124,102 136,102 138,115 128,114")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="136,102 146,92 148,106 138,115"
          fill={fT("136,102 146,92 148,106 138,115")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Tucked Flank & Waist Contour */}
        <polygon
          points="75,112 85,92 102,96 90,106"
          fill={fT("75,112 85,92 102,96 90,106")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="90,106 102,96 104,108 92,115"
          fill={fT("90,106 102,96 104,108 92,115")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="92,115 104,108 108,120 96,122"
          fill={fT("92,115 104,108 108,120 96,122")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="104,108 118,110 120,122 108,120"
          fill={fT("104,108 118,110 120,122 108,120")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="118,110 128,114 130,125 120,122"
          fill={fT("118,110 128,114 130,125 120,122")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Pelvis & Rump Base */}
        <polygon
          points="75,112 90,106 92,115 78,122"
          fill={fT("75,112 90,106 92,115 78,122")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="78,122 92,115 96,122 82,126"
          fill={fT("78,122 92,115 96,122 82,126")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="82,126 96,122 100,128 86,130"
          fill={fT("82,126 96,122 100,128 86,130")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Underbelly Shadow Contour */}
        <polygon
          points="128,114 138,115 132,128 124,126"
          fill={fT("128,114 138,115 132,128 124,126")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="120,122 130,125 124,126 114,125"
          fill={fT("120,122 130,125 124,126 114,125")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="108,120 120,122 114,125 102,124"
          fill={fT("108,120 120,122 114,125 102,124")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="96,122 108,120 102,124 90,125"
          fill={fT("96,122 108,120 102,124 90,125")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 3. BIPEDAL KITSUNE FEMININE CORSET (36 Contiguous Polygons) ──
  return (
    <g className="fox-body-bipedal-dense-3d" strokeLinejoin="round">
      {/* Slender Neck */}
      <polygon
        points="94,48 100,42 106,48 100,56"
        fill={fT("94,48 100,42 106,48 100,56", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="88,54 94,48 100,56 92,60"
        fill={fT("88,54 94,48 100,56 92,60")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="106,48 112,54 108,60 100,56"
        fill={fT("106,48 112,54 108,60 100,56")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Feminine Shoulder Caps (Deltoid Highlights) */}
      <polygon
        points="78,64 88,54 92,60 80,70"
        fill={fT("78,64 88,54 92,60 80,70", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="112,54 122,64 120,70 108,60"
        fill={fT("112,54 122,64 120,70 108,60")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Upper Bust Contour */}
      <polygon
        points="92,60 100,56 100,72 90,70"
        fill={fT("92,60 100,56 100,72 90,70")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,56 108,60 110,70 100,72"
        fill={fT("100,56 108,60 110,70 100,72")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="80,70 92,60 90,70 76,76"
        fill={fT("80,70 92,60 90,70 76,76")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="108,60 120,70 124,76 110,70"
        fill={fT("108,60 120,70 124,76 110,70")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Mid Bust & Ribcage */}
      <polygon
        points="90,70 100,72 100,84 86,82"
        fill={fT("90,70 100,72 100,84 86,82")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,72 110,70 114,82 100,84"
        fill={fT("100,72 110,70 114,82 100,84")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="76,76 90,70 86,82 72,84"
        fill={fT("76,76 90,70 86,82 72,84")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="110,70 124,76 128,84 114,82"
        fill={fT("110,70 124,76 128,84 114,82")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Solar Plexus & Lower Ribs */}
      <polygon
        points="86,82 100,84 100,96 88,94"
        fill={fT("86,82 100,84 100,96 88,94")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,84 114,82 112,94 100,96"
        fill={fT("100,84 114,82 112,94 100,96")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="72,84 86,82 88,94 74,94"
        fill={fT("72,84 86,82 88,94 74,94")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="114,82 128,84 126,94 112,94"
        fill={fT("114,82 128,84 126,94 112,94")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Narrow Tapered Waist */}
      <polygon
        points="88,94 100,96 100,106 90,104"
        fill={fT("88,94 100,96 100,106 90,104")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,96 112,94 110,104 100,106"
        fill={fT("100,96 112,94 110,104 100,106")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="74,94 88,94 90,104 78,102"
        fill={fT("74,94 88,94 90,104 78,102")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="112,94 126,94 122,102 110,104"
        fill={fT("112,94 126,94 122,102 110,104")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Flank to Hip Transition */}
      <polygon
        points="90,104 100,106 100,116 92,114"
        fill={fT("90,104 100,106 100,116 92,114")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,106 110,104 108,114 100,116"
        fill={fT("100,106 110,104 108,114 100,116")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="78,102 90,104 92,114 82,112"
        fill={fT("78,102 90,104 92,114 82,112")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="110,104 122,102 118,112 108,114"
        fill={fT("110,104 122,102 118,112 108,114")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Curving Hips & Pelvic Shield */}
      <polygon
        points="92,114 100,116 100,128 86,125"
        fill={fT("92,114 100,116 100,128 86,125")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,116 108,114 114,125 100,128"
        fill={fT("100,116 108,114 114,125 100,128")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="82,112 92,114 86,125 76,120"
        fill={fT("82,112 92,114 86,125 76,120")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="108,114 118,112 124,120 114,125"
        fill={fT("108,114 118,112 124,120 114,125")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />

      {/* Lower Pelvis & Thigh Joint Connection */}
      <polygon
        points="86,125 100,128 100,138 84,134"
        fill={fT("86,125 100,128 100,138 84,134")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="100,128 114,125 116,134 100,138"
        fill={fT("100,128 114,125 116,134 100,138")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}
