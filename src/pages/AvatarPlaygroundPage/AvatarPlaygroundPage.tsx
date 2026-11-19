import { useState } from "react";

import { computeAvatarParams } from "@/entities/character/model/avatarEngine";
import type { CharacterSkillWithStats } from "@/entities/character/model/characterSkillTypes";
import type { Character, CharacterAttribute } from "@/entities/character/model/characterTypes";
import type { CharacterClassId } from "@/entities/character/model/types";
import { ModularAvatar } from "@/entities/character/ui/ModularAvatar";

import styles from "./AvatarPlaygroundPage.module.scss";

const PRESET_SKILLS = [
  { id: "prog", name: "Программирование", level: 5 },
  { id: "fit", name: "Фитнес", level: 4 },
  { id: "mkt", name: "Маркетинг", level: 3 },
  { id: "read", name: "Чтение", level: 3 },
  { id: "des", name: "Дизайн", level: 4 },
  { id: "mus", name: "Музыка", level: 2 },
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

  // Quick preset helper handlers
  const setAllAttributes = (val: number) => {
    setStrength(val);
    setEndurance(val);
    setDiscipline(val);
    setIntelligence(val);
    setFocus(val);
    setSocial(val);
    setCreativity(val);
  };

  // Build synthetic character data
  const character: Character = {
    id: "playground-dev-char-id",
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
              <button
                onClick={() => setAllAttributes(1)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                Weak (all 1)
              </button>
              <button
                onClick={() => setAllAttributes(8)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                Balanced (all 8)
              </button>
              <button
                onClick={() => setAllAttributes(18)}
                style={{ padding: "6px 10px", borderRadius: "4px" }}
              >
                Strong (all 18)
              </button>
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
            style={bigView ? { position: "fixed", inset: 0, zIndex: 999, borderRadius: 0 } : undefined}
          >
            <ModularAvatar params={avatarParams} size={bigView ? 820 : 300} silhouetteOnly={silhouetteOnly} />
          </div>

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
