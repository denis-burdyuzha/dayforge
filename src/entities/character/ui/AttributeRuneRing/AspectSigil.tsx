import { ATTRIBUTE_COLORS, type AttributeValues, getAspect } from "../../model/aspect";
import styles from "./AspectSigil.module.scss";
import { RUNE_FRAME_POINTS, RUNE_GLYPHS, RUNE_TICKS } from "./runeGlyphs";
import { getRuneVisual, getSigilOpacity, RUNE_SIZE } from "./runeLayout";

export interface AspectSigilProps {
  /** attribute values 1..18 — the sigil shows the aspect (strict maximum ≥ 3); none → nothing */
  attributes: AttributeValues;
  /** full diameter of the sigil incl. the 18-ticks, px (0.78 × rune-ring area) */
  diameter: number;
  className?: string;
}

/**
 * Sigil viewBox: glyph 0..24 + hexagon frame (r 15) + ticks (to r 19.5) → ±20 around the centre (12,12).
 * The diameter is the WHOLE sigil incl. the 18-ticks, so they never reach the rune ring (with the 32-unit
 * rune box the top tick overlapped the Strength rune).
 */
const VIEW = { min: -8, size: 40 };
/** Rune line widths in viewBox units (same as AttributeRune) — scaled with the sigil, never under 2px */
const GLYPH_STROKE = 2;
const FRAME_STROKE = 1.5;

/**
 * AspectSigil — the aspect rune drawn large behind the avatar, centred on the avatar area. Same states as
 * AttributeRune (hexagon frame from 6, glow from 12, ticks at 18), scaled to the size; colour = aspect,
 * opacity 0.18 → 0.45. Rotates slowly (60 s per turn, clockwise; off with prefers-reduced-motion).
 */
export function AspectSigil({ attributes, diameter, className }: AspectSigilProps) {
  const aspect = getAspect(attributes);
  if (!aspect || diameter <= 0) return null;
  const value = attributes[aspect] ?? 3;
  const visual = getRuneVisual(value);
  const color = ATTRIBUTE_COLORS[aspect];
  const pxPerUnit = diameter / VIEW.size;
  // proportional thickness, but at least 2px on screen
  const unit = (w: number) => Math.max(w, 2 / pxPerUnit);
  // glow radius scales like the rune: rune glow is defined for a 28px rune whose viewBox is 32 units
  const glowPx = (visual.glow * pxPerUnit * 32) / RUNE_SIZE;

  return (
    <div
      className={[styles.sigil, className ?? ""].filter(Boolean).join(" ")}
      style={{ width: diameter, height: diameter, opacity: getSigilOpacity(value) }}
      data-testid="aspect-sigil"
      data-aspect={aspect}
      data-level={visual.level}
      aria-hidden="true"
    >
      <svg
        className={styles.spin}
        viewBox={`${VIEW.min} ${VIEW.min} ${VIEW.size} ${VIEW.size}`}
        width={diameter}
        height={diameter}
        style={
          glowPx > 0 ? { filter: `drop-shadow(0 0 ${glowPx.toFixed(1)}px ${color})` } : undefined
        }
      >
        <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
          <g strokeWidth={unit(GLYPH_STROKE)}>
            {RUNE_GLYPHS[aspect].map((shape, i) => {
              switch (shape.kind) {
                case "polygon":
                  return <polygon key={i} points={shape.points} />;
                case "polyline":
                  return <polyline key={i} points={shape.points} />;
                case "line":
                  return <line key={i} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
                case "circle":
                  return (
                    <circle
                      key={i}
                      cx={shape.cx}
                      cy={shape.cy}
                      r={shape.r}
                      {...(shape.filled ? { fill: color, stroke: "none" } : {})}
                    />
                  );
              }
            })}
          </g>
          {visual.frame && (
            <polygon
              points={RUNE_FRAME_POINTS}
              strokeWidth={unit(FRAME_STROKE)}
              opacity={visual.frameOpacity}
            />
          )}
          {visual.ticks &&
            RUNE_TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                strokeWidth={unit(FRAME_STROKE)}
              />
            ))}
        </g>
      </svg>
    </div>
  );
}
