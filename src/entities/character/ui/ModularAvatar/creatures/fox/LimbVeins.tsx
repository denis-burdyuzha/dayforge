/**
 * LimbVeins — Endurance: анимированные багровые жилы строго НА НОГАХ (макс 1..5 вен на ВСЮ фигуру).
 *
 * 1. Рандомизация угла: генерация оси вены под углом ±40° от вертикали (диагональные жилы).
 * 2. Полная проверка отрезков: каждый отрезок (P0->P1, P1->P2, P2->P3) проверяется по 5 точкам (0%, 25%, 50%, 75%, 100%)
 *    через pointInPoly. При вылете за контур на изгибах ноги смещение/длина автоматически подтягиваются внутрь силуэта.
 * 3. Распространяющийся пульс волны: поверх основной чёткой линии добавляется фазово-сдвинутый (+0.10s)
 *    слой размытой ауры (feGaussianBlur stdDeviation="1.8", opacity ~0.18, 3x stroke-width) со сглаженным спадом,
 *    создающий визуальное ощущение расходящейся волны пульса крови.
 * 4. Количество: 1..5 вен на ВСЮ фигуру, задержка между стартами MIN_GAP_BETWEEN_STARTS = 2.0s.
 */

import React, { useMemo } from "react";
import { getZonePolys, mulberry32, parsePts, pointInPoly, polysBBox, type FoxTierIndex, type Pt } from "./foxZones";
import { FOX_VEIN_ZONES_BY_TIER } from "./foxZoneRegistry";

export const VEIN_COLOR = "#991b1b";
export const VEIN_GLOW_COLOR = "#b91c1c";
export const MIN_GAP_BETWEEN_STARTS = 2.0; // Fixed 2.0s gap between vein starts

interface LimbVeinsProps {
  tier: FoxTierIndex;
  zones?: string[];
  count: number;
  seed: number;
  /** asset units per 1 canvas px */
  unit: number;
  /** per-zone transform (Strength scale) */
  zoneTransforms?: Readonly<Record<string, string>> | undefined;
}

export interface VeinPolyline {
  zone: string;
  pathD: string;
  key: string;
}

/**
 * Вычисляет точку на параметрической квадратичной кривой Безье в момент t ∈ [0, 1].
 */
function quadBezier(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number,
): [number, number] {
  const mt = 1 - t;
  const x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0];
  const y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1];
  return [x, y];
}

/**
 * Сэмплирует 11 точек вдоль сглаженной составной кривой (P0 -> P1 -> mid -> P2 -> P3).
 */
function sampleMainCurvePoints(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): Array<[number, number]> {
  const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  const pts: Array<[number, number]> = [];
  for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1.0]) {
    pts.push(quadBezier(p0, p1, mid, t));
  }
  for (const t of [0.2, 0.4, 0.6, 0.8, 1.0]) {
    pts.push(quadBezier(mid, p2, p3, t));
  }
  return pts;
}

/**
 * Проверяет, что ВСЕ сэмплированные точки кривой находятся строго внутри полигонов ноги.
 */
function isCurveInsidePolys(
  pts: Array<[number, number]>,
  parsedPolys: Array<{ pts: Pt[] }>,
): boolean {
  for (const [x, y] of pts) {
    const inside = parsedPolys.some((poly) => pointInPoly(x, y, poly.pts));
    if (!inside) return false;
  }
  return true;
}

/**
 * Генерирует диагональную сглаженную жилу с возможным ветвлением (~50% шанс) строго внутри ноги.
 * Использует абсолютную длину на базе unit, расширенный диапазон высоты (20%-85%) и плавыне Bezier кривые.
 */
function generateDiagonalVeinInPolys(
  tier: FoxTierIndex,
  zone: string,
  laneIndex: number,
  totalLanesInZone: number,
  veinSeedIndex: number,
  seed: number,
  unit: number,
): VeinPolyline | null {
  const polys = getZonePolys(tier, zone);
  if (polys.length === 0) return null;
  const bb = polysBBox(polys);
  if (!bb || bb.w <= 0 || bb.h <= 0) return null;

  const parsedPolys: Array<{ pts: Pt[] }> = polys.map((p) => ({
    pts: parsePts(p.points),
  }));

  const rnd = mulberry32(seed + veinSeedIndex * 2.718 + zone.charCodeAt(0) * 0.13);

  // Split bounding box width into totalLanesInZone equal vertical lanes
  const laneW = bb.w / Math.max(1, totalLanesInZone);
  const laneMinX = bb.minX + laneIndex * laneW;
  const pad = Math.max(0.1, laneW * 0.08);
  const left = laneMinX + pad;
  const right = laneMinX + laneW - pad;
  const usableW = Math.max(0.5, right - left);

  const isInside = (x: number, y: number): boolean => {
    return parsedPolys.some((p) => pointInPoly(x, y, p.pts));
  };

  // Up to 35 honest attempts to generate a 100% valid smooth vein inside leg polygon mesh
  for (let attempt = 0; attempt < 35; attempt++) {
    // 1. Absolute vein length formula based on unit (clamped between 8*unit and 28*unit)
    const rawL = (12 + rnd() * 10) * unit;
    const L = Math.max(8.0 * unit, Math.min(28.0 * unit, rawL));

    // 2. Expand placement height range to 20% - 85% of zone height
    let xStart = left + usableW * rnd();
    let yStart = bb.minY + bb.h * (0.20 + 0.65 * rnd());

    let foundStart = isInside(xStart, yStart);
    if (!foundStart) {
      for (let tryIdx = 0; tryIdx < 20; tryIdx++) {
        const sx = left + usableW * rnd();
        const sy = bb.minY + bb.h * (0.20 + 0.65 * rnd());
        if (isInside(sx, sy)) {
          xStart = sx;
          yStart = sy;
          foundStart = true;
          break;
        }
      }
    }

    if (!foundStart) continue;

    // Direction angle: ±40° from vertical downward (50° to 130°) with narrowing on retries
    const maxSpread = attempt < 12 ? 80 : attempt < 24 ? 50 : 30;
    const angleDeg = 90 + (rnd() - 0.5) * maxSpread;
    const angleRad = (Math.PI / 180) * angleDeg;

    let dx = Math.cos(angleRad) * L;
    let dy = Math.abs(Math.sin(angleRad) * L);

    let xEnd = xStart + dx;
    let yEnd = yStart + dy;

    // Try fitting main vector P_start -> P_end inside polygon
    let validEndFound = false;
    for (let step = 1.0; step >= 0.35; step -= 0.15) {
      const tx = xStart + dx * step;
      const ty = yStart + dy * step;
      if (isInside(tx, ty)) {
        xEnd = tx;
        yEnd = ty;
        validEndFound = true;
        break;
      }
    }

    if (!validEndFound) {
      dx = -dx; // Flip angle direction
      for (let step = 1.0; step >= 0.35; step -= 0.15) {
        const tx = xStart + dx * step;
        const ty = yStart + dy * step;
        if (isInside(tx, ty)) {
          xEnd = tx;
          yEnd = ty;
          validEndFound = true;
          break;
        }
      }
    }

    if (!validEndFound) continue;

    const strokeLen = Math.hypot(xEnd - xStart, yEnd - yStart);
    if (strokeLen < 2.0 * unit) continue;

    // 3. Generate 2 intermediate control points with smooth fractal offsets
    const t1 = 0.33;
    const t2 = 0.66;
    const offsetAmp = Math.min(2.5 * unit, strokeLen * 0.15);
    const nx = -(yEnd - yStart) / strokeLen;
    const ny = (xEnd - xStart) / strokeLen;

    let p0: [number, number] = [xStart, yStart];
    let p1: [number, number] = [
      xStart + (xEnd - xStart) * t1 + nx * (rnd() - 0.5) * offsetAmp,
      yStart + (yEnd - yStart) * t1 + ny * (rnd() - 0.5) * offsetAmp,
    ];
    let p2: [number, number] = [
      xStart + (xEnd - xStart) * t2 + nx * (rnd() - 0.5) * offsetAmp,
      yStart + (yEnd - yStart) * t2 + ny * (rnd() - 0.5) * offsetAmp,
    ];
    let p3: [number, number] = [xEnd, yEnd];

    // Sample smooth curve points
    const curvePts = sampleMainCurvePoints(p0, p1, p2, p3);

    // Verify ENTIRE smooth curve is strictly inside polygon mesh
    if (!isCurveInsidePolys(curvePts, parsedPolys)) {
      // Fallback control points to straight line
      p1 = [xStart + (xEnd - xStart) * t1, yStart + (yEnd - yStart) * t1];
      p2 = [xStart + (xEnd - xStart) * t2, yStart + (yEnd - yStart) * t2];
      const straightCurvePts = sampleMainCurvePoints(p0, p1, p2, p3);
      if (!isCurveInsidePolys(straightCurvePts, parsedPolys)) {
        continue; // Reject attempt!
      }
    }

    const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    let mainPathD = `M ${p0[0].toFixed(1)},${p0[1].toFixed(1)} Q ${p1[0].toFixed(1)},${p1[0].toFixed(1)} ${mid[0].toFixed(1)},${mid[1].toFixed(1)} Q ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0].toFixed(1)},${p3[1].toFixed(1)}`;
    // Fix typo in Q p1 string formatting
    mainPathD = `M ${p0[0].toFixed(1)},${p0[1].toFixed(1)} Q ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${mid[0].toFixed(1)},${mid[1].toFixed(1)} Q ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0].toFixed(1)},${p3[1].toFixed(1)}`;

    // 4. Vein Branching (~50% chance per seed): short fork from main vein
    let branchPathD = "";
    const hasBranch = rnd() < 0.50;
    if (hasBranch) {
      const tFork = 0.35 + 0.30 * rnd(); // Fork at 35% - 65% of main curve length
      const pFork = tFork <= 0.5 ? quadBezier(p0, p1, mid, tFork * 2) : quadBezier(mid, p2, p3, (tFork - 0.5) * 2);

      // Local tangent direction at pFork
      const pForkNext =
        tFork + 0.05 <= 0.5
          ? quadBezier(p0, p1, mid, (tFork + 0.05) * 2)
          : quadBezier(mid, p2, p3, (tFork + 0.05 - 0.5) * 2);
      const tanDx = pForkNext[0] - pFork[0];
      const tanDy = pForkNext[1] - pFork[1];
      const tanAngle = Math.atan2(tanDy, tanDx);

      // Branch angle: main angle ± (25° to 45°)
      const branchAngleOffset = (25 + 20 * rnd()) * (Math.PI / 180) * (rnd() < 0.5 ? 1 : -1);
      const branchAngle = tanAngle + branchAngleOffset;

      // Branch length: 35% - 50% of main vein strokeLen
      const branchLen = strokeLen * (0.35 + 0.15 * rnd());

      const pbEnd: [number, number] = [
        pFork[0] + Math.cos(branchAngle) * branchLen,
        pFork[1] + Math.sin(branchAngle) * branchLen,
      ];
      const pbCtrl: [number, number] = [
        pFork[0] + Math.cos(branchAngle + (rnd() - 0.5) * 0.2) * (branchLen * 0.5),
        pFork[1] + Math.sin(branchAngle + (rnd() - 0.5) * 0.2) * (branchLen * 0.5),
      ];

      // Sample 7 points along branch quadratic curve
      const branchPts: Array<[number, number]> = [];
      for (const bt of [0, 0.2, 0.4, 0.6, 0.8, 1.0]) {
        branchPts.push(quadBezier(pFork, pbCtrl, pbEnd, bt));
      }

      // If branch passes contour check, add to path! (Otherwise omit branch, main line stays)
      if (isCurveInsidePolys(branchPts, parsedPolys)) {
        branchPathD = ` M ${pFork[0].toFixed(1)},${pFork[1].toFixed(1)} Q ${pbCtrl[0].toFixed(1)},${pbCtrl[1].toFixed(1)} ${pbEnd[0].toFixed(1)},${pbEnd[1].toFixed(1)}`;
      }
    }

    const fullPathD = `${mainPathD}${branchPathD}`;

    return {
      zone,
      pathD: fullPathD,
      key: `vein-${zone}-lane${laneIndex}-${veinSeedIndex}`,
    };
  }

  return null;
}

export function LimbVeins({
  tier,
  count,
  seed,
  unit,
  zoneTransforms,
}: LimbVeinsProps): React.ReactElement | null {
  // Use STRICTLY leg zones (arm zones completely excluded)
  const veinZones = FOX_VEIN_ZONES_BY_TIER[tier] ?? [];

  // Clamp total figure vein count strictly between 1 and 5
  const maxTotalVeins = Math.max(1, Math.min(5, count));

  const veins = useMemo(() => {
    if (maxTotalVeins <= 0 || veinZones.length === 0) return [];
    const out: VeinPolyline[] = [];

    // Distribute total maxTotalVeins across available leg zones
    const countsPerZone: Record<string, number> = {};
    for (let i = 0; i < maxTotalVeins; i++) {
      const z = veinZones[i % veinZones.length];
      if (z) countsPerZone[z] = (countsPerZone[z] ?? 0) + 1;
    }

    const laneIndexPerZone: Record<string, number> = {};

    for (let i = 0; i < maxTotalVeins; i++) {
      const z = veinZones[i % veinZones.length];
      if (!z) continue;
      const totalInZone = countsPerZone[z] ?? 1;
      const laneIdx = laneIndexPerZone[z] ?? 0;
      laneIndexPerZone[z] = laneIdx + 1;

      const vein = generateDiagonalVeinInPolys(tier, z, laneIdx, totalInZone, i, seed, unit);
      if (vein) out.push(vein);
    }

    return out;
  }, [tier, veinZones, maxTotalVeins, seed, unit]);

  if (veins.length === 0) return null;

  const N = veins.length;
  // Fixed 2.0s gap between consecutive vein starts
  const minGapBetweenStarts = MIN_GAP_BETWEEN_STARTS;
  const totalCycleWindow = N * minGapBetweenStarts;
  const T = totalCycleWindow;

  // 1. Core stroke keyTimes:
  // Beat 1: 0..0.18s rise, 0.18s..0.36s fall
  // Inter-beat pause: 0.36s..0.46s
  // Beat 2: 0.46s..0.64s rise, 0.64s..0.82s fall
  // Long rest: 0.82s..T
  const k0 = 0;
  const k1 = (0.18 / T).toFixed(4);
  const k2 = (0.36 / T).toFixed(4);
  const k3 = (0.46 / T).toFixed(4);
  const k4 = (0.64 / T).toFixed(4);
  const k5 = (0.82 / T).toFixed(4);
  const k6 = 1;

  const coreKeyTimes = `${k0};${k1};${k2};${k3};${k4};${k5};${k6}`;

  const baseStrokeWidth = 1.35 * unit;
  const peakStrokeWidth = baseStrokeWidth * 2.2;
  const strokeValuesStr = `${baseStrokeWidth.toFixed(2)};${peakStrokeWidth.toFixed(2)};${baseStrokeWidth.toFixed(2)};${baseStrokeWidth.toFixed(2)};${peakStrokeWidth.toFixed(2)};${baseStrokeWidth.toFixed(2)};${baseStrokeWidth.toFixed(2)}`;
  const coreOpacityValues = "0.35;0.85;0.35;0.35;0.85;0.35;0.35";

  // 2. Secondary diffuse pulse wave keyTimes (phase-shifted later with slower decay):
  // Beat 1: 0..0.22s rise, 0.22s..0.45s fall (slower)
  // Inter-beat pause: 0.45s..0.52s
  // Beat 2: 0.52s..0.74s rise, 0.74s..0.98s fall (slower)
  // Long rest: 0.98s..T
  const g0 = 0;
  const g1 = (0.22 / T).toFixed(4);
  const g2 = (0.45 / T).toFixed(4);
  const g3 = (0.52 / T).toFixed(4);
  const g4 = (0.74 / T).toFixed(4);
  const g5 = (0.98 / T).toFixed(4);
  const g6 = 1;

  const waveKeyTimes = `${g0};${g1};${g2};${g3};${g4};${g5};${g6}`;

  const waveBaseStrokeWidth = baseStrokeWidth * 2.8;
  const wavePeakStrokeWidth = baseStrokeWidth * 4.2;
  const waveStrokeValues = `${waveBaseStrokeWidth.toFixed(2)};${wavePeakStrokeWidth.toFixed(2)};${waveBaseStrokeWidth.toFixed(2)};${waveBaseStrokeWidth.toFixed(2)};${wavePeakStrokeWidth.toFixed(2)};${waveBaseStrokeWidth.toFixed(2)};${waveBaseStrokeWidth.toFixed(2)}`;
  const waveOpacityValues = "0.00;0.20;0.00;0.00;0.20;0.00;0.00";

  // Group veins by zone for per-zone transform
  const byZone = new Map<string, Array<{ vein: VeinPolyline; globalIndex: number }>>();
  veins.forEach((vein, globalIndex) => {
    const list = byZone.get(vein.zone) ?? [];
    list.push({ vein, globalIndex });
    byZone.set(vein.zone, list);
  });

  return (
    <g className="fox-limb-veins" style={{ pointerEvents: "none" }}>
      <defs>
        <filter id="fox-vein-core-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="fox-vein-pulse-wave" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
        </filter>
      </defs>
      {[...byZone.entries()].map(([zone, items]) => {
        const tr = zoneTransforms?.[zone];
        return (
          <g key={zone} {...(tr ? { transform: tr } : {})}>
            {items.map(({ vein, globalIndex }) => {
              const mainDelay = globalIndex * minGapBetweenStarts;
              const waveDelay = mainDelay + 0.10; // Phase shift +0.10s later for pulse wave

              return (
                <g key={vein.key}>
                  {/* Layer A: Diffuse propagating pulse wave (wider stroke, blurred, phase-shifted +0.10s) */}
                  <path
                    d={vein.pathD}
                    stroke={VEIN_GLOW_COLOR}
                    strokeWidth={waveBaseStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.0}
                    filter="url(#fox-vein-pulse-wave)"
                  >
                    <animate
                      attributeName="stroke-width"
                      values={waveStrokeValues}
                      keyTimes={waveKeyTimes}
                      dur={`${T.toFixed(2)}s`}
                      begin={`${waveDelay.toFixed(3)}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values={waveOpacityValues}
                      keyTimes={waveKeyTimes}
                      dur={`${T.toFixed(2)}s`}
                      begin={`${waveDelay.toFixed(3)}s`}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Layer B: Core crisp vein stroke */}
                  <path
                    d={vein.pathD}
                    stroke={VEIN_COLOR}
                    strokeWidth={baseStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.35}
                    filter="url(#fox-vein-core-glow)"
                  >
                    <animate
                      attributeName="stroke-width"
                      values={strokeValuesStr}
                      keyTimes={coreKeyTimes}
                      dur={`${T.toFixed(2)}s`}
                      begin={`${mainDelay.toFixed(3)}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values={coreOpacityValues}
                      keyTimes={coreKeyTimes}
                      dur={`${T.toFixed(2)}s`}
                      begin={`${mainDelay.toFixed(3)}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
