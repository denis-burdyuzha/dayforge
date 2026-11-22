АРХИВ (до перехода на Claude). Актуальное — docs/ai-context/.

# Dayforge — Active Context

## 1. Ветка Git и Состояние Работы

- **Активная ветка**: `feature/lowpoly-avatar-style`
- **Завершено в текущей сессии**:
  - **Параметризация палитры тела по классам (`CLASS_BODY_PALETTE`)**:
    - В [creatureFxPalette.ts](file:///x:/DayForge/src/entities/character/ui/ModularAvatar/creatureFxPalette.ts) вынесен реестр `CLASS_BODY_PALETTE` для всех 5 классов (`explorer`, `warrior`, `creator`, `strategist`, `wanderer`).
    - Базовая синяя палитра Лисы (`{ dark: "#0a1230", mid: "#1e2a4a", light: "#3a4a6e" }`) привязана к `explorer`.
    - Добавлены хелперы `getClassBodyColor` и `remapFacetColorToClass(baseHex, classArchetype)`. В `foxZones.ts` функция `computeFoxZoneModifiers` принимает параметр `classArchetype` (по умолчанию `"explorer"`). Для Explorer визуальный рендер лисы 100% неизменен. Подготовлен фундамент для Волка (`CLASS_BODY_PALETTE.warrior`).
- **Единый источник правды**: [task.md](file:///x:/DayForge/task.md) в корне проекта.

---

## 2. Подтверждённое Готовое Состояние

### External FX Matrix & 5-Tier Fox Avatar

1. **Матрица эффектов (`foxFxMatrix.ts`)**: `TierFxConfig` + `getFoxFxConfig(level)` — L1, L3, L5, L10, L20, L35, L50.
2. **Discipline Formation System**: [DisciplineFormation.tsx](file:///x:/DayForge/src/entities/character/ui/ModularAvatar/creatures/fox/DisciplineFormation.tsx) & [creatureFxPalette.ts](file:///x:/DayForge/src/entities/character/ui/ModularAvatar/creatureFxPalette.ts).
3. **Rim Light, Energy Aura, Ember Sparks, Color Grading** — zero mesh mutation.
4. `npx tsc --noEmit` ✅ / `npm run build` ✅.

### Система атрибутов (7 каналов Fox) — ПОЛНОСТЬЮ РЕАЛИЗОВАНА И НАСТРОЕНА

1. **Strength (Сила)**: Плечевые шипы (0..4), контраст фасетов, пульсация груди.
2. **Intelligence (Интеллект)**: Радиальная сетка головы (1..16 фасетов), нервные импульсы.
3. **Focus (Фокус)**: Ореол свечения головы, прищур глаз, виньетка.
4. **Endurance (Выносливость)**: 1..5 ломаных жил на ногах, тонкие надрезы шрамов (+28% L), кинцуги.
5. **Discipline (Дисциплина)**: 5-гранные кристаллы на пропорциональной орбите (0.52 * diag), ±18% рябь torso.

### Social Attribute Overhaul (Tail Connection Network, Static Ears Accent & Snout Scars) — РЕАЛИЗОВАНО

1. **Social — Сеть связей на хвосте**:
   - Точка роста: `attachPt` (ближайшая к центру `torso` точка в зоне `tail`).
   - Разреженная выборка (пропуск промежуточных фасетов `idx % 2 === 0`) по мере роста расстояния от основания хвоста.
   - Рост числа выбранных фасетов от 1 (Social=1) до max (Social=18).
   - Подсветка ТОЛЬКО физически общего ребра меша (`getSharedMeshEdges`) между физически соседствующими выбранными фасетами. Без принудительных соединений несоседних узлов.
   - Старые метки `bondMarksFx` у хвоста полностью удалены.
2. **Social — Уши**:
   - 100% статичный тёплый оттенок (`#f97316` warm shift в `resolveFill`) + статичная `InternalFacetSubdivision` (`enablePulse={false}`). Нулевое движение, отсутствие любых анимационных тегов.
3. **Endurance — Шрамы на морде**:
   - Включена зона `snout` в перечень кандидатов шрамов, гарантируя наличие аккуратного ломаного шрама-надреза с поперечными стежками на морде.
4. **Валидация**:
   - `npx tsc --noEmit` ✅ (0 ошибок).
   - `npm run build` ✅.

---

## 3. Конкретный Следующий Шаг

1. **Тиражирование на следующий класс (`creatures/wolf/`)**: раскатка паттерна атрибутов и 5-тировой SVG-архитектуры для Воина (Warrior).
2. **Интеграция навыков**: привязка рунических отпечатков навыков к узлам аватара.
