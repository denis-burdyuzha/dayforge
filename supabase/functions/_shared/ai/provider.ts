/** The model behind the AI parsers: one forced tool call per request. */

/** A request split for prompt caching: `system` never changes between users, `user` carries everything else */
export interface ToolRequest {
  /** static instructions + catalogs — cached (cache_control) together with the tool definition */
  system: string;
  tool: {
    name: string;
    description: string;
    /** strict JSON Schema of the tool input */
    inputSchema: Record<string, unknown>;
  };
  /** per-request part: user context (skills, quests) and the text */
  user: string;
}

/** Token usage of one call, as reported by the API (for cost and cache checks) */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
}

export interface ToolResponse {
  /** raw tool input — validated by the caller */
  input: unknown;
  usage: TokenUsage | null;
}

export interface AiProvider {
  readonly model: string;
  callTool(request: ToolRequest, options: { signal: AbortSignal }): Promise<ToolResponse>;
}

/** Thrown by a provider: `timeout` / `invalid` → retried once, `error` → AI_ERROR at once */
export class ProviderError extends Error {
  readonly kind: "timeout" | "error" | "invalid";

  constructor(
    kind: "timeout" | "error" | "invalid",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ProviderError";
    this.kind = kind;
  }
}
