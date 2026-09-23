# Dayforge — Active Context

## 1. Ветка Git и Состояние Работы

- **Активная ветка**: `feature/lowpoly-avatar-style`
- **Защита предыдущего стиля**: Органический биологический стиль закоммичен (`commit: "Fauna Dayforge: organic anatomical style (pre low-poly pivot) — attributes, tiers, rig, poses complete"`). Ветка `main` и история остатка остаются на 100% рабочими для отката.
- **Единый источник правды**: [task.md](file:///x:/DayForge/task.md) в корне проекта.

---

## 2. Подтверждённое Готовое Состояние (Explorer / Лиса — Анатомический 3D Low-Poly Меш 1 в 1)

Изолированный рендерер в `src/entities/character/ui/ModularAvatar/creatures/fox/`:

- `FoxAvatar.tsx`: Корневой компонент с градиентами `#fox-eye-amber-grad` и `#fox-amber-flame-grad`.
- `FoxRimLight.tsx`: Внешний фоновый контур силуэта с `stroke="#38bdf8"`, `strokeWidth="1.5"` и `filter="url(#avatar-glow-filter)"`.
- `FoxHead.tsx`: Анатомическая 3D-топология с вытянутым лисьим носом, поднятой шеей на quadruped и правильными костными плоскостями.
- `FoxEars.tsx`: 3D-воронки ушей, направленные вперед на quadruped и назад на curled.
- `FoxFace.tsx`: Янтарные глаза, утопленные в глазницы.
- `FoxBody.tsx`: Анатомический изгиб позвоночника, реберная дуга, подтянутый пах и женственная талия Кицунэ.
- `FoxLimbs.tsx`: 4 объёмных 3D-ноги на quadruped с опорой на землю ($Y=190..192$), изящные складывающиеся руки на bipedal.
- `FoxTail.tsx`: Пышный хвост, огибающий тело снизу до подбородка на curled, и 5 S-образных хвостов Кицунэ на L50.
- **Проверки**: `npx tsc --noEmit` ✅ (0 ошибок), `npm run build` ✅ (1.31s), браузерные скриншоты L1, L10, L50 ✅.

---

## 3. Конкретный Следующий Шаг

1. Разработка изолированного рендерера `creatures/wolf/` для класса **Warrior (Волк)** по утверждённой низкополигональной системе 3D-сабдивизиона и светотени `avatarShading.ts`.
