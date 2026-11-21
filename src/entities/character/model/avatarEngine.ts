/**
 * avatarEngine.ts — Engine for computing visual parameters of the Dayforge Fantasy Creature.
 *
 * Translates character game state (level, class, attributes, skills, todayState)
 * into a pure AvatarParams data contract consumed by ModularAvatar renderer.
 */

import { applyAspectGlow, resolveAvatarAspect } from "./aspect";
import { createAvatarIdentity } from "./avatarIdentity";
import type {
  AvatarColorPalette,
  AvatarEffectItem,
  AvatarEvolutionStage,
  AvatarLimbAngles,
  AvatarParams,
  AvatarSkillImprint,
} from "./avatarTypes";
import type { CharacterSkillWithStats } from "./characterSkillTypes";
import type { Character, CharacterAttribute, DailyState } from "./characterTypes";
import { characterClasses } from "./classes";

// ── Milestone Level Tiers ───────────────────────────────────────────────────────

export const EVOLUTION_TIER_THRESHOLDS = {
  TIER_1_SPARK: 1, // Levels 1–2 (Spark form - small & cute)
  TIER_2_HATCHLING: 3, // Levels 3–4 (Hatchling form - class traits emerge)
  TIER_3_YOUNG: 5, // Levels 5–9 (Young form - first skill imprint)
  TIER_4_AWAKENED: 10, // Levels 10–19 (Awakened form - complex morphology)
  TIER_5_SIGNATURE: 20, // Levels 20–34 (Signature legendary form)
  TIER_6_ASCENDED: 35, // Levels 35–49 (Ascended — elemental transcendence)
  TIER_7_MYTHIC: 50, // Levels 50+ (Mythic — otherworldly)
} as const;

export function getEvolutionTier(level: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_7_MYTHIC) return 7;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_6_ASCENDED) return 6;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_5_SIGNATURE) return 5;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_4_AWAKENED) return 4;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_3_YOUNG) return 3;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_2_HATCHLING) return 2;
  return 1;
}

interface CreaturePaletteDefinition {
  primaryBody: string;
  secondaryBody: string;
  bellyTone: string;
  eyeColor: string;
  markingColor: string;
}

const CLASS_PALETTES: Record<AvatarEvolutionStage["classArchetype"], CreaturePaletteDefinition> = {
  warrior: {
    primaryBody: "#421828", // Deep Rich Garnet Velvet
    secondaryBody: "#240d16", // Dark Garnet Obsidian Shadow
    bellyTone: "#5c2035", // Muted Warm Garnet Belly
    eyeColor: "#ff6b00", // Single Luminescent Ember Accent (Glow & Core)
    markingColor: "#732742", // Subdued Background Contour Accent
  },
  creator: {
    primaryBody: "#854211", // Amber Basalt
    secondaryBody: "#4a1e05",
    bellyTone: "#a14e14",
    eyeColor: "#38bdf8",
    markingColor: "#fbbf24",
  },
  explorer: {
    primaryBody: "#2d3f59", // Slate Obsidian
    secondaryBody: "#182338",
    bellyTone: "#435878",
    eyeColor: "#f59e0b",
    markingColor: "#38bdf8",
  },
  strategist: {
    primaryBody: "#5c24b5", // Amethyst Twilight
    secondaryBody: "#38147a",
    bellyTone: "#732ddb",
    eyeColor: "#f472b6",
    markingColor: "#c084fc",
  },
  wanderer: {
    primaryBody: "#0b664f", // Deep Emerald Jade
    secondaryBody: "#043b2e",
    bellyTone: "#14806c",
    eyeColor: "#fbbf24",
    markingColor: "#34d399",
  },
};

// ── Organic Skill Imprint Resolvers ──────────────────────────────────────────

export function resolveSkillImprint(skillName: string, color: string): AvatarSkillImprint {
  const lower = skillName.toLowerCase();

  if (
    lower.includes("program") ||
    lower.includes("код") ||
    lower.includes("code") ||
    lower.includes("dev") ||
    lower.includes("typescript") ||
    lower.includes("javascript") ||
    lower.includes("python")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "pulse-band",
      location: "paws",
      color,
    };
  }

  if (
    lower.includes("fitness") ||
    lower.includes("workout") ||
    lower.includes("спорт") ||
    lower.includes("gym") ||
    lower.includes("силов")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "crystal",
      location: "body",
      color,
    };
  }

  if (
    lower.includes("seo") ||
    lower.includes("маркетинг") ||
    lower.includes("marketing") ||
    lower.includes("smm") ||
    lower.includes("реклам")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "halo",
      location: "head",
      color,
    };
  }

  if (
    lower.includes("чтени") ||
    lower.includes("reading") ||
    lower.includes("книг") ||
    lower.includes("book") ||
    lower.includes("learning") ||
    lower.includes("учеб")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "tail-orb",
      location: "tail",
      color,
    };
  }

  if (
    lower.includes("дизайн") ||
    lower.includes("design") ||
    lower.includes("art") ||
    lower.includes("figma") ||
    lower.includes("ui")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "rune",
      location: "body",
      color,
    };
  }

  if (
    lower.includes("музык") ||
    lower.includes("music") ||
    lower.includes("sound") ||
    lower.includes("гитар") ||
    lower.includes("piano")
  ) {
    return {
      id: `imprint-${skillName}`,
      skillName,
      type: "halo",
      location: "head",
      color,
    };
  }

  // Fallback imprint
  return {
    id: `imprint-${skillName}`,
    skillName,
    type: "rune",
    location: "body",
    color,
  };
}

// ── Main Computation ──────────────────────────────────────────────────────────

function normalizeAttr(value: number | undefined, min = 1, max = 18): number {
  if (value === undefined) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

export function computeAvatarParams(
  character: Character,
  attributes: CharacterAttribute[],
  skills: CharacterSkillWithStats[],
  todayState?: DailyState | null,
): AvatarParams {
  const identity = createAvatarIdentity(character.id);

  // 1. Class & Color Palette explicitly bound to ClassArchetype
  const charClass = characterClasses.find((c) => c.id === character.class);
  const classId = (character.class as AvatarEvolutionStage["classArchetype"]) || "warrior";
  const accentColor = charClass?.accentColor ?? "#3b82f6";

  const basePalette = CLASS_PALETTES[classId] ?? CLASS_PALETTES.warrior;

  const palette: AvatarColorPalette = {
    accent: accentColor,
    primaryBody: basePalette.primaryBody,
    secondaryBody: basePalette.secondaryBody,
    bellyTone: basePalette.bellyTone,
    eyeColor: basePalette.eyeColor,
    glow: accentColor,
    markingColor: basePalette.markingColor,
  };

  // 2. Evolution Stage (L1, L3, L5, L10, L20, L35, L50)
  const tier = getEvolutionTier(character.level);
  const evolution: AvatarEvolutionStage = {
    tier,
    level: character.level,
    classArchetype: classId,
  };

  // Discrete Body Archetype (L1-4 Larval, L5-19 Juvenile, L20-34 Adult, L35+ Apex)
  const archetype = getBodyArchetype(tier);

  // Scale map based on tier
  const tierScaleMap: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number> = {
    1: 0.45, // Spark form
    2: 0.62, // Hatchling form
    3: 0.78, // Young form
    4: 0.9, // Awakened form
    5: 1.0, // Signature legendary form
    6: 1.05, // Ascended — elemental transcendence
    7: 1.08, // Mythic — otherworldly
  };
  const baseScale = tierScaleMap[tier];

  // 3. Attributes Influence — All 7 attributes
  const strengthAttr = attributes.find((a) => a.code === "strength");
  const enduranceAttr = attributes.find((a) => a.code === "endurance");
  const disciplineAttr = attributes.find((a) => a.code === "discipline");
  const intelligenceAttr = attributes.find((a) => a.code === "intelligence");
  const focusAttr = attributes.find((a) => a.code === "focus");
  const socialAttr = attributes.find((a) => a.code === "social");
  const creativityAttr = attributes.find((a) => a.code === "creativity");

  const strengthVal = strengthAttr?.value ?? 1;
  const enduranceVal = enduranceAttr?.value ?? 1;
  const disciplineVal = disciplineAttr?.value ?? 1;
  const intelligenceVal = intelligenceAttr?.value ?? 1;
  const focusVal = focusAttr?.value ?? 1;
  const socialVal = socialAttr?.value ?? 1;
  const creativityVal = creativityAttr?.value ?? 1;

  // Strength → Body Bulk (0..1)
  const bulk = normalizeAttr(strengthVal, 1, 18);

  // Discipline & Focus normalized
  const postureConfidence = normalizeAttr(disciplineVal, 1, 18);
  const focusLevel = normalizeAttr(focusVal, 1, 18);

  // ── Narrative Transformation Resolver for Tier × Class ──
  const narrative = resolveNarrativeTransformation(tier, classId, postureConfidence);

  // Semantic posture variant
  let postureVariant: AvatarParams["posture"]["variant"] = "neutral";
  if (postureConfidence >= 0.55) {
    postureVariant = "confident";
  } else if (postureConfidence <= 0.25) {
    postureVariant = "relaxed";
  }

  const hasFocusRing = focusVal >= 10 || tier >= 5;
  const eyeVariant = (Math.floor(identity.eyeSeed * 3) % 3) as 0 | 1 | 2;

  // Intelligence → Bioluminescent Markings Complexity & Sensory Crown
  const intelligenceNormalized = normalizeAttr(intelligenceVal, 1, 18);
  let patternType: AvatarParams["markings"]["patternType"] = "dots";
  let hasSensoryCrown = false;

  if (intelligenceVal >= 12 || tier >= 6) {
    patternType = "celestial";
    hasSensoryCrown = true;
  } else if (intelligenceVal >= 8 || tier >= 4) {
    patternType = "geometric";
  } else if (intelligenceVal >= 4 || tier >= 2) {
    patternType = "runes";
  }

  // 4. Organic Skill Imprints (Visible starting from Tier 3 / Level 5+)
  const skillImprints: AvatarSkillImprint[] = [];
  if (tier >= 3) {
    const sortedSkills = [...skills].sort((a, b) =>
      b.level !== a.level ? b.level - a.level : b.totalXp - a.totalXp,
    );

    for (const skill of sortedSkills) {
      if (skillImprints.length >= 2) break;
      skillImprints.push(resolveSkillImprint(skill.name, accentColor));
    }
  }

  // 4.5 Aspect: the dominant attribute (≥ 3) colours rim light + aura for every class renderer
  const aspect = resolveAvatarAspect({
    strength: strengthVal,
    endurance: enduranceVal,
    intelligence: intelligenceVal,
    focus: focusVal,
    discipline: disciplineVal,
    social: socialVal,
    creativity: creativityVal,
  });
  palette.glow = aspect?.color ?? accentColor;

  // 5. Effects (Aura & Ethereal Mist)
  const effects: AvatarEffectItem[] = [];
  const auraIntensityMap: Record<number, number> = {
    3: 0.18,
    4: 0.3,
    5: 0.45,
    6: 0.6,
    7: 0.75,
  };
  const tierAura = tier >= 3 ? (auraIntensityMap[tier] ?? 0.18) : 0;
  const auraGlow = applyAspectGlow(
    { rimOpacity: 0, rimStrokeWidth: 0, auraOpacity: tierAura, auraRadius: 0 },
    accentColor,
    aspect,
  );
  if (auraGlow.auraOpacity > 0) {
    effects.push({
      id: "aura-core",
      type: "aura",
      intensity: auraGlow.auraOpacity,
      color: auraGlow.color,
    });
  }

  if (hasSensoryCrown || tier >= 4) {
    effects.push({
      id: "ethereal-mist",
      type: "ethereal-mist",
      intensity: tier >= 6 ? 0.45 : 0.25,
      color: accentColor,
    });
  }

  // 6. Current State
  const energy = todayState?.energy ?? 100;
  const fatigue = todayState?.fatigue ?? 0;

  // 7. Endurance → Chest Depth & Hide Thickness (0..1 continuous)
  const enduranceNormalized = normalizeAttr(enduranceVal, 1, 18);

  // 8. Social → Collar Crest size (0..1 continuous)
  const socialNormalized = normalizeAttr(socialVal, 1, 18);

  // 9. Creativity → Asymmetry Intensity (0..1 continuous) + deterministic seed
  const creativityNormalized = normalizeAttr(creativityVal, 1, 18);

  // 10. Limb Angles Resolution
  const limbAngles = resolveLimbAngles(tier, classId, bulk, postureConfidence, focusLevel);

  // ── 11. Raw attribute values for the universal attribute FX system (attributeFx/) ──
  const attributeValues: AvatarParams["attributeValues"] = {
    strength: strengthVal,
    endurance: enduranceVal,
    discipline: disciplineVal,
    intelligence: intelligenceVal,
    focus: focusVal,
    social: socialVal,
    creativity: creativityVal,
  };

  return {
    identity,
    palette,
    body: {
      bulk,
      scale: baseScale,
      proportionScale: 0.95 + identity.proportionsSeed * 0.1,
      archetypeId: archetype.id,
      headScale: archetype.headScale,
      bellyConvexity: archetype.bellyConvexity,
      chestAngularity: archetype.chestAngularity,
      spineSegmentation: archetype.spineSegmentation,
    },
    posture: {
      confidence: postureConfidence,
      variant: postureVariant,
      tiltAngle: narrative.tierTiltAngle,
      earAlertness: narrative.earAlertness,
      tailStance: narrative.tailStance,
      hoverOffsetY: narrative.hoverOffsetY,
      limbAngles,
    },
    face: {
      focusLevel,
      expression: narrative.expression,
      eyebrowAngle: narrative.eyebrowAngle,
      eyeVariant,
      hasFocusRing,
      mouthVariant: narrative.mouthVariant,
    },
    evolution,
    markings: {
      complexity: intelligenceNormalized,
      patternType,
      hasSensoryCrown,
    },
    skillImprints,
    effects,
    currentMood: {
      energy,
      fatigue,
    },
    endurance: {
      chestDepth: enduranceNormalized,
      hideThickness: enduranceNormalized,
    },
    social: {
      crestSize: socialNormalized,
    },
    creativity: {
      asymmetryIntensity: creativityNormalized,
      asymmetrySeed: identity.patternSeed,
    },
    attributeValues,
    aspect,
  };
}

export type BodyArchetypeId = "larval" | "juvenile" | "adult" | "apex";

export interface BodyArchetypeConfig {
  id: BodyArchetypeId;
  headScale: number;
  torsoHeight: number;
  forelimbLen: number;
  hindlimbLen: number;
  baseSpineArch: number;
  classBioWeight: number;
  bellyConvexity: number;
  chestAngularity: number;
  spineSegmentation: number;
}

/**
 * DISCRETE STEP TRANSITION AT TIER BOUNDARIES (L4->L5, L19->L20, L34->L35).
 * Explicitly NO interpolation/morphing between archetypes.
 */
export function getBodyArchetype(tier: 1 | 2 | 3 | 4 | 5 | 6 | 7): BodyArchetypeConfig {
  if (tier <= 2) {
    // Larval Archetype (Tiers 1-2, L1-4 Spark/Hatchling): Compact pup with large head, short legs (32px torso)
    return {
      id: "larval",
      headScale: 1.25,
      torsoHeight: 32,
      forelimbLen: 24.5,
      hindlimbLen: 26.0,
      baseSpineArch: -8,
      classBioWeight: 0.2,
      bellyConvexity: 1.0,
      chestAngularity: 0.0,
      spineSegmentation: 0.0,
    };
  }
  if (tier <= 4) {
    // Juvenile Archetype (Tiers 3-4, L5-19 Young/Awakened): Adolescent growing fox (41px torso)
    return {
      id: "juvenile",
      headScale: 1.05,
      torsoHeight: 41,
      forelimbLen: 32.0,
      hindlimbLen: 34.0,
      baseSpineArch: -2,
      classBioWeight: 0.6,
      bellyConvexity: 0.65,
      chestAngularity: 0.3,
      spineSegmentation: 0.25,
    };
  }
  if (tier === 5) {
    // Adult Archetype (Tier 5, L20-34 Signature): FIXED ANCHOR — 50px torso, 39px forelimb, 41.5px hindlimb
    return {
      id: "adult",
      headScale: 0.92,
      torsoHeight: 50,
      forelimbLen: 39.0,
      hindlimbLen: 41.5,
      baseSpineArch: 3,
      classBioWeight: 1.0,
      bellyConvexity: 0.2,
      chestAngularity: 0.75,
      spineSegmentation: 0.7,
    };
  }
  // Apex Archetype (Tiers 6-7, L35+ Ascended/Mythic): Majestic titan fox (58px torso, 45.5px forelimb, 48.5px hindlimb)
  return {
    id: "apex",
    headScale: 0.84,
    torsoHeight: 58,
    forelimbLen: 45.5,
    hindlimbLen: 48.5,
    baseSpineArch: 8,
    classBioWeight: 1.2,
    bellyConvexity: 0.0,
    chestAngularity: 1.0,
    spineSegmentation: 1.0,
  };
}

function resolveNarrativeTransformation(
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  classId: AvatarEvolutionStage["classArchetype"],
  postureConfidence: number,
): {
  expression: AvatarParams["face"]["expression"];
  mouthVariant: AvatarParams["face"]["mouthVariant"];
  tailStance: AvatarParams["posture"]["tailStance"];
  tierTiltAngle: number;
  hoverOffsetY: number;
  eyebrowAngle: number;
  earAlertness: number;
} {
  let expression: AvatarParams["face"]["expression"] = "cautious";
  let mouthVariant: AvatarParams["face"]["mouthVariant"] = "neutral";
  let tailStance: AvatarParams["posture"]["tailStance"] = "neutral";
  let tierTiltAngle = 0;
  let hoverOffsetY = 0;
  let eyebrowAngle = 0;
  let earAlertness = 0.5 + postureConfidence * 0.5;

  if (tier === 1) {
    // Spark form — scared, huddled, wide eyes, tucked mouth & tail
    expression = "scared";
    mouthVariant = "tucked";
    tailStance = "tucked";
    tierTiltAngle = -6;
    earAlertness = 0.2;
    eyebrowAngle = 8;
  } else if (tier === 2) {
    // Hatchling form — cautious, suspicious gaze, low tail
    expression = "cautious";
    mouthVariant = "tucked";
    tailStance = "low";
    tierTiltAngle = classId === "explorer" ? 2 : -3;
    earAlertness = classId === "explorer" ? 0.9 : 0.4;
    eyebrowAngle = 3;
  } else if (tier === 3) {
    // Young form — edgy teenager / impulsive / restless
    expression = "edgy";
    mouthVariant = "neutral";
    tailStance = "neutral";
    tierTiltAngle = classId === "warrior" ? -4 : classId === "strategist" ? 3 : -1;
    eyebrowAngle = -7;
    earAlertness = 0.7;
  } else if (tier === 4) {
    // Awakened form — focused, hardened, intent
    expression = "focused";
    mouthVariant = classId === "warrior" ? "snarl" : "neutral";
    tailStance = "raised";
    tierTiltAngle = classId === "warrior" ? -6 : classId === "strategist" ? 4 : 1;
    eyebrowAngle = -10;
    earAlertness = 0.85;
  } else if (tier === 5) {
    // Signature form — legendary class climax!
    if (classId === "warrior") {
      expression = "berserk";
      mouthVariant = "fangs";
      tailStance = "raised";
      tierTiltAngle = -8;
      eyebrowAngle = -14;
    } else if (classId === "creator") {
      expression = "determined";
      mouthVariant = "calm";
      tailStance = "raised";
      tierTiltAngle = 4;
      eyebrowAngle = -6;
    } else if (classId === "explorer") {
      expression = "determined";
      mouthVariant = "neutral";
      tailStance = "raised";
      tierTiltAngle = 5;
      eyebrowAngle = -8;
    } else if (classId === "strategist") {
      expression = "sovereign";
      mouthVariant = "calm";
      tailStance = "raised";
      tierTiltAngle = 6;
      eyebrowAngle = -5;
    } else {
      expression = "sovereign";
      mouthVariant = "calm";
      tailStance = "flowing";
      tierTiltAngle = 2;
      eyebrowAngle = -4;
    }
    earAlertness = 0.95;
  } else if (tier === 6) {
    // Ascended form — elemental transcendence / titan / oracle / void guardian
    expression = "sovereign";
    mouthVariant = "calm";
    tailStance = classId === "wanderer" ? "flowing" : "raised";
    tierTiltAngle = classId === "warrior" ? -3 : 4;
    hoverOffsetY = -6;
    eyebrowAngle = -6;
    earAlertness = 1.0;
  } else if (tier === 7) {
    // Mythic form — otherworldly avatar
    expression = "mythic";
    mouthVariant = "radiant";
    tailStance = classId === "wanderer" ? "flowing" : "raised";
    tierTiltAngle = 0;
    hoverOffsetY = -10;
    eyebrowAngle = -4;
    earAlertness = 1.0;
  }

  const finalTilt = tierTiltAngle + (-3 + postureConfidence * 6);

  return {
    expression,
    mouthVariant,
    tailStance,
    tierTiltAngle: finalTilt,
    hoverOffsetY,
    eyebrowAngle,
    earAlertness,
  };
}

interface LimbAnglesSpec {
  armLU: number;
  armLBend: number;
  armRU: number;
  armRBend: number;
  legLU: number;
  legLBend: number;
  legRU: number;
  legRBend: number;
}

const MILESTONE_LIMB_ANGLES: Record<
  AvatarEvolutionStage["classArchetype"],
  Record<1 | 5 | 7, LimbAnglesSpec>
> = {
  warrior: {
    1: {
      armLU: 12,
      armLBend: 20,
      armRU: -12,
      armRBend: -20,
      legLU: 8,
      legLBend: 12,
      legRU: -8,
      legRBend: -12,
    },
    5: {
      armLU: -35,
      armLBend: 45,
      armRU: 35,
      armRBend: -45,
      legLU: 18,
      legLBend: 22,
      legRU: -18,
      legRBend: -22,
    },
    7: {
      armLU: -45,
      armLBend: 70,
      armRU: 40,
      armRBend: -50,
      legLU: 24,
      legLBend: 30,
      legRU: -24,
      legRBend: -30,
    },
  },
  creator: {
    1: {
      armLU: 6,
      armLBend: 18,
      armRU: -6,
      armRBend: -18,
      legLU: 6,
      legLBend: 10,
      legRU: -6,
      legRBend: -10,
    },
    5: {
      armLU: -20,
      armLBend: 55,
      armRU: 20,
      armRBend: -55,
      legLU: 14,
      legLBend: 14,
      legRU: -14,
      legRBend: -14,
    },
    7: {
      armLU: -42,
      armLBend: 75,
      armRU: 42,
      armRBend: -75,
      legLU: 12,
      legLBend: 18,
      legRU: -12,
      legRBend: -18,
    },
  },
  explorer: {
    1: {
      armLU: -8,
      armLBend: 8,
      armRU: 8,
      armRBend: -8,
      legLU: -7,
      legLBend: 7,
      legRU: 7,
      legRBend: -7,
    },
    5: {
      armLU: -12,
      armLBend: 12,
      armRU: 12,
      armRBend: -12,
      legLU: -10,
      legLBend: 10,
      legRU: 10,
      legRBend: -10,
    },
    7: {
      armLU: -14,
      armLBend: 14,
      armRU: 14,
      armRBend: -14,
      legLU: -12,
      legLBend: 12,
      legRU: 12,
      legRBend: -12,
    },
  },
  strategist: {
    1: {
      armLU: 10,
      armLBend: 22,
      armRU: -10,
      armRBend: -22,
      legLU: 5,
      legLBend: 8,
      legRU: -5,
      legRBend: -8,
    },
    5: {
      armLU: -15,
      armLBend: 60,
      armRU: 15,
      armRBend: -60,
      legLU: 10,
      legLBend: 10,
      legRU: -10,
      legRBend: -10,
    },
    7: {
      armLU: -28,
      armLBend: 70,
      armRU: 28,
      armRBend: -70,
      legLU: 12,
      legLBend: 12,
      legRU: -12,
      legRBend: -12,
    },
  },
  wanderer: {
    1: {
      armLU: 3,
      armLBend: 10,
      armRU: -3,
      armRBend: -10,
      legLU: 8,
      legLBend: 8,
      legRU: -8,
      legRBend: -8,
    },
    5: {
      armLU: -25,
      armLBend: 20,
      armRU: -12,
      armRBend: -22,
      legLU: 14,
      legLBend: 16,
      legRU: -12,
      legRBend: -14,
    },
    7: {
      armLU: -42,
      armLBend: 30,
      armRU: -25,
      armRBend: -35,
      legLU: 10,
      legLBend: 20,
      legRU: -8,
      legRBend: -18,
    },
  },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpSpec(a: LimbAnglesSpec, b: LimbAnglesSpec, t: number): LimbAnglesSpec {
  return {
    armLU: lerp(a.armLU, b.armLU, t),
    armLBend: lerp(a.armLBend, b.armLBend, t),
    armRU: lerp(a.armRU, b.armRU, t),
    armRBend: lerp(a.armRBend, b.armRBend, t),
    legLU: lerp(a.legLU, b.legLU, t),
    legLBend: lerp(a.legLBend, b.legLBend, t),
    legRU: lerp(a.legRU, b.legRU, t),
    legRBend: lerp(a.legRBend, b.legRBend, t),
  };
}

/**
 * Dynamic Limb Rotation Angle Resolver across 7 Tiers x 5 Classes.
 * Modulated by Strength (bulk), Discipline (confidence), and Focus (focusLevel).
 */
export function resolveLimbAngles(
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  classId: AvatarEvolutionStage["classArchetype"],
  bulk: number,
  confidence: number,
  focusLevel: number,
): AvatarLimbAngles {
  const classSpecs = MILESTONE_LIMB_ANGLES[classId] ?? MILESTONE_LIMB_ANGLES.warrior;
  const t1 = classSpecs[1];
  const t5 = classSpecs[5];
  const t7 = classSpecs[7];

  let spec: LimbAnglesSpec;
  if (tier === 1) spec = t1;
  else if (tier === 2) spec = lerpSpec(t1, t5, 0.25);
  else if (tier === 3) spec = lerpSpec(t1, t5, 0.5);
  else if (tier === 4) spec = lerpSpec(t1, t5, 0.75);
  else if (tier === 5) spec = t5;
  else if (tier === 6) spec = lerpSpec(t5, t7, 0.5);
  else spec = t7;

  const strengthArmMod = (bulk - 0.5) * 5;
  const disciplineLegMod = confidence * 4;
  const focusArmMod = (focusLevel - 0.5) * 4;

  return {
    armLeftUpper: spec.armLU - strengthArmMod + focusArmMod,
    armLeftBend: spec.armLBend,
    armRightUpper: spec.armRU + strengthArmMod - focusArmMod,
    armRightBend: spec.armRBend,
    legLeftUpper: spec.legLU + disciplineLegMod,
    legLeftBend: spec.legLBend,
    legRightUpper: spec.legRU - disciplineLegMod,
    legRightBend: spec.legRBend,
  };
}
