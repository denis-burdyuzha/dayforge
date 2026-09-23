import type { AvatarParams } from "../../../../model/avatarTypes";
import { getFacetFill } from "../../avatarShading";

/**
 * FoxLimbs — 3D Volumetric Low-Poly Fox Limbs (Anatomical Joints & Grounded Paws).
 *
 * Curled: Front paw folded under sleeping chin.
 * Quadruped: 4 full 3D volumetric legs with front, side, and shadow facets (elbows, knees, hocks, paws on ground Y=190-192).
 * Bipedal: Slender anthro legs + graceful hands met in front of chest/abdomen.
 */
export function FoxLimbs({
  params,
  isSilhouette = false,
  poseMode = "bipedal",
  layer = "front",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
  layer?: "back" | "front" | "all";
}) {
  const { palette } = params;

  const wireStroke = isSilhouette ? "none" : "rgba(56, 189, 248, 0.25)";
  const strokeWidth = "0.4";
  const fLimb = (pts: string, isHl = false) =>
    getFacetFill("limbs", pts, palette, isSilhouette, isHl);
  const handFill = isSilhouette ? "#020617" : "url(#fox-amber-flame-grad)";
  const glowFilter = !isSilhouette ? "url(#avatar-glow-filter)" : undefined;

  // ── 1. CURLED FRONT PAW UNDER CHIN ──
  if (poseMode === "curled") {
    if (layer === "back") return null;
    return (
      <g className="fox-limbs-curled-anatomical-3d" strokeLinejoin="round">
        {/* Sleeping Paw under chin */}
        <polygon
          points="54,128 62,126 70,130 60,134"
          fill={fLimb("54,128 62,126 70,130 60,134", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="62,126 72,128 76,134 68,136"
          fill={fLimb("62,126 72,128 76,134 68,136")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="60,134 70,130 66,138 56,138"
          fill={fLimb("60,134 70,130 66,138 56,138")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 2. QUADRUPED 4 VOLUMETRIC 3D LEGS (Grounded Y=190-192) ──
  if (poseMode === "quadruped") {
    if (layer === "back") {
      // Shadowed Left Legs (Rendered behind body layer)
      return (
        <g className="fox-limbs-quadruped-back-3d" strokeLinejoin="round">
          {/* Front Left Leg: Shoulder -> Elbow -> Forearm -> Wrist -> Paw */}
          <polygon
            points="135,115 142,122 138,138 130,126"
            fill={fLimb("135,115 142,122 138,138 130,126")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="138,138 136,155 130,170 126,152"
            fill={fLimb("138,138 136,155 130,170 126,152")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="130,170 134,182 130,192 124,180"
            fill={fLimb("130,170 134,182 130,192 124,180")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />

          {/* Hind Left Leg: Thigh -> Knee -> Hock -> Paw */}
          <polygon
            points="90,115 82,128 76,144 84,132"
            fill={fLimb("90,115 82,128 76,144 84,132")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="76,144 84,158 82,172 72,160"
            fill={fLimb("76,144 84,158 82,172 72,160")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="82,172 84,182 84,192 76,182"
            fill={fLimb("82,172 84,182 84,192 76,182")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="84,192 90,192 86,194 80,194"
            fill={fLimb("84,192 90,192 86,194 80,194")}
            stroke={wireStroke}
            strokeWidth={strokeWidth}
          />
        </g>
      );
    }

    // Front Right Legs (Light-side, rendered in front of body)
    return (
      <g className="fox-limbs-quadruped-front-3d" strokeLinejoin="round">
        {/* Front Right Leg: Shoulder Cap -> Biceps -> Elbow -> Forearm -> Wrist -> Grounded Paw */}
        <polygon
          points="130,120 138,132 134,148 124,136"
          fill={fLimb("130,120 138,132 134,148 124,136", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="138,132 142,146 136,162 134,148"
          fill={fLimb("138,132 142,146 136,162 134,148")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="134,148 136,162 130,178 124,164"
          fill={fLimb("134,148 136,162 130,178 124,164", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="130,178 132,186 128,192 122,182"
          fill={fLimb("130,178 132,186 128,192 122,182", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="128,192 134,192 130,194 122,194"
          fill={fLimb("128,192 134,192 130,194 122,194")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Hind Right Leg: Pelvic Joint -> Upper Thigh -> Knee Joint -> Calf -> Hock -> Grounded Paw */}
        <polygon
          points="86,124 76,134 68,144 80,136"
          fill={fLimb("86,124 76,134 68,144 80,136", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="68,144 78,154 74,168 64,158"
          fill={fLimb("68,144 78,154 74,168 64,158")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="78,154 84,164 78,178 74,168"
          fill={fLimb("78,154 84,164 78,178 74,168", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="78,178 78,186 76,192 70,184"
          fill={fLimb("78,178 78,186 76,192 70,184", true)}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="76,192 82,192 78,194 70,194"
          fill={fLimb("76,192 82,192 78,194 70,194")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // ── 3. BIPEDAL ANTHRO KITSUNE LEGS & ARMS ──
  if (layer === "back") {
    // Grounded Anthro Legs
    return (
      <g className="fox-limbs-bipedal-back-3d" strokeLinejoin="round">
        {/* Left Leg: Thigh -> Knee -> Calf -> Ankle -> Grounded Foot (Y=206) */}
        <polygon
          points="84,134 88,148 90,162 80,148"
          fill={fLimb("84,134 88,148 90,162 80,148")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="90,162 96,170 92,184 84,176"
          fill={fLimb("90,162 96,170 92,184 84,176")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="96,170 94,184 94,196 88,184"
          fill={fLimb("96,170 94,184 94,196 88,184")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="94,196 98,202 96,206 90,202"
          fill={fLimb("94,196 98,202 96,206 90,202")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="88,206 98,206 94,208 86,208"
          fill={fLimb("88,206 98,206 94,208 86,208")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />

        {/* Right Leg: Thigh -> Knee -> Calf -> Ankle -> Grounded Foot (Y=206) */}
        <polygon
          points="116,134 112,148 110,162 120,148"
          fill={fLimb("116,134 112,148 110,162 120,148")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="110,162 104,170 108,184 116,176"
          fill={fLimb("110,162 104,170 108,184 116,176")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="104,170 106,184 106,196 112,184"
          fill={fLimb("104,170 106,184 106,196 112,184")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="106,196 102,202 104,206 110,202"
          fill={fLimb("106,196 102,202 104,206 110,202")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
        <polygon
          points="102,206 112,206 106,208 100,208"
          fill={fLimb("102,206 112,206 106,208 100,208")}
          stroke={wireStroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  // Graceful Anthro Arms Met at Chest / Abdomen
  return (
    <g className="fox-limbs-bipedal-front-3d" strokeLinejoin="round">
      {!isSilhouette && (
        /* Energy aura between hands */
        <circle cx="100" cy="98" r="16" fill="url(#fox-hand-glow-grad)" />
      )}
      {/* Right Arm: Shoulder -> Biceps -> Elbow -> Forearm -> Wrist */}
      <polygon
        points="124,76 132,86 130,98 122,90"
        fill={fLimb("124,76 132,86 130,98 122,90", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="130,98 118,94 106,90 118,86"
        fill={fLimb("130,98 118,94 106,90 118,86", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="106,90 98,88 102,84 110,86"
        fill={fLimb("106,90 98,88 102,84 110,86", true)}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      {/* Right Hand Gesture */}
      <polygon
        points="98,88 92,84 96,80 100,84"
        fill={handFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
        filter={glowFilter}
      />

      {/* Left Arm: Shoulder -> Biceps -> Elbow -> Forearm -> Wrist */}
      <polygon
        points="76,76 68,86 70,98 78,90"
        fill={fLimb("76,76 68,86 70,98 78,90")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="70,98 84,102 96,104 84,98"
        fill={fLimb("70,98 84,102 96,104 84,98")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points="96,104 104,106 100,112 94,108"
        fill={fLimb("96,104 104,110 100,112 94,108")}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
      />
      {/* Left Hand Gesture */}
      <polygon
        points="104,106 110,108 106,114 100,112"
        fill={handFill}
        stroke={wireStroke}
        strokeWidth={strokeWidth}
        filter={glowFilter}
      />
    </g>
  );
}
