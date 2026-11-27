/**
 * Invariants of the universal attribute FX system, checked on every fox tier (L1–L5) and preset.
 * Geometry is verified numerically; colours and animations are verified on the server-rendered markup.
 * (Visual look itself is NOT covered — see docs/ai-context/progress.md.)
 */

import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { computeAvatarParams } from "../../../model/avatarEngine";
import type { CharacterAttribute } from "../../../model/characterTypes";
import { getFoxAnatomy } from "../creatures/fox/foxAnatomy";
import { FOX_TIER_CONFIG } from "../creatures/fox/foxEvolutionConfig";
import { type FoxTierIndex, getTierPolys, preloadAllFoxTiers } from "../creatures/fox/foxZones";
import { ModularAvatar } from "../ModularAvatar";
import { AttributeFxLayer } from "./AttributeFxLayer";
import { createBodyToneResolver } from "./bodyTone";
import { computeCreativitySign } from "./computeCreativity";
import { computeDisciplineCrystals } from "./computeDiscipline";
import { computeEnduranceScars } from "./computeEndurance";
import { computeIntelligenceNetwork } from "./computeIntelligence";
import { computeSocialConstellation } from "./computeSocial";
import { computeStrengthSpikes } from "./computeStrength";
import { type AttributeValues, createFxContext, FX_TOP_BAND, type FxContext } from "./fxContext";
import { fxStep } from "./fxSeed";

const TIERS: FoxTierIndex[] = [1, 2, 3, 4, 5];

function values(base: number, over: Partial<AttributeValues> = {}): AttributeValues {
  return {
    strength: base,
    endurance: base,
    discipline: base,
    intelligence: base,
    focus: base,
    social: base,
    creativity: base,
    ...over,
  };
}

const PRESETS: Record<string, AttributeValues> = {
  Новичок: values(1),
  Атлет: values(2, { strength: 14, endurance: 12, discipline: 10 }),
  Учёный: values(2, { intelligence: 15, focus: 12, creativity: 8 }),
  "Душа компании": values(2, { social: 15, creativity: 12 }),
  "Всё на 18": values(18),
  "Всё на 9": values(9),
};

function ctxFor(tier: FoxTierIndex, v: AttributeValues, seedKey = "char-A"): FxContext {
  const cfg = Object.values(FOX_TIER_CONFIG).find((c) => c.tierIndex === tier)!;
  return createFxContext({
    anatomy: getFoxAnatomy(tier),
    classId: "explorer",
    values: v,
    seedKey,
    transform: { tx: cfg.tx, ty: cfg.ty, scale: cfg.scale },
  });
}

function markup(ctx: FxContext): string {
  return [
    renderToStaticMarkup(
      <svg>
        <AttributeFxLayer ctx={ctx} layer="back" />
      </svg>,
    ),
    renderToStaticMarkup(
      <svg>
        <AttributeFxLayer ctx={ctx} layer="front" />
      </svg>,
    ),
    renderToStaticMarkup(<AttributeFxLayer ctx={ctx} layer="overlay" />),
  ].join("\n");
}

const hexRgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/** colour lies on accent→light or accent→black (crystal facet shades) */
function isAccentShade(color: string, accent: string, light: string): boolean {
  const c = hexRgb(color);
  const a = hexRgb(accent);
  const l = hexRgb(light);
  for (let t = 0; t <= 1.0001; t += 0.005) {
    const toLight = a.map((x, i) => x + (l[i]! - x) * t);
    const toBlack = a.map((x) => x * (1 - t));
    if (toLight.every((x, i) => Math.abs(x - c[i]!) <= 2)) return true;
    if (toBlack.every((x, i) => Math.abs(x - c[i]!) <= 2)) return true;
  }
  return false;
}

// the fox tier data is a lazy chunk: load all five tiers before the synchronous checks
beforeAll(async () => {
  await preloadAllFoxTiers();
});

describe("attribute FX v2 invariants (fox L1–L5)", () => {
  it("fxStep: 1 → 0, 18 → max, ≥2 → ≥1", () => {
    expect(fxStep(1, 7)).toBe(0);
    expect(fxStep(2, 7)).toBe(1);
    expect(fxStep(18, 7)).toBe(7);
    expect(fxStep(9, 8)).toBe(3);
  });

  it("full ModularAvatar renders for every fox tier × preset (real computeAvatarParams)", () => {
    for (const level of [1, 3, 5, 10, 20, 35, 50]) {
      for (const v of Object.values(PRESETS)) {
        const attrs: CharacterAttribute[] = Object.entries(v).map(([code, value], i) => ({
          id: `a${i}`,
          attributeId: `attr-${code}`,
          code,
          name: code,
          value,
        }));
        const params = computeAvatarParams(
          {
            id: "char-A",
            profileId: "p",
            name: "n",
            class: "explorer",
            level,
            totalXp: 0,
            createdAt: "",
          },
          attrs,
          [],
          null,
        );
        const html = renderToStaticMarkup(<ModularAvatar params={params} size={300} />);
        expect(html).toContain("Explorer Fox Avatar");
      }
    }
  }, 60_000); // 35 full SVG renders — slow when the whole suite runs in parallel

  it("app render has no on-body attribute FX; the playground toggle (legacyAttributeFx) restores them", () => {
    const all18 = Object.fromEntries(Object.keys(PRESETS["Новичок"]!).map((k) => [k, 18]));
    for (const level of [1, 10, 50]) {
      const attrs: CharacterAttribute[] = Object.entries(all18).map(([code, value], i) => ({
        id: `a${i}`,
        attributeId: `attr-${code}`,
        code,
        name: code,
        value,
      }));
      const params = computeAvatarParams(
        {
          id: "char-A",
          profileId: "p",
          name: "n",
          class: "explorer",
          level,
          totalXp: 0,
          createdAt: "",
        },
        attrs,
        [],
        null,
      );
      const off = renderToStaticMarkup(<ModularAvatar params={params} size={300} />);
      expect(off).not.toMatch(/attr-fx-/);
      const on = renderToStaticMarkup(
        <ModularAvatar params={params} size={300} legacyAttributeFx />,
      );
      expect(on).toMatch(/attr-fx-front/);
      expect(on).toMatch(/attr-fx-discipline/);
    }
  });

  for (const tier of TIERS) {
    describe(`L${tier}`, () => {
      it("«Новичок»: no attribute FX elements at all", () => {
        const ctx = ctxFor(tier, PRESETS["Новичок"]!);
        const html = markup(ctx);
        expect(html).not.toMatch(/<(polygon|polyline|line|circle|rect|path)\b/);
        expect(html).not.toMatch(/attr-fx-discipline/);
        expect(computeDisciplineCrystals(ctx)).toBeNull();
        // The asset fill is untouched: every polygon keeps its own colour
        const tone = createBodyToneResolver({
          torsoZones: ctx.anatomy.zones.torso,
          strength: PRESETS["Новичок"]!.strength,
        });
        for (const poly of getTierPolys(tier)) {
          expect(tone(poly), poly.id).toBeUndefined();
        }
      });

      it("«Новичок»: rendered asset polygons keep their exact default fills", () => {
        const level = ({ 1: 1, 2: 3, 3: 10, 4: 35, 5: 50 } as const)[tier];
        const attrs: CharacterAttribute[] = Object.entries(PRESETS["Новичок"]!).map(
          ([code, value], i) => ({
            id: `a${i}`,
            attributeId: `attr-${code}`,
            code,
            name: code,
            value,
          }),
        );
        const params = computeAvatarParams(
          {
            id: "char-A",
            profileId: "p",
            name: "n",
            class: "explorer",
            level,
            totalXp: 0,
            createdAt: "",
          },
          attrs,
          [],
          null,
        );
        const html = renderToStaticMarkup(<ModularAvatar params={params} size={300} />);
        const rendered = new Map<string, string[]>();
        for (const m of html.matchAll(/<polygon id="([^"]+)"[^>]*?fill="([^"]+)"/g)) {
          rendered.set(m[1]!, [...(rendered.get(m[1]!) ?? []), m[2]!]);
        }
        for (const poly of getTierPolys(tier)) {
          const fills = rendered.get(poly.id) ?? [];
          // main asset copy must carry the default fill (the rim-light copy is a separate overlay)
          expect(fills.includes(poly.defaultFill), poly.id).toBe(true);
        }
      });

      for (const [name, v] of Object.entries(PRESETS)) {
        it(`${name}: palette-only colours, only the Intelligence wave animates`, () => {
          const ctx = ctxFor(tier, v);
          const html = markup(ctx);
          const { body, accent, light, bodyLight, shadow } = ctx.palette;
          const allowed = new Set(
            [body, accent, light, bodyLight, shadow].map((c) => c.toLowerCase()),
          );
          const colors = [...html.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
          for (const c of colors) {
            expect(allowed.has(c) || isAccentShade(c, accent, light), `colour ${c}`).toBe(true);
          }
          expect(html).not.toMatch(/f97316|rgb\(/i);
          // animations: <animate> only inside the Intelligence group; no CSS animations
          expect(html).not.toMatch(/animation\s*:/);
          const animateCount = (html.match(/<animate\b/g) ?? []).length;
          const net = computeIntelligenceNetwork(ctx);
          expect(animateCount).toBe(net ? net.nodes.length : 0);
        });

        it(`${name}: effects do not overlap`, () => {
          const ctx = ctxFor(tier, v);
          const { geo, silhouette } = ctx;
          const blocked = new Set([...geo.forehead, ...geo.nape]);
          const sign = computeCreativitySign(ctx);
          for (const id of [...(sign?.path ?? []), ...(sign?.branches.flat() ?? [])]) {
            expect(blocked.has(id), `sign uses ${id}`).toBe(false);
          }
          const net = computeIntelligenceNetwork(ctx);
          const head = new Set(geo.headPolys);
          for (const id of net?.facets ?? []) expect(head.has(id)).toBe(true);

          const bandY = 240 * FX_TOP_BAND;
          const crystals = computeDisciplineCrystals(ctx);
          for (const c of crystals?.crystals ?? []) {
            // whole crystal inside the canvas, below the Social band, ≥4px clear of the silhouette
            expect(c.p[0] - crystals!.halfW).toBeGreaterThanOrEqual(0);
            expect(c.p[0] + crystals!.halfW).toBeLessThanOrEqual(200);
            expect(c.p[1] - crystals!.halfH).toBeGreaterThanOrEqual(bandY);
            expect(c.p[1] + crystals!.halfH).toBeLessThanOrEqual(240);
            expect(silhouette.distanceTo(c.p)).toBeGreaterThanOrEqual(crystals!.radius + 4);
          }
          const social = computeSocialConstellation(ctx);
          const stars = social?.stars ?? [];
          expect(stars.length).toBeLessThanOrEqual(5);
          for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
              const d = Math.hypot(
                stars[i]!.p[0] - stars[j]!.p[0],
                stars[i]!.p[1] - stars[j]!.p[1],
              );
              expect(d, "stars ≥24px apart").toBeGreaterThanOrEqual(24);
            }
          }
          for (const s of stars) {
            // whole star inside the Social band and the canvas (6px), ≥8px from the silhouette
            expect(s.p[1] + s.r).toBeLessThanOrEqual(bandY);
            expect(s.p[1] - s.r).toBeGreaterThanOrEqual(6);
            expect(s.p[0] - s.r).toBeGreaterThanOrEqual(6);
            expect(s.p[0] + s.r).toBeLessThanOrEqual(194);
            expect(silhouette.distanceTo(s.p)).toBeGreaterThanOrEqual(8 + s.r);
          }
        });
      }

      it("counts follow fxStep at «Всё на 18»", () => {
        const ctx = ctxFor(tier, PRESETS["Всё на 18"]!);
        expect(computeStrengthSpikes(ctx)).toHaveLength(7);
        expect(computeEnduranceScars(ctx)).toHaveLength(4);
        expect(computeIntelligenceNetwork(ctx)!.facets).toHaveLength(10);
        // as many as fit (≤6 crystals in free slots, ≤5 stars in the top band)
        const formation = computeDisciplineCrystals(ctx)!;
        expect(formation.crystals).toHaveLength(Math.min(6, formation.freeSlots.length));
        const social = computeSocialConstellation(ctx)!;
        expect(social.stars.length).toBeLessThanOrEqual(5);
        expect(social.threads).toHaveLength(Math.max(0, social.stars.length - 1));
        const sign = computeCreativitySign(ctx)!;
        expect(sign.path.length - 1).toBe(14);
        expect(sign.branches.map((b) => b.length - 1)).toEqual([3, 3]);
      });

      it("same characterId → identical; different characterId → different", () => {
        const v = PRESETS["Всё на 9"]!;
        const a = ctxFor(tier, v, "char-A");
        const a2 = ctxFor(tier, v, "char-A");
        const b = ctxFor(tier, v, "char-B");
        const pick = (c: FxContext) => ({
          sign: computeCreativitySign(c)?.path,
          stars: computeSocialConstellation(c)?.stars,
          scars: computeEnduranceScars(c),
          crystals: computeDisciplineCrystals(c)?.crystals,
        });
        const A = pick(a);
        expect(JSON.stringify(pick(a2))).toBe(JSON.stringify(A));
        const B = pick(b);
        expect(JSON.stringify(B.sign)).not.toBe(JSON.stringify(A.sign));
        expect(JSON.stringify(B.stars)).not.toBe(JSON.stringify(A.stars));
        expect(JSON.stringify(B.scars)).not.toBe(JSON.stringify(A.scars));
        expect(JSON.stringify(B.crystals)).not.toBe(JSON.stringify(A.crystals));
      });
    });
  }
});
