import { getBodyArchetype } from "../../model/avatarEngine";
import type { AvatarParams } from "../../model/avatarTypes";
import { CreatureLimbs } from "./CreatureLimbs";

export function CreatureBody({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, body, evolution, posture, endurance } = params;
  const { bulk } = body;
  const { classArchetype, tier } = evolution;
  const { confidence } = posture;
  const { chestDepth, hideThickness } = endurance;

  // ── DISCRETE BODY ARCHETYPE (L1-4 Larval, L5-19 Juvenile, L20-34 Adult, L35+ Apex) ──
  const archetype = getBodyArchetype(tier);
  const bellyConvexity = body.bellyConvexity ?? archetype.bellyConvexity;
  const spineSegmentation = body.spineSegmentation ?? archetype.spineSegmentation;

  // Class Biomechanics Multipliers for 2nd Class Signal
  const classBiomechanics: Record<
    AvatarParams["evolution"]["classArchetype"],
    { shoulder: number; chest: number; thigh: number }
  > = {
    warrior: { shoulder: 1.35, chest: 1.25, thigh: 1.2 },
    creator: { shoulder: 1.12, chest: 1.05, thigh: 1.0 },
    explorer: { shoulder: 0.9, chest: 0.92, thigh: 0.9 },
    strategist: { shoulder: 1.05, chest: 1.0, thigh: 1.0 },
    wanderer: { shoulder: 0.82, chest: 0.85, thigh: 0.85 },
  };

  const bio = classBiomechanics[classArchetype] ?? classBiomechanics.warrior;

  // Skeletal & muscle breadth scaling (Archetype base + Strength bulk * Class Biomechanics * classBioWeight)
  const classWeight = archetype.classBioWeight;
  const shoulderWidth = (22 + archetype.torsoHeight * 0.1 + bulk * 12) * bio.shoulder * classWeight;
  const chestWidth = (18 + archetype.torsoHeight * 0.08 + bulk * 10) * bio.chest * classWeight;

  // ── STRENGTH → Continuous Muscle Relief (5 points) ──
  const napeBulge = bulk * 6;
  const deltoidBulge = bulk * 5.5;
  const pectoralOpacity = 0.25 + bulk * 0.65;
  const pectoralDepth = 2 + bulk * 6;

  // ── ENDURANCE → Chest cavity depth ──
  const chestBulge = chestDepth * 8;
  const bodyStrokeWidth = 1 + hideThickness * 1.5;

  // ── DISCIPLINE → Spine Curve ──
  const spineArchOffset = archetype.baseSpineArch + (-3 + confidence * 6);

  const primaryFill = isSilhouette ? "#020617" : "url(#creature-body-grad)";

  // Dynamic Y-coordinates driven by archetype.torsoHeight (55px Larval .. 98px Apex)
  const yTorsoTop = 160 - archetype.torsoHeight * 0.45;
  const yTorsoBottom = 160 + archetype.torsoHeight * 0.55;

  // ── ARCHETYPE CURVATURE CHARACTERISTICS ──
  // 1. Belly Convexity: Larval (1.0) = cute rounded pup belly, Apex (0.0) = tight athletic V-waist
  const bellyBulgeY = yTorsoBottom + bellyConvexity * 8;
  const bellyExtraX = bellyConvexity * 8;

  return (
    <g className="creature-body">
      {/* Torso Structure — Nape & Deltoids + Pectorals */}
      {/* ── Low-Poly Triangulated Torso & Faceted Chest Mesh ── */}
      <g className="creature-torso" strokeLinejoin="round">
        {/* Default Biological Torso path for other classes */}
        <path
          d={`M ${100 - shoulderWidth} ${yTorsoTop} 
             C ${100 - shoulderWidth - deltoidBulge} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.2 + spineArchOffset}, 
               ${100 - chestWidth - 6 - chestBulge - bellyExtraX} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * (0.65 + bellyConvexity * 0.1)}, 
               ${100 - chestWidth + 2 - bellyExtraX * 0.5} ${yTorsoBottom} 
             C ${100 - chestWidth / 2} ${bellyBulgeY}, 
               ${100 + chestWidth / 2} ${bellyBulgeY}, 
               ${100 + chestWidth - 2 + bellyExtraX * 0.5} ${yTorsoBottom} 
             C ${100 + chestWidth + 6 + chestBulge + bellyExtraX} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * (0.65 + bellyConvexity * 0.1)}, 
               ${100 + shoulderWidth + deltoidBulge} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.2 + spineArchOffset}, 
               ${100 + shoulderWidth} ${yTorsoTop} 
             C ${100 + shoulderWidth / 2} ${yTorsoTop - 7 - napeBulge}, 
               ${100 - shoulderWidth / 2} ${yTorsoTop - 7 - napeBulge}, 
               ${100 - shoulderWidth} ${yTorsoTop} Z`}
          fill={primaryFill}
          stroke={isSilhouette ? "none" : palette.secondaryBody}
          strokeWidth={bodyStrokeWidth}
        />

        {/* Feature 2: Single Luminescent Chest Core Ember */}
        {!isSilhouette && (
          <g className="creature-chest-core-ember">
            {/* Ambient Light Halo */}
            <circle
              cx="100"
              cy={yTorsoTop + 24}
              r="12"
              fill={palette.accent}
              opacity="0.3"
              filter="url(#avatar-glow-filter)"
            />
            {/* Outer Core Ember */}
            <circle
              cx="100"
              cy={yTorsoTop + 24}
              r="6"
              fill="url(#creature-core-ember-grad)"
              filter="url(#avatar-glow-filter)"
            />
            {/* Brilliant White-Hot Spark Center */}
            <circle cx="100" cy={yTorsoTop + 24} r="2.5" fill="#fff7ed" />
          </g>
        )}

        {/* Pectoral & Scapular Contour Folds */}
        {!isSilhouette && (
          <g opacity={pectoralOpacity}>
            <path
              d={`M ${100 - shoulderWidth * 0.4} ${yTorsoTop + 16} Q ${100 - shoulderWidth * 0.15} ${yTorsoTop + 26 + pectoralDepth * 0.5} 100 ${yTorsoTop + 24}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1.2"
            />
            <path
              d={`M ${100 + shoulderWidth * 0.4} ${yTorsoTop + 16} Q ${100 + shoulderWidth * 0.15} ${yTorsoTop + 26 + pectoralDepth * 0.5} 100 ${yTorsoTop + 24}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* 3. Spine / Abdominal Segmentation Lines */}
        {!isSilhouette && spineSegmentation > 0.1 && (
          <g opacity={spineSegmentation * 0.75}>
            {/* Horizontal Segmented Chitin Ribs */}
            <path
              d={`M ${100 - chestWidth * 0.35} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.38} 
                 L 100 ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.42} 
                 L ${100 + chestWidth * 0.35} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.38}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1.2"
            />
            <path
              d={`M ${100 - chestWidth * 0.32} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.52} 
                 L 100 ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.56} 
                 L ${100 + chestWidth * 0.32} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.52}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1.2"
            />
            {spineSegmentation > 0.6 && (
              <path
                d={`M ${100 - chestWidth * 0.28} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.66} 
                   L 100 ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.7} 
                   L ${100 + chestWidth * 0.28} ${yTorsoTop + (yTorsoBottom - yTorsoTop) * 0.66}`}
                fill="none"
                stroke={palette.secondaryBody}
                strokeWidth="1.2"
              />
            )}
          </g>
        )}

        {/* Endurance: hide folds / skin thickness marks on shoulders */}
        {!isSilhouette && hideThickness > 0.4 && (
          <g opacity={0.3 + hideThickness * 0.3}>
            <path
              d={`M ${100 - shoulderWidth + 4} ${yTorsoTop + 8} Q ${100 - shoulderWidth + 8} ${yTorsoTop + 16} ${100 - shoulderWidth + 14} ${yTorsoTop + 12}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1"
            />
            <path
              d={`M ${100 + shoulderWidth - 4} ${yTorsoTop + 8} Q ${100 + shoulderWidth - 8} ${yTorsoTop + 16} ${100 + shoulderWidth - 14} ${yTorsoTop + 12}`}
              fill="none"
              stroke={palette.secondaryBody}
              strokeWidth="1"
            />
          </g>
        )}

        {/* Sternum / Collar Ridge Lines */}
        {!isSilhouette && tier >= 3 && (
          <path
            d={`M 100 ${yTorsoTop + 14} L 100 ${yTorsoBottom - 24} M ${100 - 12} ${yTorsoTop + 28} L ${100 + 12} ${yTorsoTop + 28} M ${100 - 10} ${yTorsoTop + 40} L ${100 + 10} ${yTorsoTop + 40}`}
            stroke={palette.secondaryBody}
            strokeWidth="1.2"
            opacity="0.5"
          />
        )}
      </g>

      {/* ── Articulated 4-Limb Rig (Forelimbs & Hindlimbs) ── */}
      <CreatureLimbs
        params={params}
        isSilhouette={isSilhouette}
        yTorsoTop={yTorsoTop}
        yTorsoBottom={yTorsoBottom}
        shoulderWidth={shoulderWidth}
        chestWidth={chestWidth}
        archetype={archetype}
      />
    </g>
  );
}
