import { describe, expect, it } from "vitest";

import type { ToolRequest } from "../_shared/ai/provider.ts";
import { handleRequest } from "./handler.ts";
import { localDate, parseDayPlan, type PlanParseDeps, sanitizeItems } from "./parseDayPlan.ts";
import type { ModelOutput } from "./schema.ts";
import type { AiProvider, DayPlanStore, PlanAttemptLog, PlanParseContext } from "./types.ts";
import { ProviderError } from "./types.ts";

const USER = "11111111-1111-1111-1111-111111111111";

const CONTEXT: PlanParseContext = {
  skills: [
    { id: "skill-en", name: "Английский", aliases: ["англ"], attributes: ["intelligence"] },
    { id: "skill-run", name: "Бег", aliases: [], attributes: ["endurance"] },
  ],
  quests: [
    { id: "q1", title: "Пробежка", startTime: "07:00", durationMinutes: 30, status: "pending" },
  ],
};

const item = (over: Record<string, unknown> = {}) => ({
  title: "Урок английского",
  startTime: "10:00",
  durationMinutes: 60,
  skill: { kind: "existing", skillId: "skill-en" },
  duplicateOfExisting: false,
  confidence: "high",
  note: null,
  ...over,
});

function memoryStore(used = 0): DayPlanStore & { logs: PlanAttemptLog[] } {
  const logs: PlanAttemptLog[] = [];
  return {
    logs,
    countParseRequestsSince: async () => used,
    loadContext: async () => CONTEXT,
    logAttempt: async (log) => {
      logs.push(log);
      return `plan-parse-${logs.length}`;
    },
  };
}

type Step = unknown | ProviderError | "hang";

function scriptedProvider(steps: Step[]): AiProvider & { calls: ToolRequest[] } {
  const calls: ToolRequest[] = [];
  return {
    model: "test-model",
    calls,
    async callTool(request, { signal }) {
      calls.push(request);
      const step = steps[calls.length - 1];
      if (step === "hang") {
        return new Promise((_, reject) =>
          signal.addEventListener("abort", () => reject(new Error("aborted"))),
        );
      }
      if (step instanceof ProviderError) throw step;
      return {
        input: step,
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          cacheReadInputTokens: 0,
          cacheCreationInputTokens: 0,
        },
      };
    },
  };
}

// 2026-11-27 08:00 in Moscow (UTC+3)
const NOW = new Date("2026-11-27T05:00:00Z");

const deps = (
  provider: AiProvider,
  store = memoryStore(),
): PlanParseDeps & { store: ReturnType<typeof memoryStore> } => ({
  provider,
  store,
  timeoutMs: 30,
  now: () => NOW,
});

const BODY = {
  planDate: "2026-11-27",
  text: "В 10 английский час, вечером пробежка",
  nowLocal: "08:00",
  timezone: "Europe/Moscow",
};

describe("parseDayPlan — input and limits", () => {
  it("rejects bad bodies with 400 INVALID_INPUT and calls no model", async () => {
    const p = scriptedProvider([]);
    for (const body of [
      null,
      { ...BODY, text: "  a " },
      { ...BODY, text: "x".repeat(4001) },
      { ...BODY, planDate: "27.11.2026" },
      { ...BODY, nowLocal: "8:00" },
      { ...BODY, timezone: "Mars/Olympus" },
      { planDate: BODY.planDate, text: BODY.text },
    ]) {
      expect(await parseDayPlan(deps(p), USER, body), JSON.stringify(body)).toMatchObject({
        ok: false,
        status: 400,
        code: "INVALID_INPUT",
      });
    }
    expect(p.calls).toHaveLength(0);
  });

  it("10 plan parses a day → 429 RATE_LIMIT", async () => {
    const p = scriptedProvider([]);
    expect(await parseDayPlan(deps(p, memoryStore(10)), USER, BODY)).toMatchObject({
      ok: false,
      status: 429,
      code: "RATE_LIMIT",
    });
    expect(p.calls).toHaveLength(0);
  });

  it("isToday from the client's time zone", () => {
    expect(localDate(new Date("2026-11-26T22:30:00Z"), "Europe/Moscow")).toBe("2026-11-27");
    expect(localDate(new Date("2026-11-26T22:30:00Z"), "UTC")).toBe("2026-11-26");
    expect(localDate(NOW, "Nope/Nope")).toBeNull();
  });
});

describe("parseDayPlan — model calls", () => {
  it("valid answer → parseId + sanitized items; context and isToday in the user turn; usage logged", async () => {
    const p = scriptedProvider([{ items: [item()] }]);
    const d = deps(p);
    const r = await parseDayPlan(d, USER, BODY);
    expect(r).toEqual({
      ok: true,
      parseId: "plan-parse-1",
      items: [
        {
          title: "Урок английского",
          startTime: "10:00",
          durationMinutes: 60,
          skill: { kind: "existing", skillId: "skill-en" },
          duplicateOfExisting: false,
          confidence: "high",
          note: null,
        },
      ],
    });
    const user = p.calls[0]!.user;
    expect(user).toContain('"isToday": true');
    expect(user).toContain('"nowLocal": "08:00"');
    expect(user).toContain('"id": "skill-en"');
    expect(user).toContain('"title": "Пробежка"');
    expect(user).toContain(BODY.text);
    expect(p.calls[0]!.system).not.toContain("skill-en");
    expect(p.calls[0]!.tool.name).toBe("submit_day_plan");
    expect(d.store.logs[0]).toMatchObject({
      status: "ok",
      attempt: 1,
      planDate: "2026-11-27",
      usage: { inputTokens: 100 },
    });
  });

  it("a plan for another day is not «today»", async () => {
    const p = scriptedProvider([{ items: [item()] }]);
    await parseDayPlan(deps(p), USER, { ...BODY, planDate: "2026-11-28" });
    expect(p.calls[0]!.user).toContain('"isToday": false');
  });

  it("dayStartTime: before the boundary «today» is the previous date; a bad boundary → 400", async () => {
    // NOW in Moscow is 2026-11-27 morning; a 06:00 boundary with nowLocal 05:00 → the user's day is the 26th
    const p = scriptedProvider([{ items: [item()] }]);
    await parseDayPlan(deps(p), USER, {
      ...BODY,
      planDate: "2026-11-26",
      nowLocal: "05:00",
      dayStartTime: "06:00",
    });
    expect(p.calls[0]!.user).toContain('"isToday": true');
    expect(
      await parseDayPlan(deps(scriptedProvider([])), USER, { ...BODY, dayStartTime: "07:00" }),
    ).toMatchObject({ ok: false, code: "INVALID_INPUT" });
  });

  it("timeout → one retry → ok; invalid → retry with the error → ok", async () => {
    const t = scriptedProvider(["hang", { items: [item()] }]);
    const dt = deps(t);
    expect(await parseDayPlan(dt, USER, BODY)).toMatchObject({ ok: true, parseId: "plan-parse-2" });
    expect(dt.store.logs.map((l) => l.status)).toEqual(["timeout", "ok"]);

    const bad = { items: [item({ durationMinutes: "час" })] };
    const v = scriptedProvider([bad, { items: [item()] }]);
    const dv = deps(v);
    expect(await parseDayPlan(dv, USER, BODY)).toMatchObject({ ok: true });
    expect(v.calls[1]!.user).toMatch(/не прошёл проверку[\s\S]*items\.0\.durationMinutes/);
    expect(v.calls[1]!.system).toBe(v.calls[0]!.system);
  });

  it("error codes: 2 timeouts → 504 AI_TIMEOUT, 2 invalid → 502 AI_INVALID_OUTPUT, API error → 502 AI_ERROR once", async () => {
    expect(
      await parseDayPlan(
        deps(
          scriptedProvider([new ProviderError("timeout", "t"), new ProviderError("timeout", "t")]),
        ),
        USER,
        BODY,
      ),
    ).toMatchObject({ ok: false, status: 504, code: "AI_TIMEOUT" });
    expect(
      await parseDayPlan(deps(scriptedProvider([{ nope: 1 }, { items: "x" }])), USER, BODY),
    ).toMatchObject({ ok: false, status: 502, code: "AI_INVALID_OUTPUT" });
    const e = scriptedProvider([new ProviderError("error", "500")]);
    const de = deps(e);
    expect(await parseDayPlan(de, USER, BODY)).toMatchObject({
      ok: false,
      status: 502,
      code: "AI_ERROR",
    });
    expect(e.calls).toHaveLength(1);
    expect(de.store.logs).toHaveLength(1);
  });
});

describe("sanitizeItems", () => {
  /** isToday: planDate = the user's today = the calendar date (2026-11-27); else the plan is for tomorrow */
  const sanitize = (items: unknown[], isToday = false, nowLocal = "08:00") =>
    sanitizeItems({ items } as ModelOutput, CONTEXT, {
      planDate: isToday ? "2026-11-27" : "2026-11-28",
      userToday: "2026-11-27",
      calendarDate: "2026-11-27",
      nowLocal,
    });

  it("foreign skillId → new skill named after the item (low); a new name matching an alias → existing", () => {
    const [foreign, alias] = sanitize([
      item({ title: "Вязание", skill: { kind: "existing", skillId: "someone-elses" } }),
      item({ skill: { kind: "new", name: "англ", attributes: ["social"], icon: "languages" } }),
    ]);
    expect(foreign).toMatchObject({
      skill: { kind: "new", name: "Вязание", attributes: [], icon: "misc" },
      confidence: "low",
    });
    expect(foreign!.note).toMatch(/навык не найден/);
    expect(alias!.skill).toEqual({ kind: "existing", skillId: "skill-en" });
  });

  it("duration: multiples of 5 within 5–480; out of range → low + note", () => {
    const [rounded, tiny, huge] = sanitize([
      item({ durationMinutes: 47 }),
      item({ durationMinutes: 2 }),
      item({ durationMinutes: 600 }),
    ]);
    expect(rounded).toMatchObject({ durationMinutes: 45, confidence: "high" });
    expect(tiny).toMatchObject({ durationMinutes: 5, confidence: "low" });
    expect(huge).toMatchObject({ durationMinutes: 480, confidence: "low" });
    expect(huge!.note).toMatch(/больше 8 ч/);
  });

  it("time: H:MM padded, garbage → null (low); on today a past time moves after now (low)", () => {
    const [padded, garbage] = sanitize([item({ startTime: "9:05" }), item({ startTime: "утром" })]);
    expect(padded!.startTime).toBe("09:05");
    expect(garbage).toMatchObject({ startTime: null, confidence: "low" });

    const [past, future] = sanitize(
      [item({ startTime: "07:00" }), item({ startTime: "18:00" })],
      true,
      "15:32",
    );
    expect(past).toMatchObject({ startTime: "15:35", confidence: "low" });
    expect(past!.note).toMatch(/07:00 уже прошло — сдвинуто на 15:35/);
    expect(future).toMatchObject({ startTime: "18:00", confidence: "high" });

    // not today: the same early time stays
    expect(sanitize([item({ startTime: "07:00" })], false, "15:32")[0]!.startTime).toBe("07:00");
  });

  it("past items cascade after now, in time order, each after the previous one", () => {
    const [b, a, keep] = sanitize(
      [
        item({ startTime: "09:00", durationMinutes: 30 }),
        item({ startTime: "07:00", durationMinutes: 60 }),
        item({ startTime: "20:00" }),
      ],
      true,
      "15:32",
    );
    expect(a!.startTime).toBe("15:35"); // earliest first
    expect(b!.startTime).toBe("16:35"); // after a (60 min)
    expect(keep!.startTime).toBe("20:00");
  });

  it("night before the day boundary: the user's day is the previous date", () => {
    const opts = { userToday: "2026-11-26", calendarDate: "2026-11-27", nowLocal: "01:00" };
    // planning the user's today (26th) at 01:00 on the 27th: all its times are past, no slot left
    const [late] = sanitizeItems(
      { items: [item({ startTime: "22:00" })] } as ModelOutput,
      CONTEXT,
      {
        ...opts,
        planDate: "2026-11-26",
      },
    );
    expect(late).toMatchObject({ startTime: null, confidence: "low" });
    // planning the next day (27th = calendar today): morning stays, 00:30 is past → after 01:00
    const [night, morning] = sanitizeItems(
      { items: [item({ startTime: "00:30" }), item({ startTime: "08:00" })] } as ModelOutput,
      CONTEXT,
      { ...opts, planDate: "2026-11-27" },
    );
    expect(night!.startTime).toBe("01:00");
    expect(morning!.startTime).toBe("08:00");
  });

  it("duplicate: the model flag or the same title as a quest on the date", () => {
    const [byTitle, byModel, fresh] = sanitize([
      item({ title: "  пробежка " }),
      item({ title: "Утренняя пробежка", duplicateOfExisting: true }),
      item({ title: "Чтение" }),
    ]);
    expect(byTitle!.duplicateOfExisting).toBe(true);
    expect(byModel!.duplicateOfExisting).toBe(true);
    expect(fresh!.duplicateOfExisting).toBe(false);
  });

  it("low confidence always carries a note", () => {
    const [x] = sanitize([item({ confidence: "low", note: null })]);
    expect(x!.note).toBeTruthy();
  });
});

describe("handleRequest", () => {
  const handlerDeps = (provider: AiProvider, store = memoryStore()) => ({
    authenticate: async (a: string) => (a === "Bearer good" ? USER : null),
    parseDeps: () => deps(provider, store),
  });
  const post = (body: unknown, auth = "Bearer good") =>
    new Request("http://x/parse-day-plan", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("401 without a valid JWT; 200 { parseId, items }; 429 envelope", async () => {
    const p = scriptedProvider([{ items: [item()] }]);
    expect((await handleRequest(post(BODY, "Bearer bad"), handlerDeps(p))).status).toBe(401);
    const ok = await handleRequest(post(BODY), handlerDeps(p));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({
      parseId: "plan-parse-1",
      items: [{ startTime: "10:00" }],
    });
    const limited = await handleRequest(post(BODY), handlerDeps(p, memoryStore(10)));
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({ error: { code: "RATE_LIMIT" } });
  });
});
