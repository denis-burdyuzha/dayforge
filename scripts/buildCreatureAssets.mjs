/**
 * npm run build:assets — builds the TS asset data of every creature in scripts/creatures.config.mjs from
 * its SVGs (source SVGs are only read):
 * - <Animal>L{N}AssetData.ts: polygons in document order with their own colours, canvas fit (fox rule),
 *   aspectAccentIds = polygons inside <g id="aspectAccent"> (any nesting), source file name;
 * - a tier without its SVG re-exports the nearest lower tier (warning) — add the SVG and re-run;
 * - <animal>Assets.ts: the 5 tier assets as one array (used by the creature registry).
 * Background leftovers (near-black / transparent polygons sticking out of the animal) are dropped and counted.
 * Prints per class and tier: polygons / in aspectAccent / file used.
 */
import fs from "node:fs";
import path from "node:path";

import * as prettier from "prettier";

import {
  computeFit,
  defaultExists,
  fallbackTierModule,
  indexModule,
  parseCreatureSvg,
  resolveTierFiles,
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

  const counts = new Map();
  for (const r of resolved) {
    const out = path.join(c.outDir, `${filePrefixPascal}L${r.tier}AssetData.ts`);
    if (r.fallbackFrom !== null) {
      await writeFormatted(
        out,
        fallbackTierModule({
          constPrefix,
          filePrefixPascal,
          tier: r.tier,
          fallbackFrom: r.fallbackFrom,
          sourceFile: r.file,
        }),
      );
      const [total, accent] = counts.get(r.fallbackFrom);
      console.warn(`  WARN L${r.tier}: no ${c.filePrefix}L${r.tier}.svg — uses L${r.fallbackFrom}`);
      warnings++;
      console.log(
        `  L${r.tier}: ${total} polygons / ${accent} aspectAccent / ${path.basename(r.file)} (fallback)`,
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
    counts.set(r.tier, [parsed.polygons.length, parsed.aspectAccentIds.length]);
    console.log(
      `  L${r.tier}: ${parsed.polygons.length} polygons / ${parsed.aspectAccentIds.length} aspectAccent / ${path.basename(r.file)}` +
        (parsed.filtered ? ` / ${parsed.filtered} background polygons dropped` : ""),
    );
  }
  await writeFormatted(
    path.join(c.outDir, `${c.animal}Assets.ts`),
    indexModule({ constPrefix, filePrefixPascal, resolved }),
  );
}
console.log(`\ndone, ${warnings} warning(s)`);
