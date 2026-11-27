# Доступ к данным (аудит 27.11.2026, до изменений)

Источник: живая база (`npx supabase db query --remote --read-only` по `pg_policies`, `pg_class.relacl`, `pg_proc`) +
миграции + поиск `.insert(` / `.update(` / `.upsert(` / `.delete(` / `.rpc(` в `src/`. Edge Functions пишут через
`service_role` (обходит RLS) — в таблице не учитываются.

Сокращения прав: S/I/U/D = SELECT/INSERT/UPDATE/DELETE; «ALL» = S I U D + TRUNCATE, REFERENCES, TRIGGER, MAINTAIN.
Проект старый: default privileges выдают `anon` и `authenticated` ALL на каждую новую таблицу; защищает только RLS.

## Таблицы

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

## Функции (public)

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

## Ожидаемое

- Следующей задачей в `profiles` появятся `timezone` и `day_start_time` — их ожидаемо разрешат к UPDATE клиентом
  (column-level GRANT, как `display_name`/`avatar_url`).
