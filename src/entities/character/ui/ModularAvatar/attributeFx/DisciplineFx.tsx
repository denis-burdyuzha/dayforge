import type React from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { computeDisciplineCrystals } from "./computeDiscipline";
import { FX_CANVAS, type FxContext } from "./fxContext";
import { darken, mixHex } from "./fxPalette";

const BIPYRAMID_SIDES = 6;
/** Static 3D turn so the bipyramid reads as a volume (no rotation animation) */
const STATIC_TURN_DEG = 28;

/** Facet shade: k > 0 mixes the accent towards `light`, k < 0 darkens it (palette-only colours) */
function facetShade(base: string, light: string, k: number): string {
  return k >= 0 ? mixHex(base, light, k) : darken(base, -k);
}

/**
 * Discipline — static CSS-3D bipyramid crystals in the class `accent` colour, foreground HTML overlay.
 * Count, placement and the safe silhouette gap come from computeDisciplineCrystals().
 */
export function DisciplineFx({ ctx }: { ctx: FxContext }): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1.25);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScaleFactor(width / FX_CANVAS.w);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formation = computeDisciplineCrystals(ctx);
  const { accent, light } = ctx.palette;
  const crystalPx = (formation?.crystalSize ?? 8) * scaleFactor;

  const geom = useMemo(() => {
    const N = BIPYRAMID_SIDES;
    const totalHeight = crystalPx * 1.6;
    const half = totalHeight * 0.5;
    const R = (crystalPx * 0.85) / 2;
    const D = R * Math.cos(Math.PI / N);
    const segW = 2 * R * Math.sin(Math.PI / N);
    const slant = Math.hypot(D, half);
    const tilt = 90 - (Math.atan2(half, D) * 180) / Math.PI;
    const facets = (offset: number) =>
      Array.from({ length: N }, (_, i) => {
        const angleDeg = (i * 360) / N;
        const k = 0.35 * Math.cos(((angleDeg + 75) * Math.PI) / 180) + offset;
        return { angleY: angleDeg, color: facetShade(accent, light, k) };
      });
    return { totalHeight, D, segW, slant, tilt, top: facets(0.05), bottom: facets(-0.08) };
  }, [crystalPx, accent, light]);

  if (!formation)
    return (
      <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    );

  return (
    <div
      ref={containerRef}
      className="attr-fx-discipline"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
    >
      {formation.crystals.map((c, i) => (
        <div
          key={`disc-crystal-${i}`}
          style={{
            position: "absolute",
            left: `${((c.p[0] / FX_CANVAS.w) * 100).toFixed(2)}%`,
            top: `${((c.p[1] / FX_CANVAS.h) * 100).toFixed(2)}%`,
            transform: "translate(-50%, -50%)",
            perspective: `${(300 * scaleFactor).toFixed(1)}px`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: `${crystalPx.toFixed(1)}px`,
              height: `${geom.totalHeight.toFixed(1)}px`,
              transformStyle: "preserve-3d",
              transform: `rotate(${c.tilt.toFixed(1)}deg)`,
            }}
          >
            {/* soft static glow */}
            <div
              style={{
                position: "absolute",
                inset: `${(-6 * scaleFactor).toFixed(1)}px`,
                borderRadius: "50%",
                background: accent,
                filter: `blur(${(6 * scaleFactor).toFixed(1)}px)`,
                opacity: 0.35,
              }}
            />
            {/* static inner core */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${(crystalPx * 0.55).toFixed(1)}px`,
                height: `${(geom.totalHeight * 0.55).toFixed(1)}px`,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(ellipse at center, ${light} 0%, ${accent} 55%, transparent 100%)`,
                opacity: 0.7,
                zIndex: 2,
              }}
            />
            {/* bipyramid, turned once for volume — no animation */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transform: `rotateY(${STATIC_TURN_DEG}deg)`,
              }}
            >
              {geom.top.map((f, idx) => (
                <div
                  key={`top-${idx}`}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    width: `${geom.segW.toFixed(2)}px`,
                    height: `${geom.slant.toFixed(2)}px`,
                    marginLeft: `${(-geom.segW / 2).toFixed(2)}px`,
                    backgroundColor: f.color,
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    transformOrigin: "50% 100%",
                    transform: `rotateY(${f.angleY}deg) translateZ(${geom.D.toFixed(2)}px) rotateX(${geom.tilt.toFixed(2)}deg)`,
                    backfaceVisibility: "hidden",
                  }}
                />
              ))}
              {geom.bottom.map((f, idx) => (
                <div
                  key={`bot-${idx}`}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 0,
                    width: `${geom.segW.toFixed(2)}px`,
                    height: `${geom.slant.toFixed(2)}px`,
                    marginLeft: `${(-geom.segW / 2).toFixed(2)}px`,
                    backgroundColor: f.color,
                    clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                    transformOrigin: "50% 0%",
                    transform: `rotateY(${f.angleY}deg) translateZ(${geom.D.toFixed(2)}px) rotateX(${(-geom.tilt).toFixed(2)}deg)`,
                    backfaceVisibility: "hidden",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
