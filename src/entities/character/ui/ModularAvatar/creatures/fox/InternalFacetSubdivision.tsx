/**
 * InternalFacetSubdivision — deterministic in-zone facet subdivision overlay.
 *
 * Renders additional visible internal edge lines inside an anatomical zone,
 * simulating finer geometric sub-division of the low-poly mesh.
 *
 * Used twice:
 *  1. Head zone (Intelligence) — with optional whitening tint on inner facets
 *  2. Collar zone (Social) — with warm amber tint on inner facets
 */

import React from "react";
import { PulseLine } from "./PulseLine";

interface FacetDef {
  points: string;
}

interface InternalFacetSubdivisionProps {
  polygons: FacetDef[];
  depth: 0 | 1 | 2 | 3;
  seed: number;
  tintColor?: string;
  tintMix?: number;
  strokeColor?: string;
  strokeWidth?: number;
  minFacetArea?: number;
  enablePulse?: boolean;
  /** Normalized speed factor (0 = Int 1, 1 = Int 18) */
  pulseSpeedFactor?: number;
}

/** PRNG generator for deterministic delays */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Parse "x1,y1 x2,y2 ..." into number pairs */
function parsePts(points: string): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (const p of points.trim().split(/\s+/)) {
    const parts = p.split(",");
    const x = parseFloat(parts[0] ?? "0");
    const y = parseFloat(parts[1] ?? "0");
    if (!isNaN(x) && !isNaN(y)) {
      result.push([x, y]);
    }
  }
  return result;
}

/** Compute approximate polygon area via shoelace formula */
function polyArea(pts: Array<[number, number]>): number {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = pts[i];
    const b = pts[j];
    if (a && b) {
      area += a[0] * b[1];
      area -= b[0] * a[1];
    }
  }
  return Math.abs(area) / 2;
}

/** Compute centroid of polygon */
function centroid(pts: Array<[number, number]>): [number, number] {
  let sx = 0,
    sy = 0;
  for (const p of pts) {
    sx += p[0];
    sy += p[1];
  }
  const n = pts.length || 1;
  return [sx / n, sy / n];
}

/** Midpoint between two vertices with bias 0..1 */
function midPt(
  a: [number, number],
  b: [number, number],
  bias: number,
): [number, number] {
  return [a[0] + (b[0] - a[0]) * bias, a[1] + (b[1] - a[1]) * bias];
}

/** Generate true internal sub-division lines from centroid to vertices and edge midpoints */
function genSubLines(
  pts: Array<[number, number]>,
  depth: number,
  seedOffset: number,
): string {
  if (pts.length < 3) return "";
  const c = centroid(pts);
  const parts: string[] = [];
  const cxStr = c[0].toFixed(1);
  const cyStr = c[1].toFixed(1);

  // Depth 1: lines from centroid to every vertex (splits N-gon into N internal triangles)
  if (depth >= 1) {
    for (let i = 0; i < pts.length; i++) {
      const v = pts[i];
      if (!v) continue;
      parts.push(`M ${cxStr},${cyStr} L ${v[0].toFixed(1)},${v[1].toFixed(1)}`);
    }
  }

  // Depth 2: lines from centroid to every edge midpoint (subdivides internal triangles into 6)
  if (depth >= 2) {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (!a || !b) continue;
      const bias = 0.5 + ((seedOffset + i * 0.11) % 0.1) - 0.05;
      const mid = midPt(a, b, bias);
      parts.push(`M ${cxStr},${cyStr} L ${mid[0].toFixed(1)},${mid[1].toFixed(1)}`);
    }
  }

  // Depth 3: inner concentric geometric ring connecting mid-points of centroid rays
  if (depth >= 3) {
    const innerRing = pts.map((p) => midPt(p, c, 0.45 + (seedOffset % 0.1)));
    if (innerRing.length >= 3) {
      const last = innerRing[innerRing.length - 1];
      if (last) {
        parts.push(`M ${last[0].toFixed(1)},${last[1].toFixed(1)}`);
        for (const p of innerRing) {
          parts.push(`L ${p[0].toFixed(1)},${p[1].toFixed(1)}`);
        }
      }
    }
  }

  return parts.join(" ");
}

export function InternalFacetSubdivision({
  polygons,
  depth,
  seed,
  tintColor,
  tintMix = 0,
  strokeColor = "rgba(220,230,255,0.45)",
  strokeWidth = 0.5,
  minFacetArea = 30,
  enablePulse = true,
  pulseSpeedFactor = 0,
}: InternalFacetSubdivisionProps): React.ReactElement | null {
  if (depth === 0 || polygons.length === 0) return null;

  const elements: React.ReactElement[] = [];
  const pulseElements: React.ReactElement[] = [];

  // Speed channel: dur ~ 4.5s on Int 1 (speedFactor = 0) down to ~ 1.6s on Int 18 (speedFactor = 1)
  const clampedSpeed = Math.max(0, Math.min(1, pulseSpeedFactor));
  const durBase = 4.5 - clampedSpeed * (4.5 - 1.6); // 4.5s..1.6s

  polygons.forEach((poly, polyIdx) => {
    const pts = parsePts(poly.points);
    if (pts.length < 3) return;

    const area = polyArea(pts);
    if (area < minFacetArea) return;

    const seedOffset = (seed + polyIdx * 0.137) % 1;

    if (tintColor && tintMix > 0) {
      elements.push(
        <polygon
          key={`tint-${polyIdx}`}
          points={poly.points}
          fill={tintColor}
          opacity={tintMix}
          style={{ pointerEvents: "none" }}
        />,
      );
    }

    const subPath = genSubLines(pts, depth, seedOffset);
    if (subPath) {
      elements.push(
        <path
          key={`sub-${polyIdx}`}
          d={subPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ pointerEvents: "none" }}
        />,
      );
    }

    // Pulse animations along centroid-to-vertex rays
    if (enablePulse && depth >= 1) {
      const c = centroid(pts);
      const prng = mulberry32(seed * 1000 + polyIdx * 17 + 3);

      pts.forEach((v, vIdx) => {
        const dx = v[0] - c[0];
        const dy = v[1] - c[1];
        const L = Math.hypot(dx, dy);
        if (L < 0.5) return;

        const rndVal = prng();
        // Scale begin delay window proportionally to durBase so staggering ratio remains invariant (~25% active)
        const maxDelay = durBase * 1.0;
        const delay = rndVal * maxDelay;
        const dur = durBase * (0.9 + rndVal * 0.2);

        const dashLen = Math.max(2.5, Math.min(6, L * 0.3));

        pulseElements.push(
          <PulseLine
            key={`pulse-${polyIdx}-${vIdx}`}
            x1={c[0]}
            y1={c[1]}
            x2={v[0]}
            y2={v[1]}
            stroke="#f0f9ff"
            strokeWidth={strokeWidth * 1.3}
            dur={dur}
            delay={delay}
            dashLen={dashLen}
          />,
        );
      });
    }
  });

  if (elements.length === 0 && pulseElements.length === 0) return null;

  return (
    <g className="fox-internal-facet-subdivision" style={{ pointerEvents: "none" }}>
      {elements}
      {pulseElements.length > 0 && <g className="fox-subdivision-pulses">{pulseElements}</g>}
    </g>
  );
}
