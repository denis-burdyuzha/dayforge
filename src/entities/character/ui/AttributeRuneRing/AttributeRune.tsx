import { ATTRIBUTE_COLORS } from "../../model/aspect";
import type { AttributeKey } from "../../model/types";
import { type GlyphShape, RUNE_FRAME_POINTS, RUNE_GLYPHS, RUNE_TICKS } from "./runeGlyphs";
import { getRuneVisual, RUNE_INACTIVE_COLOR, RUNE_SIZE } from "./runeLayout";

export interface AttributeRuneProps {
  attribute: AttributeKey;
  /** attribute value 1..18 — selects the state (colour, frame, glow, ticks) */
  value: number;
  /** rendered size, px (ring: 28; glow scales proportionally) */
  size?: number;
  /** glyph only, full attribute colour, no frame / glow / ticks (skill icons) */
  plain?: boolean;
  className?: string;
}

function Glyph({ shape, color }: { shape: GlyphShape; color: string }) {
  switch (shape.kind) {
    case "polygon":
      return <polygon points={shape.points} />;
    case "polyline":
      return <polyline points={shape.points} />;
    case "line":
      return <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
    case "circle":
      return (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          {...(shape.filled ? { fill: color, stroke: "none" } : {})}
        />
      );
  }
}

/**
 * AttributeRune — one attribute rune in its value state. Shared by the rune ring, attribute cards and
 * skill cards so a rune looks the same everywhere. Decorative (aria-hidden): the caller labels it.
 */
export function AttributeRune({
  attribute,
  value,
  size = RUNE_SIZE,
  plain = false,
  className,
}: AttributeRuneProps) {
  const state = getRuneVisual(value);
  const visual = plain
    ? { ...state, active: true, opacity: 1, frame: false, glow: 0, ticks: false }
    : state;
  const color = visual.active ? ATTRIBUTE_COLORS[attribute] : RUNE_INACTIVE_COLOR;
  const glowPx = (visual.glow * size) / RUNE_SIZE;
  const glow = glowPx > 0 ? `drop-shadow(0 0 ${glowPx.toFixed(1)}px ${color})` : undefined;
  return (
    <svg
      viewBox="-4 -4 32 32"
      width={size}
      height={size}
      overflow="visible"
      aria-hidden="true"
      className={className}
      data-rune={attribute}
      data-level={visual.level}
      style={{ flexShrink: 0, ...(glow ? { filter: glow } : {}) }}
    >
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={visual.opacity}
      >
        <g strokeWidth={2}>
          {RUNE_GLYPHS[attribute].map((shape, i) => (
            <Glyph key={i} shape={shape} color={color} />
          ))}
        </g>
        {visual.frame && (
          <polygon points={RUNE_FRAME_POINTS} strokeWidth={1.5} opacity={visual.frameOpacity} />
        )}
        {visual.ticks &&
          RUNE_TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={1.5} />
          ))}
      </g>
    </svg>
  );
}
