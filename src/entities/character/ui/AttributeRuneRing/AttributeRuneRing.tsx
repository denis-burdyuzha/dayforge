import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  ATTRIBUTE_COLORS,
  ATTRIBUTE_LABELS_RU,
  ATTRIBUTE_ORDER,
  type AttributeValues,
  getAspect,
} from "../../model/aspect";
import type { AttributeKey } from "../../model/types";
import { AspectSigil } from "./AspectSigil";
import { AttributeRune } from "./AttributeRune";
import styles from "./AttributeRuneRing.module.scss";
import {
  ASPECT_SIGIL_FACTOR,
  computeRingLayout,
  getRuneLevel,
  getRuneVisual,
  RUNE_INACTIVE_COLOR,
} from "./runeLayout";

export interface AttributeRuneRingProps {
  /** attribute values 1..18 (missing → 1) */
  attributes: AttributeValues;
  /** diameter of the ring area, px */
  size: number;
  /** the avatar; rendered in the centre at its own size */
  children: ReactNode;
  /** draw the aspect sigil (0.78 x size) behind the avatar */
  showAspectSigil?: boolean;
  className?: string;
}

const FLASH_MS = 400;
/** floating phase step between neighbouring runes, s */
const FLOAT_PHASE_S = 0.5;
/** floating amplitude (see .float keyframes), px */
const FLOAT_AMPLITUDE_PX = 3;

/**
 * AttributeRuneRing — the 7 attributes as runes on a circle around the avatar.
 * strength on top, then clockwise: endurance, intelligence, focus, discipline, social, creativity.
 * The avatar keeps its size; at the base angles runes never overlap the avatar box (the radius grows if
 * needed). The ring slowly turns (CSS only) — runes then also cross the (empty) corners of the avatar box.
 */
export function AttributeRuneRing({
  attributes,
  size,
  children,
  showAspectSigil = false,
  className,
}: AttributeRuneRingProps) {
  const values = Object.fromEntries(ATTRIBUTE_ORDER.map((a) => [a, attributes[a] ?? 1])) as Record<
    AttributeKey,
    number
  >;
  const aspect = getAspect(values);

  // ── Avatar box (measured; null until mounted → plain size × 0.46 radius) ──
  const avatarRef = useRef<HTMLDivElement>(null);
  const [avatarBox, setAvatarBox] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const el = avatarRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setAvatarBox((prev) =>
        prev && prev.width === width && prev.height === height ? prev : { width, height },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = computeRingLayout(size, avatarBox, aspect);
  const maxRune = Math.max(...layout.runes.map((r) => r.size));
  // Reserved box: a turning spoke's overflow rectangle reaches hypot(R + s/2, s/2) at 45°, plus the ±3px
  // float — anything less makes the page scroll sideways on phones at some angles.
  const reach = Math.hypot(layout.radius + maxRune / 2, maxRune / 2) + FLOAT_AMPLITUDE_PX;
  const outer = Math.ceil(Math.max(size, 2 * reach));

  // ── Flash (400 ms) when a rune moves up to a higher state ──
  const levelKey = ATTRIBUTE_ORDER.map((a) => getRuneLevel(values[a])).join("");
  const prevLevels = useRef<string>(levelKey);
  const [flashing, setFlashing] = useState<ReadonlySet<AttributeKey>>(new Set());
  useEffect(() => {
    const prev = prevLevels.current;
    prevLevels.current = levelKey;
    if (prev === levelKey) return;
    const grown = ATTRIBUTE_ORDER.filter((_, i) => Number(levelKey[i]) > Number(prev[i]));
    if (grown.length === 0) return;
    setFlashing(new Set(grown));
    const t = window.setTimeout(() => setFlashing(new Set()), FLASH_MS);
    return () => window.clearTimeout(t);
  }, [levelKey]);

  // ── Tooltip (hover / focus / tap). While a tooltip is open the ring stops rotating and floating; the
  // tooltip is placed on the inner side of the rune's CURRENT position (orbit angle read once on open). ──
  const [active, setActive] = useState<{ attribute: AttributeKey; angle: number } | null>(null);
  const activate = (attribute: AttributeKey, from: Element) => {
    let angle = 0;
    const el = from.closest("[data-spoke]");
    if (el && typeof window !== "undefined") {
      const m = /matrix\(([^)]+)\)/.exec(window.getComputedStyle(el).transform);
      if (m?.[1]) {
        const [ma, mb] = m[1].split(",").map(Number);
        if (ma !== undefined && mb !== undefined) angle = Math.atan2(mb, ma);
      }
    }
    setActive((cur) => (cur?.attribute === attribute ? cur : { attribute, angle }));
  };
  const deactivate = (attribute: AttributeKey) =>
    setActive((cur) => (cur?.attribute === attribute ? null : cur));

  return (
    <div
      className={[styles.ring, active ? styles.paused : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ width: outer, height: outer }}
      data-testid="attribute-rune-ring"
      data-paused={active ? "true" : undefined}
    >
      {showAspectSigil && <AspectSigil attributes={values} diameter={size * ASPECT_SIGIL_FACTOR} />}

      <div ref={avatarRef} className={styles.avatar}>
        {children}
      </div>

      {/* Orbit: every rune sits on its own «spoke» from the centre that turns (120 s, all in sync); the rune
          counter-rotates to stay upright and floats. Per-rune spokes (not one rotating box) keep the
          scrollable overflow inside the circle at any angle. */}
      <div className={styles.orbit} data-testid="rune-orbit">
        {layout.runes.map((p, i) => {
          const v = values[p.attribute];
          const visual = getRuneVisual(v);
          const color = visual.active ? ATTRIBUTE_COLORS[p.attribute] : RUNE_INACTIVE_COLOR;
          const label = `${ATTRIBUTE_LABELS_RU[p.attribute]} · ${v}`;
          const isAspect = p.attribute === aspect;
          const isActive = active?.attribute === p.attribute;
          // rune position as it is on screen now (rotated by the paused orbit angle)
          const ang = isActive ? active.angle : 0;
          const x = p.x * Math.cos(ang) - p.y * Math.sin(ang);
          const y = p.x * Math.sin(ang) + p.y * Math.cos(ang);
          // Tooltip on the inner side: right of left-side runes, left of right-side, below/above top/bottom
          const gap = p.size / 2 + 6;
          const tooltipPos: CSSProperties =
            Math.abs(x) < p.size
              ? y < 0
                ? { left: 0, top: gap, transform: "translate(-50%, 0)" }
                : { left: 0, top: -gap, transform: "translate(-50%, -100%)" }
              : x < 0
                ? { left: gap, top: 0, transform: "translate(0, -50%)" }
                : { left: -gap, top: 0, transform: "translate(-100%, -50%)" };
          return (
            <div key={p.attribute} className={styles.spoke} data-spoke={p.attribute}>
              <div className={styles.slot} style={{ left: p.x, top: p.y }}>
                <div className={styles.upright}>
                  <div
                    className={styles.float}
                    style={{ animationDelay: `${-i * FLOAT_PHASE_S}s` }}
                  >
                    <button
                      type="button"
                      className={[styles.rune, flashing.has(p.attribute) ? styles.flash : ""]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ width: p.size, height: p.size, color }}
                      aria-label={label}
                      data-attribute={p.attribute}
                      data-level={visual.level}
                      data-aspect={isAspect ? "true" : undefined}
                      onMouseEnter={(e) => activate(p.attribute, e.currentTarget)}
                      onMouseLeave={() => deactivate(p.attribute)}
                      onFocus={(e) => activate(p.attribute, e.currentTarget)}
                      onBlur={() => deactivate(p.attribute)}
                      onClick={(e) => activate(p.attribute, e.currentTarget)}
                    >
                      <AttributeRune attribute={p.attribute} value={v} size={p.size} breathe />
                    </button>
                  </div>
                  {isActive && (
                    <span role="tooltip" className={styles.tooltip} style={tooltipPos}>
                      {label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
