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
  /** Exact character level */
  level?: number;
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

  /**
   * Fox-specific visual attribute channels.
   * Only consumed by FoxAvatar — other creatures ignore these fields.
   */
  foxAttributes?: {
    /** Strength: shoulder spike count (0..4), core highlight opacity (0..1), core scale (1.0..1.08) */
    strength: {
      spikeCount: number;         // 0..4 stepped at 4/8/12/16 Str
      coreHighlightOpacity: number; // 0..1
      coreScale: number;          // 1.0..1.08 (only non-curled poses)
    };
    /** Intelligence: head facet subdivision depth (fixed to 1), facet count scaling with value (1..9) */
    intelligence: {
      subdivisionDepth: number;   // 1 = depth 1
      facetCount: number;         // 1..9 facets selected for subdivision
      headWhitenMix: number;      // 0..1 normalized intelligence
    };
    /** Focus: depth of field (body dimming, head untouched), canvas vignette opacity (0..0.41), eye vertical squeeze (0.88..1.0), particle ring convergence */
    focus: {
      eyeSqueezeY: number;        // 0.88..1.0 (lower = squinted) — secondary channel
      /** 0..1 — body zones (torso/limbs/tail) desaturate to ~45% and dim to ~88%; head zone untouched */
      depthOfField: number;
      vignetteOpacity: number;    // 0..0.41
      particleOrbitRadius: number; // px override, -1 = use tier default (@deprecated: use particleConvergence)
      /** 0..1 — convergence of particle ring toward head center & tighter radius (via ParticleConfig.radius) */
      particleConvergence: number;
    };
    /** Endurance: cold ash patina on torso (0..1), elongated-facet scars on torso (1..6), crimson limb veins (1..12) */
    endurance: {
      patinaStrength: number;     // 0..1 desaturation + cold ash-blue tint
      scratchCount: number;       // 1..6 scars on the most elongated torso facets
      veinCount: number;          // 1..12 pulsing crimson veins on limb zones (constant pulse speed)
    };
    /** Discipline: particle target shape, rim stability (jitter reduction), pose symmetry emphasis */
    discipline: {
      particleTargetShape: "none" | "circle" | "square" | "triangle" | "spiral" | "arc";
      rimJitterReduction: number; // 0..1 — how stable/non-flickering rim-light appears
      poseSymmetryEmphasis: number; // 0..1
    };
    /** Social: collar facet subdivision depth (0..2), bond mark count (0..4), collar warm hue shift (0..1) */
    social: {
      collarSubdivisionDepth: number; // 0..2
      bondMarkCount: number;          // 0..4
      collarWarmShift: number;        // 0..1 warm tone mix on collar zone
    };
  };
}
