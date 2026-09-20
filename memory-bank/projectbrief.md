# Dayforge — Project Brief

## Продукт

Dayforge — это мобильное RPG-приложение для продуктивности. Реальные действия пользователя (ежедневные задачи, отчёты, привычки) прокачивают игрового персонажа: растёт XP, поднимается уровень, прокачиваются характеристики и навыки.

Слоган: **«Твоя жизнь. Твоя RPG.»**

Целевая аудитория: люди, которым нужна геймификация реальной жизни для поддержания мотивации и системности.

---

## Технологический стек

| Слой             | Технология                                            |
| ---------------- | ----------------------------------------------------- |
| Фреймворк        | React 19 + TypeScript (strict mode)                   |
| Сборщик          | Vite 8                                                |
| Роутинг          | React Router v7                                       |
| Серверный стейт  | TanStack Query v5 (staleTime: 30s)                    |
| Клиентский стейт | Zustand v5                                            |
| Формы            | React Hook Form v7 + Zod v4                           |
| Анимации         | Framer Motion v13                                     |
| Бэкенд / БД      | Supabase (PostgreSQL + Auth + RLS)                    |
| Архитектура      | Feature-Sliced Design (FSD)                           |
| Стили            | SCSS Modules, CSS Custom Properties (dark-first тема) |
| Линтинг          | ESLint + Prettier + Husky + Commitlint                |
| Node.js          | 22+                                                   |

---

## Ключевые архитектурные решения

### 1. Атомарные RPC-функции вместо множественных запросов

Onboarding выполняется через единственный RPC-вызов `complete_onboarding(username, character_name, class_id, starting_directions[])`, который атомарно в одной транзакции:

- обновляет `profiles` (username, `onboarding_completed = true`)
- создаёт `characters`
- сидирует все 7 `character_attributes` со значением 1
- сидирует `user_skills` для выбранных starting directions

### 2. Repository layer — нет прямых вызовов Supabase из компонентов

Все обращения к БД идут через repository-объекты:

- `onboardingRepository` — `complete(data)`
- `characterRepository` — `getCurrentCharacter`, `getCharacterAttributes`, `getUserSkills`, `getTodayState`

Компоненты используют только hooks (`useCharacter`, `useCharacterData`), которые оборачивают TanStack Query.

### 3. TanStack Query кэш — один сетевой запрос

`useCharacter(userId)` — ключ `['character', userId]` — используется и в Header, и в HomePage. При совпадении ключей TanStack Query отдаёт кэш без дублирования сетевого вызова.

### 4. Единый источник истины для auth gate

`useAppState()` в `entities/auth/model` — единственный хук, определяющий состояние приложения:

- `loading` → Supabase ещё проверяет сессию
- `unauthenticated` → нет сессии
- `needs-onboarding` → сессия есть, но нет записи в `characters`
- `ready` → сессия есть + персонаж создан

Сигнал для onboarding: **наличие записи в `characters`** (не поле `onboarding_completed` из profiles). Это единственный источник правды.

### 5. Dark-first тема

CSS Custom Properties определены в `shared/styles/tokens/tokens.scss`. Все компоненты используют токены, хардкод цветов запрещён. Токены: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-primary`, `--color-success`, `--color-warning`, `--color-danger`.

### 6. Переиспользуемый UI Kit в shared/ui

Компоненты: `Avatar`, `Badge`, `Button`, `Card`, `Drawer`, `EmptyState`, `ErrorState`, `Input`, `Loading`, `LoadingScreen`, `Modal`, `ProgressBar`, `Stat`, `Textarea`, `Toast`, `XPBar`, `LevelUp`, `Achievement`.
Каждый компонент — отдельная папка с `.tsx` + `.module.scss`. Новые визуальные компоненты создаются только здесь.

---

## БД-схема (ключевые таблицы)

```
profiles          — id (= auth.users.id), username, display_name, avatar_url, onboarding_completed
characters        — id, profile_id, name, class, level, total_xp
attribute_definitions — id, code, name, description
character_attributes  — id, character_id, attribute_id, value (0–∞, starts at 1)
skills            — id, code, name, description
user_skills       — id, character_id, skill_id, level, xp
daily_plans       — id, character_id, date, status (planned|completed)
quests            — id, daily_plan_id, title, description, status (pending|completed), position
daily_reports     — id, character_id, date, content
report_events     — id, daily_report_id, type, description
event_impacts     — id, report_event_id, attribute_id|skill_id, value (±)
xp_transactions   — id, character_id, skill_id?, report_event_id?, amount, reason
daily_states      — id, character_id, date, energy(0-100), fatigue(0-100), focus(0-100), mood(0-100)
```

---

## Характеристики персонажа (из миграции seed_game_data)

| code           | Название     | Описание                                                  |
| -------------- | ------------ | --------------------------------------------------------- |
| `strength`     | Сила         | Физическая сила и способность выполнять физическую работу |
| `endurance`    | Выносливость | Способность долго сохранять работоспособность             |
| `discipline`   | Дисциплина   | Выполнять запланированное независимо от желания           |
| `intelligence` | Интеллект    | Учиться, анализировать и решать сложные задачи            |
| `focus`        | Фокус        | Концентрироваться на одной задаче                         |
| `social`       | Социальность | Взаимодействовать с людьми и строить отношения            |
| `creativity`   | Креативность | Создавать новые идеи и нестандартные решения              |

---

## Классы персонажа

| id           | Название      | Emoji | Цвет      |
| ------------ | ------------- | ----- | --------- |
| `warrior`    | Воин          | ⚔️    | `#ef4444` |
| `creator`    | Создатель     | 🛠     | `#f59e0b` |
| `explorer`   | Исследователь | 🔭    | `#3b82f6` |
| `strategist` | Стратег       | ♟     | `#818cf8` |
| `wanderer`   | Странник      | 🧭    | `#22c55e` |

---

## Стартовые навыки (из seed_game_data)

`programming`, `driving`, `communication`, `learning`, `fitness`, `planning`

Стартовые направления онбординга (7 вариантов):
`programming`, `fitness`, `learning`, `career`, `finance`, `social`, `creativity`

Примечание: направления `career`, `finance`, `creativity` не имеют прямого соответствия в таблице `skills` — при onboarding RPC они молча пропускаются (сиды не создаются).

---

## XP-формула (фронтенд)

`xpRequiredForLevel(n) = (n + 1) * 100`
`xpWithinCurrentLevel(totalXp, level) = totalXp - xpThresholdForLevel(level)`
Реализована в `entities/character/model/characterTypes.ts`.
