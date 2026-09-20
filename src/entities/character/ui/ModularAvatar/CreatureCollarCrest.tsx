import type { AvatarParams } from "../../model/avatarTypes";

/**
 * CreatureCollarCrest — Social attribute visual channel.
 *
 * Renders a collar crest / plumage / ruff on the neck area.
 * Size and shape scale continuously with social.crestSize (0..1).
 * Form varies by class archetype:
 *   Warrior:    bristling mane/spikes on nape
 *   Creator:    sculpted ornamental collar
 *   Explorer:   feathered antenna-fins
 *   Strategist: crystalline necklace lattice
 *   Wanderer:   ethereal flowing ribbons
 */
export function CreatureCollarCrest({
  params,
  isSilhouette = false,
}: {
  params: AvatarParams;
  isSilhouette?: boolean;
}) {
  const { palette, social, evolution } = params;
  const { crestSize } = social;
  const { classArchetype } = evolution;

  // Don't render if Social is too low
  if (crestSize < 0.08) return null;

  const fillPrimary = isSilhouette ? "#020617" : palette.primaryBody;
  const fillAccent = isSilhouette ? "#020617" : palette.accent;
  const fillMembrane = isSilhouette ? "#020617" : "url(#creature-membrane-grad)";
  const strokeAccent = isSilhouette ? "none" : palette.accent;

  // Scale factor: 0..1 → crest grows from barely visible to full
  const s = crestSize;
  const opacity = isSilhouette ? 1 : 0.6 + s * 0.35;

  return (
    <g className="creature-collar-crest" opacity={opacity}>
      {/* Warrior: bristling mane spikes on nape/shoulders */}
      {classArchetype === "warrior" && (
        <g>
          {/* Central spine bristle */}
          <path
            d={`M 100 ${118 - s * 6} L ${100 - 4 * s} 124 L ${100 + 4 * s} 124 Z`}
            fill={fillPrimary}
            stroke={strokeAccent}
            strokeWidth="0.8"
          />
          {/* Left shoulder bristles */}
          {s > 0.2 && (
            <path
              d={`M ${88 - s * 6} ${116 - s * 8} L ${86 - s * 2} 124 L ${92 - s * 2} 126 Z`}
              fill={fillPrimary}
              stroke={strokeAccent}
              strokeWidth="0.8"
            />
          )}
          {/* Right shoulder bristles */}
          {s > 0.2 && (
            <path
              d={`M ${112 + s * 6} ${116 - s * 8} L ${114 + s * 2} 124 L ${108 + s * 2} 126 Z`}
              fill={fillPrimary}
              stroke={strokeAccent}
              strokeWidth="0.8"
            />
          )}
          {/* Extra outer spikes at high social */}
          {s > 0.5 && (
            <>
              <path
                d={`M ${80 - s * 8} ${120 - s * 6} L ${82 - s * 4} 128 L ${86 - s * 4} 126 Z`}
                fill={fillAccent}
              />
              <path
                d={`M ${120 + s * 8} ${120 - s * 6} L ${118 + s * 4} 128 L ${114 + s * 4} 126 Z`}
                fill={fillAccent}
              />
            </>
          )}
        </g>
      )}

      {/* Creator: sculpted ornamental collar with curves */}
      {classArchetype === "creator" && (
        <g>
          <path
            d={`M ${100 - 14 * s - 8} 122 
               Q ${100 - 8 * s} ${118 - s * 8} 100 ${116 - s * 6}
               Q ${100 + 8 * s} ${118 - s * 8} ${100 + 14 * s + 8} 122`}
            fill="none"
            stroke={strokeAccent}
            strokeWidth={1.5 + s * 1.5}
            strokeLinecap="round"
          />
          {s > 0.35 && (
            <>
              {/* Ornamental dots along collar */}
              <circle cx={100 - 10 * s} cy={119 - s * 5} r={1.5 + s} fill={fillAccent} />
              <circle cx={100} cy={116 - s * 6} r={1.5 + s} fill={fillAccent} />
              <circle cx={100 + 10 * s} cy={119 - s * 5} r={1.5 + s} fill={fillAccent} />
            </>
          )}
        </g>
      )}

      {/* Explorer: feathered antenna-fin collar */}
      {classArchetype === "explorer" && (
        <g>
          {/* Left fin */}
          <path
            d={`M ${90 - s * 4} 124 C ${82 - s * 10} ${118 - s * 10}, ${78 - s * 8} ${114 - s * 6}, ${84 - s * 6} 122`}
            fill={fillMembrane}
            stroke={strokeAccent}
            strokeWidth="0.8"
          />
          {/* Right fin */}
          <path
            d={`M ${110 + s * 4} 124 C ${118 + s * 10} ${118 - s * 10}, ${122 + s * 8} ${114 - s * 6}, ${116 + s * 6} 122`}
            fill={fillMembrane}
            stroke={strokeAccent}
            strokeWidth="0.8"
          />
          {s > 0.5 && !isSilhouette && (
            <>
              {/* Feather detail lines */}
              <path
                d={`M ${86 - s * 5} 123 L ${80 - s * 8} ${116 - s * 8}`}
                stroke={palette.accent}
                strokeWidth="0.7"
                opacity="0.6"
              />
              <path
                d={`M ${114 + s * 5} 123 L ${120 + s * 8} ${116 - s * 8}`}
                stroke={palette.accent}
                strokeWidth="0.7"
                opacity="0.6"
              />
            </>
          )}
        </g>
      )}

      {/* Strategist: crystalline necklace lattice */}
      {classArchetype === "strategist" && (
        <g>
          {/* Central crystal pendant */}
          <polygon
            points={`100,${120 - s * 4} ${98 - s * 2},${124 - s * 2} 100,${126 - s * 1} ${102 + s * 2},${124 - s * 2}`}
            fill={fillAccent}
          />
          {s > 0.25 && (
            <>
              {/* Side crystal nodes */}
              <polygon
                points={`${92 - s * 4},${122 - s * 3} ${90 - s * 4},${125 - s * 2} ${94 - s * 4},${125 - s * 2}`}
                fill={fillAccent}
              />
              <polygon
                points={`${108 + s * 4},${122 - s * 3} ${106 + s * 4},${125 - s * 2} ${110 + s * 4},${125 - s * 2}`}
                fill={fillAccent}
              />
            </>
          )}
          {s > 0.45 && !isSilhouette && (
            <>
              {/* Lattice connecting lines */}
              <line
                x1={92 - s * 4}
                y1={124 - s * 2}
                x2={100}
                y2={122 - s * 3}
                stroke={palette.accent}
                strokeWidth="0.8"
                opacity="0.7"
              />
              <line
                x1={108 + s * 4}
                y1={124 - s * 2}
                x2={100}
                y2={122 - s * 3}
                stroke={palette.accent}
                strokeWidth="0.8"
                opacity="0.7"
              />
            </>
          )}
        </g>
      )}

      {/* Wanderer: ethereal flowing ribbons */}
      {classArchetype === "wanderer" && (
        <g opacity={isSilhouette ? 1 : 0.65 + s * 0.25}>
          {/* Left ribbon */}
          <path
            d={`M 92 124 C ${82 - s * 12} ${118 - s * 8}, ${76 - s * 10} ${126 - s * 4}, ${80 - s * 8} ${132 + s * 4}`}
            fill="none"
            stroke={isSilhouette ? "#020617" : palette.accent}
            strokeWidth={2 + s * 2}
            strokeLinecap="round"
            opacity={0.5 + s * 0.4}
          />
          {/* Right ribbon */}
          <path
            d={`M 108 124 C ${118 + s * 12} ${118 - s * 8}, ${124 + s * 10} ${126 - s * 4}, ${120 + s * 8} ${132 + s * 4}`}
            fill="none"
            stroke={isSilhouette ? "#020617" : palette.accent}
            strokeWidth={2 + s * 2}
            strokeLinecap="round"
            opacity={0.5 + s * 0.4}
          />
          {s > 0.6 && (
            <>
              {/* Extra inner wisps */}
              <path
                d={`M 96 123 C ${88 - s * 6} ${120 - s * 4}, ${86 - s * 4} ${128}, ${88 - s * 2} ${134 + s * 2}`}
                fill="none"
                stroke={isSilhouette ? "#020617" : palette.markingColor}
                strokeWidth={1 + s}
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d={`M 104 123 C ${112 + s * 6} ${120 - s * 4}, ${114 + s * 4} ${128}, ${112 + s * 2} ${134 + s * 2}`}
                fill="none"
                stroke={isSilhouette ? "#020617" : palette.markingColor}
                strokeWidth={1 + s}
                strokeLinecap="round"
                opacity="0.4"
              />
            </>
          )}
        </g>
      )}
    </g>
  );
}
