# AI-план дня

Статус: план (этап 0, 27.11.2026), ветка `feature/ai-day-plan`. Итоговая схема — в конце работы.

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
