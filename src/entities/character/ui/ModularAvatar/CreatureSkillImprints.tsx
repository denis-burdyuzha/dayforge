import type { AvatarParams } from "../../model/avatarTypes";

interface L1SkillImprintsOffset {
  /** Left paw centre X (asset-bound, Larval) */
  pawLeftCx: number;
  /** Right paw centre X (asset-bound, Larval) */
  pawRightCx: number;
  /** Paw band Y (asset-bound, Larval) */
  pawCy: number;
  /** Eye centre X — crystal is anchored here for Larval */
  eyeCx: number;
  /** Eye centre Y — crystal is anchored here for Larval */
  eyeCy: number;
  /** Chest crystal centre X (legacy fallback / non-Larval) */
  crystalCx: number;
  /** Chest crystal centre Y */
  crystalCy: number;
  /** Halo centre X */
  haloCx: number;
  /** Halo ring centre Y */
  haloCy: number;
  /** Halo ring half-width */
  haloRx: number;
  /**
   * Asset scale factor (e.g. 0.50 for Larval).
   * Proportionally shrinks crystal and halo sizes so they appear as
   * small accents rather than full-scale overlays on the scaled-down mesh.
   * Default 1.0 when l1Offset is omitted (legacy tiers).
   */
  assetScale: number;
}

/**
 * CreatureSkillImprints — Glowing skill resonance overlays on the creature body.
 *
 * Larval tier (l1Offset provided):
 *   • Crystal: tiny diamond anchored to the EYE centroid (eyeCx/eyeCy), NOT chest centre,
 *     so it doesn't paint a blob over the face geometry.  opacity=0.55.
 *   • Halo: dashed ellipse above head (haloCx/haloCy), opacity=0.60.
 *   • All sizes scaled by l1Offset.assetScale (0.50) → small accents.
 *
 * Non-Larval tiers (l1Offset undefined): legacy hardcoded behaviour unchanged.
 */
export function CreatureSkillImprints({
  params,
  l1Offset,
}: {
  params: AvatarParams;
  l1Offset?: L1SkillImprintsOffset;
}) {
  const { skillImprints, palette } = params;

  if (skillImprints.length === 0) return null;

  // ── Size scale factor ─────────────────────────────────────────────────────
  const sizeScale = l1Offset ? l1Offset.assetScale : 1.0;

  // ── Coordinate anchors ────────────────────────────────────────────────────
  const pawLeftCx  = l1Offset ? l1Offset.pawLeftCx  : 76;
  const pawRightCx = l1Offset ? l1Offset.pawRightCx : 124;
  const pawCy      = l1Offset ? l1Offset.pawCy      : 162;

  // Crystal: anchored to EYE for Larval (avoids painting over the face).
  const crystalCx  = l1Offset ? l1Offset.eyeCx    : 100;
  const crystalCy  = l1Offset ? l1Offset.eyeCy    : 135;
  const crystalW   = Math.round(3 * sizeScale);   // half-width ≈ 1.5 px
  const crystalH1  = Math.round(4 * sizeScale);   // height above mid ≈ 2 px
  const crystalH2  = Math.round(3 * sizeScale);   // height below mid ≈ 1.5 px

  // Halo: dashed ring above head.
  const haloCx     = l1Offset ? l1Offset.haloCx   : 100;
  const haloCy     = l1Offset ? l1Offset.haloCy   : 72;
  const haloRxVal  = l1Offset ? Math.round(l1Offset.haloRx * sizeScale) : 28;
  const haloRyVal  = Math.round(4 * sizeScale);

  // Rune: small dot near crystal.
  const runeCy     = crystalCy + Math.round(5 * sizeScale);
  const runeR      = Math.round(3 * sizeScale);

  return (
    <g className="creature-skill-imprints" filter="url(#avatar-glow-filter)">
      {skillImprints.map((imprint, idx) => {
        const glowColor = imprint.color || palette.accent;

        if (imprint.type === "pulse-band") {
          return (
            <g key={imprint.id}>
              <ellipse
                cx={pawLeftCx}
                cy={pawCy}
                rx={Math.round(10 * sizeScale)}
                ry={Math.round(3 * sizeScale)}
                fill="none"
                stroke={glowColor}
                strokeWidth="2"
              />
              <ellipse
                cx={pawRightCx}
                cy={pawCy}
                rx={Math.round(10 * sizeScale)}
                ry={Math.round(3 * sizeScale)}
                fill="none"
                stroke={glowColor}
                strokeWidth="2"
              />
            </g>
          );
        }

        if (imprint.type === "crystal") {
          return (
            <g key={imprint.id}>
              {/* Tiny diamond anchored to eye centroid — won't cover snout geometry */}
              <polygon
                points={`${crystalCx},${crystalCy} ${crystalCx - crystalW},${crystalCy + crystalH1} ${crystalCx},${crystalCy + crystalH1 + crystalH2} ${crystalCx + crystalW},${crystalCy + crystalH1}`}
                fill={glowColor}
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity="0.55"
              />
            </g>
          );
        }

        if (imprint.type === "halo") {
          return (
            <g key={imprint.id}>
              {/* Dashed halo ring above head — light accent only */}
              <ellipse
                cx={haloCx}
                cy={haloCy}
                rx={haloRxVal}
                ry={haloRyVal}
                fill="none"
                stroke={glowColor}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.60"
              />
            </g>
          );
        }

        if (imprint.type === "rune") {
          return (
            <g key={imprint.id} transform={`translate(${idx === 0 ? 0 : Math.round(8 * sizeScale)}, 0)`}>
              <circle
                cx={crystalCx}
                cy={runeCy}
                r={runeR}
                fill="none"
                stroke={glowColor}
                strokeWidth="1.5"
              />
              <polygon
                points={`${crystalCx},${runeCy - runeR + 1} ${crystalCx - Math.round(3 * sizeScale)},${runeCy + Math.round(3 * sizeScale)} ${crystalCx + Math.round(3 * sizeScale)},${runeCy + Math.round(3 * sizeScale)}`}
                fill={glowColor}
                opacity="0.6"
              />
            </g>
          );
        }

        return null;
      })}
    </g>
  );
}
