/**
 * PulseLine — общий приём «бегущий импульс» вдоль отрезка.
 *
 * Короткий штрих (stroke-dasharray) едет от (x1,y1) к (x2,y2) через SMIL-анимацию
 * stroke-dashoffset + затухающую opacity. Используется и Intelligence (синие импульсы
 * от центроида фасета к вершинам), и Endurance (багровые жилы вдоль рёбер конечностей).
 */

import React from "react";

interface PulseLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  /** длительность одного цикла, сек */
  dur: number;
  /** задержка старта, сек (детерминированный рассинхрон) */
  delay: number;
  /** длина бегущего штриха в единицах asset-space */
  dashLen: number;
}

export function PulseLine({
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth,
  dur,
  delay,
  dashLen,
}: PulseLineProps): React.ReactElement | null {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 0.5) return null;
  const gapLen = L + dashLen + 20;
  const durStr = `${dur.toFixed(2)}s`;
  const beginStr = `${delay.toFixed(2)}s`;

  return (
    <path
      d={`M ${x1.toFixed(1)},${y1.toFixed(1)} L ${x2.toFixed(1)},${y2.toFixed(1)}`}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={`${dashLen.toFixed(1)} ${gapLen.toFixed(1)}`}
      style={{ pointerEvents: "none" }}
    >
      <animate
        attributeName="stroke-dashoffset"
        values={`${dashLen.toFixed(1)}; ${dashLen.toFixed(1)}; ${(-L).toFixed(1)}; ${(-L).toFixed(1)}`}
        keyTimes="0; 0.08; 0.32; 1"
        dur={durStr}
        begin={beginStr}
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0; 0.95; 0.95; 0; 0"
        keyTimes="0; 0.08; 0.28; 0.34; 1"
        dur={durStr}
        begin={beginStr}
        repeatCount="indefinite"
      />
    </path>
  );
}
