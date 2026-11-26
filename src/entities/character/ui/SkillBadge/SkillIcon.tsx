import { getSkillIcon } from "../../model/skillPresentation";
import type { AttributeKey } from "../../model/types";
import { AttributeRune } from "../AttributeRuneRing/AttributeRune";
import styles from "./SkillBadge.module.scss";

export interface SkillIconProps {
  name: string;
  primaryAttribute: AttributeKey | null;
  /** stored icon key (character_skills.icon); overrides the keyword-based icon */
  iconKey?: string | null | undefined;
  /** skill form 0..100 — fills the ring */
  form: number;
  /** outer diameter of the form ring, px */
  size: number;
  /** icon size inside the ring, px */
  iconSize: number;
}

/**
 * Skill icon inside a form ring (progress = Form %, colour = main attribute): stored icon key → keyword icon →
 * the rune glyph of the main attribute; a skill without an attribute gets a neutral dot.
 */
export function SkillIcon({
  name,
  primaryAttribute,
  iconKey,
  form,
  size,
  iconSize,
}: SkillIconProps) {
  const icon = getSkillIcon(name, primaryAttribute, iconKey);
  const stroke = Math.max(2, size / 14);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, form)) / 100;
  return (
    <span
      className={styles.icon}
      style={{ width: size, height: size }}
      data-form={Math.round(form)}
      data-icon-category={icon.category ?? "none"}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={stroke}
          style={{ color: icon.color }}
        />
        <circle
          className={styles.formArc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={icon.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * pct).toFixed(2)} ${c.toFixed(2)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={styles.iconGlyph}>
        {icon.kind === "icon" ? (
          // lucide glyphs fill their box almost edge to edge (rune glyphs have a frame margin) → ×0.8
          <icon.Icon
            size={Math.round(iconSize * 0.8)}
            color={icon.color}
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : icon.attribute ? (
          <AttributeRune attribute={icon.attribute} value={18} size={iconSize} plain />
        ) : (
          <span
            className={styles.neutralDot}
            style={{ width: iconSize / 3, height: iconSize / 3, background: icon.color }}
          />
        )}
      </span>
    </span>
  );
}
