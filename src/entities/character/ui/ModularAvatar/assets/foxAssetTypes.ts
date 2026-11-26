export interface FoxZonePoly {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone name from foxL{N}.svg groups (`unassigned` = not classified, never used by FX) */
  zone: string;
}

export interface FoxBaseAssetProps {
  isSilhouette?: boolean | undefined;
  overrideFill?: string | undefined;
  overrideStroke?: string | undefined;
  overrideStrokeWidth?: number | string | undefined;
  /**
   * Per-zone SVG `transform` applied to every polygon of that zone (z-order is preserved,
   * polygon geometry in the data files is never mutated).
   */
  zoneTransforms?: Readonly<Record<string, string>> | undefined;
  /** Per-polygon fill override (colour grading by zone). Return undefined to keep default. */
  resolveFill?: ((poly: FoxZonePoly) => string | undefined) | undefined;
  /** Polygons recoloured into the aspect colour (shared aspect accent); empty / undefined → none */
  aspectAccentIds?: ReadonlyArray<string> | undefined;
  /** Aspect colour; null / undefined → accent polygons keep their own colours */
  aspectColor?: string | null | undefined;
}
