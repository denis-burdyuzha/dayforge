# Dayforge — контекст для Claude

Читать в начале КАЖДОЙ сессии. Подробности — в `docs/ai-context/` (ссылки внизу).
Источники правды: «что сделано и как работает» — **код**; «как должно быть» — `docs/ai-context/decisions.md`.
`memory-bank/`, `task.md`, `AGENTS.md`, `.ai-import/` — архив эпохи Gemini/Antigravity, не источник правды.

## Продукт

Dayforge — AI-RPG для саморазвития: реальные действия пользователя развивают его персонажа.
Цикл: план дня → квесты → вечерний отчёт → XP → развитие персонажа (пользователь подтверждает начисления).
Mobile-first PWA, solo-разработка (20–30 ч/нед), закрытая бета с друзьями до монетизации.
Аватар-существо (тотемное low-poly животное на класс) — ключевая «игровая» часть продукта.
AI-слой (26.11.2026): разбор вечернего отчёта (`ai-day-report.md`) и утренний план текстом → квесты со временем
(`ai-day-plan.md`); план vs факт — отложен. Квест без навыка = 0 XP.

## Стек

React 19 + TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) + Vite 8,
FSD, React Router 7, TanStack Query 5, Zustand 5 (пока не используется), RHF + Zod 4, Framer Motion,
SCSS Modules + CSS-токены (dark-first), Supabase (Postgres/Auth/RLS, Edge Functions `parse-day-report`, `parse-day-plan` на Deno + Anthropic SDK).
Алиас `@/` → `src/`. Коммиты — commitlint (conventional), husky: commit-msg + lint-staged.

## Карта ключевых папок

```
src/app/                router (router.tsx), layouts (AppShell, Guest/ProtectedLayout), providers
src/pages/              HomePage (персонаж), Landing, Login, AuthCallback, AvatarPlaygroundPage (/dev/avatar)
src/widgets/            header, bottom-navigation
src/features/           onboarding (визард + RPC), daily-plan (DailyPlanPage), daily-report (DailyReportPage)
src/entities/auth/      useAppState() — Auth Gate (loading | unauthenticated | needs-onboarding | ready)
src/entities/character/ model: типы, формулы XP/уровня/формы, avatarEngine.ts, avatarTypes.ts
                        api: characterRepository; ui/ModularAvatar/ — рендер аватара
src/entities/daily-plan/, daily-report/   репозитории (Supabase) + типы
src/shared/             ui-kit (shared/ui/*), api/supabase (client + database.types.ts), config/env.ts, styles
supabase/migrations/    схема, сиды, RLS, RPC (complete_onboarding, complete_quest, apply_day_report, …)
supabase/functions/     parse-day-report, parse-day-plan (Deno); _shared/ai/ — общий AI-модуль (провайдер, кэш промпта,
                        повтор, правила навыков); _shared/skillIcons.json (общий с клиентом)
supabase/tests/         SQL-тесты на PGlite (vitest)
src/assets/images/baseForm/<class>/   SVG-ассеты аватара по тирам (fox/wolf/bear/lion/deer L1..L5)
scripts/buildCreatureAssets.mjs      npm run build:assets: SVG → данные волка/медведя/льва/оленя (+ aspectAccent)
scripts/annotateFoxZones.mjs          запекает id групп из SVG в FoxL{N}AssetData.ts (поле zone)
```

Аватар (самое важное): `src/entities/character/ui/ModularAvatar/`

- `ModularAvatar.tsx` — диспетчер: `explorer` → `creatures/fox/FoxAvatar.tsx`; остальные классы →
  `creatures/creatureRegistry.ts` (волк, медведь, лев, олень) → общий `creatures/AssetCreatureAvatar.tsx`.
  Новый зверь — `docs/ai-context/adding-creature.md`. Органический рендер удалён (26.11.2026).
- `shared/aspectAccent.ts` — подкраска полигонов `aspectAccentIds` в цвет аспекта (OKLCH, светотень сохраняется);
  в SVG — группа `<g id="aspectAccent">`.
- Атрибуты сейчас: `model/aspect.ts` (аспект) + `ui/AttributeRuneRing/` (круг рун). Тело эффектов не несёт.
- `attributeFx/` — ОТЛОЖЕНО (только при `legacyAttributeFx` в Playground): универсальные эффекты 7 атрибутов (anatomy, fxContext, fxPalette, fxSeed,
  bodyTone, compute<Attr>.ts + <Attr>Fx.tsx, AttributeFxLayer, тест инвариантов). Ничего лисьего внутри.
- `creatures/fox/` — FoxAvatar, foxAnatomy (адаптер лисы для attributeFx), foxZones, foxZoneRegistry, foxFxMatrix,
  foxEvolutionConfig.
- `assets/` — FoxL{1..5}AssetData.ts (полигоны + zone) и FoxZonedAsset (общий рендер полигонов всех зверей).
- `creatureFxPalette.ts` — палитры классов (тело, цвет кристаллов Discipline).

## Команды

```
npm run dev            # Vite dev server; плейграунд аватара: /dev/avatar?class=explorer&level=35&social=10
npm run build          # tsc -b && vite build  ← это НАСТОЯЩАЯ проверка типов
npx tsc --noEmit -p tsconfig.app.json   # быстрая проверка типов приложения
npm run lint           # eslint . (src/ чистый; падает только на .ai-import/ — архив, ESLint его не игнорирует)
npm run format         # prettier --write
npm test               # vitest run — фронт + SQL (PGlite) + Edge Function (на Windows из X:\DayForge, не x:)
npm run eval:day-report # eval разбора отчёта на реальной модели (ключ ANTHROPIC_API_KEY в .env.local; без ключа — пропуск)
npm run eval:day-plan   # то же для плана дня (+ usage / cache read / стоимость)
npm run build:assets   # SVG зверей → TS-данные (scripts/creatures.config.mjs); повторный запуск без изменений — нулевой diff
npx supabase db push   # применить миграции к привязанному проекту
npx supabase gen types typescript --linked > src/shared/api/supabase/database.types.ts  # (скрипта в package.json нет)
```

ВНИМАНИЕ: `npm run typecheck` / `npx tsc --noEmit` в корне проверяют 0 файлов (корневой tsconfig.json —
solution-style с `"files": []`). Все прошлые отчёты «tsc ✅ 0 ошибок» на этом основании ничего не доказывали.

## Git

- `main` содержит всю работу по аватару: `feature/avatar-aspect-runes` влита 22.11.2026 (merge --no-ff).
  Новую работу вести в отдельной ветке от `main`, напрямую в `main` не коммитить.
- Работа 24.09–07.10.2026 сохранена WIP-коммитом 368942d (19.11.2026).
- Не делать `git checkout .`/`reset`/`clean`/force-push без явного согласия владельца.
- `.ai-import/` в .gitignore, не коммитить. `id_df`, `.env.local` — секреты (в .gitignore), не коммитить.

## Текущий фокус

Атрибуты: аспект (цвет rim/ауры + сигил за аватаром) + вращающийся круг рун (22.11.2026, в `main`); эффекты на
теле v2 отложены (тег `avatar-attribute-fx-v2`, чекбокс в Playground). Миграцию онбординга (20261122150000) нужно
применить `npx supabase db push`. Открытые вопросы — `progress.md`.
Все 5 классов на SVG-пайплайне (26.11.2026): лиса, волк, медведь, лев, олень. Владелец доразмечает `aspectAccent`
у волка и добавит оленя L4–L5 → `npm run build:assets`.
AI-разбор отчёта и AI-план дня (26.11.2026). Следующий шаг — экспорт плана во внешние календари через фид-подписку.
Supabase CLI: Docker не запускать; удалённый проект — `npx supabase db push` (linked), типы — `gen types --linked`.

## ПРАВИЛА работы

1. Никогда не помечать задачу «сделано/проверено» без реальной проверки. Если визуально проверить нельзя —
   писать прямо: «не проверено визуально».
2. Одна правка за раз, затем проверка. Не складывать несколько исправлений в одну итерацию.
3. При баге сначала найти и назвать корневую причину, потом чинить. Не лечить симптом.
4. После изменений: `npx tsc --noEmit -p tsconfig.app.json` и `npm run build`
   (НЕ `npx tsc --noEmit` в корне — он проверяет 0 файлов).
5. Не делать скриншотов для владельца — тестировать самому и писать текстовый отчёт.
   Визуальные изменения аватара всегда проверяй сам через Playwright по скриншотам; мне скриншоты не присылай.
   (Playwright MCP: `/dev/avatar?class=explorer&level=N&big=1&<атрибуты>`, файлы — в `.playwright-mcp/`, уникальные
   имена; перед проверкой убедиться, что в консоли нет ошибок.)
6. Коммиты в формате commitlint (conventional commits): `feat(avatar): …`, `fix(db): …`, `docs: …`.
7. Не предлагать заново отвергнутые подходы из `docs/ai-context/decisions.md`
   (робот/кибер, человекоподобный, органика на Безье, процедурная геометрия, плавный морф тиров и др.).
8. В конце каждой сессии самому обновить `docs/ai-context/progress.md`.

Дополнительно (из опыта прошлых агентов):

- Решения по визуалу аватара — только из decisions.md / avatar-system.md; при сомнении спросить владельца.
- Новый класс = отдельная папка `creatures/<animal>/`, без `if (classArchetype === …)` в общем рендере.
- Zero Mesh Mutation: вершины SVG-ассета не двигать; различия — через FX-слои.

## Файлы контекста (`docs/ai-context/`)

- [product.md](docs/ai-context/product.md) — видение, основной цикл, MVP, что отложено.
- [architecture.md](docs/ai-context/architecture.md) — FSD-слои, роутинг/Auth Gate, данные, схема БД, RPC, RLS, формулы.
- [avatar-system.md](docs/ai-context/avatar-system.md) — архитектура аватара, ассеты и id зон, атрибут→визуал (решение vs код), баги.
- [decisions.md](docs/ai-context/decisions.md) — журнал решений и отвергнутых подходов (с причинами).
- [ai-day-report.md](docs/ai-context/ai-day-report.md) — AI-разбор отчёта: схема, лимиты, коды ошибок, eval, деплой.
- [ai-day-plan.md](docs/ai-context/ai-day-plan.md) — AI-план дня: схема, лимиты, коды, таймлайн, eval.
- [adding-creature.md](docs/ai-context/adding-creature.md) — добавить/обновить зверя: SVG, разметка aspectAccent, сборка.
- [progress.md](docs/ai-context/progress.md) — что сделано, текущий статус, открытые задачи, расхождения, результат сборки.

## Инструкция себе

В конце каждой сессии (не дожидаясь команды) обновить `docs/ai-context/progress.md`: что сделано, что
проверено и как, что НЕ проверено, следующий шаг. При изменении архитектуры/решений — обновить
`architecture.md` / `avatar-system.md` / `decisions.md`. CLAUDE.md держать ≤150 строк.
