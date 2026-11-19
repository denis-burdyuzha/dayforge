import React, { useMemo, useState, useLayoutEffect, useRef } from "react";
import { CLASS_FORMATION_COLOR, shadeColor } from "../../creatureFxPalette";
import { getTierPolys, mulberry32, parsePts, pointInPoly, type FoxTierIndex, type Pt } from "./foxZones";

interface DisciplineFormationProps {
  avatarCenter: { cx: number; cy: number };
  avatarHalfDiag: number;
  disciplineLerp: number; // 0 (chaos at Disc=1) .. 1 (order at Disc=18)
  particleJitter: number;
  seed: number;
  formationColor?: string | undefined;
  tierIndex?: FoxTierIndex;
  scale?: number;
  tx?: number;
  ty?: number;
}

const DISCIPLINE_FORMATION_COUNT = 6;
const BIPYRAMID_SIDES = 6;

export const DisciplineFormation: React.FC<DisciplineFormationProps> = ({
  avatarCenter,
  avatarHalfDiag,
  disciplineLerp,
  particleJitter: _particleJitter,
  seed,
  formationColor,
  tierIndex,
  scale = 1,
  tx = 0,
  ty = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1.25); // Fallback scale: 250px container / 200 viewBox = 1.25

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScaleFactor(width / 200);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. Crystal Size scaling (scaled down by ~48-50% from 0.25 to 0.13)
  const rawScale = avatarHalfDiag * 0.13;
  const minSize = 6;
  const maxSize = 12;
  const viewBoxCrystalScale = Math.max(minSize, Math.min(maxSize, rawScale));
  const crystalScale = viewBoxCrystalScale * scaleFactor;

  const baseColor = formationColor ?? CLASS_FORMATION_COLOR.explorer;
  const MIN_GAP = viewBoxCrystalScale * 1.5 + 10;
  const MAX_GAP = MIN_GAP + 26;

  // 2. Pre-calculate 3D geometry parameters for 6-sided bipyramid (in screen CSS px)
  const bipyramidGeom = useMemo(() => {
    const N = BIPYRAMID_SIDES;
    const totalHeight = crystalScale * 1.6;
    const topH = totalHeight * 0.5;
    const botH = totalHeight * 0.5;
    const waistWidth = crystalScale * 0.85;

    const R = waistWidth / 2; // waist radius in screen px
    const D = R * Math.cos(Math.PI / N); // perpendicular distance to edge center (translateZ depth)
    const segW = 2 * R * Math.sin(Math.PI / N); // edge segment width in screen px

    const topSlant = Math.hypot(D, topH);
    const topPitch = (Math.atan2(topH, D) * 180) / Math.PI;
    const topTilt = 90 - topPitch;

    const botSlant = Math.hypot(D, botH);
    const botPitch = (Math.atan2(botH, D) * 180) / Math.PI;
    const botTilt = 90 - botPitch;

    const topFacets = Array.from({ length: N }, (_, i) => {
      const angleDeg = (i * 360) / N;
      // Baked light orientation (light from top-left front at -45 deg)
      const lightAngleRad = ((angleDeg + 30 + 45) * Math.PI) / 180;
      const offset = 0.35 * Math.cos(lightAngleRad);
      const color = shadeColor(baseColor, offset + 0.05);

      return {
        angleY: angleDeg,
        depth: D,
        tiltX: topTilt,
        width: segW,
        height: topSlant,
        color,
      };
    });

    const botFacets = Array.from({ length: N }, (_, i) => {
      const angleDeg = (i * 360) / N;
      const lightAngleRad = ((angleDeg + 30 + 45) * Math.PI) / 180;
      const offset = 0.35 * Math.cos(lightAngleRad);
      const color = shadeColor(baseColor, offset - 0.08);

      return {
        angleY: angleDeg,
        depth: D,
        tiltX: botTilt,
        width: segW,
        height: botSlant,
        color,
      };
    });

    return { totalHeight, waistWidth, topFacets, botFacets };
  }, [crystalScale, baseColor]);

  // 3. Canvas body polygons for silhouette ray-marching
  const bodyCanvasPolys = useMemo(() => {
    if (!tierIndex) return [];
    const rawPolys = getTierPolys(tierIndex);
    return rawPolys.map((poly) => {
      const pts = parsePts(poly.points);
      return pts.map(([x, y]) => [tx + x * scale, ty + y * scale] as Pt);
    });
  }, [tierIndex, tx, ty, scale]);

  const isPointInSilhouette = (x: number, y: number): boolean => {
    if (bodyCanvasPolys.length === 0) return false;
    return bodyCanvasPolys.some((polyPts) => pointInPoly(x, y, polyPts));
  };

  const getSilhouetteDistance = (cx: number, cy: number, angleRad: number): number => {
    if (bodyCanvasPolys.length === 0) return avatarHalfDiag * 0.6;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    let maxInsideR = 0;
    for (let r = 0; r <= 170; r += 2.5) {
      const px = cx + r * cosA;
      const py = cy + r * sinA;
      if (isPointInSilhouette(px, py)) {
        maxInsideR = r;
      }
    }
    return maxInsideR > 0 ? maxInsideR : avatarHalfDiag * 0.6;
  };

  // 4. Calculate initial crystal positions (Ray-marching + orderRadius)
  const baseAngleOffset = -Math.PI / 2;
  const orderAngles = Array.from({ length: DISCIPLINE_FORMATION_COUNT }, (_, i) =>
    baseAngleOffset + (i / DISCIPLINE_FORMATION_COUNT) * Math.PI * 2
  );
  const orderSilDists = orderAngles.map((angle) =>
    getSilhouetteDistance(avatarCenter.cx, avatarCenter.cy, angle)
  );
  const maxOrderSilDist = Math.max(...orderSilDists);
  const orderRadius = maxOrderSilDist + MIN_GAP;

  const crystalPolar = Array.from({ length: DISCIPLINE_FORMATION_COUNT }, (_, i) => {
    const angleOrder = orderAngles[i]!;

    const prng = mulberry32(seed + i * 17.317);
    const angleChaos = prng() * Math.PI * 2 - Math.PI;
    const silDistChaos = getSilhouetteDistance(avatarCenter.cx, avatarCenter.cy, angleChaos);
    const gapChaos = MIN_GAP + prng() * (MAX_GAP - MIN_GAP);
    const distChaos = silDistChaos + gapChaos;

    let angleDiff = angleOrder - angleChaos;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const angle = angleChaos + angleDiff * disciplineLerp;
    const dist = distChaos + (orderRadius - distChaos) * disciplineLerp;

    return { angle, dist, angleOrder };
  });

  // Step C: Collision resolution pass
  const count = DISCIPLINE_FORMATION_COUNT;
  const minDistBetweenCenters = viewBoxCrystalScale * 2.1;

  for (let pass = 0; pass < 5; pass++) {
    let overlapFound = false;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const cpI = crystalPolar[i]!;
        const cpJ = crystalPolar[j]!;

        const xi = avatarCenter.cx + cpI.dist * Math.cos(cpI.angle);
        const yi = avatarCenter.cy + cpI.dist * Math.sin(cpI.angle);
        const xj = avatarCenter.cx + cpJ.dist * Math.cos(cpJ.angle);
        const yj = avatarCenter.cy + cpJ.dist * Math.sin(cpJ.angle);

        const currentDist = Math.hypot(xj - xi, yj - yi);
        if (currentDist < minDistBetweenCenters && currentDist > 0.001) {
          overlapFound = true;
          const avgR = (cpI.dist + cpJ.dist) / 2;
          const reqArc = minDistBetweenCenters - currentDist;
          const deltaAngle = reqArc / Math.max(10, avgR);

          let diff = cpJ.angle - cpI.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          const sign = diff >= 0 ? 1 : -1;
          cpI.angle -= (deltaAngle / 2) * sign;
          cpJ.angle += (deltaAngle / 2) * sign;
        }
      }
    }
    if (!overlapFound) break;
  }

  // Step D: Build final crystal transforms
  const crystals = crystalPolar.map((cp, i) => {
    const exactSil = getSilhouetteDistance(avatarCenter.cx, avatarCenter.cy, cp.angle);
    let safeDist = Math.max(cp.dist, exactSil + MIN_GAP);
    let cx = avatarCenter.cx + safeDist * Math.cos(cp.angle);
    let cy = avatarCenter.cy + safeDist * Math.sin(cp.angle);

    let pushCount = 0;
    while (
      pushCount < 15 &&
      (isPointInSilhouette(cx, cy) ||
        isPointInSilhouette(cx - 3, cy) ||
        isPointInSilhouette(cx + 3, cy) ||
        isPointInSilhouette(cx, cy - 3) ||
        isPointInSilhouette(cx, cy + 3))
    ) {
      safeDist += 3;
      cx = avatarCenter.cx + safeDist * Math.cos(cp.angle);
      cy = avatarCenter.cy + safeDist * Math.sin(cp.angle);
      pushCount++;
    }

    const targetRotDeg = (cp.angle * 180) / Math.PI + 90;
    const jitterRotDeg = ((seed * 137.5 + i * 83.1) % 360) - 180;
    const rotDeg = jitterRotDeg * (1 - disciplineLerp) + targetRotDeg * disciplineLerp;

    const isFlipping = disciplineLerp < 0.95;
    const flipDur = (2.0 + (i % 3) * 0.6) / Math.max(0.08, 1 - disciplineLerp * 0.85);

    const wobbleAmp = avatarHalfDiag * 0.055 * scaleFactor;
    const wobbleDur = 1.8 + ((i * 3.7 + seed * 1.3) % 1.2);
    const wobbleDx = Math.cos(seed * 2.3 + i * 1.7) * wobbleAmp;
    const wobbleDy = Math.sin(seed * 2.3 + i * 1.7) * wobbleAmp;

    const corePulseDur = 2.2 + ((i * 0.27 + seed * 0.13) % 0.7);

    return {
      cx,
      cy,
      rotDeg,
      isFlipping,
      flipDur,
      wobbleDur,
      wobbleDx,
      wobbleDy,
      corePulseDur,
    };
  });

  const perspectivePx = 300 * scaleFactor;

  return (
    <div
      ref={containerRef}
      className="fox-discipline-formation-3d-overlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <style>{`
        @keyframes spin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes corePulseAnim {
          0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.9); }
          50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>

      {crystals.map((c, i) => {
        const leftPct = (c.cx / 200) * 100;
        const topPct = (c.cy / 240) * 100;

        return (
          <div
            key={`disc-crystal-3d-${i}`}
            style={{
              position: "absolute",
              left: `${leftPct.toFixed(2)}%`,
              top: `${topPct.toFixed(2)}%`,
              transform: "translate(-50%, -50%)",
              perspective: `${perspectivePx.toFixed(1)}px`,
              pointerEvents: "none",
            }}
          >
            {/* Wobble Stance & Orientation Group */}
            <div
              style={{
                position: "relative",
                width: `${crystalScale.toFixed(1)}px`,
                height: `${bipyramidGeom.totalHeight.toFixed(1)}px`,
                transformStyle: "preserve-3d",
                transform: `translate(${c.wobbleDx.toFixed(1)}px, ${c.wobbleDy.toFixed(1)}px) rotate(${c.rotDeg.toFixed(1)}deg)`,
              }}
            >
              {/* Outer Ambient Glow / Shadow Layer */}
              <div
                style={{
                  position: "absolute",
                  inset: `${(-6 * scaleFactor).toFixed(1)}px`,
                  borderRadius: "50%",
                  background: baseColor,
                  filter: `blur(${(6 * scaleFactor).toFixed(1)}px)`,
                  opacity: 0.45,
                  pointerEvents: "none",
                }}
              />

              {/* Inner Magical Pulsing Core */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${(crystalScale * 0.55).toFixed(1)}px`,
                  height: `${(bipyramidGeom.totalHeight * 0.55).toFixed(1)}px`,
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse at center, #ffffff 0%, ${baseColor} 55%, transparent 100%)`,
                  animation: `corePulseAnim ${c.corePulseDur.toFixed(2)}s ease-in-out infinite`,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              {/* 3D Rotating Bipyramid Crystal */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                  animation: c.isFlipping
                    ? `spin3D ${c.flipDur.toFixed(2)}s linear infinite`
                    : "none",
                }}
              >
                {/* 6 Top Pyramid Facets */}
                {bipyramidGeom.topFacets.map((f, idx) => (
                  <div
                    key={`top-${idx}`}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "0px",
                      width: `${f.width.toFixed(2)}px`,
                      height: `${f.height.toFixed(2)}px`,
                      marginLeft: `${(-f.width / 2).toFixed(2)}px`,
                      backgroundColor: f.color,
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                      transformOrigin: "50% 100%",
                      transform: `rotateY(${f.angleY}deg) translateZ(${f.depth.toFixed(2)}px) rotateX(${f.tiltX.toFixed(2)}deg)`,
                      backfaceVisibility: "hidden",
                    }}
                  />
                ))}

                {/* 6 Bottom Pyramid Facets */}
                {bipyramidGeom.botFacets.map((f, idx) => (
                  <div
                    key={`bot-${idx}`}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: "0px",
                      width: `${f.width.toFixed(2)}px`,
                      height: `${f.height.toFixed(2)}px`,
                      marginLeft: `${(-f.width / 2).toFixed(2)}px`,
                      backgroundColor: f.color,
                      clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                      transformOrigin: "50% 0%",
                      transform: `rotateY(${f.angleY}deg) translateZ(${f.depth.toFixed(2)}px) rotateX(${-f.tiltX.toFixed(2)}deg)`,
                      backfaceVisibility: "hidden",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

