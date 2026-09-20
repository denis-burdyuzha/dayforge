import type { CharacterClass, StartingDirection } from "./types";

export const characterClasses: CharacterClass[] = [
  {
    id: "warrior",
    name: "Воин",
    description: "Действует, преодолевает препятствия и становится сильнее через испытания.",
    motto: "Действие вместо оправданий",
    avatarIcon: "⚔️",
    accentColor: "#ef4444",
  },
  {
    id: "creator",
    name: "Создатель",
    description: "Создаёт новое, превращает идеи в реальные вещи и развивает мастерство.",
    motto: "Превращай идеи в реальность",
    avatarIcon: "🛠",
    accentColor: "#f59e0b",
  },
  {
    id: "explorer",
    name: "Исследователь",
    description: "Изучает мир, получает новый опыт и постоянно расширяет свои горизонты.",
    motto: "Познавай неисследованное",
    avatarIcon: "🔭",
    accentColor: "#3b82f6",
  },
  {
    id: "strategist",
    name: "Стратег",
    description: "Планирует действия, управляет ресурсами и добивается целей системно.",
    motto: "Точный расчёт — верная победа",
    avatarIcon: "♟",
    accentColor: "#818cf8",
  },
  {
    id: "wanderer",
    name: "Странник",
    description: "Ищет свой путь, пробует новое и развивается через разнообразный опыт.",
    motto: "Твой путь создаётся каждым шагом",
    avatarIcon: "🧭",
    accentColor: "#22c55e",
  },
];

export const startingDirections: StartingDirection[] = [
  { id: "programming", label: "Программирование" },
  { id: "fitness", label: "Фитнес" },
  { id: "learning", label: "Обучение" },
  { id: "career", label: "Карьера" },
  { id: "finance", label: "Финансы" },
  { id: "social", label: "Социальное" },
  { id: "creativity", label: "Творчество" },
];
