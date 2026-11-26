/**
 * Pure helpers of scripts/buildCreatureAssets.mjs (unit-tested in scripts/creatureAssets.test.ts):
 * SVG → polygons (document order = z-order), the `aspectAccent` group → aspectAccentIds, canvas fit,
 * tier file resolution with fallback to the nearest lower tier, TS module text.
 */
import fs from "node:fs";
import path from "node:path";

export const TIERS = [1, 2, 3, 4, 5];
/** Avatar canvas and the fox fit rule: bbox contained in 168 × 208 (16px margin), centred on (100, 120) */
export const CANVAS = { w: 200, h: 240, margin: 16 };
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
 * - duplicate ids get a `_<n>` suffix; `transform` attributes are not supported (error).
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
        polygons.push({ id, points, defaultFill: fill.toLowerCase() });
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
  return { viewBox, polygons, aspectAccentIds, warnings };
}

/** Canvas fit by the shared rule (fox rule): contain the polygon bbox in 168 × 208, centre on (100, 120) */
export function computeFit(polygons) {
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
  const boxW = CANVAS.w - 2 * CANVAS.margin;
  const boxH = CANVAS.h - 2 * CANVAS.margin;
  const scale = Math.min(boxW / (x1 - x0), boxH / (y1 - y0));
  const r = (v) => Math.round(v * 10000) / 10000;
  return {
    scale: r(scale),
    tx: r(CANVAS.w / 2 - ((x0 + x1) / 2) * scale),
    ty: r(CANVAS.h / 2 - ((y0 + y1) / 2) * scale),
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

/** TS module of one tier with its own SVG */
export function tierModule({ constPrefix, tier, sourceFile, parsed, fit }) {
  const P = `${constPrefix}_L${tier}`;
  return (
    `/* Generated by scripts/buildCreatureAssets.mjs from ${posix(sourceFile)} — do not edit by hand. */\n` +
    `import type { CreaturePolygonDef } from "../../../shared/creatureAssetTypes";\n\n` +
    `export const ${P}_SOURCE = "${path.basename(sourceFile)}";\n\n` +
    `/** Source viewBox ${parsed.viewBox}; polygon bbox ${fit.bbox.join(",")} */\n` +
    `export const ${P}_FIT = { scale: ${fit.scale}, tx: ${fit.tx}, ty: ${fit.ty}, viewBox: "${parsed.viewBox}" } as const;\n\n` +
    `/** polygons of <g id="aspectAccent"> (recoloured into the aspect colour) */\n` +
    `export const ${P}_ASPECT_ACCENT_IDS: readonly string[] = ${JSON.stringify(parsed.aspectAccentIds)};\n\n` +
    `export const ${P}_POLYGONS: CreaturePolygonDef[] = ${JSON.stringify(parsed.polygons, null, 2)};\n`
  );
}

/** TS module of a tier without its own SVG: re-exports the data of the lower tier it falls back to */
export function fallbackTierModule({
  constPrefix,
  filePrefixPascal,
  tier,
  fallbackFrom,
  sourceFile,
}) {
  const P = `${constPrefix}_L${tier}`;
  const F = `${constPrefix}_L${fallbackFrom}`;
  return (
    `/* Generated by scripts/buildCreatureAssets.mjs — no ${filePrefixPascal}L${tier} SVG yet: tier ${tier} uses\n` +
    ` * ${posix(sourceFile)} (tier ${fallbackFrom}). Add the SVG and run \`npm run build:assets\`. Do not edit by hand. */\n` +
    `export {\n` +
    `  ${F}_ASPECT_ACCENT_IDS as ${P}_ASPECT_ACCENT_IDS,\n` +
    `  ${F}_FIT as ${P}_FIT,\n` +
    `  ${F}_POLYGONS as ${P}_POLYGONS,\n` +
    `  ${F}_SOURCE as ${P}_SOURCE,\n` +
    `} from "./${filePrefixPascal}L${fallbackFrom}AssetData";\n`
  );
}

/** Index module: the 5 tier assets of the creature as one array */
export function indexModule({ constPrefix, filePrefixPascal, resolved }) {
  const imports = resolved
    .map(
      (r) =>
        `import {\n  ${constPrefix}_L${r.tier}_ASPECT_ACCENT_IDS,\n  ${constPrefix}_L${r.tier}_FIT,\n` +
        `  ${constPrefix}_L${r.tier}_POLYGONS,\n  ${constPrefix}_L${r.tier}_SOURCE,\n} from "./${filePrefixPascal}L${r.tier}AssetData";`,
    )
    .join("\n");
  const entries = resolved
    .map(
      (r) =>
        `  {\n    tierIndex: ${r.tier},\n    polygons: ${constPrefix}_L${r.tier}_POLYGONS,\n` +
        `    fit: ${constPrefix}_L${r.tier}_FIT,\n    aspectAccentIds: ${constPrefix}_L${r.tier}_ASPECT_ACCENT_IDS,\n` +
        `    source: ${constPrefix}_L${r.tier}_SOURCE,\n    fallbackFrom: ${r.fallbackFrom ?? "null"},\n  },`,
    )
    .join("\n");
  return (
    `/* Generated by scripts/buildCreatureAssets.mjs — do not edit by hand. */\n` +
    `import type { CreatureTierAsset } from "../../../shared/creatureAssetTypes";\n` +
    `${imports}\n\n` +
    `export const ${constPrefix}_TIER_ASSETS: readonly CreatureTierAsset[] = [\n${entries}\n];\n`
  );
}

export const defaultExists = (file) => fs.existsSync(file);
