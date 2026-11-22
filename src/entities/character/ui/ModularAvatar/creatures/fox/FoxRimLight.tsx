import type { AvatarParams } from "../../../../model/avatarTypes";
import { FOX_L1_POLYGONS } from "../../assets/FoxL1AssetData";

/**
 * FoxRimLight — Outer silhouette perimeter rim-light contour.
 *
 * ── Curled (Larval / foxL1.svg asset) ──────────────────────────────────────
 * Instead of hardcoding an approximated polygon path, we duplicate ALL polygons
 * from the actual asset with fill="none" and stroke="#38bdf8".
 *
 * Because we apply the SAME transform as FoxAvatar's asset group
 * (translate(tx, ty) scale(assetScale)), the stroke outlines land on top of
 * every polygon edge, forming a perfect per-polygon glow halo that follows
 * the real low-poly silhouette exactly — no approximation, no misalignment.
 *
 * The outer edges glow brightly because there is no adjacent polygon to cover
 * them; inner shared edges cancel out perceptually (both sides glow equally).
 *
 * ── Quadruped / Bipedal ──────────────────────────────────────────────────────
 * Legacy hand-tuned paths for procedural tiers — untouched.
 */
export function FoxRimLight({
  poseMode = "bipedal",
  assetTransform,
}: {
  params: AvatarParams;
  poseMode?: "curled" | "quadruped" | "bipedal";
  /**
   * For curled pose: the CSS/SVG transform applied to the foxL1 asset group
   * so that the rim-light overlay is perfectly registered with the mesh.
   * Example: "translate(-14.5, -72.5) scale(0.50)"
   */
  assetTransform?: string;
}) {
  // ── 1. CURLED SLEEPING PUP SILHOUETTE (foxL1.svg asset) ─────────────────
  if (poseMode === "curled") {
    return (
      <g
        className="fox-outer-rim-light-curled"
        transform={assetTransform}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="3"          // 3px in asset-space → ~1.5px in viewBox at scale 0.50
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"  // keeps 1.5px apparent width regardless of scale
        filter="url(#avatar-glow-filter)"
        shapeRendering="geometricPrecision"
        opacity="0.85"
      >
        {FOX_L1_POLYGONS.map((poly) => (
          <polygon
            key={`rim-${poly.id}`}
            points={poly.points}
            shapeRendering="geometricPrecision"
          />
        ))}
      </g>
    );
  }

  // ── 2. QUADRUPED WILD FOX SILHOUETTE ────────────────────────────────────
  if (poseMode === "quadruped") {
    return (
      <g
        className="fox-outer-rim-light-quadruped"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.5"
        filter="url(#avatar-glow-filter)"
      >
        {/* Outer silhouette outline of alert standing quadruped fox */}
        <path d="M 132,38 L 145,36 L 152,48 L 158,54 L 174,66 L 176,74 L 168,78 L 156,84 L 142,96 L 138,125 L 134,168 L 130,192 L 118,192 L 124,145 L 102,122 L 88,162 L 84,192 L 72,192 L 76,144 L 52,132 L 28,145 L 10,162 L 12,172 L 24,155 L 48,135 L 75,112 L 98,82 L 120,70 L 128,52 Z" />
      </g>
    );
  }

  // ── 3. BIPEDAL KITSUNE SPIRIT SILHOUETTE ────────────────────────────────
  return (
    <g
      className="fox-outer-rim-light-bipedal"
      fill="none"
      stroke="#38bdf8"
      strokeWidth="1.5"
      filter="url(#avatar-glow-filter)"
    >
      {/* 5 Kitsune Tails Outer Halo Rim Light */}
      <path d="M 8,88 L 4,100 L 12,116 L 28,134 L 52,142 L 62,114 L 38,82 L 34,45 L 40,24 L 52,35 L 48,70 L 72,98 L 92,56 L 95,32 L 100,12 L 105,32 L 108,56 L 128,98 L 152,70 L 148,35 L 160,24 L 166,45 L 162,82 L 138,114 L 148,142 L 172,134 L 188,116 L 196,100 L 192,88 L 182,102 L 164,118 L 138,126 L 114,132 Z" />

      {/* Anthro Body & Head Outer Rim Light */}
      <path d="M 70,14 L 84,46 L 82,58 L 76,64 L 64,90 L 68,104 L 80,128 L 86,155 L 94,166 L 92,192 L 86,206 L 98,206 L 102,206 L 114,206 L 108,192 L 106,166 L 120,128 L 132,104 L 136,90 L 124,64 L 118,58 L 130,14 L 108,40 L 100,32 L 92,40 Z" />
    </g>
  );
}
