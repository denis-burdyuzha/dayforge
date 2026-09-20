import type { AvatarParams } from "../../model/avatarTypes";

export function CreatureShadow({ params }: { params: AvatarParams }) {
  const { body } = params;
  // Scale shadow with evolution stage scale
  const rx = 35 * body.scale * (1 + body.bulk * 0.2);
  const ry = 8 * body.scale;

  return <ellipse cx="100" cy="212" rx={rx} ry={ry} fill="#000000" opacity="0.35" />;
}
