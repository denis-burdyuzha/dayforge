# Архитектура (по коду, состояние на 27.11.2026)

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
- ProtectedLayout → AppShell: `/app` (HomePage), `/app/plan` (`?date=`), `/app/calendar` (`?date=&view=day|week`),
  `/app/report`, `/app/settings`; заглушки `/app/report/review`, `/app/character`.
- Шапка: кнопка профиля (аватар + уровень) ведёт на `/app/settings` (шестерёнки нет). Настройки
  (`pages/SettingsPage`): список секций `SECTIONS` (id + компонент, каждая через `SettingsSection`) —
  «Аккаунт» (email, «Выйти» → `signOut` + полная перезагрузка на лендинг) и «Мой день» (вопрос о времени сна).
  Новая секция = компонент в `ui/` + запись в `SECTIONS`.
- Нижняя навигация: Главная, План, Календарь, Отчёт (иконки lucide). ProtectedLayout синхронизирует
  `profiles.timezone` с часовым поясом устройства при входе.
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
- **«Сегодня» = день пользователя:** `getUserDayDate(now, profiles.day_start_time)` (`shared/lib/userDay.ts`): до
  границы дня (по умолчанию 04:00, настройка 00:00–06:00) ночь относится к предыдущей дате. `useUserToday(userId)`
  (`entities/profile`) даёт today/tomorrow/dayStartTime; используется в плане, отчёте (и XP за день —
  `getUserDayRangeIso`), календаре, главной, черновиках, онбординге. Репозитории получают дату параметром.

## Игровой цикл (как реально работает)

1. `/app/plan`: план дня — RPC `get_or_create_daily_plan`. Форма квеста: название, навык (опц.), часы 0.25–8.
   Новый навык → основной атрибут обязателен, второй по желанию → RPC `create_skill`; квест — RPC `create_quest`
   (duration = часы × 60, сервер ставит hours, skill_name, planned_at/scheduled_at). Клиент таблицы не пишет.
   С 26.11.2026 там же «Опиши план на день» → Edge Function `parse-day-plan` → предпросмотр пунктов (время,
   длительность, навык) → RPC `apply_day_plan` → pending-квесты `source='ai_plan'` с `start_time`/`duration_minutes`
   с 27.11.2026 — на сегодня или завтра (переключатель), дописывание к плану. Список квестов дня по времени;
   таймлайн и правка квестов — во вкладке «Календарь». Подробно — `ai-day-plan.md`.
   1a. `/app/calendar` (`features/calendar`): вид «День» (шкала min(07:00) – max(23:00), пересечения в колонках,
   «Без времени», линия «сейчас», стрелки/свайп/«Сегодня») и «Неделя» (пн–вс, компактные блоки, тап → день).
   Нижняя карточка (`Drawer side=bottom`): название, дата, время, длительность, навык, «Выполнено», «Удалить»
   (выполненный — только название). Перетаскивание по 15 мин (мышь сразу, тач после удержания 400 мс), тап по
   шкале — новый квест. Запись только `create_quest`/`update_quest`/`delete_quest`/`complete_quest`; при ошибке блок
   возвращается и показывается сообщение. Данные — `dailyPlanRepository.getQuestsInRange` (ключ
   `['calendar', characterId, monday]`).
2. Отметка квеста (план, карточка календаря) → **окно отмены 5 с** (`features/quest-completion`:
   `useDeferredQuestCompletion` + `QuestUndoBar`): квест сразу выглядит выполненным, плашка «Квест выполнен ·
   Отменить» с полосой отсчёта; только по истечении окна RPC `complete_quest(p_quest_id)` → XP, уровень, атрибуты,
   навык; micro-toast; LevelUp при росте уровня. У каждого квеста своё окно; при `visibilitychange`→hidden,
   `pagehide` и уходе со страницы всё ожидающее отправляется сразу; ошибка → квест возвращается + сообщение.
   Сервер не менялся. Ядро — `deferredCompletion.ts` (без React, тесты на таймерах).
   2a. «Мой день» в настройках: вопрос «Во сколько ты обычно ложишься спать?» → `profiles.day_start_time` = время
   сна + 2 ч (не позже 06:00), «До полуночи» = 04:00 (`entities/profile/model/bedtime.ts`). Отдельной колонки нет;
   выбор запоминается на устройстве (localStorage `dayforge:bedtime-choice`) только чтобы отличить 02:00 от
   «До полуночи» (оба дают 04:00).
   Квест без навыка (с 26.11.2026) завершается с 0 XP и без атрибутов.
3. `/app/report` (с 26.11.2026): свободный текст → «Разобрать день» → Edge Function `parse-day-report` → превью
   событий (правка часов/навыков) → «Подтвердить» → RPC `apply_day_report` → `completeDay` сохраняет текст → LevelUp.
   «Завершить день без разбора» — старый путь: свободный текст → `completeDay`: RPC `save_daily_report`, сумма `xp_transactions` за сегодня,
   `attributeDeltas` (из `quests.attribute_id` — **всегда пусто**, т.к. addQuest пишет `attribute_id: null`), текущий уровень.
   Отчёт только сохраняется — никакого анализа/начислений.
4. HomePage: аватар (`computeAvatarParams` → `ModularAvatar`), атрибуты (числа), навыки (level/form), события XP.

## Схема БД (public)

| Таблица                      | Ключевые колонки                                                                                                                                                                                                                                                                                                    | Статус                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| profiles                     | id (=auth.users.id), username (unique), display_name, avatar_url, onboarding_completed, day_start_time (04:00), timezone                                                                                                                                                                                            | используется                          |
| characters                   | id, profile_id, name, class, level (≥1), total_xp (≥0)                                                                                                                                                                                                                                                              | используется                          |
| attribute_definitions        | id, code (unique), name, description — сид 7 атрибутов                                                                                                                                                                                                                                                              | используется                          |
| character_attributes         | character_id, attribute_id, value (≥0) — unique(character_id, attribute_id)                                                                                                                                                                                                                                         | используется                          |
| character_skills             | id, character_id, name, total_hours, total_xp, last_practiced_at, primary_attribute_id, secondary_attribute_id, aliases[], icon; unique index (character_id, lower(name))                                                                                                                                           | используется                          |
| character_snapshots          | id, character_id, snapshot_date (локальная дата), level, tier (1–5), total_xp, attributes jsonb (7), aspect, top_skills jsonb (≤5), skills_count, relics jsonb; unique(character_id, snapshot_date)                                                                                                                 | пишут только SECURITY DEFINER-функции |
| day_report_parses            | id, user_id, report_date, input_text, model, attempt, raw_output, parsed_events, status, error_message, latency_ms                                                                                                                                                                                                  | пишет Edge Function (service_role)    |
| day_plan_parses              | как day_report_parses (plan_date, parsed_items) + usage                                                                                                                                                                                                                                                             | пишет parse-day-plan (service_role)   |
| day_plan_applications        | parse_id (PK), user_id, plan_date, result                                                                                                                                                                                                                                                                           | пишет apply_day_plan                  |
| day_report_applications      | parse_id (PK), user_id, report_date, result                                                                                                                                                                                                                                                                         | пишет apply_day_report                |
| daily_plans                  | character_id, date, status planned/completed — unique(character_id, date)                                                                                                                                                                                                                                           | используется (status не меняется)     |
| quests                       | daily_plan_id, title, description, status pending/completed, position, xp_reward (легаси, не влияет), attribute_id (легаси, всегда null), skill_name, hours, skill_id, start_time, duration_minutes, source (manual/ai_plan/ai_report), planned_at (не меняется), scheduled_at (меняется при переносе даты/времени) | используется                          |
| daily_reports                | character_id, date, content — unique(character_id, date)                                                                                                                                                                                                                                                            | используется                          |
| xp_transactions              | character_id, amount, reason, skill_id (→skills, легаси), report_event_id                                                                                                                                                                                                                                           | пишет complete_quest                  |
| skills                       | каталог из сида (programming, driving, communication, learning, fitness, planning)                                                                                                                                                                                                                                  | только для онбординга                 |
| report_events, event_impacts | задел под AI-анализ отчёта                                                                                                                                                                                                                                                                                          | не используются                       |
| daily_states                 | energy, fatigue, focus, mood (0–100)                                                                                                                                                                                                                                                                                | читается, не пишется                  |
| ~~user_skills~~              | удалена миграцией 20260915190000 (данные перенесены в character_skills)                                                                                                                                                                                                                                             | —                                     |

Триггер `on_auth_user_created` → `handle_new_user()` создаёт `profiles` из `raw_user_meta_data`.

## RPC / функции (последние версии)

| Функция                                                                                                         | Где (последняя версия)                    | Что делает                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `complete_onboarding(p_username, p_character_name, p_class_id, p_starting_directions[], p_local_date?)`         | `20261127150000_character_snapshots.sql`  | SECURITY DEFINER, auth.uid(). Guard повторного вызова. Валидирует класс и направления. Обновляет profile, создаёт character, 7 атрибутов = 1 (навыки не создаёт — с `20261122150000`), первый снимок персонажа на `p_local_date` (клиент передаёт локальную дату; по умолчанию CURRENT_DATE). Возвращает `{character_id}`. EXECUTE только authenticated.                                                                                                                      |
| `calculate_quest_effects(p_skill_id, p_hours)`                                                                  | `20260916163000_quest_effects_engine.sql` | Чистый расчёт (STABLE, invoker). characterXp = round(coalesce(hours,1)×10); если есть навык: Form из last_practiced_at → multiplier, skillXp = round(hours×20×mult); attributeChanges = +1 primary, +1 secondary (если ≠ primary). Без навыка/тегов атрибуты не растут.                                                                                                                                                                                                       |
| `complete_quest(p_quest_id)`                                                                                    | `20260916163000_quest_effects_engine.sql` | SECURITY DEFINER, атомарно. Проверяет владельца квеста. Идемпотентна: на completed возвращает `success:false, xpAwarded:0`. Резолвит/создаёт навык по skill_name, ставит status=completed, вызывает calculate_quest_effects, пишет xp_transactions, пересчитывает level (цикл), применяет атрибуты, обновляет навык (total_hours, total_xp, last_practiced_at=now). Возвращает xpAwarded, oldLevel, newLevel, nextLevelThreshold, attributeGained, skillXpGained, skillLevel. |
| `_complete_quest_core(character_id, quest_id, skill_id)`                                                        | `20261127150000_character_snapshots.sql`  | Внутреннее ядро начислений (SECURITY DEFINER, EXECUTE отозван у клиентов). `complete_quest` и `apply_day_report` вызывают его; с 26.11.2026 `complete_quest` — обёртка над ядром (результат тот же). В конце — снимок персонажа на дату плана квеста.                                                                                                                                                                                                                         |
| `_resolve_event_skill(character_id, skill jsonb, invalid_code)`                                                 | `20261127120000_ai_day_plan.sql`          | Общее разрешение навыка для apply_day_report / apply_day_plan: existing (проверка владельца), new (дедуп по имени и aliases, иначе создание с 1–2 атрибутами), none. Не выставлена клиентам. С этой же миграции ядро начислений даёт 0 XP квесту без навыка.                                                                                                                                                                                                                  |
| `_upsert_character_snapshot(character_id, date)`                                                                | `20261127150000_character_snapshots.sql`  | Считает снимок из текущего состояния (уровень, тир по `assetTierForLevel`, XP, 7 атрибутов, аспект по правилу `getAspect`, топ-5 навыков по total_xp, число навыков) и делает upsert за дату. Помощники `_snapshot_tier`, `_snapshot_aspect`, `_skill_level_for_xp` — копии клиентских правил (SQL-тест сверяет). EXECUTE отозван у клиентов.                                                                                                                                 |
| `apply_day_plan(p_plan_date, p_items jsonb, p_parse_id)`                                                        | `20261127120000_ai_day_plan.sql`          | Создаёт pending-квесты плана (title, start_time, duration_minutes 5–480, source ai_plan, hours = duration/60, навык через `_resolve_event_skill`); идемпотентно (`day_plan_applications`); Σ pending-минут даты ≤ 960 → `PLAN_HOURS_LIMIT`. Подробно — `ai-day-plan.md`.                                                                                                                                                                                                      |
| `apply_day_report(p_report_date, p_events jsonb, p_parse_id)`                                                   | `20261126120000_ai_day_report.sql`        | Применяет подтверждённые события AI-разбора: идемпотентно по parse_id (`day_report_applications`), 0.1–8 ч/событие, ≤16 ч/дата, навык existing/new (дедуп по имени и aliases)/none, квест из плана или новый. Подробно — `ai-day-report.md`.                                                                                                                                                                                                                                  |
| `create_skill`, `get_or_create_daily_plan`, `create_quest`, `update_quest`, `delete_quest`, `save_daily_report` | `20261128120000_lock_game_data.sql`       | Клиентские RPC записи (SECURITY DEFINER, auth.uid(), проверка принадлежности). Правила — `security.md`. `test_quest_engine()` удалена этой же миграцией.                                                                                                                                                                                                                                                                                                                      |
| `handle_new_user()`                                                                                             | `20260811174717_auth_profile.sql`         | Триггер создания профиля.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Ранние версии complete_quest (`20260914104000`, `20260914141500`, `20260915180200`) перезаписаны.               |

## Правило лиги «запланировано заранее» (27.11.2026, задел)

`quest_counts_for_league(quest_id)` (`20261129130000_league_rule.sql`, внутренняя, STABLE, без GRANT клиентам) — по
`quests.scheduled_at` и `profiles.timezone` (NULL/неизвестный → UTC): запланирован до начала дня квеста (дата +
`day_start_time`) → true; со временем — не позже чем за 1 ч до начала; без времени — до 14:00 даты. `planned_at` не
используется (не меняется никогда). В начислениях пока нигде не вызывается.

## Снимки персонажа (`character_snapshots`, 27.11.2026)

Ежедневная история персонажа для будущего повтора эволюции и витрины: одна строка на (персонаж, локальная дата) —
состояние после последнего начисления этого дня. Где пишутся: `_complete_quest_core` (значит, `complete_quest` и
каждое событие `apply_day_report`) — на дату плана квеста; `complete_onboarding` — на локальную дату клиента; разовое
заполнение в миграции — CURRENT_DATE (UTC) для всех персонажей. Повторное начисление в тот же день обновляет строку.
`apply_day_plan` и `create_skill` снимок не пишут — XP не меняется, `skills_count`
обновится при следующем начислении. Чтение: `characterRepository.getCharacterSnapshots(characterId)` (по возрастанию
даты, `model/characterSnapshotTypes.ts`); UI пока нет. RLS: владелец читает свои, писать клиентам нельзя.

## RLS и права (`20261128120000_lock_game_data.sql`, 27.11.2026)

RLS включён на всех таблицах. Клиент только читает: `authenticated` — SELECT (политики select own), `anon` — SELECT
только справочников `attribute_definitions`, `skills`. Писать может лишь `profiles.display_name/avatar_url` своей
строки. Все записи игровых данных — SECURITY DEFINER RPC; новая таблица по умолчанию read-only. Подробно и
итоговая таблица доступа — `security.md`.

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
- Тесты (vitest): attributeFx, аватар, клиентские модели отчёта и плана, раскладка таймлайна; SQL — на PGlite
  (`supabase/tests/`, все миграции поверх заглушки `auth`); Edge Functions — юнит-тесты с мок-провайдером.
  `npm run eval:day-report` / `npm run eval:day-plan` — eval на реальной модели (usage, cache read, стоимость).
- Edge Functions: `parse-day-report`, `parse-day-plan` (Deno, import map `deno.json` в каждой); общий AI-модуль
  `supabase/functions/_shared/ai/` (провайдер Anthropic с кэшированием промпта, цикл попыток, правила навыков, HTTP);
  `_shared/skillIcons.json` читается и клиентом. Типы функций/тестов — `tsconfig.supabase.json`.
- Сборка: один чанк ~1.15 МБ (ассеты аватара — TS-данные внутри бандла), Vite предупреждает >500 кБ.
- `vite-tsconfig-paths` избыточен (Vite 8 умеет сам) + дублирующий `resolve.alias`.
