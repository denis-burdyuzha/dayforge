import { useState } from "react";

import { ATTRIBUTE_LABELS_RU } from "@/entities/character/model/aspect";
import { ATTRIBUTE_LABELS_RU as ATTR_RU, ATTRIBUTE_ORDER } from "@/entities/character/model/aspect";
import { computeAvatarParams } from "@/entities/character/model/avatarEngine";
import type { CharacterSkillWithStats } from "@/entities/character/model/characterSkillTypes";
import type { Character, CharacterAttribute } from "@/entities/character/model/characterTypes";
import {
  displaySkillName,
  getSkillRank,
  pickTitleSkill,
  type SkillView,
} from "@/entities/character/model/skillPresentation";
import type { CharacterClassId } from "@/entities/character/model/types";
import type { AttributeKey } from "@/entities/character/model/types";
import { AttributeRuneRing } from "@/entities/character/ui/AttributeRuneRing";
import { ModularAvatar } from "@/entities/character/ui/ModularAvatar";
import { SkillCard, SkillTitlePlate } from "@/entities/character/ui/SkillBadge";

import styles from "./AvatarPlaygroundPage.module.scss";

const PRESET_SKILLS = [
  { id: "prog", name: "Программирование", level: 5 },
  { id: "fit", name: "Фитнес", level: 4 },
  { id: "mkt", name: "Маркетинг", level: 3 },
  { id: "read", name: "Чтение", level: 3 },
  { id: "des", name: "Дизайн", level: 4 },
  { id: "mus", name: "Музыка", level: 2 },
];

/** Test skills for the title plate / skill cards (0–3 used, set by the «Тестовые навыки» control) */
interface TestSkill {
  name: string;
  level: number;
  form: number;
  attr: AttributeKey;
}
/** Attribute → short preset key used by applyPreset */
const PRESET_KEY = {
  strength: "str",
  endurance: "end",
  intelligence: "int",
  focus: "foc",
  discipline: "dis",
  social: "soc",
  creativity: "cre",
} as const satisfies Record<AttributeKey, string>;

const DEFAULT_TEST_SKILLS: TestSkill[] = [
  { name: "Программирование", level: 12, form: 90, attr: "intelligence" },
  { name: "Бег", level: 5, form: 60, attr: "endurance" },
  { name: "Вязание", level: 3, form: 25, attr: "creativity" },
];

export function AvatarPlaygroundPage() {
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialLevel = Number(searchParams?.get("level")) || 1;
  const initialClass = (searchParams?.get("class") as CharacterClassId) || "warrior";
  const initialStr = Number(searchParams?.get("strength")) || 1;
  const bigView = searchParams?.get("big") === "1";
  const initialSil = searchParams?.get("silhouette") === "true";

  const [level, setLevel] = useState<number>(initialLevel);
  const [selectedClass, setSelectedClass] = useState<CharacterClassId>(initialClass);

  const [strength, setStrength] = useState<number>(initialStr);
  const initialAttr = (key: string, fallback = 1) => Number(searchParams?.get(key)) || fallback;
  const [endurance, setEndurance] = useState<number>(initialAttr("endurance"));
  const [discipline, setDiscipline] = useState<number>(initialAttr("discipline"));
  const [intelligence, setIntelligence] = useState<number>(initialAttr("intelligence"));
  const [focus, setFocus] = useState<number>(initialAttr("focus"));
  const [social, setSocial] = useState<number>(initialAttr("social"));
  const [creativity, setCreativity] = useState<number>(initialAttr("creativity"));

  const [activePresetSkillIds, setActivePresetSkillIds] = useState<string[]>(["prog"]);
  const [customSkillName, setCustomSkillName] = useState<string>("");
  const [silhouetteOnly, setSilhouetteOnly] = useState<boolean>(initialSil);
  // Archived on-body attribute FX v2 (attributeFx/) — playground-only toggle, off by default
  const [testSkillCount, setTestSkillCount] = useState<number>(
    Math.min(3, Math.max(0, Number(searchParams?.get("skills")) || 0)),
  );
  const [testSkills, setTestSkills] = useState<TestSkill[]>(DEFAULT_TEST_SKILLS);
  const updateTestSkill = (i: number, patch: Partial<TestSkill>) =>
    setTestSkills((prev) => prev.map((t, k) => (k === i ? { ...t, ...patch } : t)));
  const [legacyFx, setLegacyFx] = useState<boolean>(searchParams?.get("legacyFx") === "1");
  // Character id = seed of the attribute FX (same id → same picture, different id → different picture)
  const [charId, setCharId] = useState<string>(
    searchParams?.get("charId") || "playground-dev-char-id",
  );

  type AttrPreset = Partial<Record<"str" | "end" | "dis" | "int" | "foc" | "soc" | "cre", number>>;
  const applyPreset = (base: number, p: AttrPreset) => {
    setStrength(p.str ?? base);
    setEndurance(p.end ?? base);
    setDiscipline(p.dis ?? base);
    setIntelligence(p.int ?? base);
    setFocus(p.foc ?? base);
    setSocial(p.soc ?? base);
    setCreativity(p.cre ?? base);
  };
  const ATTRIBUTE_PRESETS: Array<{ label: string; base: number; values: AttrPreset }> = [
    { label: "Новичок", base: 1, values: {} },
    { label: "Атлет", base: 2, values: { str: 14, end: 12, dis: 10 } },
    { label: "Учёный", base: 2, values: { int: 15, foc: 12, cre: 8 } },
    { label: "Душа компании", base: 2, values: { soc: 15, cre: 12 } },
    { label: "Всё на 18", base: 18, values: {} },
    { label: "Всё на 9", base: 9, values: {} },
    // «Аспект: X» — X = 15, the next two attributes in ATTRIBUTE_ORDER (cyclic) = 6, the rest = 2
    ...ATTRIBUTE_ORDER.map((attr, i) => {
      const next = [1, 2].map((d) => ATTRIBUTE_ORDER[(i + d) % ATTRIBUTE_ORDER.length]!);
      const values: AttrPreset = { [PRESET_KEY[attr]]: 15 };
      for (const n of next) values[PRESET_KEY[n]] = 6;
      return { label: `Аспект: ${ATTR_RU[attr]}`, base: 2, values };
    }),
  ];

  // Build synthetic character data
  const character: Character = {
    id: charId,
    profileId: "playground-profile",
    name: "Dayforge Creature",
    class: selectedClass,
    level,
    totalXp: 100 * level,
    createdAt: new Date().toISOString(),
  };

  const attributes: CharacterAttribute[] = [
    { id: "a1", attributeId: "attr-str", code: "strength", name: "Сила", value: strength },
    {
      id: "a2",
      attributeId: "attr-end",
      code: "endurance",
      name: "Выносливость",
      value: endurance,
    },
    {
      id: "a3",
      attributeId: "attr-dis",
      code: "discipline",
      name: "Дисциплина",
      value: discipline,
    },
    {
      id: "a4",
      attributeId: "attr-int",
      code: "intelligence",
      name: "Интеллект",
      value: intelligence,
    },
    { id: "a5", attributeId: "attr-foc", code: "focus", name: "Фокус", value: focus },
    { id: "a6", attributeId: "attr-soc", code: "social", name: "Социальность", value: social },
    {
      id: "a7",
      attributeId: "attr-cre",
      code: "creativity",
      name: "Креативность",
      value: creativity,
    },
  ];

  const skills: CharacterSkillWithStats[] = [
    ...PRESET_SKILLS.filter((s) => activePresetSkillIds.includes(s.id)).map((s) => ({
      id: `skill-${s.id}`,
      characterId: character.id,
      name: s.name,
      totalHours: s.level * 10,
      totalXp: s.level * 50,
      lastPracticedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      level: s.level,
      formPercentage: 100,
      formMultiplier: 1.0,
    })),
    ...(customSkillName.trim()
      ? [
          {
            id: "skill-custom",
            characterId: character.id,
            name: customSkillName.trim(),
            totalHours: 20,
            totalXp: 200,
            lastPracticedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            level: 5,
            formPercentage: 100,
            formMultiplier: 1.0,
          },
        ]
      : []),
  ];

  const avatarParams = computeAvatarParams(character, attributes, skills, null);
  avatarParams.silhouetteOnly = silhouetteOnly;

  const testSkillViews: SkillView[] = testSkills.slice(0, testSkillCount).map((t, i) => ({
    id: `test-skill-${i}`,
    name: displaySkillName(t.name),
    level: t.level,
    rank: getSkillRank(t.level),
    totalXp: t.level * 50,
    lastPracticedAt: null,
    form: t.form,
    primaryAttribute: t.attr,
    attributes: [t.attr],
  }));
  const titleSkill = pickTitleSkill(testSkillViews);

  const toggleSkill = (id: string) => {
    setActivePresetSkillIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🐉 Dayforge Creature Playground (Adult Species)</h1>
        <p>Художественная биоморфология, 5 стадий эволюции и проверка качества чистого силуэта</p>
      </header>

      <div className={styles.layout}>
        {/* Left Side: Controls */}
        <div className={styles.controlsPanel}>
          <section className={styles.section}>
            <h3>Быстрые пресеты эволюции</h3>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              <button
                onClick={() => setLevel(1)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                L1 Spark
              </button>
              <button
                onClick={() => setLevel(3)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                L3 Hatchling
              </button>
              <button
                onClick={() => setLevel(5)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                L5 Young
              </button>
              <button
                onClick={() => setLevel(10)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                L10 Awakened
              </button>
              <button
                onClick={() => setLevel(20)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                L20 Signature
              </button>
              <button
                onClick={() => setLevel(35)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  background: "#7c3aed",
                  color: "#fff",
                }}
              >
                L35 Ascended
              </button>
              <button
                onClick={() => setLevel(50)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  background: "#dc2626",
                  color: "#fff",
                }}
              >
                L50 Mythic
              </button>
            </div>

            <h3>Быстрые пресеты атрибутов & Тест Силуэта</h3>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {ATTRIBUTE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.base, p.values)}
                  style={{ padding: "6px 10px", borderRadius: "4px" }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setSilhouetteOnly(!silhouetteOnly)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  background: silhouetteOnly ? "#3b82f6" : "#334155",
                  color: "#ffffff",
                }}
              >
                {silhouetteOnly ? "✓ SILHOUETTE ONLY" : "👁 SILHOUETTE ONLY"}
              </button>
            </div>

            <label className={styles.checkboxLabel} style={{ marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={legacyFx}
                onChange={(e) => setLegacyFx(e.target.checked)}
                data-testid="legacy-fx-toggle"
              />
              <span>Старые эффекты атрибутов (v2)</span>
            </label>

            <div className={styles.field}>
              <label>Character ID (seed эффектов):</label>
              <input
                className={styles.textInput}
                value={charId}
                onChange={(e) => setCharId(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>
                Level: <strong>{level}</strong>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              />
            </div>

            <div className={styles.field}>
              <label>Class Archetype:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as CharacterClassId)}
              >
                <option value="warrior">Воин (warrior)</option>
                <option value="creator">Создатель (creator)</option>
                <option value="explorer">Исследователь (explorer)</option>
                <option value="strategist">Стратег (strategist)</option>
                <option value="wanderer">Странник (wanderer)</option>
              </select>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Характеристики (Биоморфология) — все 7</h3>
            <div className={styles.sliderGrid}>
              <div className={styles.field}>
                <label>
                  Strength (Массивность/Плечи): <strong>{strength}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Endurance (Грудь/Толщина): <strong>{endurance}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={endurance}
                  onChange={(e) => setEndurance(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Discipline (Осанка/Стойка): <strong>{discipline}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={discipline}
                  onChange={(e) => setDiscipline(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Intelligence (Биолюминесценция): <strong>{intelligence}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={intelligence}
                  onChange={(e) => setIntelligence(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Focus (Зрачок/Прищур): <strong>{focus}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={focus}
                  onChange={(e) => setFocus(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Social (Воротник/Гребень): <strong>{social}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={social}
                  onChange={(e) => setSocial(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label>
                  Creativity (Асимметрия): <strong>{creativity}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Тестовые навыки (титул и карточки)</h3>
            <div className={styles.field}>
              <label>
                Количество: <strong>{testSkillCount}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="3"
                value={testSkillCount}
                onChange={(e) => setTestSkillCount(Number(e.target.value))}
                data-testid="test-skill-count"
              />
            </div>
            {testSkills.slice(0, testSkillCount).map((t, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.4fr) 52px 52px minmax(0, 1fr)",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <input
                  className={styles.textInput}
                  value={t.name}
                  aria-label="Название навыка"
                  style={{ minWidth: 0, width: "100%" }}
                  onChange={(e) => updateTestSkill(i, { name: e.target.value })}
                />
                <input
                  className={styles.textInput}
                  type="number"
                  min={1}
                  max={30}
                  value={t.level}
                  aria-label="Уровень"
                  style={{ minWidth: 0, width: "100%" }}
                  onChange={(e) => updateTestSkill(i, { level: Number(e.target.value) || 1 })}
                />
                <input
                  className={styles.textInput}
                  type="number"
                  min={0}
                  max={100}
                  value={t.form}
                  aria-label="Форма %"
                  style={{ minWidth: 0, width: "100%" }}
                  onChange={(e) => updateTestSkill(i, { form: Number(e.target.value) || 0 })}
                />
                <select
                  value={t.attr}
                  aria-label="Основной атрибут"
                  style={{ minWidth: 0, width: "100%" }}
                  onChange={(e) => updateTestSkill(i, { attr: e.target.value as AttributeKey })}
                >
                  {ATTRIBUTE_ORDER.map((a) => (
                    <option key={a} value={a}>
                      {ATTR_RU[a]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </section>

          <section className={styles.section}>
            <h3>Навыки (Нейронные отпечатки)</h3>
            <div className={styles.checkboxGroup}>
              {PRESET_SKILLS.map((sk) => (
                <label key={sk.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={activePresetSkillIds.includes(sk.id)}
                    onChange={() => toggleSkill(sk.id)}
                  />
                  <span>
                    {sk.name} (Lvl {sk.level})
                  </span>
                </label>
              ))}
            </div>

            <div className={styles.field} style={{ marginTop: "12px" }}>
              <label>Custom Skill Name (Check Imprint):</label>
              <input
                type="text"
                placeholder="например: Иностранные языки, Кулинария..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className={styles.textInput}
              />
            </div>
          </section>
        </div>

        {/* Right Side: Avatar Render & Params Inspector */}
        <div className={styles.renderPanel}>
          <div
            className={styles.avatarWrapper}
            style={
              bigView
                ? { position: "fixed", inset: 0, zIndex: 999, borderRadius: 0 }
                : { padding: "8px" }
            }
          >
            {bigView ? (
              // big=1: the bare avatar at 820px for close inspection (no rune ring)
              <ModularAvatar
                params={avatarParams}
                size={820}
                silhouetteOnly={silhouetteOnly}
                legacyAttributeFx={legacyFx}
              />
            ) : (
              // Same composition as the character page hero: 200×240 avatar inside a 340px rune ring
              <AttributeRuneRing attributes={avatarParams.attributeValues} size={340}>
                <ModularAvatar
                  params={avatarParams}
                  size="lg"
                  silhouetteOnly={silhouetteOnly}
                  legacyAttributeFx={legacyFx}
                />
              </AttributeRuneRing>
            )}
            {!bigView && <SkillTitlePlate skill={titleSkill} />}
          </div>

          {testSkillViews.length > 0 && (
            <div style={{ display: "grid", gap: "8px" }}>
              {testSkillViews.map((sk) => (
                <SkillCard key={sk.id} skill={sk} attributeValues={avatarParams.attributeValues} />
              ))}
            </div>
          )}

          <p data-testid="aspect-info" style={{ margin: "8px 0", fontSize: "14px" }}>
            Аспект:{" "}
            {avatarParams.aspect ? (
              <>
                <span style={{ color: avatarParams.aspect.color, fontWeight: 700 }}>
                  ● {ATTRIBUTE_LABELS_RU[avatarParams.aspect.attribute]} (
                  {avatarParams.aspect.attribute})
                </span>
                {" · "}интенсивность {avatarParams.aspect.intensity.toFixed(2)}
              </>
            ) : (
              <span>нет (цвет класса)</span>
            )}
          </p>

          <div className={styles.debugInfo}>
            <h4>Computed Params Summary</h4>
            <ul>
              <li>
                <strong>Silhouette Mode:</strong>{" "}
                {silhouetteOnly ? "Active (Pure Black)" : "Normal (Colored)"}
              </li>
              <li>
                <strong>Evolution Tier:</strong> Tier {avatarParams.evolution.tier} (
                {avatarParams.evolution.classArchetype})
              </li>
              <li>
                <strong>Body Scale & Bulk:</strong> scale {avatarParams.body.scale.toFixed(2)}, bulk{" "}
                {avatarParams.body.bulk.toFixed(2)}
              </li>
              <li>
                <strong>Archetype ({avatarParams.body.archetypeId}):</strong> headScale:{" "}
                {avatarParams.body.headScale.toFixed(2)}, torso:{" "}
                {computeAvatarParams(character, attributes, skills, null).body.archetypeId}
              </li>
              <li>
                <strong>Limb Joint Angles:</strong> armL (
                {avatarParams.posture.limbAngles.armLeftUpper.toFixed(0)}° /{" "}
                {avatarParams.posture.limbAngles.armLeftBend.toFixed(0)}°), legL (
                {avatarParams.posture.limbAngles.legLeftUpper.toFixed(0)}° /{" "}
                {avatarParams.posture.limbAngles.legLeftBend.toFixed(0)}°)
              </li>
              <li>
                <strong>Posture:</strong> {avatarParams.posture.variant} (confidence:{" "}
                {avatarParams.posture.confidence.toFixed(2)}, tilt:{" "}
                {avatarParams.posture.tiltAngle.toFixed(1)}°, ears:{" "}
                {avatarParams.posture.earAlertness.toFixed(2)})
              </li>
              <li>
                <strong>Face:</strong> {avatarParams.face.expression} (focus:{" "}
                {avatarParams.face.focusLevel.toFixed(2)}, eyebrow: {avatarParams.face.eyebrowAngle}
                °, ring: {avatarParams.face.hasFocusRing ? "Yes" : "No"})
              </li>
              <li>
                <strong>Endurance:</strong> chest {avatarParams.endurance.chestDepth.toFixed(2)},
                hide {avatarParams.endurance.hideThickness.toFixed(2)}
              </li>
              <li>
                <strong>Social Crest:</strong> {avatarParams.social.crestSize.toFixed(2)}
              </li>
              <li>
                <strong>Creativity:</strong> asymmetry{" "}
                {avatarParams.creativity.asymmetryIntensity.toFixed(2)}, seed{" "}
                {avatarParams.creativity.asymmetrySeed.toFixed(3)}
              </li>
              <li>
                <strong>Markings:</strong> {avatarParams.markings.patternType} (complexity:{" "}
                {avatarParams.markings.complexity.toFixed(2)})
              </li>
              <li>
                <strong>Skill Imprints ({avatarParams.skillImprints.length}):</strong>{" "}
                {avatarParams.skillImprints.map((e) => `${e.skillName} [${e.type}]`).join(", ") ||
                  "None"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
