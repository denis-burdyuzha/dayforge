import type { AvatarParams } from "../../../../model/avatarTypes";

/**
 * FoxFace — Anatomical Eye Socket Planes & Amber Almond Lenses.
 *
 * Curled: 3/4 sleeping almond eyes sitting inside facial socket planes over front paw.
 * Quadruped: Alert right profile almond eye recessed in facial orbital socket.
 * Bipedal: Slanted almond amber lenses (#ff7700 -> #ffcc00), dark socket mask, pupil slit, and specular white dot.
 */
export function FoxFace({
  isSilhouette = false,
  poseMode = "bipedal",
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
  poseMode?: "curled" | "quadruped" | "bipedal";
}) {
  const wireStroke = isSilhouette ? "none" : "rgba(56, 189, 248, 0.25)";
  const eyeLensFill = isSilhouette ? "#020617" : "url(#fox-eye-amber-grad)";
  const noseFill = isSilhouette ? "#020617" : "#080d17";

  // ── 1. CURLED SLEEPING PUP EYES ──
  if (poseMode === "curled") {
    return (
      <g className="fox-face-curled-eyes">
        {/* Left Eye: Dark socket plane */}
        <polygon
          points="64,106 74,102 80,110 70,113"
          fill="#080d17"
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        {/* Left Eye: Almond Amber Lens */}
        <polygon
          points="67,106 74,103 78,109 71,110"
          fill={eyeLensFill}
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        <polygon points="70,107 75,105 76,108 72,109" fill="#ffea70" opacity="0.65" />
        {/* Left Pupil & Specular Dot */}
        <polygon points="73,106 74,109 72,109" fill="#120800" />
        <circle cx="71.5" cy="106.5" r="1.1" fill="#ffffff" />

        {/* Right Eye: Dark socket plane */}
        <polygon
          points="80,108 88,103 93,110 85,113"
          fill="#080d17"
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        {/* Right Eye: Almond Amber Lens */}
        <polygon
          points="82,108 87,105 91,110 85,111"
          fill={eyeLensFill}
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        <polygon points="84,108 88,106 89,109 85,110" fill="#ffea70" opacity="0.65" />
        {/* Right Pupil & Specular Dot */}
        <polygon points="86,107 87,110 85,110" fill="#120800" />
        <circle cx="84.5" cy="107.5" r="1.1" fill="#ffffff" />

        {/* Nose Tip */}
        <polygon
          points="60,132 66,136 62,137"
          fill={noseFill}
          stroke={wireStroke}
          strokeWidth="0.4"
        />
      </g>
    );
  }

  // ── 2. QUADRUPED PROFILE EYE (Recessed in Facial Orbital Socket) ──
  if (poseMode === "quadruped") {
    return (
      <g className="fox-face-quadruped-eye">
        {/* Profile Orbital Socket Plane */}
        <polygon
          points="144,58 152,52 160,58 152,64"
          fill="#080d17"
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        {/* Almond Amber Lens */}
        <polygon
          points="147,58 152,55 157,58 152,61"
          fill={eyeLensFill}
          stroke={wireStroke}
          strokeWidth="0.4"
        />
        <polygon points="150,58 153,56 155,58 152,60" fill="#ffea70" opacity="0.65" />
        {/* Pupil Slit & Specular Dot */}
        <polygon points="152,56 153,60 151,60" fill="#120800" />
        <circle cx="150" cy="57.5" r="1.1" fill="#ffffff" />

        {/* Snout Tip */}
        <polygon
          points="174,66 176,74 170,78"
          fill={noseFill}
          stroke={wireStroke}
          strokeWidth="0.4"
        />
      </g>
    );
  }

  // ── 3. BIPEDAL FRONTAL EYES ──
  return (
    <g className="fox-face-bipedal-eyes">
      {/* Left Slanted Eye: Orbital Socket Plane */}
      <polygon
        points="82,56 90,49 100,56 92,63"
        fill="#080d17"
        stroke={wireStroke}
        strokeWidth="0.4"
      />
      {/* Left Slanted Eye: Amber Lens */}
      <polygon
        points="86,56 90,51 96,56 92,61"
        fill={eyeLensFill}
        stroke={wireStroke}
        strokeWidth="0.4"
      />
      <polygon points="89,55 91,52 94,56 91,59" fill="#ffea70" opacity="0.65" />
      {/* Left Pupil Slit & Specular Dot */}
      <polygon points="91,53 92,58 90,58" fill="#120800" />
      <circle cx="89" cy="54.5" r="1.2" fill="#ffffff" />

      {/* Right Slanted Eye: Orbital Socket Plane */}
      <polygon
        points="100,56 110,49 118,56 110,63"
        fill="#080d17"
        stroke={wireStroke}
        strokeWidth="0.4"
      />
      {/* Right Slanted Eye: Amber Lens */}
      <polygon
        points="104,56 110,51 114,56 110,61"
        fill={eyeLensFill}
        stroke={wireStroke}
        strokeWidth="0.4"
      />
      <polygon points="106,55 109,52 111,56 109,59" fill="#ffea70" opacity="0.65" />
      {/* Right Pupil Slit & Specular Dot */}
      <polygon points="109,53 110,58 108,58" fill="#120800" />
      <circle cx="111" cy="54.5" r="1.2" fill="#ffffff" />

      {/* Nose Tip */}
      <polygon points="97,78 103,78 100,80" fill={noseFill} stroke={wireStroke} strokeWidth="0.4" />
    </g>
  );
}
