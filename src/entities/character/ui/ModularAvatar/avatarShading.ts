import type { AvatarColorPalette } from "../../model/avatarTypes";

export type AnatomicalZone = "head" | "torso" | "limbs" | "tail" | "accent";

/**
 * Computes the 2D centroid (center of mass) of a polygon given a SVG points string "x1,y1 x2,y2 x3,y3...".
 */
export function getPolygonCentroid(points: string): { x: number; y: number } {
  const pairs = points.trim().split(/\s+/);
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (const pair of pairs) {
    const [xStr, yStr] = pair.split(",");
    if (xStr !== undefined && yStr !== undefined) {
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      if (!isNaN(x) && !isNaN(y)) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  return count > 0 ? { x: sumX / count, y: sumY / count } : { x: 100, y: 120 };
}

/**
 * Shared Systemic 3D Volumetric Shading Function for Dayforge Low-Poly Avatars.
 *
 * Light source is fixed from Top-Front-Left (x ~ 70, y ~ 20).
 * Color hierarchy per user request:
 *   - Specular Ridge Highlight: #325885
 *   - Illuminated Facets (top of back/tail/forehead): #27476e / #1f3857
 *   - Base Body Tone: #172a42 / #121f30
 *   - Deep Shadow (underbelly, bottom, rear facets): #0c1420 / #090e17
 */
export function getFacetFill(
  zone: AnatomicalZone,
  pointsOrX: string | number,
  palette: AvatarColorPalette,
  isSilhouette = false,
  isHighlightFacet = false,
): string {
  if (isSilhouette) return "#020617";
  if (zone === "accent") return palette.accent;

  const { x, y } =
    typeof pointsOrX === "number" ? { x: pointsOrX, y: 120 } : getPolygonCentroid(pointsOrX);

  if (isHighlightFacet) return "#325885";

  // Lighting height & X position zones
  const isHighest = y < 70;
  const isUpper = y >= 70 && y < 110;
  const isMid = y >= 110 && y < 155;
  const isLightSide = x < 110;
  const isExtremeLightSide = x < 85;

  if (zone === "head") {
    if (isHighest && isLightSide) return "#325885"; // Ridge highlight
    if (isHighest || (isUpper && isExtremeLightSide)) return "#27476e"; // Illuminated forehead
    if (isUpper || isLightSide) return "#1f3857";
    if (isMid) return "#172a42";
    return "#0c1420"; // Jaw shadow
  }

  if (zone === "torso") {
    if (isUpper && isExtremeLightSide) return "#325885"; // Shoulder/chest highlight
    if (isUpper && isLightSide) return "#27476e"; // Illuminated upper back
    if (isUpper || (isMid && isLightSide)) return "#1f3857"; // Upper body base
    if (isMid) return "#172a42"; // Mid flank
    return "#090e17"; // Underbelly deep shadow
  }

  if (zone === "limbs") {
    if (isUpper && isLightSide) return "#27476e";
    if (isLightSide) return "#1f3857";
    if (isMid) return "#121f30";
    return "#0c1420";
  }

  if (zone === "tail") {
    if (isHighest || (isUpper && isExtremeLightSide)) return "#325885"; // Plume top highlight
    if (isUpper && isLightSide) return "#27476e";
    if (isUpper || (isMid && isLightSide)) return "#1f3857";
    if (isMid) return "#172a42";
    return "#0c1420";
  }

  return "#172a42";
}
