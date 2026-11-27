/**
 * npm run build:assets — builds the TS asset data of every creature in scripts/creatures.config.mjs from
 * its SVGs (source SVGs are only read):
 * - <Animal>L{N}AssetData.ts (one per tier WITH its own SVG): polygons in document order with their own
 *   colours and aspectAccentIds = polygons inside <g id="aspectAccent"> (any nesting). Loaded lazily, one chunk
 *   per creature and tier;
 * - <animal>Assets.ts: the static metadata of the 5 tiers (canvas fit by the shared rule, source file, counts)
 *   and a dynamic-import loader per tier. A tier without its SVG (warning) points at the nearest lower tier's
 *   data and fit — add the SVG and re-run;
 * Background leftovers (near-black / transparent polygons sticking out of the animal) are dropped and counted.
 * Prints per class and tier: polygons / in aspectAccent / file used.
 */
import fs from "node:fs";
import path from "node:path";

import * as prettier from "prettier";

import {
  computeFit,
  defaultExists,
  indexModule,
  parseCreatureSvg,
  resolveTierFiles,
  STALE_FALLBACK_MARKER,
  tierModule,
} from "./creatureAssets.lib.mjs";
import { CREATURES } from "./creatures.config.mjs";

const pascal = (s) => s[0].toUpperCase() + s.slice(1);

/** write a generated module formatted like the rest of the repo (re-running gives no diff) */
async function writeFormatted(file, source) {
  const options = (await prettier.resolveConfig(file)) ?? {};
  fs.writeFileSync(file, await prettier.format(source, { ...options, filepath: file }));
}
let warnings = 0;

for (const c of CREATURES) {
  const constPrefix = c.animal.toUpperCase();
  const filePrefixPascal = pascal(c.animal);
  const resolved = resolveTierFiles(c.sourceDir, c.filePrefix, defaultExists);
  if (resolved.some((r) => r.file === null)) {
    throw new Error(
      `${c.classId}: no ${c.filePrefix}L1.svg in ${c.sourceDir} — nothing to fall back to`,
    );
  }
  fs.mkdirSync(c.outDir, { recursive: true });
  console.log(`\n${c.classId} / ${c.animal}`);

  /** tier → { fit, polygonCount, accentCount } of the tiers with their own SVG */
  const built = new Map();
  const tiers = [];
  for (const r of resolved) {
    const out = path.join(c.outDir, `${filePrefixPascal}L${r.tier}AssetData.ts`);
    if (r.fallbackFrom !== null) {
      // old format: a data file that only re-exported the lower tier — it is not needed any more
      if (fs.existsSync(out) && fs.readFileSync(out, "utf8").includes(STALE_FALLBACK_MARKER)) {
        fs.rmSync(out);
      }
      const from = built.get(r.fallbackFrom);
      tiers.push({
        tier: r.tier,
        usesTier: r.fallbackFrom,
        fallbackFrom: r.fallbackFrom,
        sourceFile: r.file,
        ...from,
      });
      console.warn(`  WARN L${r.tier}: no ${c.filePrefix}L${r.tier}.svg — uses L${r.fallbackFrom}`);
      warnings++;
      console.log(
        `  L${r.tier}: ${from.polygonCount} polygons / ${from.accentCount} aspectAccent / ${path.basename(r.file)} (fallback)`,
      );
      continue;
    }
    const label = `${c.filePrefix}L${r.tier}`;
    const parsed = parseCreatureSvg(fs.readFileSync(r.file, "utf8"), label);
    for (const w of parsed.warnings) {
      console.warn(`  WARN ${w}`);
      warnings++;
    }
    const fit = computeFit(parsed.polygons);
    await writeFormatted(
      out,
      tierModule({ constPrefix, tier: r.tier, sourceFile: r.file, parsed, fit }),
    );
    const info = {
      fit,
      polygonCount: parsed.polygons.length,
      accentCount: parsed.aspectAccentIds.length,
    };
    built.set(r.tier, info);
    tiers.push({
      tier: r.tier,
      usesTier: r.tier,
      fallbackFrom: null,
      sourceFile: r.file,
      ...info,
    });
    console.log(
      `  L${r.tier}: ${parsed.polygons.length} polygons / ${parsed.aspectAccentIds.length} aspectAccent / ${path.basename(r.file)}` +
        (parsed.filtered ? ` / ${parsed.filtered} background polygons dropped` : ""),
    );
  }
  await writeFormatted(
    path.join(c.outDir, `${c.animal}Assets.ts`),
    indexModule({ constPrefix, animal: c.animal, filePrefixPascal, tiers }),
  );
}
console.log(`\ndone, ${warnings} warning(s)`);
