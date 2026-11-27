/**
 * Pure helpers of scripts/buildCreatureAssets.mjs (unit-tested in scripts/creatureAssets.test.ts):
 * SVG → polygons (document order = z-order), the `aspectAccent` group → aspectAccentIds, canvas fit,
 * tier file resolution with fallback to the nearest lower tier, TS module text.
 */
import fs from "node:fs";
import path from "node:path";

export const TIERS = [1, 2, 3, 4, 5];
/**
 * Avatar canvas and the fit rule shared by every creature (also the fox, see foxEvolutionConfig):
 * scale = min(208 · 0.86 / bbox height, 168 / bbox width); the bbox is centred horizontally on x = 100 and
 * its bottom stands on the common ground line y = 212 (where the ground shadow is drawn).
 * So the height is 86 % of the 208 field unless the width (168) is the limit.
 */
export const CANVAS = { w: 200, h: 240, fieldW: 168, fieldH: 208, heightShare: 0.86, groundY: 212 };
export const ACCENT_GROUP_ID = "aspectAccent";

const attrOf = (attrs, name) => new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs)?.[1];

function fillOf(attrs) {
  const fill = attrOf(attrs, "fill");
  if (fill) return fill;
  const style = attrOf(attrs, "style");
  return style ? /(?:^|;)\s*fill\s*:\s*([^;]+)/.exec(style)?.[1]?.trim() : undefined;
}

/**
 * Parse one creature SVG.
 * - every <polygon> in document order, with its fill (no palette remap);
 * - polygons anywhere inside an element with id="aspectAccent" (any nesting depth) → aspectAccentIds;
 * - a polygon without an id gets a stable generated id `<label>_p<index>` (index in document order);
 * - duplicate ids get a `_<n>` suffix; `transform` attributes are not supported (error);
 * - background leftovers (near-black / transparent polygons sticking out of the animal, see
 *   findBackgroundLeftovers) are dropped; their count is returned in `filtered`.
 * @param {string} svg
 * @param {string} label file label for messages / generated ids, e.g. "bearL1"
 */
export function parseCreatureSvg(svg, label) {
  const viewBox = /<svg\b[^>]*\bviewBox="([^"]+)"/.exec(svg)?.[1] ?? "";
  const warnings = [];
  const polygons = [];
  const aspectAccentIds = [];
  const seen = new Map();
  /** stack of open elements: true = this element is (inside) the accent group */
  const stack = [];
  let accentGroups = 0;
  const tagRe = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(svg))) {
    const [, closing, name, attrs, selfClosing] = m;
    if (closing) {
      stack.pop();
      continue;
    }
    if (/(?:^|\s)transform="/.test(attrs)) {
      throw new Error(
        `${label}: <${name}> has a transform — not supported, flatten it in the SVG editor`,
      );
    }
    const parentAccent = stack.length > 0 && stack[stack.length - 1];
    const isAccent = parentAccent || attrOf(attrs, "id") === ACCENT_GROUP_ID;
    if (attrOf(attrs, "id") === ACCENT_GROUP_ID) accentGroups++;

    if (name === "polygon") {
      const points = attrOf(attrs, "points")?.trim().replace(/\s+/g, " ");
      const fill = fillOf(attrs);
      if (!points || !fill) {
        warnings.push(`${label}: polygon #${polygons.length} without points/fill skipped`);
      } else {
        let id = attrOf(attrs, "id") || `${label}_p${polygons.length}`;
        const n = seen.get(id) ?? 0;
        seen.set(id, n + 1);
        if (n > 0) id = `${id}_${n}`;
        const opacity = Math.min(
          ...[attrOf(attrs, "opacity"), attrOf(attrs, "fill-opacity")]
            .filter((v) => v !== undefined)
            .map(Number),
          1,
        );
        polygons.push({ id, points, defaultFill: fill.toLowerCase(), opacity });
        if (isAccent) aspectAccentIds.push(id);
      }
    }
    // every non-self-closing element (a <polygon …></polygon> too) is popped by its closing tag
    if (!selfClosing) stack.push(isAccent);
  }
  if (accentGroups === 0) {
    warnings.push(`${label}: no <g id="${ACCENT_GROUP_ID}"> — aspectAccentIds = []`);
  } else if (aspectAccentIds.length === 0) {
    warnings.push(`${label}: <g id="${ACCENT_GROUP_ID}"> has no polygons`);
  }
  const drop = new Set(findBackgroundLeftovers(polygons));
  const kept = polygons
    .filter((p) => !drop.has(p.id))
    .map(({ id, points, defaultFill }) => ({ id, points, defaultFill }));
  return {
    viewBox,
    polygons: kept,
    aspectAccentIds: aspectAccentIds.filter((id) => !drop.has(id)),
    warnings,
    filtered: drop.size,
  };
}

const bboxOf = (polygons) => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of polygons)
    for (const pair of p.points.split(" ")) {
      const [x, y] = pair.split(",").map(Number);
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return [x0, y0, x1, y1];
};

/** largest sRGB channel 0..1 of a #rrggbb fill (1 for anything that is not a hex colour) */
export function maxChannel(fill) {
  const m = /^#([0-9a-f]{6})$/i.exec(fill);
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  return Math.max((n >> 16) & 255, (n >> 8) & 255, n & 255) / 255;
}

export const NEAR_BLACK = 0.08;
export const MIN_OPACITY = 0.1;

/**
 * Leftovers of the vectorisation that must not define the silhouette: near-black (largest channel < 8 %) or
 * almost transparent (opacity < 0.1) polygons — but ONLY those whose removal shrinks the bbox, i.e. the
 * background ones sticking out of the animal. Dark polygons inside the body (shadows, pupils, dark fur) stay:
 * removing them would punch holes (a plain «relative luminance < 8 %» filter would delete 30–70 % of the
 * dark bodies of the fox, wolf, bear and deer). Returns the ids to drop.
 */
export function findBackgroundLeftovers(polygons) {
  const isDark = (p) => maxChannel(p.defaultFill) < NEAR_BLACK || (p.opacity ?? 1) < MIN_OPACITY;
  const body = polygons.filter((p) => !isDark(p));
  if (body.length === 0 || body.length === polygons.length) return [];
  const [bx0, by0, bx1, by1] = bboxOf(body);
  const eps = 1e-6;
  return polygons
    .filter((p) => {
      if (!isDark(p)) return false;
      const [x0, y0, x1, y1] = bboxOf([p]);
      return x0 < bx0 - eps || y0 < by0 - eps || x1 > bx1 + eps || y1 > by1 + eps;
    })
    .map((p) => p.id);
}

/** Canvas fit by the shared rule (see CANVAS): scale from the bbox, centred on x = 100, standing on y = 212 */
export function computeFit(polygons) {
  const [x0, y0, x1, y1] = bboxOf(polygons);
  const scale = Math.min(
    (CANVAS.fieldH * CANVAS.heightShare) / (y1 - y0),
    CANVAS.fieldW / (x1 - x0),
  );
  const r = (v) => Math.round(v * 10000) / 10000;
  return {
    scale: r(scale),
    tx: r(CANVAS.w / 2 - ((x0 + x1) / 2) * scale),
    ty: r(CANVAS.groundY - y1 * scale),
    bbox: [x0, y0, x1, y1],
  };
}

/**
 * Which SVG file each tier uses: `<filePrefix>L<N>.svg`, or the nearest lower existing tier (fallback).
 * @param {(file: string) => boolean} exists
 * @returns {{ tier: number, file: string | null, fallbackFrom: number | null }[]}
 */
export function resolveTierFiles(sourceDir, filePrefix, exists) {
  const own = TIERS.map((t) => path.join(sourceDir, `${filePrefix}L${t}.svg`));
  return TIERS.map((tier, i) => {
    if (exists(own[i])) return { tier, file: own[i], fallbackFrom: null };
    for (let j = i - 1; j >= 0; j--) {
      if (exists(own[j])) return { tier, file: own[j], fallbackFrom: TIERS[j] };
    }
    return { tier, file: null, fallbackFrom: null };
  });
}

const posix = (p) => p.split(path.sep).join("/");

/** Data module of one tier with its own SVG — the heavy chunk, imported lazily by the index module */
export function tierModule({ constPrefix, tier, sourceFile, parsed, fit }) {
  const P = `${constPrefix}_L${tier}`;
  return (
    `/* Generated by scripts/buildCreatureAssets.mjs from ${posix(sourceFile)} — do not edit by hand. */
` +
    `import type { CreaturePolygonDef } from "../../../shared/creatureAssetTypes";

` +
    `/** Source viewBox ${parsed.viewBox}; polygon bbox ${fit.bbox.join(",")} */

` +
    `/** polygons of <g id="aspectAccent"> (recoloured into the aspect colour) */
` +
    `export const ${P}_ASPECT_ACCENT_IDS: readonly string[] = ${JSON.stringify(parsed.aspectAccentIds)};

` +
    `export const ${P}_POLYGONS: CreaturePolygonDef[] = ${JSON.stringify(parsed.polygons, null, 2)};
`
  );
}

/** First line of a data module that only re-exported a lower tier (old format) — such files are removed */
export const STALE_FALLBACK_MARKER = "Generated by scripts/buildCreatureAssets.mjs — no ";

/**
 * Index module: the static metadata of the 5 tiers (fit, source, counts) + a loader per tier. The polygon data
 * is NOT imported statically: each `load` is a dynamic import (its own chunk). A tier without its own SVG
 * loads the data of the lower tier it falls back to (same cache key).
 * @param {{ tier: number, usesTier: number, fallbackFrom: number | null, sourceFile: string, fit: object,
 *           polygonCount: number, accentCount: number }[]} tiers
 */
export function indexModule({ constPrefix, animal, filePrefixPascal, tiers }) {
  const entries = tiers
    .map((t) => {
      const mod = `${filePrefixPascal}L${t.usesTier}AssetData`;
      const P = `${constPrefix}_L${t.usesTier}`;
      return (
        `  {
    tierIndex: ${t.tier},
` +
        `    fit: { scale: ${t.fit.scale}, tx: ${t.fit.tx}, ty: ${t.fit.ty} },
` +
        `    source: "${path.basename(t.sourceFile)}",
    fallbackFrom: ${t.fallbackFrom ?? "null"},
` +
        `    polygonCount: ${t.polygonCount},
    aspectAccentCount: ${t.accentCount},
` +
        `    dataKey: "${animal}:L${t.usesTier}",
` +
        `    load: () =>
      import("./${mod}").then((m) => ({
        polygons: m.${P}_POLYGONS,
` +
        `        aspectAccentIds: m.${P}_ASPECT_ACCENT_IDS,
      })),
  },`
      );
    })
    .join("\n");
  return (
    `/* Generated by scripts/buildCreatureAssets.mjs — do not edit by hand. */
` +
    `import type { CreatureTierMeta } from "../../../shared/creatureAssetTypes";

` +
    `/** Static tier metadata; the polygon data of each tier is loaded lazily (own chunk) */
` +
    `export const ${constPrefix}_TIER_ASSETS: readonly CreatureTierMeta[] = [
${entries}
];
`
  );
}

export const defaultExists = (file) => fs.existsSync(file);
