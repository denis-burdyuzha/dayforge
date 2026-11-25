# AI-разбор вечернего отчёта

Статус: план (этап 0, 26.11.2026). Финальная схема — в конце работы над веткой `feature/ai-day-report`.

## Текущий поток (по коду, до изменений)

**План дня** — `features/daily-plan/ui/DailyPlanPage.tsx`, `entities/daily-plan/api/dailyPlanRepository.ts`.

- `daily_plans` (character_id, date, status `planned|completed`, unique (character_id, date)) → `quests`
  (daily_plan_id, title, description, status `pending|completed`, position, xp_reward, attribute_id,
  skill_name, hours numeric, skill_id → character_skills).
- Квест отмечается на странице плана: `dailyPlanRepository.completeQuest` → RPC `complete_quest(p_quest_id)`.

**`complete_quest`** (последняя версия — миграция 20260916163000, SECURITY DEFINER, `auth.uid()`):

1. персонаж по `profile_id = auth.uid()`, квест + проверка владения через daily_plans;
2. идемпотентность: уже `completed` → `{success:false, message:'Quest already completed', xpAwarded:0, …}`;
3. если у квеста нет skill_id, но есть skill_name — upsert character_skills по `lower(name)`;
4. статус → completed; **один вызов `calculate_quest_effects(skill_id, hours)`**;
5. XP персонажа (+ `xp_transactions`), уровень по кривой `10·N·(N−1)`; атрибуты +1 по primary/secondary
   атрибутам навыка; навык: total_xp, total_hours, last_practiced_at, уровень по той же кривой.
6. Возвращает `{success, xpAwarded, oldLevel, newLevel, nextLevelThreshold, attributeGained, skillXpGained, skillLevel}`.

**`calculate_quest_effects(p_skill_id, p_hours)`** (STABLE, чистая формула): characterXp = round(hours·10)
(hours null → 1); skillXp = round(hours·20·formMultiplier) (форма: 3 дня grace, −5%/день, мин 20%;
множитель 1.0/0.9/0.75/0.5); attributeChanges = +1 primary, +1 secondary (если есть). Без навыка — только XP.

**Отчёт** — `features/daily-report/ui/DailyReportPage.tsx`: textarea + «Завершить день» →
`dailyReportRepository.completeDay` = upsert `daily_reports(character_id, date, content)` + сумма
`xp_transactions` за сегодня. XP здесь не начисляется; LevelUp — сравнение уровня до/после.
`report_events` / `event_impacts` (initial schema) ссылаются на устаревшую таблицу `skills` и не используются.

**Навыки** — `character_skills` (name, total_hours, total_xp, last_practiced_at, primary_attribute_id,
secondary_attribute_id; unique (character_id, lower(name))). Иконка сейчас — по ключевым словам на клиенте
(`model/skillPresentation.ts`, lucide).

**Edge Functions** — нет (`supabase/functions/` отсутствует). Новые сущности в БД не выставляются в API
автоматически (`config.toml`: auto_expose_new_tables не задан) — нужны явные GRANT.

## Новый поток

```
Текст дня ──► Edge Function parse-day-report (JWT пользователя)
              ├ лимит 20 разборов/сутки (day_report_parses, attempt = 1)
              ├ контекст: навыки пользователя (+aliases, атрибуты), незавершённые квесты на дату,
              │           7 атрибутов (рус.), ключи иконок (skillIcons.json)
              ├ AiProvider → Anthropic Messages API (tool use, strict JSON Schema) → Zod
              ├ каждая попытка → day_report_parses (status ok | invalid_output | timeout | error)
              └ { parseId, events[] }
          ──► Предпросмотр (правка событий) ──► RPC apply_day_report(date, events, parseId)
              ├ идемпотентно по parseId (day_report_applications: результат первого применения)
              ├ лимиты: 0.1–8 ч на событие, ≤ 16 ч на дату (с уже начисленными) → DAY_HOURS_LIMIT
              ├ событие с planned_quest_id → завершить этот квест; без → создать квест на дату и завершить
              ├ навык: existing / new (дедуп по нормализованному имени и aliases) / none
              └ начисления — общей с complete_quest внутренней функцией (XP только из calculate_quest_effects)
          ──► существующий поток: LevelUp, инвалидация запросов персонажа
```

## Адаптация названий к реальной схеме

- «квест на дату» = строка `quests` в `daily_plans` (character_id, date); план создаётся при необходимости.
- Пользователь → персонаж: `characters.profile_id = auth.uid()` (`user_id` в новых таблицах = auth uid).
- Атрибуты навыка: `character_skills.primary_attribute_id` / `secondary_attribute_id` (коды → id через
  `attribute_definitions.code`).
- Тип результата: тот же, что у `complete_quest` (`xpAwarded, oldLevel, newLevel, nextLevelThreshold,
attributeGained, skillXpGained, skillLevel`) + список событий и новых навыков.
- «Отметить вручную» = переход на страницу плана (`/app/plan`), где квесты отмечаются как сейчас;
  ручное «Завершить день» (сохранить текст) остаётся.

## Решения, принятые на этапе 0

- `temperature` не передаётся: текущий `@anthropic-ai/sdk` (≥ 1.0.0) шлёт API-версию 2026-10-21, где
  `temperature` — ошибка 400 на всех моделях (решение владельца 26.11.2026). Форму ответа держат strict tool
  use + Zod; качество — eval.
- SQL-тесты — скрипт `supabase/tests/apply_day_report.sql`, прогоняется в vitest на PGlite (Postgres в WASM,
  без Docker) поверх всех миграций и заглушки схемы `auth`.
