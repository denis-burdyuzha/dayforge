import type { CSSProperties } from "react";

import { ATTRIBUTE_COLORS, type AttributeValues, getAspect } from "../../model/aspect";
import styles from "./AspectSigil.module.scss";
import { getGlyphExtent, RUNE_GLYPHS } from "./runeGlyphs";
import { getSigilGlowPx, getSigilOpacity, getSigilStrokePx } from "./runeLayout";

export interface AspectSigilProps {
  /** attribute values 1..18 — the sigil shows the aspect (strict maximum ≥ 3); none → nothing */
  attributes: AttributeValues;
  /** diameter of the circle the glyph is fitted into, px (0.78 × rune-ring area) */
  diameter: number;
  className?: string;
}

/**
 * AspectSigil — ONLY the aspect glyph, drawn large behind the avatar and centred on it. No hexagon frame and
 * no ticks (identical for every aspect, they dominated the shape), no rotation (it hid the shape).
 * The glyph is fitted into the circle of `diameter` by its own centre and outer radius, so its edges stick
 * out past the fox silhouette but never reach the rune ring. Lines 3 → 5px, glow 6px from 12 / 10px at 18,
 * opacity 0.18 → 0.45 «breathing» ±20% over 5 s (CSS; off with prefers-reduced-motion).
 */
export function AspectSigil({ attributes, diameter, className }: AspectSigilProps) {
  const aspect = getAspect(attributes);
  if (!aspect || diameter <= 0) return null;
  const value = attributes[aspect] ?? 3;
  const color = ATTRIBUTE_COLORS[aspect];
  const shapes = RUNE_GLYPHS[aspect];
  const stroke = getSigilStrokePx(value);
  const glow = getSigilGlowPx(value);
  const opacity = getSigilOpacity(value);

  // Fit: the glyph's outer radius (+ half the line width) = diameter / 2
  const { cx, cy, radius } = getGlyphExtent(shapes);
  const half = (radius * (diameter / 2)) / (diameter / 2 - stroke / 2);
  const viewBox = `${cx - half} ${cy - half} ${half * 2} ${half * 2}`;

  return (
    <div
      className={[styles.sigil, className ?? ""].filter(Boolean).join(" ")}
      style={
        { width: diameter, height: diameter, opacity, "--sigil-opacity": opacity } as CSSProperties
      }
      data-testid="aspect-sigil"
      data-aspect={aspect}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        viewBox={viewBox}
        width={diameter}
        height={diameter}
        style={glow > 0 ? { filter: `drop-shadow(0 0 ${glow}px ${color})` } : undefined}
      >
        <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
          {shapes.map((shape, i) => {
            const line = { vectorEffect: "non-scaling-stroke" as const, strokeWidth: stroke };
            switch (shape.kind) {
              case "polygon":
                return <polygon key={i} points={shape.points} {...line} />;
              case "polyline":
                return <polyline key={i} points={shape.points} {...line} />;
              case "line":
                return (
                  <line key={i} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} {...line} />
                );
              case "circle":
                return shape.filled ? (
                  <circle
                    key={i}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill={color}
                    stroke="none"
                  />
                ) : (
                  <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} {...line} />
                );
            }
          })}
        </g>
      </svg>
    </div>
  );
}
