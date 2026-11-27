/**
 * The canvas fit rule shared by every creature (mirror of computeFit in scripts/creatureAssets.lib.mjs; the
 * tests keep both in sync): scale = min(208 · 0.86 / bbox height, 168 / bbox width); the bbox is centred
 * horizontally on x = 100 and its bottom stands on the common ground line y = 212 (the ground shadow).
 */
export const FIT_FIELD = { w: 168, h: 208, heightShare: 0.86, centerX: 100, groundY: 212 } as const;

export interface FitPolygon {
  points: string;
}

export interface CanvasFit {
  scale: number;
  tx: number;
  ty: number;
}

export function polygonBBox(polygons: ReadonlyArray<FitPolygon>) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of polygons) {
    for (const pair of p.points.trim().split(/\s+/)) {
      const [x, y] = pair.split(",").map(Number);
      if (x === undefined || y === undefined) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

export function computeCanvasFit(polygons: ReadonlyArray<FitPolygon>): CanvasFit {
  const b = polygonBBox(polygons);
  const scale = Math.min((FIT_FIELD.h * FIT_FIELD.heightShare) / b.h, FIT_FIELD.w / b.w);
  return {
    scale,
    tx: FIT_FIELD.centerX - ((b.x0 + b.x1) / 2) * scale,
    ty: FIT_FIELD.groundY - b.y1 * scale,
  };
}

/** Share of the 168 × 208 field the silhouette takes under a fit */
export function fieldShare(polygons: ReadonlyArray<FitPolygon>, fit: Pick<CanvasFit, "scale">) {
  const b = polygonBBox(polygons);
  return { width: (b.w * fit.scale) / FIT_FIELD.w, height: (b.h * fit.scale) / FIT_FIELD.h };
}
