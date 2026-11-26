import type { AvatarParams } from "../../model/avatarTypes";

/** Shadow scale per 7-step evolution tier (the former body.scale of the avatar params) */
const TIER_SCALE: Record<AvatarParams["evolution"]["tier"], number> = {
  1: 0.45,
  2: 0.62,
  3: 0.78,
  4: 0.9,
  5: 1.0,
  6: 1.05,
  7: 1.08,
};

/** Ground shadow under the creature: grows with the evolution tier and with Strength (bulk 0..1) */
export function CreatureShadow({ params }: { params: AvatarParams }) {
  const scale = TIER_SCALE[params.evolution.tier];
  const bulk = Math.min(1, Math.max(0, (params.attributeValues.strength - 1) / 17));
  const rx = 35 * scale * (1 + bulk * 0.2);
  const ry = 8 * scale;

  return <ellipse cx="100" cy="212" rx={rx} ry={ry} fill="#000000" opacity="0.35" />;
}
