/**
 * foxL1ViewBoxCoords.ts
 *
 * Semantic viewBox (0 0 200 240) coordinates derived from foxL1.svg asset mesh
 * for the Larval tier. Used to anchor FX-layers to the new asset geometry.
 *
 * Transform applied in FoxAvatar.tsx for the asset group:
 *   g { transform: "translate(-14.5, -72.5) scale(0.50)" }
 *   i.e.  x_vb = x_asset × 0.50 − 14.5
 *         y_vb = y_asset × 0.50 − 72.5
 *
 * ─── Contain-fit calculation ────────────────────────────────────────────────
 * Asset mesh bbox (foxL1.svg): X=44..414 (W=370), Y=252..526 (H=274)
 * Available viewBox with ~8px padding: 184×224
 *   scaleX = 184/370 = 0.497,  scaleY = 224/274 = 0.817  →  scale = 0.50
 *
 * In viewBox coords after transform:
 *   X = 44×0.50−14.5 = 7.5   ..  414×0.50−14.5 = 192.5   (inside 0..200) ✓
 *   Y = 252×0.50−72.5 = 53.5 ..  526×0.50−72.5 = 190.5   (inside 0..240) ✓
 *
 * ─── Zone centroids (asset → viewBox) ───────────────────────────────────────
 *   body centre   (229, 389) → (100, 122)
 *   head/ears     (113, 360) → ( 42, 107)
 *   eyes          (160, 422) → ( 65, 138)
 *   snout/nose    (157, 414) → ( 64, 134)
 *   torso/back    (229, 360) → (100, 107)
 *   markings/fore (155, 345) → ( 63,  100) ← forehead of curled fox
 *   tail body     (320, 440) → (145, 147)
 *   tail tip      (355, 495) → (163, 175)
 *   front paws    (170, 470) → ( 71, 162)
 *   halo (above)  (155, 308) → ( 63,  81)
 */

/** All semantic viewBox-space coordinates for the Larval (foxL1) asset tier. */
export const L1_VB = {
  // ── Body centre ──────────────────────────────────────────────────────────
  /** Horizontal body centre X (asset X=229 → 229×0.50−14.5=100) */
  cx: 100,

  // ── Head / ears zone ─────────────────────────────────────────────────────
  /** Head zone centroid X — fox head is at LEFT side in curled pose (asset X≈113) */
  headCx: 42,    // 113 × 0.50 − 14.5 = 42.0
  /** Head zone centroid Y (asset Y≈360 → 360×0.50−72.5=107.5) */
  headCy: 108,
  /** Head half-width in viewBox coords */
  headRx: 22,
  /** Head half-height in viewBox coords */
  headRy: 15,

  // ── Eyes (actual eye polygon centre, for precise FX anchoring) ───────────
  /** Eye centre X (asset X≈160 → 160×0.50−14.5=65.5) */
  eyeCx: 66,
  /** Eye centre Y (asset Y≈422 → 422×0.50−72.5=138.5) */
  eyeCy: 139,

  // ── Torso / back zone ────────────────────────────────────────────────────
  /** Torso centroid Y — back spine of curled fox (asset Y≈360 → 107.5) */
  torsoCy: 108,
  /** Torso half-width in viewBox coords */
  torsoRx: 50,

  // ── Markings (forehead of curled fox) ────────────────────────────────────
  /** Markings anchor X — forehead of head (asset X≈155 → 155×0.50−14.5=63) */
  markingsCx: 63,
  /** Markings anchor Y — top of head (asset Y≈345 → 345×0.50−72.5=100) */
  markingsCy: 100,

  // ── Tail tip ─────────────────────────────────────────────────────────────
  /** Tail tip representative Y (asset Y≈495 → 495×0.50−72.5=175) */
  tailTipCy: 175,

  // ── Shadow / Aura ────────────────────────────────────────────────────────
  /** Ground shadow Y — just below asset bottom (asset Y=526 → 190.5 → use 194) */
  shadowCy: 194,
  /** Aura glow centre Y — body centre of mass (asset Y=389 → 122) */
  auraCy: 122,

  // ── Paw pulse-band positions ─────────────────────────────────────────────
  /** Left front paw centre X (asset X≈170 → 170×0.50−14.5=70.5) */
  pawLeftCx: 71,
  /** Right front paw centre X (asset X≈200 → 200×0.50−14.5=85.5) */
  pawRightCx: 86,
  /** Paw pulse-band Y (asset Y≈470 → 470×0.50−72.5=162.5) */
  pawCy: 163,

  // ── Skill crystal (chest emblem) ─────────────────────────────────────────
  /** Crystal anchor X (body centre) */
  crystalCx: 100,
  /** Crystal anchor Y — upper torso (asset Y≈370 → 370×0.50−72.5=112.5) */
  crystalCy: 113,

  // ── Halo ring (above head / crown) ───────────────────────────────────────
  /** Halo centre X — same as headCx (asset X≈155) */
  haloCx: 63,
  /** Halo centre Y — above head (asset Y≈308 → 308×0.50−72.5=81.5) */
  haloCy: 82,
  /** Halo half-width (legacy 28 × assetScale 0.50 = 14) */
  haloRx: 14,
};
