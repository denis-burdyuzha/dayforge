import { describe, expect, it } from "vitest";

import { AnthropicProvider, DEFAULT_MODEL } from "./anthropicProvider.ts";
import { SUBMIT_TOOL_NAME } from "./schema.ts";
import type { ProviderError } from "./types.ts";
import { type ProviderInput } from "./types.ts";

const INPUT: ProviderInput = {
  reportDate: "2026-11-20",
  text: "Пробежал 5 км",
  context: { skills: [], plannedQuests: [] },
};

const message = (over: Record<string, unknown>) => ({
  id: "msg_1",
  type: "message",
  role: "assistant",
  model: DEFAULT_MODEL,
  stop_reason: "tool_use",
  stop_details: null,
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 10 },
  content: [{ type: "tool_use", id: "toolu_1", name: SUBMIT_TOOL_NAME, input: { events: [] } }],
  ...over,
});

function fakeFetch(respond: () => Response) {
  const requests: Array<{ url: string; body: Record<string, unknown>; headers: Headers }> = [];
  const f = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({
      url: String(url),
      body: JSON.parse(String(init?.body ?? "{}")),
      headers: new Headers(init?.headers),
    });
    return respond();
  }) as typeof fetch;
  return { f, requests };
}

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const signal = () => new AbortController().signal;

describe("AnthropicProvider", () => {
  it("forces one strict tool call, default model, no temperature; returns the tool input", async () => {
    const { f, requests } = fakeFetch(() => ok(message({})));
    const provider = new AnthropicProvider({ apiKey: "test", timeoutMs: 20_000, fetch: f });
    expect(provider.model).toBe("claude-haiku-4-5");

    const out = await provider.parseDayReport(INPUT, { signal: signal() });
    expect(out).toEqual({ events: [] });

    const body = requests[0]?.body ?? {};
    expect(body.model).toBe("claude-haiku-4-5");
    expect(body).not.toHaveProperty("temperature");
    expect(body.tool_choice).toEqual({ type: "tool", name: SUBMIT_TOOL_NAME });
    expect((body.tools as Array<Record<string, unknown>>)[0]).toMatchObject({
      name: SUBMIT_TOOL_NAME,
      strict: true,
    });
    expect(requests[0]?.headers.get("anthropic-version")).toBe("2026-10-21");
  });

  it("uses AI_MODEL when given", async () => {
    const { f, requests } = fakeFetch(() => ok(message({})));
    await new AnthropicProvider({
      apiKey: "t",
      model: "claude-haiku-5-5",
      timeoutMs: 1000,
      fetch: f,
    }).parseDayReport(INPUT, { signal: signal() });
    expect(requests[0]?.body.model).toBe("claude-haiku-5-5");
  });

  it("refusal → error; max_tokens / no tool call → invalid; API 500 → error", async () => {
    const cases: Array<[() => Response, ProviderError["kind"]]> = [
      [() => ok(message({ stop_reason: "refusal", content: [] })), "error"],
      [() => ok(message({ stop_reason: "max_tokens" })), "invalid"],
      [
        () => ok(message({ stop_reason: "end_turn", content: [{ type: "text", text: "привет" }] })),
        "invalid",
      ],
      [
        () =>
          new Response(
            JSON.stringify({ type: "error", error: { type: "api_error", message: "boom" } }),
            {
              status: 500,
              headers: { "content-type": "application/json" },
            },
          ),
        "error",
      ],
    ];
    for (const [respond, kind] of cases) {
      const { f } = fakeFetch(respond);
      const provider = new AnthropicProvider({ apiKey: "t", timeoutMs: 1000, fetch: f });
      await expect(provider.parseDayReport(INPUT, { signal: signal() })).rejects.toMatchObject({
        kind,
      });
    }
  });

  it("an aborted request → timeout", async () => {
    const f = ((_url: unknown, init?: RequestInit) =>
      new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      })) as typeof fetch;
    const controller = new AbortController();
    const provider = new AnthropicProvider({ apiKey: "t", timeoutMs: 20_000, fetch: f });
    const pending = provider.parseDayReport(INPUT, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ kind: "timeout" });
  });
});
