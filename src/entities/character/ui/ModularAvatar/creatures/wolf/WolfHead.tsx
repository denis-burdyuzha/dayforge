import type { AvatarParams } from "../../../../model/avatarTypes";
import { WolfEars } from "./WolfEars";

export function WolfHead({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, body } = params;

  // ── Wolf head is broader and more massive than fox ──
  // Head center: Y=92, Cranium: Y=68..108 (40px tall)
  // Wide jaw: X=82..118 (36px width) — broader than fox (32px)
  // Muzzle is blunt and heavy, NOT pointed like fox

  const hScale = body.headScale ?? 1.0;

  const wireStroke = isSilhouette ? "none" : palette.accent;
  const facetBaseFill = isSilhouette ? "#020617" : "rgba(66, 24, 40, 0.5)";
  const facetShadeFill = isSilhouette ? "#020617" : "rgba(36, 13, 22, 0.7)";
  const facetHighlightFill = isSilhouette ? "#020617" : "rgba(255, 107, 0, 0.10)";
  const muzzleFill = isSilhouette ? "#020617" : "rgba(92, 32, 53, 0.45)";

  return (
    <g className="wolf-head">
      {/* Scale entire head + ears around neck anchor (100, 110) */}
      <g transform={`translate(100, 110) scale(${hScale}) translate(-100, -110)`}>
        {/* Ears behind cranium */}
        <WolfEars params={params} isSilhouette={isSilhouette} />

        {/* ── Low-Poly Wolf Cranium — Wide Wedge with Heavy Brow ── */}
        <g className="lowpoly-wolf-head-mesh" strokeLinejoin="round">
          {/* 1. Broad Crown Top (C=100,68 | TL=82,78 | TR=118,78) */}
          <polygon
            points="100,68 82,78 100,85"
            fill={facetHighlightFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="100,68 118,78 100,85"
            fill={facetHighlightFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />

          {/* 2. Heavy Brow Ridge (BL=80,85 | BR=120,85) */}
          <polygon
            points="82,78 80,88 100,85"
            fill={facetBaseFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="118,78 120,88 100,85"
            fill={facetBaseFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />

          {/* 3. Broad Cheekbones (CL=78,96 | CR=122,96) */}
          <polygon
            points="80,88 78,98 100,85"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="120,88 122,98 100,85"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />

          {/* 4. Wide Blunt Muzzle Bridge (M=100,105) */}
          <polygon
            points="100,85 80,88 96,105"
            fill={muzzleFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="100,85 120,88 104,105"
            fill={muzzleFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />

          {/* 5. Muzzle Side Flats */}
          <polygon
            points="80,88 78,98 96,105"
            fill={facetBaseFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="120,88 122,98 104,105"
            fill={facetBaseFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />

          {/* 6. Heavy Jaw (JL=82,104 | JR=118,104 | Chin=100,108) */}
          <polygon
            points="78,98 82,106 96,105"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="122,98 118,106 104,105"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          {/* Chin plate */}
          <polygon
            points="82,106 100,110 118,106"
            fill={facetBaseFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="96,105 100,110 82,106"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="104,105 100,110 118,106"
            fill={facetShadeFill}
            stroke={wireStroke}
            strokeWidth="1.3"
          />
        </g>
      </g>
    </g>
  );
}
