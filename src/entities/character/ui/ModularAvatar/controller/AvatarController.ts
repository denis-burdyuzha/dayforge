import type { AvatarParams } from "@/entities/character/model/avatarTypes";
import {
  FOX_L1_NODE_BINDING_MAP,
  type AvatarBodyRegion,
  type SemanticBodyRegionBinding,
} from "../registry/AvatarNodeRegistry";

export interface AvatarTransformState {
  scale: number;
  bulk: number;
  tiltAngle: number;
  hoverOffsetY: number;
  viewBox: string;
}

export class AvatarController {
  private params: AvatarParams;

  constructor(params: AvatarParams) {
    this.params = params;
  }

  public getTargetNode(region: AvatarBodyRegion): SemanticBodyRegionBinding {
    return FOX_L1_NODE_BINDING_MAP[region];
  }

  public getTransformState(): AvatarTransformState {
    const { body, posture } = this.params;
    return {
      scale: body.scale,
      bulk: body.bulk,
      tiltAngle: posture.tiltAngle,
      hoverOffsetY: posture.hoverOffsetY ?? 0,
      // Default viewBox matching foxL1 SVG Asset dimensions (468 x 767) or standard avatar viewBox
      viewBox: "0 0 468 767",
    };
  }

  public getGlowParams() {
    const { palette, evolution } = this.params;
    const tier = evolution.tier;
    return {
      glowColor: palette.glow,
      accentColor: palette.accent,
      strokeWidth: tier >= 5 ? 2.2 : tier >= 3 ? 1.6 : 1.2,
      glowBlur: tier >= 6 ? 6.0 : 3.5,
    };
  }

  public getRegionFill(region: AvatarBodyRegion): string {
    const { palette, endurance, social } = this.params;

    switch (region) {
      case "head":
      case "snout":
      case "ears":
        return palette.primaryBody;
      case "torso":
      case "chest":
        return endurance.chestDepth > 0.6 ? palette.primaryBody : palette.secondaryBody;
      case "collar":
        return social.crestSize > 0.5 ? palette.bellyTone : palette.secondaryBody;
      case "limbsFront":
      case "limbsBack":
        return palette.secondaryBody;
      case "tail":
        return palette.primaryBody;
      case "tailTip":
        return "url(#fox-amber-flame-grad)";
      case "eyes":
        return "url(#fox-eye-amber-grad)";
      case "markings":
        return palette.markingColor || palette.accent;
      default:
        return palette.primaryBody;
    }
  }
}
