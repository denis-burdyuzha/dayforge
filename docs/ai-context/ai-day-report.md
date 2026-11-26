# AI-разбор вечернего отчёта

Статус: реализовано в ветке `feature/ai-day-report` (26.11.2026), влито в `main`. Миграция `20261126120000`
к удалённой базе НЕ применена, Edge Function НЕ задеплоена, eval на реальной модели НЕ прогонялся (нет ключа).
Финальная схема, лимиты, коды ошибок и запуск — раздел «Итог» в конце файла.

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

## Итог (финальная схема, 26.11.2026)

> Изменения миграцией `20261127120000_ai_day_plan.sql` (ветка ai-day-plan, см. `ai-day-plan.md`): событие без
> навыка завершает квест с 0 XP; создание навыка вынесено в `_resolve_event_skill`; квесты, созданные отчётом, —
> `source='ai_report'`; `day_report_parses.usage jsonb`.

### БД — миграция `supabase/migrations/20261126120000_ai_day_report.sql`

- `character_skills`: `aliases TEXT[] NOT NULL DEFAULT '{}'`, `icon TEXT NULL` (ключ из `skillIcons.json`).
- `day_report_parses` — лог каждой попытки разбора: `id, user_id → auth.users, report_date, input_text, model,
attempt (1|2), raw_output, parsed_events, status (ok|invalid_output|timeout|error), error_message, latency_ms,
created_at`. RLS: select own; запись — только `service_role` (Edge Function).
- `day_report_applications` — `parse_id PK → day_report_parses, user_id, report_date, result jsonb, created_at`.
  Хранит результат первого применения (идемпотентность). RLS: select own.
- `_normalize_skill_name(text)` — lower + trim + схлопывание пробелов.
- `_complete_quest_core(character_id, quest_id, skill_id)` — общее ядро начислений (SECURITY DEFINER, EXECUTE
  отозван у PUBLIC/anon/authenticated). `complete_quest` переведён на него, результат тот же (регрессионный тест).
- `apply_day_report(p_report_date date, p_events jsonb, p_parse_id uuid)`:
  - событие: `{description, hours, planned_quest_id, skill: {kind:'existing', skill_id} | {kind:'new', name,
attributes[1–2], icon} | {kind:'none'}}` — XP клиент не передаёт;
  - planned quest → завершается; иначе создаётся квест в плане на дату и завершается; уже завершённый —
    пропуск `skipped: 'QUEST_ALREADY_COMPLETED'`;
  - новый навык: дедуп по нормализованному имени и `aliases` (в т.ч. между событиями одного отчёта);
  - результат: `{success, xpAwarded, oldLevel, newLevel, nextLevelThreshold, attributeGained, skillXpGained,
skillLevel, leveledUp, reportDate, totalHours, events[], newSkills[]}`; повтор того же parse —
    сохранённый результат + `replayed: true`.

### Лимиты

| Что                          | Значение                       | Где проверяется                                |
| ---------------------------- | ------------------------------ | ---------------------------------------------- |
| Текст                        | 3–4000 символов                | Edge Function (Zod), клиент (maxLength)        |
| Часы на событие              | 0.1–8, шаг UI 0.25             | RPC (`INVALID_HOURS`), функция клампит, клиент |
| Часы на дату                 | ≤ 16 с уже начисленными        | RPC (`DAY_HOURS_LIMIT`, DETAIL JSON)           |
| Разборов в сутки             | 20 (UTC, `attempt = 1`)        | Edge Function (`RATE_LIMIT`)                   |
| Таймаут модели               | 20 с                           | Edge Function (`AI_TIMEOUT`)                   |
| Событий за разбор            | ≤ 30                           | JSON Schema / Zod                              |
| Повтор при невалидном ответе | 1 (с текстом ошибки валидации) | Edge Function                                  |

### Коды ошибок

- Edge Function `parse-day-report` (тело `{error: {code, message}}`): `UNAUTHORIZED` 401, `METHOD_NOT_ALLOWED`
  405, `INVALID_INPUT` 400, `RATE_LIMIT` 429, `AI_TIMEOUT` 504, `AI_INVALID_OUTPUT` 502, `AI_ERROR` 502,
  `INTERNAL` 500.
- RPC `apply_day_report` (код в message): `NOT_AUTHENTICATED`, `CHARACTER_NOT_FOUND`, `PARSE_NOT_FOUND`,
  `INVALID_EVENTS`, `INVALID_HOURS`, `DAY_HOURS_LIMIT` (DETAIL `{alreadyHours, newHours, totalHours, limit}`),
  `SKILL_NOT_FOUND`, `INVALID_SKILL_ATTRIBUTES`, `QUEST_NOT_FOUND`.
- Клиент (`entities/daily-report/api/aiDayReportErrors.ts`) добавляет `NETWORK` и `UNKNOWN`. UI показывает
  4 вида: лимит (только «Отметить вручную»), сбой ИИ (повтор + вручную), нет сети (повтор, черновик цел),
  превышение 16 ч (баннер у «Подтвердить»).

### Edge Function — `supabase/functions/parse-day-report/`

`index.ts` (Deno.serve, env) → `handler.ts` → `parseDayReport.ts` (лимит, контекст, `sanitizeEvents`) → общий
AI-модуль. Промпт — `prompt.ts`, схемы — `schema.ts`. Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (выдаются платформой), `ANTHROPIC_API_KEY`, `AI_MODEL` (по умолчанию `claude-haiku-5-5`
с 26.11.2026, ветка ai-day-plan).

### Общий AI-модуль `supabase/functions/_shared/ai/` (с 26.11.2026, используют parse-day-report и parse-day-plan)

- `anthropicProvider.ts` — `AiProvider.callTool(request)`: forced strict tool, без temperature, `maxRetries: 0`,
  возвращает `{input, usage}` (input/output/cache read/cache write токены).
- `attempts.ts` — цикл ≤ 2 попыток (повтор после таймаута / невалидного ответа с текстом ошибки, API-ошибка — без
  повтора), лог каждой попытки (с usage), коды `AI_TIMEOUT 504 / AI_INVALID_OUTPUT 502 / AI_ERROR 502`.
- `prompts.ts` — общий блок правил навыков (`SKILL_RULES`: existing по синонимам/aliases, new, none для бытовых дел,
  поручений, встреч без цели развития и «работы» без уточнения) и каталог атрибутов/иконок.
- `skills.ts` (`resolveSkillRef`: чужой id → new на проверку, alias → existing, иконка), `schemas.ts`, `catalog.ts`,
  `http.ts` (CORS, JWT, конверт ошибок), `supabaseContext.ts` (навыки + квесты даты, счётчик запросов).
- **Кэширование промпта:** неизменная часть (tool schema + system: правила, блок навыков, атрибуты, иконки) идёт
  первой и помечена `cache_control: ephemeral` на system-блоке (tools рендерятся до system и попадают в тот же
  префикс); меняющаяся (навыки пользователя, квесты, текст, ошибка повтора) — в user-сообщении. Минимум кэша у
  Haiku 5.5 — 512 токенов; префикс ~3.3k. Проверка — usage в eval (`cache read` в N/M вызовов).
- Плановые квесты в контексте отчёта получают `startTime`.

### Клиент

`features/daily-report`: `useAiDayReport` (фазы input → parsing → preview → applying), `AiDayReport`,
`DayEventCard`. Черновик — `localStorage` `dayforge:day-report-draft:<date>` (`shared/lib/draftStore`). Превью
XP = Σ round(h·10) по событиям с навыком (с 26.11.2026 событие без навыка = 0 XP; только отображение). Иконка навыка из БД (`character_skills.icon`) приоритетнее ключевых слов
(`skillPresentation.getSkillIcon`).

### Тесты и eval

- `npm test` — SQL на PGlite (`supabase/tests/*.test.ts`: миграции, регрессия complete_quest,
  apply_day_report), юнит-тесты функции с мок-провайдером, 20 фикстур, клиентская модель.
- `npm run eval:day-report` — 20 фикстур (`parse-day-report/fixtures/day-reports.json`) против реальной модели;
  ключ `ANTHROPIC_API_KEY` (и опц. `AI_MODEL`) из окружения или `.env.local`. Без ключа — сообщение и exit 0.
  Оценка: совпадение набора событий, навыка, planned quest, часы ±30%.

### Развёртывание

```
npx supabase db push
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... AI_MODEL=claude-haiku-5-5
npx supabase functions deploy parse-day-report
npx supabase gen types typescript --linked > src/shared/api/supabase/database.types.ts   # сверить с ручной правкой
```
