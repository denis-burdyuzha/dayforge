import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxTail — Volumetric 3D Low-Poly Kitsune Tail Plumes (30-36 Contiguous Polygons).
 *
 * Curled: Massive plush 3D tail wrapping smoothly around bottom up to under chin.
 * Quadruped: Bushy 3D tail sweeping down-backwards with fiery amber tip.
 * Bipedal: 5 Voluptuous S-curved Kitsune tails fanning out in a majestic halo behind back.
 */
export function FoxTail({
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
  const fTail = (pts: string, isHl = false) =>
    getFacetFill("tail", pts, palette, isSilhouette, isHl);
  const fillTip = isSilhouette ? "#020617" : "url(#fox-amber-flame-grad)";
  const glowFilter = !isSilhouette ? "url(#avatar-glow-filter)" : undefined;

  // ── 1. CURLED MASSIVE PLUSH TAIL WRAPPING AROUND BODY (30 Contiguous Polygons) ──
  if (poseMode === "curled") {
    return (
      <g className="fox-tail-curled-volumetric-3d" strokeLinejoin="round">
        {/* Rump Connection Root */}
        <polygon
          points="144,126 156,132 164,138 152,144 136,138"
          fill={fTail("144,126 156,132 164,138 152,144 136,138")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="164,138 170,154 162,162 150,166 152,144"
          fill={fTail("164,138 170,154 162,162 150,166 152,144")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="152,144 162,162 148,168 140,156"
          fill={fTail("152,144 162,162 148,168 140,156")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Bottom Curve Swell */}
        <polygon
          points="150,166 138,174 124,180 112,176 104,170"
          fill={fTail("150,166 138,174 124,180 112,176 104,170")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="124,180 106,182 88,184 80,178 74,172"
          fill={fTail("124,180 106,182 88,184 80,178 74,172")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="88,184 72,180 54,174 46,166 48,158"
          fill={fTail("88,184 72,180 54,174 46,166 48,158")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Front Wrap Upwards to Chin */}
        <polygon
          points="54,174 42,164 36,154 42,144 48,158"
          fill={fTail("54,174 42,164 36,154 42,144 48,158")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="36,154 32,135 42,125 46,138"
          fill={fTail("36,154 32,135 42,125 46,138")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Glowing Amber Plume Tip Resting Near Chin */}
        <polygon
          points="32,135 42,125 56,128 46,138"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>
    );
  }

  // ── 2. QUADRUPED BUSHY TAIL (26 Contiguous Polygons) ──
  if (poseMode === "quadruped") {
    return (
      <g className="fox-tail-quadruped-volumetric-3d" strokeLinejoin="round">
        {/* Hip Connection Root */}
        <polygon
          points="75,112 66,118 58,124 64,128 68,132"
          fill={fTail("75,112 66,118 58,124 64,128 68,132")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="58,124 48,130 38,136 44,142 50,138"
          fill={fTail("58,124 48,130 38,136 44,142 50,138")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Mid Plume Swell */}
        <polygon
          points="38,136 28,142 20,150 24,156 30,152"
          fill={fTail("38,136 28,142 20,150 24,156 30,152")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="20,150 16,156 12,162 14,166 16,164"
          fill={fTail("20,150 16,156 12,162 14,166 16,164")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Glowing Amber Tip */}
        <polygon
          points="20,150 10,162 12,172 24,155"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>
    );
  }

  // ── 3. BIPEDAL 5 VOLUPTUOUS S-CURVED KITSUNE TAILS (35 Contiguous Polygons) ──
  return (
    <g className="fox-tail-kitsune-5voluptuous-3d" strokeLinejoin="round">
      {/* TAIL 1: OUTER LEFT S-CURVED TAIL (7 Contiguous Facets) */}
      <g className="kitsune-tail-outer-left">
        <polygon
          points="86,132 74,129 62,126 68,136 78,146"
          fill={fTail("86,132 74,129 62,126 68,136 78,146")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="62,126 48,122 36,118 42,128 52,142"
          fill={fTail("62,126 48,122 36,118 42,128 52,142")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="36,118 26,110 18,102 22,110 28,134"
          fill={fTail("36,118 26,110 18,102 22,110 28,134")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="18,102 12,94 8,88 4,100 12,116"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>

      {/* TAIL 2: UPPER LEFT S-CURVED TAIL (7 Contiguous Facets) */}
      <g className="kitsune-tail-upper-left">
        <polygon
          points="90,122 80,110 72,98 68,106 82,128"
          fill={fTail("90,122 80,110 72,98 68,106 82,128", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="72,98 60,84 48,70 42,78 62,112"
          fill={fTail("72,98 60,84 48,70 42,78 62,112", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="48,70 40,58 34,45 38,40 44,36 38,82"
          fill={fTail("48,70 40,58 34,45 38,40 44,36 38,82", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="34,45 40,24 52,35 44,36"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>

      {/* TAIL 3: CENTER HIGH BACK TAIL (7 Contiguous Facets) */}
      <g className="kitsune-tail-center-high">
        <polygon
          points="96,118 95,102 94,88 100,88 106,88 104,118"
          fill={fTail("96,118 95,102 94,88 100,88 106,88 104,118", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="94,88 93,72 92,56 100,56 108,56 106,88"
          fill={fTail("94,88 93,72 92,56 100,56 108,56 106,88", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="92,56 94,44 95,32 100,32 105,32 108,56"
          fill={fTail("92,56 94,44 95,32 100,32 105,32 108,56", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="95,32 100,12 105,32"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>

      {/* TAIL 4: UPPER RIGHT S-CURVED TAIL (7 Contiguous Facets) */}
      <g className="kitsune-tail-upper-right">
        <polygon
          points="110,122 120,110 128,98 132,106 118,128"
          fill={fTail("110,122 120,110 128,98 132,106 118,128")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="128,98 140,84 152,70 158,78 138,112"
          fill={fTail("128,98 140,84 152,70 158,78 138,112")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="152,70 160,58 166,45 162,40 156,36 162,82"
          fill={fTail("152,70 160,58 166,45 162,40 156,36 162,82")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="166,45 160,24 148,35 156,36"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>

      {/* TAIL 5: OUTER RIGHT S-CURVED TAIL (7 Contiguous Facets) */}
      <g className="kitsune-tail-outer-right">
        <polygon
          points="114,132 126,129 138,126 132,136 122,146"
          fill={fTail("114,132 126,129 138,126 132,136 122,146")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="138,126 152,122 164,118 158,128 148,142"
          fill={fTail("138,126 152,122 164,118 158,128 148,142")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="164,118 174,110 182,102 178,110 172,134"
          fill={fTail("164,118 174,110 182,102 178,110 172,134")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="182,102 188,94 192,88 196,100 188,116"
          fill={fillTip}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
          filter={glowFilter}
        />
      </g>
    </g>
  );
}
