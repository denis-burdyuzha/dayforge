/**
 * FoxAttributeFX — визуальные каналы атрибутов Лисы, привязанные к РЕАЛЬНЫМ зонам из
 * сгруппированных SVG (foxL1..foxL5). Координаты/якоря вычисляются из полигонов зон
 * (см. foxZones.ts), ничего не хардкодится в пикселях.
 *
 *  • Strength     — torso: оверлей-хайлайт, шипы по верхней полосе bbox torso,
 *                   (контраст фасетов и scale torso — через zone-modifiers в ассете)
 *  • Intelligence — head: InternalFacetSubdivision (побеление head — zone-modifier в ассете)
 *  • Focus        — depth of field: приглушение torso/конечностей/хвоста (zone-modifier в ассете,
 *                   голова не трогается) + vignette всего canvas (overlay). Halo убран.
 *  • Endurance    — torso: холодная патина (zone-modifier), шрамы на вытянутых фасетах torso и морды;
 *                   конечности: пульсирующие багровые жилы (LimbVeins)
 *  • Discipline   — L1/L5: симметрия по вертикальной оси bbox torso; (L2–L4: поза — tilt в FoxAvatar)
 *  • Social       — tail: радиальный рост сети связей от точки крепления к телу (редкая выборка),
 *                   подсветка общих рёбер физически соседствующих фасетов;
 *                   ears: статичный тёплый цветовой акцент + статичная подразбивка без движения.
 *
 * Группа `unassigned` не используется ни одним эффектом.
 */

import React, { useMemo } from "react";
import type { AvatarParams } from "../../../../model/avatarTypes";
import { InternalFacetSubdivision } from "./InternalFacetSubdivision";
import { LimbVeins } from "./LimbVeins";
import {
  getScarColor,
  getTailAttachmentPoint,
  getZonePolys,
  hslToRgb,
  LIMB_ZONES_BY_TIER,
  mulberry32,
  parsePts,
  polyArea,
  polyCentroid,
  polysBBox,
  torsoTopAnchors,
  type FoxTierIndex,
  type FoxZonePoly,
} from "./foxZones";

/** Длиннейшая сторона полигона */
function longestSide(pts: Array<[number, number]>): number {
  let m = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (a && b) m = Math.max(m, Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return m;
}

/** Находит все общие рёбра (пары общих вершин) между выбранными фасетами */
function getSharedMeshEdges(
  polygons: FoxZonePoly[]
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const N = polygons.length;

  for (let i = 0; i < N; i++) {
    const polyA = polygons[i];
    if (!polyA) continue;
    const ptsA = parsePts(polyA.points);

    for (let j = i + 1; j < N; j++) {
      const polyB = polygons[j];
      if (!polyB) continue;
      const ptsB = parsePts(polyB.points);

      const commonVerts: Array<[number, number]> = [];
      for (const pA of ptsA) {
        for (const pB of ptsB) {
          if (Math.hypot(pA[0] - pB[0], pA[1] - pB[1]) < 0.25) {
            if (!commonVerts.some((v) => Math.hypot(v[0] - pA[0], v[1] - pA[1]) < 0.25)) {
              commonVerts.push(pA);
            }
          }
        }
      }

      if (commonVerts.length >= 2) {
        const v1 = commonVerts[0]!;
        const v2 = commonVerts[1]!;
        edges.push({ x1: v1[0], y1: v1[1], x2: v2[0], y2: v2[1] });
      }
    }
  }

  return edges;
}

// ── Overlay (рендерится НАД мешем) ────────────────────────────────────────────

interface FoxAttributeFXProps {
  params: AvatarParams;
  tier: FoxTierIndex;
  /** transform asset-space → canvas */
  bodyTransform: string;
  /** asset units per 1 canvas px (1 / tier scale) */
  unit: number;
  /** transform применённый к зоне torso (scale Strength) — оверлеи torso следуют за ним */
  torsoTransform: string | undefined;
  /** per-zone transforms (Strength scale) — жилы на конечностях следуют за своей зоной */
  zoneTransforms?: Readonly<Record<string, string>> | undefined;
  /** optional resolver for actual computed facet color (with Strength/DOF modifiers) */
  resolveFill?: ((poly: FoxZonePoly) => string | undefined) | undefined;
}

export function FoxAttributeFX({
  params,
  tier,
  bodyTransform,
  unit,
  torsoTransform,
  zoneTransforms,
  resolveFill,
}: FoxAttributeFXProps): React.ReactElement | null {
  const fox = params.foxAttributes;
  const seed = params.identity.patternSeed;
  const cIntensity = params.creativity?.asymmetryIntensity ?? 0;

  const geo = useMemo(() => {
    const torso = getZonePolys(tier, "torso");
    const limbZones = LIMB_ZONES_BY_TIER[tier] ?? [];
    const limbs = limbZones.flatMap((z) => getZonePolys(tier, z));
    const headAll = getZonePolys(tier, "head");
    const headBox = polysBBox(headAll);

    // Tail polygons
    const tailAll = [
      ...getZonePolys(tier, "tail"),
      ...getZonePolys(tier, "tailArray"),
    ];
    const tailBasePolys = tailAll.filter(
      (p) => !p.id.includes("tip") && p.zone !== "tailTip" && p.zone !== "tail_tip"
    );

    const attachPt = getTailAttachmentPoint(tier);

    // Sorted tail base polys by distance of centroid to attachment point (base of tail)
    const sortedTailBasePolys = [...tailBasePolys].sort((a, b) => {
      const [cxA, cyA] = polyCentroid(parsePts(a.points));
      const [cxB, cyB] = polyCentroid(parsePts(b.points));
      const dA = (cxA - attachPt.x) ** 2 + (cyA - attachPt.y) ** 2;
      const dB = (cxB - attachPt.x) ** 2 + (cyB - attachPt.y) ** 2;
      return dA - dB;
    });

    // Sparse candidate selection along tail: pick every 2nd candidate (skipping intermediate polygons)
    const sparseTailCandidates = sortedTailBasePolys.filter((_, idx) => idx % 2 === 0);

    // Ears polygons for static subdivision accent
    const earsPolys = [
      ...getZonePolys(tier, "ears"),
      ...getZonePolys(tier, "ear_far"),
      ...getZonePolys(tier, "ear_near"),
      ...getZonePolys(tier, "earsArray"),
    ];

    // Candidate head polygons for subdivision: exclude ears, eyes, snout
    const headPolys = headAll.filter((p) => {
      if (p.zone !== "head" || p.id.includes("ear") || p.id.includes("eye") || p.id.includes("snout")) {
        return false;
      }
      return true;
    });

    const headAreas = headPolys.map((p) => polyArea(parsePts(p.points))).sort((a, b) => a - b);

    // Endurance scars: самые вытянутые фасеты torso и морды (snout).
    const torsoAreas = torso.map((p) => polyArea(parsePts(p.points))).sort((a, b) => a - b);
    const torsoMedianArea = torsoAreas[Math.floor(torsoAreas.length / 2)] ?? 0;
    const torsoScars = torso
      .map((p) => {
        const pts = parsePts(p.points);
        const area = polyArea(pts);
        const side = longestSide(pts);
        return { poly: p, area, score: area > 0 ? (side * side) / area : 0 };
      })
      .filter((c) => c.area >= torsoMedianArea * 0.3)
      .sort((a, b) => b.score - a.score || a.poly.id.localeCompare(b.poly.id))
      .map((c) => c.poly);

    const snoutAll = [
      ...getZonePolys(tier, "snout"),
      ...getZonePolys(tier, "snoutArray"),
    ];
    const snoutScars = snoutAll
      .map((p) => {
        const pts = parsePts(p.points);
        const area = polyArea(pts);
        const side = longestSide(pts);
        return { poly: p, area, score: area > 0 ? (side * side) / area : 0 };
      })
      .sort((a, b) => b.score - a.score || a.poly.id.localeCompare(b.poly.id))
      .map((c) => c.poly);

    // Prioritize 1 snout scar candidate, then torso scar candidates
    const scarCandidates: FoxZonePoly[] = [];
    if (snoutScars.length > 0 && snoutScars[0]) {
      scarCandidates.push(snoutScars[0]);
    }
    for (const p of torsoScars) {
      if (!scarCandidates.some((sc) => sc.id === p.id)) {
        scarCandidates.push(p);
      }
    }

    return {
      torso,
      limbs,
      limbZones,
      strengthPolys: [...torso, ...limbs],
      headPolys,
      headBox,
      scarCandidates,
      sortedTailBasePolys,
      sparseTailCandidates,
      earsPolys,
      attachPt,
      torsoBox: polysBBox(torso),
      headMedianArea: headAreas[Math.floor(headAreas.length / 2)] ?? 0,
    };
  }, [tier]);

  if (!fox) return null;
  const { torso, strengthPolys, headPolys, torsoBox } = geo;

  // ── Strength ────────────────────────────────────────────────────────────────
  const strengthFx =
    torsoBox && fox.strength.coreHighlightOpacity > 0.01 ? (
      <g className="fox-strength-fx" {...(torsoTransform ? { transform: torsoTransform } : {})}>
        {/* Core highlight: полупрозрачный светлый оверлей ПОВЕРХ фасетов torso и конечностей */}
        <g className="fox-strength-highlight" style={{ mixBlendMode: "overlay" }}>
          {strengthPolys.map((p, i) => (
            <polygon
              key={`str-ov-${p.id}`}
              points={p.points}
              fill="#e0f2fe"
              opacity={0.08 + fox.strength.coreHighlightOpacity * (i % 3 === 0 ? 0.27 : i % 3 === 1 ? 0.18 : 0.1)}
            />
          ))}
        </g>

        {/* Счётные шипы: растут ТОЛЬКО от верхней кромки torso НАРУЖУ */}
        {fox.strength.spikeCount > 0 && (
          <g className="fox-strength-spikes">
            {torsoTopAnchors(torso, fox.strength.spikeCount).map((a, i) => {
              const baseW = torsoBox.w * 0.06;
              const len = a.maxLen;
              const nx = -a.uy;
              const ny = a.ux;
              const b1x = a.x - nx * (baseW / 2);
              const b1y = a.y - ny * (baseW / 2);
              const b2x = a.x + nx * (baseW / 2);
              const b2y = a.y + ny * (baseW / 2);
              const tipX = a.x + a.ux * len;
              const tipY = a.y + a.uy * len;

              return (
                <polygon
                  key={`spike-${i}`}
                  points={`${b1x.toFixed(1)},${b1y.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}`}
                  fill={a.color}
                  stroke="rgba(15, 23, 42, 0.45)"
                  strokeWidth={0.5 * unit}
                  strokeLinejoin="round"
                  opacity={0.95}
                />
              );
            })}
          </g>
        )}
      </g>
    ) : null;

  // ── Intelligence: подразбивка (depth 1) по ВСЕЙ зоне головы (head) ────────────
  const facetCount = fox.intelligence.facetCount ?? 1;

  const selectedHeadPolys = useMemo(() => {
    if (facetCount <= 0 || headPolys.length === 0) return [];
    const candidates = headPolys.filter((p) => polyArea(parsePts(p.points)) >= geo.headMedianArea * 0.2);
    if (candidates.length === 0) return [];

    const center = geo.headBox
      ? { x: geo.headBox.cx, y: geo.headBox.cy }
      : { x: 0, y: 0 };

    const sorted = [...candidates].sort((a, b) => {
      const ptsA = parsePts(a.points);
      const ptsB = parsePts(b.points);
      const [cxA, cyA] = polyCentroid(ptsA);
      const [cxB, cyB] = polyCentroid(ptsB);
      const distA = (cxA - center.x) ** 2 + (cyA - center.y) ** 2;
      const distB = (cxB - center.x) ** 2 + (cyB - center.y) ** 2;
      if (Math.abs(distA - distB) > 0.01) {
        return distA - distB;
      }
      return a.id.localeCompare(b.id);
    });

    return sorted.slice(0, facetCount);
  }, [headPolys, facetCount, geo.headMedianArea, geo.headBox]);

  const intelligenceFx =
    selectedHeadPolys.length > 0 ? (
      <g className="fox-intelligence-fx" filter="url(#fox-intel-line-glow)">
        <defs>
          <filter id="fox-intel-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <InternalFacetSubdivision
          polygons={selectedHeadPolys}
          depth={1}
          seed={seed}
          tintColor="#38bdf8"
          tintMix={0.10}
          strokeColor="rgba(56, 189, 248, 0.72)"
          strokeWidth={0.95 * unit}
          minFacetArea={geo.headMedianArea * 0.2}
          pulseSpeedFactor={fox.intelligence.headWhitenMix}
        />
      </g>
    ) : null;

  function getScarSlashLine(pts: Array<[number, number]>): { x1: number; y1: number; x2: number; y2: number } | null {
    if (pts.length < 3) return null;
    let maxLen = 0;
    let maxIdx = 0;
    const N = pts.length;
    for (let i = 0; i < N; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % N];
      if (a && b) {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len > maxLen) {
          maxLen = len;
          maxIdx = i;
        }
      }
    }
    const pA = pts[maxIdx];
    const pB = pts[(maxIdx + 1) % N];
    if (!pA || !pB) return null;
    const mx = (pA[0] + pB[0]) / 2;
    const my = (pA[1] + pB[1]) / 2;

    let oppVert: [number, number] = pts[(maxIdx + 2) % N] ?? pA;
    let maxDist = 0;
    for (let k = 0; k < N; k++) {
      if (k !== maxIdx && k !== (maxIdx + 1) % N) {
        const v = pts[k];
        if (v) {
          const d = Math.hypot(v[0] - mx, v[1] - my);
          if (d > maxDist) {
            maxDist = d;
            oppVert = v;
          }
        }
      }
    }
    return { x1: oppVert[0], y1: oppVert[1], x2: mx, y2: my };
  }

  // ── Endurance: шрамы ────────
  const scarCount = fox.endurance.scratchCount ?? 0;
  const scars = geo.scarCandidates.slice(0, Math.max(0, scarCount));

  const enduranceFx =
    torsoBox && scars.length > 0 ? (
      <g className="fox-endurance-fx" {...(torsoTransform ? { transform: torsoTransform } : {})}>
        <g className="fox-endurance-scars">
          {scars.map((p) => {
            const pts = parsePts(p.points);
            const line = getScarSlashLine(pts);
            if (!line) return null;
            const actualFill = (resolveFill ? resolveFill(p) : undefined) ?? p.defaultFill;
            const scarColor = getScarColor(actualFill, 35);

            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const len = Math.hypot(dx, dy) || 1;
            const tx = dx / len;
            const ty = dy / len;
            const nx = -ty;
            const ny = tx;
            const stitchLen = Math.min(4.5 * unit, len * 0.45);
            const stitchTValues = [0.25, 0.50, 0.75];

            return (
              <g key={`scar-group-${p.id}`}>
                <line
                  key={`scar-${p.id}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={scarColor}
                  strokeWidth={2.2 * unit}
                  strokeLinecap="round"
                  opacity={0.95}
                />
                {stitchTValues.map((t, idx) => {
                  const cx = line.x1 + tx * len * t;
                  const cy = line.y1 + ty * len * t;
                  const sX1 = cx - nx * (stitchLen / 2);
                  const sY1 = cy - ny * (stitchLen / 2);
                  const sX2 = cx + nx * (stitchLen / 2);
                  const sY2 = cy + ny * (stitchLen / 2);
                  return (
                    <line
                      key={`scar-stitch-${p.id}-${idx}`}
                      x1={sX1}
                      y1={sY1}
                      x2={sX2}
                      y2={sY2}
                      stroke={scarColor}
                      strokeWidth={2.2 * unit}
                      strokeLinecap="round"
                      opacity={0.90}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </g>
    ) : null;

  // ── Endurance: жилы на ногах ──
  const veinsFx =
    fox.endurance.veinCount > 0 ? (
      <LimbVeins
        tier={tier}
        zones={geo.limbZones}
        count={fox.endurance.veinCount}
        seed={seed}
        unit={unit}
        zoneTransforms={zoneTransforms}
      />
    ) : null;

  // ── Social: сеть связей на хвосте (радиальный рост от точки крепления, редкая выборка) ──
  const socialShift = fox.social.collarWarmShift ?? 0;

  // Node count grows with Social attribute (from 1 at Social=1 up to max sparse candidates at Social=18)
  const socialProgress = Math.max(0, Math.min(1, socialShift / 0.8));
  const tailNodeCount = socialShift > 0.01
    ? Math.max(1, Math.round(1 + socialProgress * (geo.sparseTailCandidates.length - 1)))
    : 0;

  const selectedTailPolys = useMemo(() => {
    if (tailNodeCount <= 0 || geo.sparseTailCandidates.length === 0) return [];
    return geo.sparseTailCandidates.slice(0, tailNodeCount);
  }, [geo.sparseTailCandidates, tailNodeCount]);

  // Highlight shared mesh edges between physically adjacent selected tail polygons
  const sharedTailEdges = useMemo(() => {
    return getSharedMeshEdges(selectedTailPolys);
  }, [selectedTailPolys]);

  const socialTailNetworkFx =
    selectedTailPolys.length > 0 ? (
      <g className="fox-social-subdiv" filter="url(#fox-intel-line-glow)">
        {/* Subdivided facets along tail base to tip (sparse sampling) */}
        <InternalFacetSubdivision
          polygons={selectedTailPolys}
          depth={1}
          seed={seed + 41}
          tintColor="#f97316"
          tintMix={0.12}
          strokeColor="rgba(249, 115, 22, 0.78)"
          strokeWidth={0.9 * unit}
          minFacetArea={6}
        />

        {/* Highlighted physical shared mesh edges between physically adjacent selected facets */}
        {sharedTailEdges.length > 0 && (
          <g className="fox-social-shared-edges">
            {sharedTailEdges.map((edge, idx) => (
              <line
                key={`social-shared-edge-${idx}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="rgba(249, 115, 22, 0.88)"
                strokeWidth={1.3 * unit}
                strokeLinecap="round"
              />
            ))}
          </g>
        )}
      </g>
    ) : null;

  // ── Social: уши (только статичный цветовой акцент + subdivision, БЕЗ движения) ──
  const socialEarsSubdivFx =
    socialShift > 0.05 && geo.earsPolys.length > 0 ? (
      <g className="fox-social-ears-subdiv" filter="url(#fox-intel-line-glow)">
        <InternalFacetSubdivision
          polygons={geo.earsPolys}
          depth={1}
          seed={seed + 88}
          tintColor="#f97316"
          tintMix={Math.min(0.15, socialShift * 0.18)}
          strokeColor="rgba(249, 115, 22, 0.75)"
          strokeWidth={0.85 * unit}
          minFacetArea={4}
          enablePulse={false}
        />
      </g>
    ) : null;

  // ── Creativity: декоративные выступающие грани (декоративные сколы/чипы) ─────────
  const shardCount = cIntensity >= 0.85 ? 4 : cIntensity >= 0.6 ? 3 : cIntensity >= 0.35 ? 2 : cIntensity >= 0.15 ? 1 : 0;

  // Seed-variable accent color for Creativity shards
  const seedPRNG = mulberry32(seed + 0.718);
  const hueShift = (seedPRNG() - 0.5) * 80;
  const accentHue = (285 + hueShift + 360) % 360;
  const [sR, sG, sB] = hslToRgb(accentHue, 85, 65);
  const shardFillColor = `rgb(${sR}, ${sG}, ${sB})`;

  const creativeShardsFx =
    shardCount > 0 && torsoBox ? (
      <g className="fox-creativity-shards">
        {Array.from({ length: shardCount }, (_, i) => {
          const hostPoly = headPolys[i % headPolys.length] ?? torso[i % torso.length];
          if (!hostPoly) return null;

          const pts = parsePts(hostPoly.points);
          const [cx, cy] = polyCentroid(pts);

          // Build a slim pointed crystal shard
          const dirX = cx - torsoBox.cx;
          const dirY = cy - torsoBox.cy;
          const len = Math.hypot(dirX, dirY) || 1;
          const ux = (dirX / len);
          const uy = (dirY / len);
          const nx = -uy;
          const ny = ux;

          const shardW = 3.5 * unit;
          const shardLen = 7.5 * unit;
          const b1x = cx - nx * (shardW / 2);
          const b1y = cy - ny * (shardW / 2);
          const b2x = cx + nx * (shardW / 2);
          const b2y = cy + ny * (shardW / 2);
          const tipX = cx + ux * shardLen;
          const tipY = cy + uy * shardLen;

          return (
            <polygon
              key={`creative-shard-${i}`}
              points={`${b1x.toFixed(1)},${b1y.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}`}
              fill={shardFillColor}
              stroke="rgba(15, 23, 42, 0.45)"
              strokeWidth={0.45 * unit}
              strokeLinejoin="round"
              opacity={0.92}
            />
          );
        })}
      </g>
    ) : null;

  return (
    <g className="fox-attribute-fx" style={{ pointerEvents: "none" }}>
      <g transform={bodyTransform}>
        {strengthFx}
        {intelligenceFx}
        {enduranceFx}
        {veinsFx}
        {socialTailNetworkFx}
        {socialEarsSubdivFx}
        {creativeShardsFx}
      </g>

      {/* Focus: vignette периферии всего canvas (canvas-space, viewBox 0 0 200 240) */}
      {fox.focus.vignetteOpacity > 0.01 && (
        <g className="fox-focus-vignette">
          <defs>
            <radialGradient id="fox-focus-vignette" cx="50%" cy="50%" r="72%">
              <stop offset="35%" stopColor="#000814" stopOpacity="0" />
              <stop offset="100%" stopColor="#000814" stopOpacity={Math.min(0.95, fox.focus.vignetteOpacity * 2)} />
            </radialGradient>
          </defs>
          <rect x={-40} y={-40} width={280} height={320} fill="url(#fox-focus-vignette)" />
        </g>
      )}
    </g>
  );
}
