# Архитектура (по коду, состояние на 26.11.2026)

Всё ниже проверено чтением кода. Аватар — отдельно в `avatar-system.md`.

## FSD-слои

| Слой            | Что лежит                                                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`      | `router/router.tsx`; `layouts/` (AppShell, GuestLayout, ProtectedLayout); `providers/` (AppProviders, ErrorBoundary, ThemeProvider, NotificationProvider, QueryProvider)                                                                                                                                   |
| `src/pages/`    | HomePage (страница персонажа), LandingPage, LoginPage, AuthCallbackPage, AvatarPlaygroundPage                                                                                                                                                                                                              |
| `src/widgets/`  | `header` (лого + Avatar + Badge уровня), `bottom-navigation` (3 вкладки: Главная / План / Отчёт)                                                                                                                                                                                                           |
| `src/features/` | `onboarding` (визард, Zod-схема, onboardingRepository), `daily-plan/ui/DailyPlanPage`, `daily-report/ui/DailyReportPage` + `DayCompletionView`                                                                                                                                                             |
| `src/entities/` | `auth` (useAppState), `character` (типы, формулы, репозиторий, хуки, аватар), `daily-plan`, `daily-report` (репозитории + типы)                                                                                                                                                                            |
| `src/shared/`   | `ui/` (UI-кит: Button, Input, Textarea, Card, Badge, ProgressBar, XPBar, Stat, Avatar, Modal, Drawer, Toast, Loading, LoadingScreen, EmptyState, ErrorState, LevelUp, Achievment), `api/supabase` (client, database.types.ts), `config/env.ts` (Zod-валидация env), `styles/` (tokens, themes, animations) |

Нарушения FSD: страницы плана/отчёта лежат в `features/*/ui/*Page.tsx` (а не в `pages/`); `features/daily-plan|report`
не имеют своих `api/model` — используют `entities/*`.

## Роутинг (`src/app/router/router.tsx`)

- `/dev/avatar` — AvatarPlaygroundPage, **без** защиты (доступен в проде тоже). URL-параметры:
  `class`, `level`, `strength`, `endurance`, `discipline`, `intelligence`, `focus`, `social`, `creativity`, `big=1`, `silhouette=true`.
- GuestLayout: `/` (Landing), `/onboarding`, `/login`.
- `/auth/callback` — завершение OAuth + досабмит онбординга из `localStorage["dayforge:onboarding:draft"]`.
- ProtectedLayout → AppShell: `/app` (HomePage), `/app/plan`, `/app/report`; заглушки `/app/report/review`, `/app/character`, `/app/settings`.
- `*` → `/`.

## Auth Gate (`entities/auth/model/useAppState.ts`)

Состояния: `loading` → `unauthenticated` → `needs-onboarding` → `ready`.
Признак онбординга — **наличие строки в `characters`** (не `profiles.onboarding_completed`).
ProtectedLayout: loading → LoadingScreen; unauthenticated → `/login`; needs-onboarding → `/onboarding`.
GuestLayout: ready на `/`, `/login`, `/onboarding` → `/app`; needs-onboarding вне `/onboarding` → `/onboarding`.
Техдолг: `useAppState` — обычный хук с локальным state; каждый вызов (Layout, Header…) создаёт свою подписку
на `onAuthStateChange` и свой запрос в `characters`.

## Онбординг (`features/onboarding`)

Экраны: Intro → Identity (username) → Class (characterName + classId) → Directions (1–5 направлений) → Confirmation.
Регистрация — **в конце** (ConfirmationStep): email/password `signUp` → RPC; Google OAuth → черновик в localStorage →
`/auth/callback` → RPC. Вход существующего пользователя — LoginPage (email/password, Google).

## Провайдеры

`ErrorBoundary > ThemeProvider > NotificationProvider > QueryProvider(staleTime 30s, retry 1)`.

## Слой данных

- Компоненты не ходят в Supabase напрямую (кроме auth в Login/Confirmation/useAppState) — через репозитории:
  `characterRepository` (getCurrentCharacter, getCharacterAttributes, getTodayState, getRecentXpEvents, getCharacterSkills),
  `dailyPlanRepository` (getTodayPlan, createTodayPlan, addQuest, completeQuest→RPC), `dailyReportRepository`
  (getTodayReport, completeDay), `aiDayReportRepository` (parse→Edge Function `parse-day-report`,
  apply→RPC `apply_day_report`), `onboardingRepository.complete`→RPC.
- TanStack Query: `useCharacter(userId)` ключ `['character', userId]` (общий для Header и HomePage);
  `useCharacterData` — подзапросы `['character', characterId, 'attributes'|'state'|'xp-events'|'character-skills']`.
- Zustand установлен, но **не используется**.
- «Сегодня» вычисляется как `new Date().toISOString().slice(0,10)` — это дата по **UTC**, не локальная (баг для UTC+3 в 00:00–03:00).

## Игровой цикл (как реально работает)

1. `/app/plan`: «Создать план» → `daily_plans` (character_id, date). Форма квеста: название, навык (опц.), часы (≥0.25).
   Новый навык → выбор 1–2 атрибутов → `addQuest` создаёт строку `character_skills` с primary/secondary_attribute_id
   (клиентский insert) и квест с `skill_name`, `hours`, `skill_id`.
2. Отметка квеста → RPC `complete_quest(p_quest_id)` → XP, уровень, атрибуты, навык; micro-toast; LevelUp при росте уровня.
3. `/app/report` (с 26.11.2026): свободный текст → «Разобрать день» → Edge Function `parse-day-report` → превью
   событий (правка часов/навыков) → «Подтвердить» → RPC `apply_day_report` → `completeDay` сохраняет текст → LevelUp.
   «Завершить день без разбора» — старый путь: свободный текст → `completeDay`: upsert `daily_reports`, сумма `xp_transactions` за сегодня,
   `attributeDeltas` (из `quests.attribute_id` — **всегда пусто**, т.к. addQuest пишет `attribute_id: null`), текущий уровень.
   Отчёт только сохраняется — никакого анализа/начислений.
4. HomePage: аватар (`computeAvatarParams` → `ModularAvatar`), атрибуты (числа), навыки (level/form), события XP.

## Схема БД (public)

| Таблица                      | Ключевые колонки                                                                                                                                                          | Статус                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| profiles                     | id (=auth.users.id), username (unique), display_name, avatar_url, onboarding_completed                                                                                    | используется                       |
| characters                   | id, profile_id, name, class, level (≥1), total_xp (≥0)                                                                                                                    | используется                       |
| attribute_definitions        | id, code (unique), name, description — сид 7 атрибутов                                                                                                                    | используется                       |
| character_attributes         | character_id, attribute_id, value (≥0) — unique(character_id, attribute_id)                                                                                               | используется                       |
| character_skills             | id, character_id, name, total_hours, total_xp, last_practiced_at, primary_attribute_id, secondary_attribute_id, aliases[], icon; unique index (character_id, lower(name)) | используется                       |
| day_report_parses            | id, user_id, report_date, input_text, model, attempt, raw_output, parsed_events, status, error_message, latency_ms                                                        | пишет Edge Function (service_role) |
| day_report_applications      | parse_id (PK), user_id, report_date, result                                                                                                                               | пишет apply_day_report             |
| daily_plans                  | character_id, date, status planned/completed — unique(character_id, date)                                                                                                 | используется (status не меняется)  |
| quests                       | daily_plan_id, title, description, status pending/completed, position, xp_reward (легаси, не влияет), attribute_id (легаси, всегда null), skill_name, hours, skill_id     | используется                       |
| daily_reports                | character_id, date, content — unique(character_id, date)                                                                                                                  | используется                       |
| xp_transactions              | character_id, amount, reason, skill_id (→skills, легаси), report_event_id                                                                                                 | пишет complete_quest               |
| skills                       | каталог из сида (programming, driving, communication, learning, fitness, planning)                                                                                        | только для онбординга              |
| report_events, event_impacts | задел под AI-анализ отчёта                                                                                                                                                | не используются                    |
| daily_states                 | energy, fatigue, focus, mood (0–100)                                                                                                                                      | читается, не пишется               |
| ~~user_skills~~              | удалена миграцией 20260915190000 (данные перенесены в character_skills)                                                                                                   | —                                  |

Триггер `on_auth_user_created` → `handle_new_user()` создаёт `profiles` из `raw_user_meta_data`.

## RPC / функции (последние версии)

| Функция                                                                                           | Где (последняя версия)                       | Что делает                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `complete_onboarding(p_username, p_character_name, p_class_id, p_starting_directions[])`          | `20260915190000_refactor_dayforge_model.sql` | SECURITY DEFINER, auth.uid(). Guard повторного вызова. Валидирует класс и направления. Обновляет profile, создаёт character, 7 атрибутов = 1, **создаёт character_skills для направлений, у которых есть запись в `skills`** (расходится с решением владельца). Возвращает `{character_id}`. EXECUTE только authenticated.                                                                                                                                                    |
| `calculate_quest_effects(p_skill_id, p_hours)`                                                    | `20260916163000_quest_effects_engine.sql`    | Чистый расчёт (STABLE, invoker). characterXp = round(coalesce(hours,1)×10); если есть навык: Form из last_practiced_at → multiplier, skillXp = round(hours×20×mult); attributeChanges = +1 primary, +1 secondary (если ≠ primary). Без навыка/тегов атрибуты не растут.                                                                                                                                                                                                       |
| `complete_quest(p_quest_id)`                                                                      | `20260916163000_quest_effects_engine.sql`    | SECURITY DEFINER, атомарно. Проверяет владельца квеста. Идемпотентна: на completed возвращает `success:false, xpAwarded:0`. Резолвит/создаёт навык по skill_name, ставит status=completed, вызывает calculate_quest_effects, пишет xp_transactions, пересчитывает level (цикл), применяет атрибуты, обновляет навык (total_hours, total_xp, last_practiced_at=now). Возвращает xpAwarded, oldLevel, newLevel, nextLevelThreshold, attributeGained, skillXpGained, skillLevel. |
| `_complete_quest_core(character_id, quest_id, skill_id)`                                          | `20261126120000_ai_day_report.sql`           | Внутреннее ядро начислений (SECURITY DEFINER, EXECUTE отозван у клиентов). `complete_quest` и `apply_day_report` вызывают его; с 26.11.2026 `complete_quest` — обёртка над ядром (результат тот же).                                                                                                                                                                                                                                                                          |
| `apply_day_report(p_report_date, p_events jsonb, p_parse_id)`                                     | `20261126120000_ai_day_report.sql`           | Применяет подтверждённые события AI-разбора: идемпотентно по parse_id (`day_report_applications`), 0.1–8 ч/событие, ≤16 ч/дата, навык existing/new (дедуп по имени и aliases)/none, квест из плана или новый. Подробно — `ai-day-report.md`.                                                                                                                                                                                                                                  |
| `test_quest_engine()`                                                                             | `20260916164000_test_function.sql`           | Тестовая SECURITY DEFINER-функция: вставляет/удаляет тестовые навыки у **первого персонажа в БД**. EXECUTE не отозван у PUBLIC — **дыра, удалить**.                                                                                                                                                                                                                                                                                                                           |
| `handle_new_user()`                                                                               | `20260811174717_auth_profile.sql`            | Триггер создания профиля.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Ранние версии complete_quest (`20260914104000`, `20260914141500`, `20260915180200`) перезаписаны. |

## RLS (`20260811170514_enable_rls.sql`, `20260915180000_add_character_skills.sql`)

RLS включён на всех таблицах. attribute_definitions / skills — select для authenticated. Остальные — CRUD только
своих строк (через `characters.profile_id = auth.uid()`). **Слабость:** клиент может напрямую UPDATE
`characters.level/total_xp` и `character_attributes.value` (политики разрешают update своих строк) — атомарность
`complete_quest` обходится. Для беты с друзьями терпимо, но перед публичным запуском закрыть.

## Формулы (где лежат)

| Формула                                                           | SQL                                           | TS                                                                                                                 |
| ----------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Порог уровня total_xp(N) = 10·N·(N−1); XP до следующего = 20·N    | `complete_quest` (c_base_xp_multiplier=10)    | `entities/character/model/characterTypes.ts` — `xpThresholdForLevel`, `xpRequiredForLevel`, `xpWithinCurrentLevel` |
| XP персонажа = часы×10 (часы по умолчанию 1)                      | `calculate_quest_effects`                     | —                                                                                                                  |
| XP навыка = часы×20×formMultiplier                                | `calculate_quest_effects`                     | —                                                                                                                  |
| Уровень навыка: тот же порог 10·N·(N−1)                           | `complete_quest` (c_skill_base_xp_multiplier) | `characterSkillTypes.ts` — `computeSkillLevel`                                                                     |
| Form% = 100 при ≤3 днях; далее 100 − 5·(дни−3), пол 20            | `calculate_quest_effects`                     | `characterSkillTypes.ts` — `computeFormPercentage`                                                                 |
| formMultiplier: ≥90→1.0, ≥70→0.9, ≥40→0.75, иначе 0.5             | `calculate_quest_effects`                     | `characterSkillTypes.ts` — `computeFormMultiplier`                                                                 |
| Атрибут +1 к primary/secondary тегу навыка                        | `calculate_quest_effects`                     | —                                                                                                                  |
| Тир аватара по уровню (7 тиров)                                   | —                                             | `avatarEngine.ts` — `getEvolutionTier`                                                                             |
| Константы TS и SQL дублируются вручную («keep in sync with RPC»). |

## Инфраструктура

- CI: `.github/workflows/ci.yml` (typecheck, lint, test, build на push main/develop) — по словам владельца отключён
  в GitHub (падал без тестов); файл в репозитории остался.
- Тесты (vitest): attributeFx, аватар, клиентская модель отчёта; SQL — на PGlite (`supabase/tests/`, все миграции
  поверх заглушки `auth`); Edge Function — юнит-тесты с мок-провайдером. `npm run eval:day-report` — eval на модели.
- Edge Functions: `supabase/functions/parse-day-report/` (Deno, import map `deno.json`); общий
  `supabase/functions/_shared/skillIcons.json` читается и клиентом. Типы функций/тестов — `tsconfig.supabase.json`.
- Сборка: один чанк ~1.15 МБ (ассеты аватара — TS-данные внутри бандла), Vite предупреждает >500 кБ.
- `vite-tsconfig-paths` избыточен (Vite 8 умеет сам) + дублирующий `resolve.alias`.
