import { describe, expect, it } from "vitest";

import { AnthropicProvider, DEFAULT_MODEL } from "./anthropicProvider.ts";
import type { ProviderError, ToolRequest } from "./provider.ts";

const TOOL = "submit_test";

const REQUEST: ToolRequest = {
  system: "Статические правила",
  tool: {
    name: TOOL,
    description: "Тестовый инструмент",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["items"],
      properties: { items: { type: "array", items: { type: "string" } } },
    },
  },
  user: "Текст пользователя",
};

const message = (over: Record<string, unknown>) => ({
  id: "msg_1",
  type: "message",
  role: "assistant",
  model: DEFAULT_MODEL,
  stop_reason: "tool_use",
  stop_details: null,
  stop_sequence: null,
  usage: {
    input_tokens: 120,
    output_tokens: 40,
    cache_read_input_tokens: 2000,
    cache_creation_input_tokens: 0,
  },
  content: [{ type: "tool_use", id: "toolu_1", name: TOOL, input: { items: [] } }],
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
  it("forces one strict tool call, default model, no temperature; cached static system; returns input + usage", async () => {
    const { f, requests } = fakeFetch(() => ok(message({})));
    const provider = new AnthropicProvider({ apiKey: "test", timeoutMs: 20_000, fetch: f });
    expect(provider.model).toBe("claude-haiku-5-5");

    const out = await provider.callTool(REQUEST, { signal: signal() });
    expect(out).toEqual({
      input: { items: [] },
      usage: {
        inputTokens: 120,
        outputTokens: 40,
        cacheReadInputTokens: 2000,
        cacheCreationInputTokens: 0,
      },
    });

    const body = requests[0]?.body ?? {};
    expect(body.model).toBe("claude-haiku-5-5");
    expect(body).not.toHaveProperty("temperature");
    expect(body.tool_choice).toEqual({ type: "tool", name: TOOL });
    expect((body.tools as Array<Record<string, unknown>>)[0]).toMatchObject({
      name: TOOL,
      strict: true,
    });
    // static part first and cached; the per-user part only in the user turn
    expect(body.system).toEqual([
      { type: "text", text: "Статические правила", cache_control: { type: "ephemeral" } },
    ]);
    expect(body.messages).toEqual([{ role: "user", content: "Текст пользователя" }]);
    expect(requests[0]?.headers.get("anthropic-version")).toBe("2026-10-21");
  });

  it("uses AI_MODEL when given", async () => {
    const { f, requests } = fakeFetch(() => ok(message({})));
    await new AnthropicProvider({
      apiKey: "t",
      model: "claude-sonnet-5-5",
      timeoutMs: 1000,
      fetch: f,
    }).callTool(REQUEST, { signal: signal() });
    expect(requests[0]?.body.model).toBe("claude-sonnet-5-5");
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
            { status: 500, headers: { "content-type": "application/json" } },
          ),
        "error",
      ],
    ];
    for (const [respond, kind] of cases) {
      const { f } = fakeFetch(respond);
      const provider = new AnthropicProvider({ apiKey: "t", timeoutMs: 1000, fetch: f });
      await expect(provider.callTool(REQUEST, { signal: signal() })).rejects.toMatchObject({
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
    const pending = provider.callTool(REQUEST, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ kind: "timeout" });
  });
});
