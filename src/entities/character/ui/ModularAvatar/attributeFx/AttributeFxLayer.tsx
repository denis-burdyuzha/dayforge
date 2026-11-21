/**
 * AttributeFxLayer — assembles the 7 universal attribute effects.
 *
 * Layer order (see FoxAvatar / any creature avatar):
 *   background → layer="back"  (SocialFx, under the asset)
 *   asset body
 *   layer="front": StrengthFx, EnduranceFx, CreativityFx, IntelligenceFx (asset space),
 *                  FocusFx (eye glints + canvas vignette, canvas space)
 *   layer="overlay": DisciplineFx (HTML/CSS-3D crystals, foreground)
 */

import type React from "react";

import { CreativityFx } from "./CreativityFx";
import { DisciplineFx } from "./DisciplineFx";
import { EnduranceFx } from "./EnduranceFx";
import { FocusFx } from "./FocusFx";
import type { FxContext } from "./fxContext";
import { IntelligenceFx } from "./IntelligenceFx";
import { SocialFx } from "./SocialFx";
import { StrengthFx } from "./StrengthFx";

export type AttributeFxLayerKind = "back" | "front" | "overlay";

export function AttributeFxLayer({
  ctx,
  layer,
}: {
  ctx: FxContext;
  layer: AttributeFxLayerKind;
}): React.ReactElement {
  if (layer === "overlay") return <DisciplineFx ctx={ctx} />;

  if (layer === "back") {
    return (
      <g className="attr-fx-back" style={{ pointerEvents: "none" }}>
        <SocialFx ctx={ctx} />
      </g>
    );
  }

  const { tx, ty, scale } = ctx.transform;
  return (
    <g className="attr-fx-front" style={{ pointerEvents: "none" }}>
      <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
        <StrengthFx ctx={ctx} />
        <EnduranceFx ctx={ctx} />
        <CreativityFx ctx={ctx} />
        <IntelligenceFx ctx={ctx} />
      </g>
      <FocusFx ctx={ctx} />
    </g>
  );
}
