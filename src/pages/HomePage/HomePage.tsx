import { useEffect, useRef, useState } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import {
  ATTRIBUTE_COLORS,
  ATTRIBUTE_LABELS_RU,
  isAttributeKey,
} from "@/entities/character/model/aspect";
import { computeAvatarParams } from "@/entities/character/model/avatarEngine";
import {
  xpRequiredForLevel,
  xpWithinCurrentLevel,
} from "@/entities/character/model/characterTypes";
import { characterClasses } from "@/entities/character/model/classes";
import { pickTitleSkill, toSkillView } from "@/entities/character/model/skillPresentation";
import { useCharacterData } from "@/entities/character/model/useCharacterData";
import { AttributeRune, AttributeRuneRing } from "@/entities/character/ui/AttributeRuneRing";
import { ModularAvatar } from "@/entities/character/ui/ModularAvatar";
import { SkillCard, SkillTitlePlate } from "@/entities/character/ui/SkillBadge";
import { Badge } from "@/shared/ui/Badge/ui/Badge";
import { Card } from "@/shared/ui/Card/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState/ui/ErrorState";
import { Loading } from "@/shared/ui/Loading/ui/Loading";
import { XPBar } from "@/shared/ui/XPBar/ui/XPBar";

import styles from "./HomePage.module.scss";

// ---------------------------------------------------------------------------
// Decorative attribute icons (fallback: ✨)
// ---------------------------------------------------------------------------

const ATTRIBUTE_ICONS: Record<string, string> = {
  strength: "💪",
  endurance: "🏃",
  discipline: "🎯",
  intelligence: "🧠",
  focus: "🔍",
  social: "🤝",
  creativity: "🎨",
};

/** Rune ring diameter around the 200×240 hero avatar (fits a 390px-wide screen) */
const HERO_RING_SIZE = 340;

function getAttrIcon(code: string): string {
  return ATTRIBUTE_ICONS[code] ?? "✨";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSince(isoDate: string): number {
  const start = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatXpDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// ---------------------------------------------------------------------------
// useSectionReveal — IntersectionObserver hook for scroll-in animation
// ---------------------------------------------------------------------------

function useSectionReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          el.classList.add(styles.visible as string);
          observer.disconnect(); // once: true
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// ---------------------------------------------------------------------------
// AttributeCard — expandable HUD card (NO progress bar, just the number)
// ---------------------------------------------------------------------------

function AttributeCard({
  code,
  label,
  icon,
  description,
  value,
  accentColor,
}: {
  code: string;
  label: string;
  icon: string;
  description: string;
  value: number;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      variant="interactive"
      className={styles.attrCard}
      onClick={() => setExpanded((v) => !v)}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
    >
      <div className={styles.attrCardHeader}>
        {isAttributeKey(code) ? (
          <AttributeRune attribute={code} value={value} size={24} />
        ) : (
          <span className={styles.attrIcon}>{icon}</span>
        )}
        <span className={styles.attrName}>{label}</span>
        {/* Plain number — no progress bar */}
        <span className={styles.attrValue} style={{ color: accentColor }}>
          {value}
        </span>
      </div>

      {expanded && (
        <div className={styles.attrExpanded}>
          <p className={styles.attrDescription}>{description}</p>
          <p className={styles.attrHistoryNote}>
            +1 за каждый выполненный квест с этой характеристикой.
          </p>
        </div>
      )}

      <span className={styles.attrChevron}>{expanded ? "▲" : "▼"}</span>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Reveal-section wrapper — applies .sectionReveal + IntersectionObserver
// ---------------------------------------------------------------------------

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useSectionReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={[styles.section, styles.sectionReveal, className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const HomePage = () => {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const { character, attributes, characterSkills, todayState, xpEvents, isLoading, error } =
    useCharacterData(userId);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем персонажа…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <ErrorState
          title="Ошибка загрузки"
          description="Не удалось получить данные персонажа. Попробуй обновить страницу."
        />
      </div>
    );
  }

  if (!character) {
    return (
      <div className={styles.center}>
        <EmptyState
          title="Персонаж не найден"
          description="Пройди онбординг, чтобы создать своего персонажа."
        />
      </div>
    );
  }

  const charClass = characterClasses.find((c) => c.id === character.class);
  const accentColor = charClass?.accentColor ?? "var(--color-primary)";

  const currentLevelXp = xpWithinCurrentLevel(character.totalXp, character.level);
  const requiredXp = xpRequiredForLevel(character.level);
  const xpToNext = requiredXp - currentLevelXp;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayXpEvents = xpEvents.filter((e) => e.createdAt.slice(0, 10) === todayStr);

  const dayCount = character.createdAt ? daysSince(character.createdAt) : 0;

  const attrDeltas = attributes
    .map((a) => ({
      label: a.name,
      delta: a.value - 1,
    }))
    .filter((d) => d.delta > 0);

  // Compute avatar params for modular vector avatar
  const avatarParams = computeAvatarParams(character, attributes, characterSkills, todayState);

  // Skills: presentation (rank, icon, form) + the title skill shown under the avatar
  const skillViews = characterSkills.map((skill) => toSkillView(skill, attributes));
  const titleSkill = pickTitleSkill(skillViews);

  return (
    <div className={styles.page}>
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.heroSection}>
        {/* Animated background orbs */}
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgOrb1} style={{ background: accentColor }} />
          <div className={styles.heroBgOrb2} style={{ background: accentColor }} />
        </div>

        <div className={styles.heroContent}>
          {/* Modular Vector Avatar */}
          <div className={styles.sigilWrapper}>
            <AttributeRuneRing attributes={avatarParams.attributeValues} size={HERO_RING_SIZE}>
              <div className={styles.sigilAvatar}>
                <div className={styles.sigilGlow} style={{ background: accentColor }} />
                <div className={styles.sigilReveal}>
                  <ModularAvatar params={avatarParams} size="lg" />
                </div>
              </div>
            </AttributeRuneRing>
          </div>

          <SkillTitlePlate skill={titleSkill} className={styles.titlePlate} />

          <h1 className={styles.heroName}>{character.name}</h1>

          {charClass && (
            <div className={styles.heroClass}>
              <Badge variant="primary">
                {charClass.avatarIcon}&nbsp;{charClass.name}
              </Badge>
            </div>
          )}

          {/* XP block */}
          <div className={styles.xpBlock}>
            <div className={styles.levelLabel} style={{ color: accentColor }}>
              LEVEL {character.level}
            </div>
            <div className={styles.xpBarWrapper}>
              <XPBar level={character.level} currentXp={currentLevelXp} requiredXp={requiredXp} />
            </div>
            <div className={styles.xpMeta}>
              <span className={styles.xpCurrent}>
                {currentLevelXp} / {requiredXp} XP
              </span>
              <span className={styles.xpToNext}>
                +{xpToNext} XP до Уровня {character.level + 1}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ATTRIBUTES — number only, no progress bar
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>Характеристики</h2>
        <div className={styles.attrGrid}>
          {attributes.length > 0 ? (
            attributes.map((attr) => (
              <AttributeCard
                key={attr.id}
                code={attr.code}
                label={isAttributeKey(attr.code) ? ATTRIBUTE_LABELS_RU[attr.code] : attr.name}
                icon={getAttrIcon(attr.code)}
                description={attr.description || "Прокачивается через реальные действия."}
                value={attr.value}
                accentColor={isAttributeKey(attr.code) ? ATTRIBUTE_COLORS[attr.code] : accentColor}
              />
            ))
          ) : (
            <div className={styles.emptyWrap}>
              <EmptyState
                title="Характеристики загружаются"
                description="Данные появятся совсем скоро."
              />
            </div>
          )}
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          SKILLS (character_skills) — Level + Form + Last practiced
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>Навыки</h2>
        {characterSkills.length > 0 ? (
          <div className={styles.skillsList}>
            {skillViews.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                attributeValues={avatarParams.attributeValues}
              />
            ))}
          </div>
        ) : (
          <Card className={styles.emptyCard}>
            <EmptyState
              title="Навыков пока нет"
              description="Добавь навык к квесту в Дневном плане — и он появится здесь после выполнения."
            />
          </Card>
        )}
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          CURRENT STATE
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>Состояние сегодня</h2>
        <Card className={styles.stateCard}>
          {todayState ? (
            <div className={styles.stateGrid}>
              {[
                { label: "Энергия", icon: "⚡", value: todayState.energy },
                { label: "Настроение", icon: "😊", value: todayState.mood },
                { label: "Усталость", icon: "😴", value: todayState.fatigue },
                { label: "Фокус", icon: "🎯", value: todayState.focus },
              ].map(({ label, icon, value }) => (
                <div key={label} className={styles.statePill}>
                  <span className={styles.stateIcon}>{icon}</span>
                  <span className={styles.stateLabel}>{label}</span>
                  <div className={styles.stateBarTrack}>
                    <div
                      className={styles.stateBarFill}
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <span className={styles.stateValue}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Состояние не определено"
              description="Состояние пока не определено. Оно появится после первого вечернего отчёта."
            />
          )}
        </Card>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          TODAY'S GROWTH
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>Рост сегодня</h2>
        <Card className={styles.growthCard}>
          {todayXpEvents.length > 0 ? (
            <ul className={styles.eventList}>
              {todayXpEvents.map((ev) => (
                <li key={ev.id} className={styles.eventItem}>
                  <span className={styles.eventAmount} style={{ color: accentColor }}>
                    +{ev.amount} XP
                  </span>
                  <span className={styles.eventReason}>
                    {ev.eventDescription ?? ev.reason ?? "Достижение"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Сегодня ещё не было отчёта"
              description="Расскажи, как прошёл твой день — и сигил наполнится новой силой."
            />
          )}
        </Card>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          RECENT EVENTS
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>Последние события</h2>
        <Card>
          {xpEvents.length > 0 ? (
            <ul className={styles.eventList}>
              {xpEvents.slice(0, 10).map((ev) => (
                <li key={ev.id} className={styles.eventItem}>
                  <span className={styles.eventDate}>{formatXpDate(ev.createdAt)}</span>
                  <span className={styles.eventReason}>
                    {ev.eventDescription ?? ev.reason ?? "Достижение"}
                  </span>
                  <span className={styles.eventAmount} style={{ color: accentColor }}>
                    +{ev.amount} XP
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="История пуста"
              description="Твои события начнут появляться здесь после первого вечернего отчёта."
            />
          )}
        </Card>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          CHARACTER EVOLUTION
      ══════════════════════════════════════════════════════════ */}
      <RevealSection>
        <h2 className={styles.sectionTitle}>День {dayCount} в Кузнице</h2>
        <Card className={styles.evolutionCard}>
          {attrDeltas.length > 0 && (
            <div className={styles.evolutionDeltas}>
              <p className={styles.evolutionSubtitle}>Рост характеристик:</p>
              <div className={styles.deltasGrid}>
                {attrDeltas.map(({ label, delta }) => (
                  <div key={label} className={styles.deltaItem}>
                    <span className={styles.deltaLabel}>{label}</span>
                    <span className={styles.deltaValue} style={{ color: accentColor }}>
                      +{delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {characterSkills.length > 0 && (
            <p className={styles.evolutionStat}>
              <span className={styles.evolutionNum} style={{ color: accentColor }}>
                {characterSkills.length}
              </span>{" "}
              {characterSkills.length === 1 ? "навык развивается" : "навыков развивается"}
            </p>
          )}

          {attrDeltas.length === 0 && characterSkills.length === 0 && (
            <EmptyState
              title="Твоя история начнётся с первого квеста"
              description="Выполни квест с атрибутом или навыком — и здесь появится твой прогресс."
            />
          )}
        </Card>
      </RevealSection>
    </div>
  );
};

export default HomePage;
