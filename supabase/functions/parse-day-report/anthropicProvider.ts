/**
 * AiProvider on the Anthropic Messages API: one forced call of a strict tool whose input schema is the event
 * list. No temperature: the SDK (≥ 1.0) speaks API version 2026-10-21, where sampling parameters are
 * rejected — the strict schema + server-side Zod validation keep the output in shape.
 */
import Anthropic from "@anthropic-ai/sdk";

import { buildUserMessage, SYSTEM_PROMPT } from "./prompt.ts";
import { SUBMIT_TOOL_INPUT_SCHEMA, SUBMIT_TOOL_NAME } from "./schema.ts";
import { type AiProvider, ProviderError, type ProviderInput } from "./types.ts";

export const DEFAULT_MODEL = "claude-haiku-4-5";

export interface AnthropicProviderOptions {
  apiKey?: string | undefined;
  model?: string | undefined;
  timeoutMs: number;
  /** tests only: a fake fetch for the SDK client */
  fetch?: typeof fetch | undefined;
}

export class AnthropicProvider implements AiProvider {
  readonly model: string;
  private readonly client: Anthropic;
  private readonly timeoutMs: number;

  constructor(options: AnthropicProviderOptions) {
    this.model = options.model || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs;
    // retries are the caller's job (one retry on timeout / invalid output)
    this.client = new Anthropic({
      ...(options.apiKey ? { apiKey: options.apiKey } : {}),
      ...(options.fetch ? { fetch: options.fetch } : {}),
      maxRetries: 0,
    });
  }

  async parseDayReport(
    input: ProviderInput,
    { signal }: { signal: AbortSignal },
  ): Promise<unknown> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: [
            {
              name: SUBMIT_TOOL_NAME,
              description:
                "Сохранить события дня, извлечённые из отчёта пользователя. Вызывается ровно один раз.",
              strict: true,
              input_schema: SUBMIT_TOOL_INPUT_SCHEMA as unknown as Anthropic.Tool.InputSchema,
            },
          ],
          tool_choice: { type: "tool", name: SUBMIT_TOOL_NAME },
          messages: [{ role: "user", content: buildUserMessage(input) }],
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
          {
            cause: error,
          },
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
        block.type === "tool_use" && block.name === SUBMIT_TOOL_NAME,
    );
    if (!call) {
      throw new ProviderError("invalid", `the model did not call ${SUBMIT_TOOL_NAME}`);
    }
    return call.input;
  }
}
