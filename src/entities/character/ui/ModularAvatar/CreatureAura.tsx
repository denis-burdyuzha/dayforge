import type { AvatarParams } from "../../model/avatarTypes";

export interface CreatureAuraProps {
  params: AvatarParams;
  overrideOpacity?: number;
  overrideRadius?: number;
  /** id of the radialGradient to fill with (default: creature-aura-radial) */
  gradientId?: string;
}

/**
 * CreatureAura — Ambient Energy Aura rendered underneath the avatar canvas center (100, 120).
 * Uses radialGradient (#38bdf8 -> transparent) with smooth breathing opacity pulse animation.
 */
export function CreatureAura({
  params,
  overrideOpacity,
  overrideRadius,
  gradientId = "creature-aura-radial",
}: CreatureAuraProps) {
  const { effects, evolution } = params;
  const auraEffect = effects.find((e) => e.type === "aura");

  const opacity = overrideOpacity !== undefined ? overrideOpacity : (auraEffect?.intensity ?? 0);
  const radius =
    overrideRadius !== undefined
      ? overrideRadius
      : evolution.tier === 5
        ? 80
        : evolution.tier === 4
          ? 70
          : 60;

  if (opacity <= 0 || radius <= 0) return null;

  const minOpacity = (opacity * 0.9).toFixed(3);
  const maxOpacity = opacity.toFixed(3);

  return (
    <g className="creature-aura">
      {/* Outer ambient glow circle centered at (100, 120) */}
      <circle cx="100" cy="120" r={radius} fill={`url(#${gradientId})`} opacity={opacity}>
        <animate
          attributeName="opacity"
          values={`${maxOpacity};${minOpacity};${maxOpacity}`}
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}
