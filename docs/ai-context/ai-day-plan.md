# AI-план дня

Статус: реализовано (ветка `feature/ai-day-plan`, 26.11.2026). Итог — раздел «Итог» в конце файла.

## Текущий поток (по коду)

- `/app/plan` — `features/daily-plan/ui/DailyPlanPage.tsx`: «Создать план» → `daily_plans` (character_id, date —
  UTC-дата `toISOString`), ручная форма квеста (название, навык по имени, часы ≥ 0.25; новый навык → 1–2 атрибута,
  клиентский insert в `character_skills`) → `dailyPlanRepository.addQuest`. Отметка → RPC `complete_quest`.
- `quests`: daily_plan_id, title, description, status `pending|completed`, position, xp_reward, attribute_id
  (легаси), skill_name, hours numeric NULL, skill_id NULL. Навык у квеста уже необязателен.
- `_complete_quest_core` (миграция 20261126120000): одна формула `calculate_quest_effects(skill_id, hours)`.
  **Без навыка сейчас начисляется XP персонажа** (round(hours·10), hours null → 1).
- `parse-day-report`: AnthropicProvider (forced strict tool, без temperature, таймаут 20 с), цикл 2 попыток,
  журнал `day_report_parses`, лимит 20/сутки (`attempt = 1` с 00:00 UTC), контекст — навыки + pending-квесты даты.
- `apply_day_report`: идемпотентность через `day_report_applications`; дедуп/создание навыка — **инлайн** внутри
  функции (общей функции нет).

## Как встраивается план

```
Текст плана ─► Edge Function parse-day-plan {planDate, text, nowLocal, timezone}
               ├ лимит 10/сутки (day_plan_parses, attempt = 1), отдельно от отчётов
               ├ контекст: навыки (id, name, aliases, атрибуты), все квесты даты (title, start_time, duration, status)
               ├ общий AI-модуль supabase/functions/_shared/ai (провайдер, повтор, журнал, блок правил навыков)
               └ { parseId, items[] }
           ─► Предпросмотр (правка, пересечения, дубли выключены) ─► RPC apply_day_plan(date, items, parseId)
               ├ идемпотентно (day_plan_applications), 5–480 мин/пункт, Σ pending-квестов даты ≤ 960 мин
               ├ навык — общая _resolve_event_skill (та же, что в apply_day_report)
               └ pending-квесты source='ai_plan' с start_time, duration_minutes, hours = duration/60
           ─► таймлайн дня на /app/plan
Вечер: parse-day-report видит эти квесты как plannedQuests → apply_day_report завершает их.
```

## Адаптация и решения этапа 0

- Новые поля `quests`: `start_time time NULL`, `duration_minutes int NULL` (5–480), `source text NOT NULL DEFAULT
'manual'` (`manual|ai_plan|ai_report`). `hours` остаётся мерой для XP: план пишет `hours = duration_minutes/60`,
  вечерний отчёт при связи перезаписывает часы фактом.
- **Квест без навыка = 0 XP**, атрибуты не меняются, квест завершается (меняем `_complete_quest_core`). Это меняет
  поведение ручных квестов без навыка и none-событий отчёта; превью XP отчёта перестаёт считать none.
- Создание навыка с дедупликацией выносится в `_resolve_event_skill(character_id, skill jsonb)`;
  `apply_day_report` пересоздаётся на ней без изменения результата.
- Лимит 960 мин считает pending-квесты даты: `COALESCE(duration_minutes, round(hours·60), 0)`.
- Журналы попыток получают `usage jsonb` (токены, cache read/creation) — для оценки кэша и стоимости.
- Модель по умолчанию — `claude-haiku-5-5` (обе функции); статическая часть запроса (tools + system) кэшируется
  `cache_control`, динамическая (навыки, квесты, текст) — в user-сообщении.
- «Сегодня» на клиенте остаётся UTC-датой, как в отчёте (известный техдолг); правило «не раньше nowLocal» сервер
  применяет, если `planDate` = локальная дата по `timezone`.

## Итог (26.11.2026)

### БД — миграция `supabase/migrations/20261127120000_ai_day_plan.sql`

- `quests`: `start_time time NULL`, `duration_minutes int NULL` (CHECK 5–480), `source text NOT NULL DEFAULT
'manual'` (CHECK `manual|ai_plan|ai_report`; `apply_day_report` пишет `ai_report`).
- `_complete_quest_core`: квест без навыка → completed, 0 XP, без строки `xp_transactions`, атрибуты не меняются.
- `_resolve_event_skill(character_id, skill jsonb, invalid_code)` — общее разрешение навыка (existing: владелец,
  иначе `SKILL_NOT_FOUND`; new: дедуп по `_normalize_skill_name` имени и aliases, иначе 1–2 атрибута →
  `INVALID_SKILL_ATTRIBUTES`, иконка по regex; none). `apply_day_report` пересоздан на ней (результат прежний).
- `day_plan_parses` (как `day_report_parses` + `parsed_items`, `plan_date`, `usage jsonb`), `day_plan_applications`
  (parse_id PK, result). RLS: select own; запись в журнал — только service_role. `day_report_parses.usage jsonb`.
- `apply_day_plan(p_plan_date, p_items jsonb, p_parse_id)` — SECURITY DEFINER, `auth.uid()`, атомарно, идемпотентно
  (повтор → сохранённый результат + `replayed: true`). Пункт `{title, start_time 'HH:MM'|null, duration_minutes,
skill}`. Квесты pending, `source='ai_plan'`, `hours = duration/60`, позиции по времени (без времени — в конце).
  Пересечения не проверяются. Результат `{success, planId, planDate, quests[], newSkills[], totalMinutes}`.

### Лимиты и коды

| Что                            | Значение                | Где                                            |
| ------------------------------ | ----------------------- | ---------------------------------------------- |
| Текст плана                    | 3–4000 символов         | функция (Zod), клиент                          |
| Разборов плана в сутки         | 10 (UTC, `attempt = 1`) | функция → 429 `RATE_LIMIT`                     |
| Длительность пункта            | 5–480 мин, кратно 5     | функция (клампинг), RPC `INVALID_DURATION`, UI |
| Σ pending-квестов даты + новые | ≤ 960 мин               | RPC `PLAN_HOURS_LIMIT` (DETAIL JSON)           |
| Таймаут модели / повтор        | 20 с / 1 повтор         | общий модуль                                   |

Функция: `UNAUTHORIZED` 401, `INVALID_INPUT` 400 (в т.ч. неизвестный timezone), `RATE_LIMIT` 429, `AI_TIMEOUT` 504,
`AI_INVALID_OUTPUT` 502, `AI_ERROR` 502, `INTERNAL` 500. RPC: `NOT_AUTHENTICATED`, `CHARACTER_NOT_FOUND`,
`PARSE_NOT_FOUND`, `INVALID_ITEMS`, `INVALID_DURATION`, `PLAN_HOURS_LIMIT`, `SKILL_NOT_FOUND`,
`INVALID_SKILL_ATTRIBUTES`.

### Edge Function `parse-day-plan`

Вход `{planDate, text, nowLocal "HH:MM", timezone}`, ответ `{parseId, items}`; пункт `{title, startTime|null,
durationMinutes, skill, duplicateOfExisting, confidence, note}`. `isToday` = локальная дата по timezone == planDate.
`sanitizeItems`: длительность кратна 5 в 5–480; время HH:MM (иначе null + low); на сегодня время раньше nowLocal
сдвигается на ближайшие 5 минут после «сейчас» (low + note); навык по общим правилам (чужой id → new на проверку);
дубль — флаг модели или то же название, что у квеста на дату. Промпт — `parse-day-plan/prompt.ts` + общий блок
навыков `_shared/ai/prompts.ts`.

### Клиент

`/app/plan`: поле «Опиши план на день» (черновик `dayforge:day-plan-draft:<date>`) → «Составить план» → предпросмотр
(`PlanItemCard`: чекбокс, название, время, длительность, навык existing/new/none, «Проверь», «Уже в плане»,
«Пересекается с …»; итог «N пунктов · H ч M мин») → «Добавить в план» → перезагрузка плана → `DayTimeline`
(шкала ≥ 07:00–23:00, блоки по времени/длительности, цвет основного атрибута навыка, пересечения в две колонки,
выполненные приглушены) + «Без времени». Ручная форма квеста осталась («Добавить вручную» в ошибках открывает её).

### Eval

`npm run eval:day-plan` — 15 фикстур (`parse-day-plan/fixtures/day-plans.json`), ключ из `.env.local`.
Результат 26.11.2026 (claude-haiku-5-5, после правки промпта): 14/15 (93%); пункты 52/52, навыки 51/52, время 39/39,
выдуманных пунктов 0. Кэш: cache read в 14/15 вызовов (~3.3k токенов префикса), ≈ $0.0003 за разбор.
Первый прогон до правки промпта — 12/15: модель оставляла startTime = null, если «утро» уже прошло (сегодня
в 15:30) и у поручений; пропускала «потом обед»; добавляла «Сон» пунктом.
