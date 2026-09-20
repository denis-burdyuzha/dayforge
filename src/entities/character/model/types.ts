export type CharacterClassId = "warrior" | "creator" | "explorer" | "strategist" | "wanderer";

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  description: string;
  motto: string;
  avatarIcon: string;
  accentColor: string;
}

export type AttributeKey =
  "endurance" | "intelligence" | "social" | "strength" | "discipline" | "creativity" | "focus";

export type StartingDirectionId =
  "programming" | "fitness" | "learning" | "career" | "finance" | "social" | "creativity";

export interface StartingDirection {
  id: StartingDirectionId;
  label: string;
}
