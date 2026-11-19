/**
 * Добавляет поле `zone` в FoxL{N}AssetData.ts на основе foxL{N}_grouped.svg.
 * Порядок полигонов (z-order) в AssetData НЕ меняется — зона подставляется по id.
 * Usage: node scripts/annotateFoxZones.mjs <dirWithGroupedSvgs>
 */
import fs from "node:fs";
import path from "node:path";

const srcDir = process.argv[2];
const assetsDir = "src/entities/character/ui/ModularAvatar/assets";
const files = { 1: "foxL1.svg", 2: "foxL2.svg", 3: "foxL3.svg", 4: "foxL4.svg", 5: "foxL5.svg" };

for (const n of [1, 2, 3, 4, 5]) {
  const svg = fs.readFileSync(path.join(srcDir, files[n]), "utf8");
  const zoneById = new Map();
  const ptsById = new Map();
  // walk groups: <g id="zone"> ... </g>
  const groupRe = /<g id="([^"]+)">([\s\S]*?)<\/g>/g;
  let m;
  while ((m = groupRe.exec(svg))) {
    const zone = m[1];
    const polyRe = /<polygon id="([^"]+)" points="([^"]+)"/g;
    let p;
    while ((p = polyRe.exec(m[2]))) {
      if (zoneById.has(p[1])) throw new Error(`L${n}: duplicate id ${p[1]}`);
      zoneById.set(p[1], zone);
      ptsById.set(p[1], p[2]);
    }
  }
  const dataPath = path.join(assetsDir, `FoxL${n}AssetData.ts`);
  const ts = fs.readFileSync(dataPath, "utf8");
  const arrStart = ts.indexOf("= [", ts.indexOf("export const")) + 2;
  const arrEnd = ts.lastIndexOf("];") + 1;
  const arr = JSON.parse(ts.slice(arrStart, arrEnd));
  let mismatch = 0;
  let missing = 0;
  const counts = {};
  const out = arr.map((poly) => {
    const zone = zoneById.get(poly.id);
    if (!zone) { missing++; }
    else if (ptsById.get(poly.id) !== poly.points) { mismatch++; }
    const z = zone ?? "unassigned";
    counts[z] = (counts[z] ?? 0) + 1;
    return { id: poly.id, points: poly.points, defaultFill: poly.defaultFill, zone: z };
  });
  console.log(`L${n}: polys=${arr.length} svgPolys=${zoneById.size} missing=${missing} pointsMismatch=${mismatch}`, counts);
  const head = `export type FoxL${n}Zone = ${JSON.stringify([...new Set(out.map((o) => o.zone))].sort()).replace(/,/g, " | ").replace(/[\[\]]/g, "")};\n\nexport interface FoxL${n}PolygonDef {\n  id: string;\n  points: string;\n  defaultFill: string;\n  /** Anatomical zone from foxL${n}_grouped.svg (\`unassigned\` = not classified) */\n  zone: FoxL${n}Zone;\n}\n\nexport const FOX_L${n}_POLYGONS: FoxL${n}PolygonDef[] = `;
  fs.writeFileSync(dataPath, head + JSON.stringify(out, null, 2) + ";\n");
}
