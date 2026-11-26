export interface CreatureAuraProps {
  /** peak opacity (tier FX × aspect intensity); ≤ 0 → nothing rendered */
  opacity: number;
  /** radius in canvas px; ≤ 0 → nothing rendered */
  radius: number;
  /** id of the radialGradient to fill with */
  gradientId: string;
}

/**
 * CreatureAura — ambient energy aura under the creature, centred on the canvas point (100, 120), with a
 * slow breathing opacity pulse. Colour comes from the radial gradient (aspect colour or neutral).
 */
export function CreatureAura({ opacity, radius, gradientId }: CreatureAuraProps) {
  if (opacity <= 0 || radius <= 0) return null;

  const minOpacity = (opacity * 0.9).toFixed(3);
  const maxOpacity = opacity.toFixed(3);

  return (
    <g className="creature-aura">
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
