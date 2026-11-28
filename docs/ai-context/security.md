# Доступ к данным

**Правило (с 27.11.2026, миграция `20261128120000_lock_game_data.sql`):** клиент (`anon`, `authenticated`) только
читает игровые данные. Любые изменения XP, уровней, атрибутов, навыков, планов, квестов и отчётов — только через
SECURITY DEFINER RPC (`search_path = public, pg_temp`), которые берут персонажа по `auth.uid()` и проверяют
принадлежность каждого переданного id. Новая таблица по умолчанию: `authenticated` — только SELECT, `anon` — ничего
(default privileges владельца `postgres`); **RLS включать в той же миграции**, иначе SELECT увидит все строки.
Edge Functions пишут через `service_role` — не затронуты.

## Итог: что может клиент

| Таблица                                        | authenticated                                                                                                                     | anon   | Запись — через                                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| profiles                                       | SELECT своей строки; UPDATE своей строки только `display_name`, `avatar_url`, `day_start_time`, `timezone`, `share_daily_summary` | —      | `complete_onboarding` (username, onboarding_completed), триггер `handle_new_user`                                   |
| characters, character_attributes               | SELECT своих                                                                                                                      | —      | `complete_onboarding`, `complete_quest`, `apply_day_report`                                                         |
| character_skills                               | SELECT своих                                                                                                                      | —      | `create_skill`, `apply_day_report`, `apply_day_plan`, `complete_quest`                                              |
| character_snapshots                            | SELECT своих                                                                                                                      | —      | ядро начислений, `complete_onboarding`                                                                              |
| daily_plans                                    | SELECT своих                                                                                                                      | —      | `get_or_create_daily_plan`, `create_quest`, `update_quest`, `apply_day_plan`, `apply_day_report`                    |
| quests                                         | SELECT своих                                                                                                                      | —      | `create_quest`, `update_quest`, `delete_quest`, `apply_day_plan`; завершение — `complete_quest`, `apply_day_report` |
| daily_reports                                  | SELECT своих                                                                                                                      | —      | `save_daily_report`; триггер после `apply_day_report`                                                               |
| friendships                                    | SELECT строк, где ты одна из сторон                                                                                               | —      | `add_friend_by_code`, `remove_friend`                                                                               |
| banned_words                                   | —                                                                                                                                 | —      | миграции                                                                                                            |
| xp_transactions                                | SELECT своих                                                                                                                      | —      | ядро начислений                                                                                                     |
| day_report_parses, day_plan_parses             | SELECT своих                                                                                                                      | —      | Edge Functions (service_role)                                                                                       |
| day_report_applications, day_plan_applications | SELECT своих                                                                                                                      | —      | `apply_day_report`, `apply_day_plan`                                                                                |
| daily_states, report_events, event_impacts     | SELECT своих                                                                                                                      | —      | никто (не используются)                                                                                             |
| attribute_definitions, skills (справочники)    | SELECT                                                                                                                            | SELECT | миграции (сиды)                                                                                                     |

Политики RLS: остались только SELECT own и «update own profile»; все insert/update/delete политики удалены.
anon сохраняет SELECT на справочниках на будущее, хотя до входа клиент сейчас ни одну таблицу не читает
(онбординг на статике; проверено Playwright на живой базе — до шага регистрации 0 запросов к Supabase).

### RPC для клиента (EXECUTE только authenticated)

| RPC                                                                                          | Правила                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_or_create_daily_plan(p_date)`                                                           | план своего персонажа на дату                                                                                                                                                                                                  |
| `create_skill(p_name, p_attributes[], p_icon?)`                                              | строго 1–2 кода атрибутов (`INVALID_ATTRIBUTES`), дедуп по нормализованному имени и aliases (`_find_skill_by_name`, общий с AI-разборами)                                                                                      |
| `create_quest(p_date, p_title, p_start_time?, p_duration_minutes?, p_skill_id?)`             | название 1–120, длительность 5–480, навык свой (`SKILL_NOT_FOUND`); `hours = duration/60`; `planned_at = scheduled_at = now()`                                                                                                 |
| `update_quest(p_quest_id, p_title, p_date, p_start_time?, p_duration_minutes?, p_skill_id?)` | полный набор полей (пропуск = NULL); завершённый — только название (`QUEST_COMPLETED`); другая дата → квест переезжает в план той даты; при смене даты или start_time `scheduled_at = now()`; `planned_at` не меняется никогда |
| `delete_quest(p_quest_id)`                                                                   | только pending (`QUEST_COMPLETED`)                                                                                                                                                                                             |
| `save_daily_report(p_date, p_content)`                                                       | upsert текста (1–20000 символов)                                                                                                                                                                                               |
| `rename_character(p_name)`                                                                   | правила имени + бан-лист (`INVALID_NAME`, `NAME_NOT_ALLOWED`); только свой персонаж                                                                                                                                            |
| `get_my_streak()`                                                                            | своя серия (STABLE, без блокировок)                                                                                                                                                                                            |
| `add_friend_by_code`, `remove_friend`, `regenerate_friend_code`, `get_my_friend_code`        | только свои пары и свой код; лимиты 100 друзей / 20 добавлений в сутки                                                                                                                                                         |
| `get_friends()`, `get_friend_profile(p_friend_user_id)`                                      | только друзья (`NOT_FRIENDS`); отбирают поля сами — без текстов отчётов, планов и названий квестов; сводка null, если друг её скрыл                                                                                            |
| `get_invite_preview(p_code)` — **также anon**                                                | только `{ name, class }` владельца кода или null                                                                                                                                                                               |
| `complete_quest`, `apply_day_report`, `apply_day_plan`, `complete_onboarding`                | XP/уровни от клиента не принимают                                                                                                                                                                                              |

Чужой квест во всех RPC → `QUEST_NOT_FOUND` (существование не раскрывается). Будущее правило лиги считает по
`quests.scheduled_at`, не по `planned_at`.

Внутренние функции (`_complete_quest_core`, `_resolve_event_skill`, `_find_skill_by_name`, `_upsert_character_snapshot`,
`_current_character_id`, `_ensure_daily_plan`, `_check_quest_fields`, `_own_skill_name`, `calculate_quest_effects`,
`_normalize_skill_name`, `_snapshot_*`, `_skill_level_for_xp`, `handle_new_user`, `quest_counts_for_league`,
`_check_character_name`, `_normalize_name_for_ban`, `_user_today`, `_streak_info`, `_new_friend_code`, `_are_friends`,
`_friend_card`, `_day_summary`, триггерные `_day_report_applied`, `_daily_report_snapshot`)
клиентам не исполнимы.
`test_quest_engine` удалена. Default privileges на **функции** Supabase по-прежнему дают EXECUTE anon/authenticated —
каждая новая функция обязана явно `REVOKE … FROM PUBLIC, anon` (и `authenticated`, если внутренняя).

### Проверка

- PGlite: `supabase/tests/access_control.test.ts` (authenticated/anon).
- Живая база 27.11.2026 (supabase-js, anon-ключ, одноразовый пользователь): прямой update своего `characters.level`
  → `42501 permission denied for table characters` (уровень остался 1); update атрибутов, insert `xp_transactions`,
  insert `daily_plans`, update `profiles.username` — 42501; update `display_name` — ок; RPC create/delete_quest — ок;
  anon update/select `characters` — 42501, select `attribute_definitions` — ок.

## Изменения 28.11.2026 (feature/friends-and-streak)

- Данные друзей — только через `get_friends` / `get_friend_profile`: они сами собирают карточку из разрешённых полей.
  Политик RLS «читать строки друзей» нет; `friendships` читается только своими строками.
- `profiles.friend_code` клиенту не изменить (нет GRANT) — только `regenerate_friend_code`;
  `share_daily_summary` — column GRANT UPDATE.
- Живая база 28.11.2026 (supabase-js, anon-ключ, 2 одноразовых пользователя): онбординг обоих; `rename_character`
  «Cyka» → `NAME_NOT_ALLOWED`; `get_my_streak` работает (read-only транзакция PostgREST); B добавил A по коду в нижнем
  регистре, оба видят друг друга в `get_friends`; ключи карточки — ровно 11 разрешённых; прямой insert в
  `friendships` → `42501 permission denied for table friendships`; update `friend_code` → 42501;
  update `share_daily_summary` — ок, после него сводка у друга null; anon `get_invite_preview` → только
  `{ name, class }`, неверный код → null; anon `get_friends` и select `friendships` — отказ; `remove_friend` убирает пару
  у обоих.

## Изменения 27.11.2026 (feature/calendar-and-day-boundary)

- `profiles.day_start_time` (time, 00:00–06:00 шаг 30, CHECK) и `profiles.timezone` (text ≤ 64) — column-level
  GRANT UPDATE authenticated (`20261129120000_day_boundary.sql`). Проверено на живой базе: UPDATE разрешён ровно
  `avatar_url, day_start_time, display_name, timezone`.
- `quest_counts_for_league` — внутренняя (EXECUTE отозван у PUBLIC/anon/authenticated; проверено на живой базе).
- `apply_day_plan` пересоздан (пункты на две даты) с прежними правами: authenticated — да, anon — нет.

---

# Аудит до изменений (27.11.2026)

Источник: живая база (`npx supabase db query --remote --read-only` по `pg_policies`, `pg_class.relacl`, `pg_proc`) +
миграции + поиск `.insert(` / `.update(` / `.upsert(` / `.delete(` / `.rpc(` в `src/`. Edge Functions пишут через
`service_role` (обходит RLS) — в таблице не учитываются.

Сокращения прав: S/I/U/D = SELECT/INSERT/UPDATE/DELETE; «ALL» = S I U D + TRUNCATE, REFERENCES, TRIGGER, MAINTAIN.
Проект старый: default privileges выдают `anon` и `authenticated` ALL на каждую новую таблицу; защищает только RLS.

## Таблицы (до)

| Таблица                 | RLS-политики (роль)                              | GRANT authenticated | GRANT anon | Клиент пишет напрямую                                                                                                                                       |
| ----------------------- | ------------------------------------------------ | ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| profiles                | S own, U own (authenticated)                     | ALL                 | ALL        | нет (создаёт триггер `handle_new_user`, меняет `complete_onboarding`)                                                                                       |
| characters              | S, I, U, D own (authenticated)                   | ALL                 | ALL        | нет (создаёт `complete_onboarding`)                                                                                                                         |
| character_attributes    | S, I, U, D own (authenticated)                   | ALL                 | ALL        | нет                                                                                                                                                         |
| character_skills        | S, I, U, D own (**public** — роль не ограничена) | ALL                 | ALL        | **да**: `entities/daily-plan/api/dailyPlanRepository.ts` `addQuest` → insert (character_id, name, primary_attribute_id, secondary_attribute_id)             |
| character_snapshots     | S own (authenticated)                            | S                   | —          | нет                                                                                                                                                         |
| attribute_definitions   | S (authenticated)                                | ALL                 | ALL        | нет (справочник)                                                                                                                                            |
| skills                  | S (authenticated)                                | ALL                 | ALL        | нет (справочник)                                                                                                                                            |
| daily_plans             | S, I, U, D own (authenticated)                   | ALL                 | ALL        | **да**: `dailyPlanRepository.createTodayPlan` → insert (character_id, date, status)                                                                         |
| quests                  | S, I, U, D own (authenticated)                   | ALL                 | ALL        | **да**: `dailyPlanRepository.addQuest` → insert (daily_plan_id, title, description, status, position, xp_reward, attribute_id, skill_name, hours, skill_id) |
| daily_reports           | S, I, U, D own (authenticated)                   | ALL                 | ALL        | **да**: `entities/daily-report/api/dailyReportRepository.ts` `completeDay` → upsert (character_id, date, content)                                           |
| report_events           | S, I, U, D own (authenticated)                   | ALL                 | ALL        | нет (не используется)                                                                                                                                       |
| event_impacts           | S, I, U, D own (authenticated)                   | ALL                 | ALL        | нет (не используется)                                                                                                                                       |
| xp_transactions         | S own, **I own** (authenticated)                 | ALL                 | ALL        | нет (пишет ядро начислений), но политика позволяет вставить себе запись                                                                                     |
| daily_states            | S, I, U, D own (authenticated)                   | ALL                 | ALL        | нет (только чтение)                                                                                                                                         |
| day_report_parses       | S own (authenticated)                            | S                   | —          | нет (пишет Edge Function)                                                                                                                                   |
| day_plan_parses         | S own (authenticated)                            | S                   | —          | нет (пишет Edge Function)                                                                                                                                   |
| day_report_applications | S own (authenticated)                            | S                   | —          | нет (пишет `apply_day_report`)                                                                                                                              |
| day_plan_applications   | S own (authenticated)                            | S                   | —          | нет (пишет `apply_day_plan`)                                                                                                                                |

`ai_usage` в базе нет.

### Что это позволяет клиенту сейчас (дыры)

- Через REST поднять себе `characters.level/total_xp`, `character_attributes.value`, `character_skills.total_xp/total_hours`,
  менять/удалять квесты (в т.ч. завершённые), переводить квест в `completed` без начисления, вставлять
  `xp_transactions`, создать второго персонажа или удалить своего, менять `profiles.onboarding_completed/username`.
  Всё это обходит начисления, снимки (`character_snapshots`) и будущую защиту лиги.
- `TRUNCATE` / `MAINTAIN` у `anon` и `authenticated` на большинстве таблиц. TRUNCATE не подчиняется RLS; через
  PostgREST он недоступен (API делает только S/I/U/D/RPC), но право лишнее.
- Политики `character_skills` выданы роли `public` (включая `anon`); строк anon не видит (auth.uid() = null).

## Функции (public, до)

| Функция                                                                      | Definer | search_path     | auth.uid / владелец                       | EXECUTE anon / authenticated | Замечание                                                                                  |
| ---------------------------------------------------------------------------- | ------- | --------------- | ----------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| complete_onboarding(…, p_local_date)                                         | да      | public, pg_temp | да (guard повторного вызова)              | нет / да                     | XP/уровни не принимает                                                                     |
| complete_quest(p_quest_id)                                                   | да      | public, pg_temp | да, квест своего персонажа                | **да** / да                  | anon упирается в «Not authenticated»; отозвать у anon                                      |
| apply_day_report(…)                                                          | да      | public, pg_temp | да, parse своего пользователя, id навыков | нет / да                     | часы 0.1–8 — входные, XP считает сервер                                                    |
| apply_day_plan(…)                                                            | да      | public, pg_temp | да, parse своего пользователя, id навыков | нет / да                     | XP не начисляет                                                                            |
| _complete_quest_core, _resolve_event_skill, _upsert_character_snapshot       | да      | public, pg_temp | вызывающий проверяет                      | нет / нет                    | внутренние                                                                                 |
| calculate_quest_effects                                                      | нет     | public, pg_temp | —                                         | **да** / **да**              | внутренний расчёт, клиенту не нужен                                                        |
| _normalize_skill_name, _snapshot_tier, _snapshot_aspect, _skill_level_for_xp | нет     | (нет у первой)  | —                                         | **да** / **да**              | чистые помощники, клиенту не нужны                                                         |
| handle_new_user()                                                            | да      | public          | триггер                                   | **да** / **да**              | вызывается только триггером; EXECUTE не нужен                                              |
| test_quest_engine()                                                          | да      | public, pg_temp | **нет**                                   | **да** / **да**              | **дыра**: вставляет и удаляет тестовые навыки первому персонажу в базе; вызывает даже anon |
