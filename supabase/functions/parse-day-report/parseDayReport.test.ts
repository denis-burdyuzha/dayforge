import { describe, expect, it } from "vitest";

import { handleRequest } from "./handler.ts";
import { parseDayReport, type ParseDeps, sanitizeEvents } from "./parseDayReport.ts";
import type {
  AiProvider,
  AttemptLog,
  DayReportStore,
  ParseContext,
  ProviderInput,
} from "./types.ts";
import { ProviderError } from "./types.ts";

const USER = "11111111-1111-1111-1111-111111111111";

const CONTEXT: ParseContext = {
  skills: [
    {
      id: "skill-en",
      name: "Английский",
      aliases: ["англ", "English"],
      attributes: ["intelligence"],
    },
    { id: "skill-run", name: "Бег", aliases: [], attributes: ["endurance"] },
  ],
  plannedQuests: [{ id: "quest-run", title: "Пробежка", skill: "Бег" }],
};

const event = (over: Record<string, unknown> = {}) => ({
  description: "Пробежка 5 км",
  hours: 0.5,
  plannedQuestId: "quest-run",
  skill: { kind: "existing", skillId: "skill-run" },
  confidence: "high",
  note: null,
  ...over,
});

function memoryStore(used = 0): DayReportStore & { logs: AttemptLog[] } {
  const logs: AttemptLog[] = [];
  return {
    logs,
    countParseRequestsSince: async () => used,
    loadContext: async () => CONTEXT,
    logAttempt: async (log) => {
      logs.push(log);
      return `parse-${logs.length}`;
    },
  };
}

type Step = unknown | ProviderError | "hang";

function scriptedProvider(steps: Step[]): AiProvider & { calls: ProviderInput[] } {
  const calls: ProviderInput[] = [];
  return {
    model: "test-model",
    calls,
    async parseDayReport(input, { signal }) {
      calls.push(input);
      const step = steps[calls.length - 1];
      if (step === "hang") {
        return new Promise((_, reject) =>
          signal.addEventListener("abort", () => reject(new Error("aborted"))),
        );
      }
      if (step instanceof ProviderError) throw step;
      return step;
    },
  };
}

const deps = (
  provider: AiProvider,
  store = memoryStore(),
): ParseDeps & { store: ReturnType<typeof memoryStore> } => ({
  provider,
  store,
  timeoutMs: 30,
});

const BODY = { reportDate: "2026-11-20", text: "Утром пробежал 5 км, полчаса" };

describe("parseDayReport — input and limits", () => {
  it("rejects text shorter than 3 / longer than 4000 chars and a bad date", async () => {
    const p = scriptedProvider([]);
    for (const body of [
      { reportDate: "2026-11-20", text: "ok" },
      { reportDate: "2026-11-20", text: "a".repeat(4001) },
      { reportDate: "20.11.2026", text: "нормальный текст" },
      { text: "нормальный текст" },
    ]) {
      const r = await parseDayReport(deps(p), USER, body);
      expect(r).toMatchObject({ ok: false, status: 400, code: "INVALID_INPUT" });
    }
    expect(p.calls).toHaveLength(0);
  });

  it("returns 429 RATE_LIMIT after 20 parse requests today, without calling the model", async () => {
    const p = scriptedProvider([{ events: [] }]);
    const r = await parseDayReport(deps(p, memoryStore(20)), USER, BODY);
    expect(r).toMatchObject({ ok: false, status: 429, code: "RATE_LIMIT" });
    expect(p.calls).toHaveLength(0);
  });
});

describe("parseDayReport — model calls", () => {
  it("valid answer → parseId of the logged ok attempt + sanitized events", async () => {
    const p = scriptedProvider([{ events: [event()] }]);
    const d = deps(p);
    const r = await parseDayReport(d, USER, BODY);
    expect(r).toEqual({
      ok: true,
      parseId: "parse-1",
      events: [
        {
          description: "Пробежка 5 км",
          hours: 0.5,
          plannedQuestId: "quest-run",
          skill: { kind: "existing", skillId: "skill-run" },
          confidence: "high",
          note: null,
        },
      ],
    });
    expect(d.store.logs).toHaveLength(1);
    expect(d.store.logs[0]).toMatchObject({
      status: "ok",
      attempt: 1,
      model: "test-model",
      userId: USER,
    });
    expect(p.calls[0]?.context).toEqual(CONTEXT);
  });

  it("timeout (real abort after timeoutMs) → one retry → ok; both attempts logged", async () => {
    const p = scriptedProvider(["hang", { events: [event()] }]);
    const d = deps(p);
    const r = await parseDayReport(d, USER, BODY);
    expect(r).toMatchObject({ ok: true, parseId: "parse-2" });
    expect(d.store.logs.map((l) => [l.attempt, l.status])).toEqual([
      [1, "timeout"],
      [2, "ok"],
    ]);
    expect(p.calls[1]?.validationError).toBeUndefined();
  });

  it("two timeouts → 504 AI_TIMEOUT", async () => {
    const p = scriptedProvider([
      new ProviderError("timeout", "t"),
      new ProviderError("timeout", "t"),
    ]);
    const d = deps(p);
    expect(await parseDayReport(d, USER, BODY)).toMatchObject({
      ok: false,
      status: 504,
      code: "AI_TIMEOUT",
    });
    expect(d.store.logs.map((l) => l.status)).toEqual(["timeout", "timeout"]);
  });

  it("invalid answer → retry WITH the validation error and the previous output → ok", async () => {
    const bad = { events: [event({ hours: "два" })] };
    const p = scriptedProvider([bad, { events: [event()] }]);
    const d = deps(p);
    const r = await parseDayReport(d, USER, BODY);
    expect(r).toMatchObject({ ok: true, parseId: "parse-2" });
    expect(p.calls[1]?.validationError).toMatch(/events\.0\.hours/);
    expect(p.calls[1]?.previousOutput).toEqual(bad);
    expect(d.store.logs[0]).toMatchObject({ status: "invalid_output", rawOutput: bad });
  });

  it("two invalid answers → 502 AI_INVALID_OUTPUT", async () => {
    const p = scriptedProvider([{ nope: true }, new ProviderError("invalid", "no tool call")]);
    const d = deps(p);
    expect(await parseDayReport(d, USER, BODY)).toMatchObject({
      ok: false,
      code: "AI_INVALID_OUTPUT",
    });
    expect(d.store.logs.map((l) => l.status)).toEqual(["invalid_output", "invalid_output"]);
  });

  it("API error → 502 AI_ERROR at once, no retry", async () => {
    const p = scriptedProvider([new ProviderError("error", "500 overloaded")]);
    const d = deps(p);
    expect(await parseDayReport(d, USER, BODY)).toMatchObject({
      ok: false,
      status: 502,
      code: "AI_ERROR",
    });
    expect(p.calls).toHaveLength(1);
    expect(d.store.logs).toHaveLength(1);
  });
});

describe("sanitizeEvents", () => {
  const sanitize = (events: unknown[]) =>
    sanitizeEvents({ events } as Parameters<typeof sanitizeEvents>[0], CONTEXT);

  it("foreign skillId → new skill to review (low); unknown / repeated planned quest → null", () => {
    const [a, b] = sanitize([
      event({
        skill: { kind: "existing", skillId: "someone-elses" },
        plannedQuestId: "quest-of-b",
      }),
      event({ plannedQuestId: "quest-run" }),
    ]);
    expect(a).toMatchObject({
      plannedQuestId: null,
      skill: { kind: "new", attributes: [], icon: "misc" },
      confidence: "low",
    });
    expect(a?.note).toMatch(/навык не найден/);
    expect(b?.plannedQuestId).toBe("quest-run");

    const [c, d] = sanitize([event(), event()]);
    expect(c?.plannedQuestId).toBe("quest-run");
    expect(d?.plannedQuestId).toBeNull();
  });

  it("hours: rounded to 0.1, > 8 → 8 (low + note), < 0.1 → 0.1", () => {
    const [a, b, c] = sanitize([event({ hours: 1.26 }), event({ hours: 20 }), event({ hours: 0 })]);
    expect(a?.hours).toBe(1.3);
    expect(b).toMatchObject({ hours: 8, confidence: "low" });
    expect(b?.note).toMatch(/8 ч/);
    expect(c?.hours).toBe(0.1);
  });

  it("a «new» skill matching a name or alias → the existing skill; icon outside the list → misc; ≤ 2 attrs", () => {
    const [a, b] = sanitize([
      event({
        skill: { kind: "new", name: "  english ", attributes: ["intelligence"], icon: "languages" },
      }),
      event({
        skill: {
          kind: "new",
          name: "шахматы",
          attributes: ["focus", "focus", "intelligence"],
          icon: "dragon",
        },
      }),
    ]);
    expect(a?.skill).toEqual({ kind: "existing", skillId: "skill-en" });
    expect(b?.skill).toEqual({
      kind: "new",
      name: "Шахматы",
      attributes: ["focus", "intelligence"],
      icon: "misc",
    });
  });

  it("low confidence always carries a note", () => {
    const [a] = sanitize([event({ confidence: "low", note: null })]);
    expect(a?.note).toBeTruthy();
  });
});

describe("handleRequest", () => {
  const handlerDeps = (provider: AiProvider, store = memoryStore()) => ({
    authenticate: async (auth: string) => (auth === "Bearer good" ? USER : null),
    parseDeps: () => deps(provider, store),
  });
  const post = (body: unknown, auth = "Bearer good") =>
    new Request("http://x/parse-day-report", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("CORS preflight, 405, 401", async () => {
    const d = handlerDeps(scriptedProvider([]));
    expect((await handleRequest(new Request("http://x", { method: "OPTIONS" }), d)).status).toBe(
      200,
    );
    expect((await handleRequest(new Request("http://x", { method: "GET" }), d)).status).toBe(405);
    const unauth = await handleRequest(post(BODY, "Bearer bad"), d);
    expect(unauth.status).toBe(401);
    expect(await unauth.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: expect.any(String) },
    });
  });

  it("200 with { parseId, events }; 429 with RATE_LIMIT", async () => {
    const ok = await handleRequest(
      post(BODY),
      handlerDeps(scriptedProvider([{ events: [event()] }])),
    );
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ parseId: "parse-1", events: [{ hours: 0.5 }] });

    const limited = await handleRequest(
      post(BODY),
      handlerDeps(scriptedProvider([]), memoryStore(20)),
    );
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({ error: { code: "RATE_LIMIT" } });
  });
});
