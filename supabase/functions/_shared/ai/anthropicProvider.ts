/**
 * AiProvider on the Anthropic Messages API: one forced call of a strict tool.
 * - No temperature: the SDK (≥ 1.0) speaks API version 2026-10-21, where sampling parameters are rejected.
 * - Prompt caching: tools render before system, so a cache breakpoint on the (static) system block caches
 *   the tool definition + instructions + catalogs; the per-user context and the text go in the user turn.
 */
import Anthropic from "@anthropic-ai/sdk";

import { type AiProvider, ProviderError, type ToolRequest, type ToolResponse } from "./provider.ts";

export const DEFAULT_MODEL = "claude-haiku-5-5";

export interface AnthropicProviderOptions {
  apiKey?: string | undefined;
  model?: string | undefined;
  timeoutMs: number;
  maxTokens?: number | undefined;
  /** tests only: a fake fetch for the SDK client */
  fetch?: typeof fetch | undefined;
}

export class AnthropicProvider implements AiProvider {
  readonly model: string;
  private readonly client: Anthropic;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;

  constructor(options: AnthropicProviderOptions) {
    this.model = options.model || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs;
    this.maxTokens = options.maxTokens ?? 8192;
    // retries are the caller's job (one retry on timeout / invalid output)
    this.client = new Anthropic({
      ...(options.apiKey ? { apiKey: options.apiKey } : {}),
      ...(options.fetch ? { fetch: options.fetch } : {}),
      maxRetries: 0,
    });
  }

  async callTool(request: ToolRequest, { signal }: { signal: AbortSignal }): Promise<ToolResponse> {
    const { tool } = request;
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: this.maxTokens,
          system: [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }],
          tools: [
            {
              name: tool.name,
              description: tool.description,
              strict: true,
              input_schema: tool.inputSchema as unknown as Anthropic.Tool.InputSchema,
            },
          ],
          tool_choice: { type: "tool", name: tool.name },
          messages: [{ role: "user", content: request.user }],
        },
        { signal, timeout: this.timeoutMs },
      );
    } catch (error) {
      if (
        error instanceof Anthropic.APIConnectionTimeoutError ||
        error instanceof Anthropic.APIUserAbortError
      ) {
        throw new ProviderError("timeout", "model request timed out", { cause: error });
      }
      if (error instanceof Anthropic.APIError) {
        throw new ProviderError(
          "error",
          `Anthropic API error ${error.status ?? ""}: ${error.message}`,
          { cause: error },
        );
      }
      throw new ProviderError("error", error instanceof Error ? error.message : String(error), {
        cause: error,
      });
    }

    if (response.stop_reason === "refusal") {
      throw new ProviderError("error", "the model declined the request");
    }
    if (response.stop_reason === "max_tokens") {
      throw new ProviderError("invalid", "the answer was cut off (max_tokens)");
    }
    const call = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === tool.name,
    );
    if (!call) {
      throw new ProviderError("invalid", `the model did not call ${tool.name}`);
    }
    const u = response.usage;
    return {
      input: call.input,
      usage: u
        ? {
            inputTokens: u.input_tokens ?? 0,
            outputTokens: u.output_tokens ?? 0,
            cacheReadInputTokens: u.cache_read_input_tokens ?? 0,
            cacheCreationInputTokens: u.cache_creation_input_tokens ?? 0,
          }
        : null,
    };
  }
}
