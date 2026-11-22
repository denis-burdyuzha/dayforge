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

/**
 * AttributeRuneRing — the 7 attributes as runes on a circle around the avatar.
 * strength on top, then clockwise: endurance, intelligence, focus, discipline, social, creativity.
 * The avatar keeps its size; runes never overlap the avatar box (the radius grows if needed).
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
  const outer = Math.ceil(Math.max(size, 2 * layout.radius + maxRune));

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

  // ── Tooltip (hover / focus / tap) ──
  const [active, setActive] = useState<AttributeKey | null>(null);

  return (
    <div
      className={[styles.ring, className ?? ""].filter(Boolean).join(" ")}
      style={{ width: outer, height: outer }}
      data-testid="attribute-rune-ring"
    >
      {showAspectSigil && <AspectSigil attributes={values} diameter={size * ASPECT_SIGIL_FACTOR} />}

      <div ref={avatarRef} className={styles.avatar}>
        {children}
      </div>

      {layout.runes.map((p) => {
        const v = values[p.attribute];
        const visual = getRuneVisual(v);
        const color = visual.active ? ATTRIBUTE_COLORS[p.attribute] : RUNE_INACTIVE_COLOR;
        const label = `${ATTRIBUTE_LABELS_RU[p.attribute]} · ${v}`;
        const isAspect = p.attribute === aspect;
        // Tooltip sits next to the rune on its inner side (towards the centre) so it never leaves
        // the ring: right of left-side runes, left of right-side runes, below/above top/bottom ones.
        const gap = p.size / 2 + 6;
        const tooltipPos: CSSProperties =
          Math.abs(p.x) < p.size
            ? p.y < 0
              ? { left: 0, top: gap, transform: "translate(-50%, 0)" }
              : { left: 0, top: -gap, transform: "translate(-50%, -100%)" }
            : p.x < 0
              ? { left: gap, top: 0, transform: "translate(0, -50%)" }
              : { left: -gap, top: 0, transform: "translate(-100%, -50%)" };
        return (
          <div
            key={p.attribute}
            className={styles.slot}
            style={{ left: outer / 2 + p.x, top: outer / 2 + p.y }}
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
              onMouseEnter={() => setActive(p.attribute)}
              onMouseLeave={() => setActive((a) => (a === p.attribute ? null : a))}
              onFocus={() => setActive(p.attribute)}
              onBlur={() => setActive((a) => (a === p.attribute ? null : a))}
              onClick={() => setActive(p.attribute)}
            >
              <AttributeRune attribute={p.attribute} value={v} size={p.size} />
            </button>
            {active === p.attribute && (
              <span role="tooltip" className={styles.tooltip} style={tooltipPos}>
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
