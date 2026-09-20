/**
 * avatarTypes.ts — Data contract for the Dayforge Fantasy Creature Modular Avatar.
 *
 * The Avatar Renderer strictly consumes AvatarParams.
 * No progression/attribute/class logic calculation happens inside the Renderer.
 */

export interface AvatarIdentity {
  bodySeed: number;
  faceSeed: number;
  eyeSeed: number;
  earSeed: number;
  tailSeed: number;
  patternSeed: number;
  colorSeed: number;
  proportionsSeed: number;
}

export interface AvatarColorPalette {
  accent: string;
  primaryBody: string;
  secondaryBody: string;
  bellyTone: string;
  eyeColor: string;
  glow: string;
  markingColor: string;
}

export interface AvatarCreatureBody {
  /** 0..1 normalized bulkiness from Strength attribute */
  bulk: number;
  /** Overall scale factor derived from evolution stage (0.35 for L1 to 1.0 for L20) */
  scale: number;
  /** Height/width proportion ratio from proportionsSeed */
  proportionScale: number;
  /** Discrete Body Archetype: 'larval' (L1-4), 'juvenile' (L5-19), 'adult' (L20-34), 'apex' (L35+) */
  archetypeId: "larval" | "juvenile" | "adult" | "apex";
  /** Head scale multiplier for archetype head-to-body proportion ratio */
  headScale: number;
  /** Belly convexity factor (1.0 cute rounded cub belly .. 0.0 flat athletic) */
  bellyConvexity: number;
  /** Chest angularity factor (0.0 soft smooth arc .. 1.0 sharp faceted armor) */
  chestAngularity: number;
  /** Spine segmentation factor (0.0 smooth curve .. 1.0 armored dorsal notches) */
  spineSegmentation: number;
}

export interface AvatarLimbAngles {
  armLeftUpper: number;
  armLeftBend: number;
  armRightUpper: number;
  armRightBend: number;
  legLeftUpper: number;
  legLeftBend: number;
  legRightUpper: number;
  legRightBend: number;
}

export interface AvatarPosture {
  /** 0..1 normalized from Discipline attribute */
  confidence: number;
  variant: "relaxed" | "neutral" | "confident";
  /** Body tilt in degrees (-10° forward attack/crouch to +8° proud chin up) */
  tiltAngle: number;
  /** Ear alertness factor (0..1) */
  earAlertness: number;
  /** Tail posture stance: 'tucked' (scared L1) | 'low' | 'neutral' | 'raised' | 'flowing' */
  tailStance: "tucked" | "low" | "neutral" | "raised" | "flowing";
  /** Vertical displacement in px (e.g. -6px to -12px for floating Ascended/Mythic tiers) */
  hoverOffsetY: number;
  /** Articulated limb rotation angles in degrees for left/right arms and legs */
  limbAngles: AvatarLimbAngles;
}

export interface AvatarCreatureFace {
  /** 0..1 normalized from Focus attribute */
  focusLevel: number;
  expression:
    | "scared" // Tier 1 Spark — wide anxious eyes, tucked mouth
    | "cautious" // Tier 2 Hatchling — suspicious gaze, head tilted
    | "edgy" // Tier 3 Young — sullen furrowed brow, sharp glare
    | "focused" // Tier 4 Awakened — intense gaze
    | "determined" // Tier 4-5 — sharp predatory / demiruge intent
    | "berserk" // Warrior Tier 5 Signature — fangs bared, fierce snarling eye
    | "sovereign" // Tier 6 Ascended — serene titan / oracle gaze
    | "mythic"; // Tier 7 Mythic — star / radiant avatar eyes
  eyebrowAngle: number;
  eyeVariant: 0 | 1 | 2;
  /** Focus aura/ring around eyes when focus is high */
  hasFocusRing: boolean;
  /** Mouth & jaw expression */
  mouthVariant: "tucked" | "neutral" | "snarl" | "fangs" | "calm" | "radiant";
}

export interface AvatarEvolutionStage {
  /** Tier: 1 Spark, 2 Hatchling, 3 Young, 4 Awakened, 5 Signature, 6 Ascended, 7 Mythic */
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  classArchetype: "warrior" | "creator" | "explorer" | "strategist" | "wanderer";
}

export interface AvatarMarkings {
  /** 0..1 normalized from Intelligence attribute (affects intricacy of bioluminescent patterns) */
  complexity: number;
  /** Pattern style on body/head */
  patternType: "dots" | "runes" | "geometric" | "celestial";
  hasSensoryCrown: boolean;
}

export interface AvatarSkillImprint {
  id: string;
  skillName: string;
  type: "rune" | "pulse-band" | "halo" | "tail-orb" | "crystal";
  location: "paws" | "body" | "tail" | "head";
  color: string;
}

export interface AvatarEffectItem {
  id: string;
  type: "aura" | "particles" | "ethereal-mist";
  intensity: number;
  color: string;
}

export interface AvatarParams {
  identity: AvatarIdentity;
  palette: AvatarColorPalette;
  body: AvatarCreatureBody;
  posture: AvatarPosture;
  face: AvatarCreatureFace;
  evolution: AvatarEvolutionStage;
  markings: AvatarMarkings;
  skillImprints: AvatarSkillImprint[];
  effects: AvatarEffectItem[];
  currentMood: {
    energy: number;
    fatigue: number;
  };
  /** 0..1 normalized Endurance attribute channels */
  endurance: {
    /** Chest cavity depth / rib cage volume (separate from Strength bulk) */
    chestDepth: number;
    /** Skin/hide thickness — thicker contour lines and folds */
    hideThickness: number;
  };
  /** 0..1 normalized Social attribute channel */
  social: {
    /** Collar crest / plumage / ruff size (0 = none, 1 = full) */
    crestSize: number;
  };
  /** Creativity attribute channels */
  creativity: {
    /** 0..1 — how pronounced the asymmetry/irregularity is */
    asymmetryIntensity: number;
    /** Deterministic seed (from identity) controlling the specific shape of asymmetry */
    asymmetrySeed: number;
  };
  /** If true, renders creature in pure dark silhouette mode to test silhouette quality */
  silhouetteOnly?: boolean;
}
