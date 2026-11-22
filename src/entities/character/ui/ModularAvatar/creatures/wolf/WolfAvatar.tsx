import type React from "react";

import type { AvatarParams } from "../../../../model/avatarTypes";
import { CreatureShadow } from "../../CreatureShadow";
import styles from "../../ModularAvatar.module.scss";
import { getWolfTierConfig } from "./wolfEvolutionConfig";

export interface WolfAvatarProps {
  params: AvatarParams;
  isSilhouette?: boolean;
}

/**
 * WolfAvatar (Warrior) — level-driven 5-tier low-poly asset pipeline, same as the fox: one SVG asset per
 * tier rendered with its own colours, fitted into the 200 × 240 canvas by the fox rule.
 */
export const WolfAvatar: React.FC<WolfAvatarProps> = ({ params, isSilhouette = false }) => {
  const level = params.evolution.level ?? 1;
  const tierConfig = getWolfTierConfig(level);
  const AssetComponent = tierConfig.component;
  const bodyTransform = `translate(${tierConfig.tx}, ${tierConfig.ty}) scale(${tierConfig.scale})`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgRoot}
        aria-label={`Dayforge Warrior Wolf Avatar (${tierConfig.name} Lvl ${level})`}
        role="img"
        overflow="visible"
      >
        {!isSilhouette && <CreatureShadow params={params} />}
        <g
          className={isSilhouette ? "" : "avatar-body-group"}
          style={isSilhouette ? { fill: "#020617", stroke: "none" } : undefined}
        >
          <g transform={bodyTransform}>
            <AssetComponent isSilhouette={isSilhouette} />
          </g>
        </g>
      </svg>
    </div>
  );
};
