import type { AvatarParams } from "../../../../model/avatarTypes";

export function WolfFace({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, face, evolution } = params;
  const { expression, mouthVariant } = face;
  const tier = evolution.tier;

  const eyeNarrow =
    expression === "focused" || expression === "determined" || expression === "berserk";
  const eyeMythic = expression === "mythic";

  // Left eye diamond points — centered at (86, 90)
  const leftEyeOuter = eyeNarrow ? "82,90 86,87 90,90 86,92" : "80,90 86,86 92,90 86,94";

  const leftIris = eyeNarrow ? "83,90 86,88 89,90 86,91" : "82,90 86,87 90,90 86,93";

  // Right eye diamond points — centered at (114, 90)
  const rightEyeOuter = eyeNarrow ? "110,90 114,87 118,90 114,92" : "108,90 114,86 120,90 114,94";

  const rightIris = eyeNarrow ? "111,90 114,88 117,90 114,91" : "110,90 114,87 118,90 114,93";

  const eyeOuterFill = isSilhouette ? "#020617" : expression === "berserk" ? "#240005" : "#0f0408";

  const irisFill = isSilhouette ? "#020617" : eyeMythic ? "#fff7ed" : palette.eyeColor;

  const showFocusRing = face.hasFocusRing && !isSilhouette;
  const showFangs =
    !isSilhouette &&
    (mouthVariant === "snarl" || mouthVariant === "fangs" || expression === "berserk");

  return (
    <g className="wolf-face">
      {showFocusRing && tier >= 5 && (
        <ellipse
          cx="100"
          cy="90"
          rx="20"
          ry="8"
          fill="none"
          stroke={palette.accent}
          strokeWidth="0.5"
          strokeOpacity="0.5"
          filter="url(#avatar-glow-filter)"
        />
      )}

      {/* Left Eye */}
      <g className="wolf-left-eye">
        <polygon
          points={leftEyeOuter}
          fill={eyeOuterFill}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.2"
        />
        <polygon points={leftIris} fill={irisFill} />
        {!isSilhouette && (
          <polygon
            points="85,90 86,89 87,90 86,91"
            fill="#fff7ed"
            filter="url(#avatar-glow-filter)"
          />
        )}
      </g>

      {/* Right Eye */}
      <g className="wolf-right-eye">
        <polygon
          points={rightEyeOuter}
          fill={eyeOuterFill}
          stroke={isSilhouette ? "none" : palette.accent}
          strokeWidth="1.2"
        />
        <polygon points={rightIris} fill={irisFill} />
        {!isSilhouette && (
          <polygon
            points="113,90 114,89 115,90 114,91"
            fill="#fff7ed"
            filter="url(#avatar-glow-filter)"
          />
        )}
      </g>

      {/* Dark Muzzle Nose */}
      <polygon
        points="96,104 104,104 100,109"
        fill={isSilhouette ? "#020617" : palette.accent}
        stroke={isSilhouette ? "none" : palette.secondaryBody}
        strokeWidth="1"
      />

      {/* Snarl Fangs */}
      {showFangs && (
        <g className="wolf-fangs">
          <line x1="96" y1="110" x2="94" y2="114" stroke={palette.accent} strokeWidth="1.2" />
          <line x1="104" y1="110" x2="106" y2="114" stroke={palette.accent} strokeWidth="1.2" />
        </g>
      )}
    </g>
  );
}
