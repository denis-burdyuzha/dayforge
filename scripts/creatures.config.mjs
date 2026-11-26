/**
 * Creatures built from SVG assets by scripts/buildCreatureAssets.mjs (`npm run build:assets`).
 * The fox (explorer) has its own zone-annotated pipeline (scripts/annotateFoxZones.mjs) and is not here.
 *
 * - classId: character class id
 * - animal: name used for generated constants (WOLF_L1_POLYGONS …) and file names (WolfL1AssetData.ts)
 * - sourceDir / filePrefix: SVGs are `${sourceDir}/${filePrefix}L1.svg … L5.svg` (read only)
 * - outDir: where the generated TS data goes
 */
export const CREATURES = [
  {
    classId: "warrior",
    animal: "wolf",
    sourceDir: "src/assets/images/baseForm/warrior",
    filePrefix: "wolf",
    outDir: "src/entities/character/ui/ModularAvatar/creatures/wolf/assets",
  },
  {
    classId: "creator",
    animal: "bear",
    sourceDir: "src/assets/images/baseForm/creator",
    filePrefix: "bear",
    outDir: "src/entities/character/ui/ModularAvatar/creatures/bear/assets",
  },
  {
    classId: "strategist",
    animal: "lion",
    sourceDir: "src/assets/images/baseForm/strategist",
    filePrefix: "lion",
    outDir: "src/entities/character/ui/ModularAvatar/creatures/lion/assets",
  },
  {
    classId: "wanderer",
    animal: "deer",
    sourceDir: "src/assets/images/baseForm/wanderer",
    filePrefix: "deer",
    outDir: "src/entities/character/ui/ModularAvatar/creatures/deer/assets",
  },
];
