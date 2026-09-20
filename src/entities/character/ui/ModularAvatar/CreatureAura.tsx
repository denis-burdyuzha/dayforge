import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureAura({ params }: { params: AvatarParams }) {
  const { effects, evolution } = params;
  const auraEffect = effects.find((e) => e.type === "aura");

  if (!auraEffect || evolution.tier < 3) return null;

  return (
    <g className="creature-aura">
      {/* Outer ambient glow circle */}
      <circle
        cx="100"
        cy="120"
        r={evolution.tier === 5 ? "80" : evolution.tier === 4 ? "70" : "60"}
        fill="url(#creature-aura-radial)"
        opacity={auraEffect.intensity}
      />
    </g>
  );
}
