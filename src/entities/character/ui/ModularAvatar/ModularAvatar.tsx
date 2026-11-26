import type { AvatarParams } from "../../model/avatarTypes";
import { AssetCreatureAvatar } from "./creatures/AssetCreatureAvatar";
import { getCreature } from "./creatures/creatureRegistry";
import { FoxAvatar } from "./creatures/fox";
import styles from "./ModularAvatar.module.scss";

export type ModularAvatarSize = "sm" | "md" | "lg" | "xl";

export interface ModularAvatarProps {
  params: AvatarParams;
  size?: ModularAvatarSize | number;
  className?: string;
  silhouetteOnly?: boolean;
  /**
   * Dev-only: render the archived on-body attribute FX v2 (attributeFx/) on the fox. Off everywhere in the
   * app; only the /dev/avatar playground toggles it.
   */
  legacyAttributeFx?: boolean;
}

/**
 * Class renderer dispatch: Explorer → FoxAvatar (zone-annotated fox); every other class → its creature from
 * the registry (wolf, bear, lion, deer) on the shared SVG-asset renderer.
 */
export function ModularAvatar({
  params,
  size = "lg",
  className,
  silhouetteOnly = false,
  legacyAttributeFx = false,
}: ModularAvatarProps) {
  const isSilhouette = silhouetteOnly || Boolean(params.silhouetteOnly);

  const containerClasses = [
    styles.avatarContainer,
    typeof size === "string" ? styles[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const customStyle =
    typeof size === "number"
      ? { width: `${size}px`, height: `${Math.round(size * 1.2)}px` }
      : undefined;

  const creature = getCreature(params.evolution.classArchetype);

  return (
    <div className={containerClasses} style={customStyle}>
      {creature ? (
        <AssetCreatureAvatar creature={creature} params={params} isSilhouette={isSilhouette} />
      ) : (
        <FoxAvatar
          params={params}
          isSilhouette={isSilhouette}
          legacyAttributeFx={legacyAttributeFx}
        />
      )}
    </div>
  );
}
