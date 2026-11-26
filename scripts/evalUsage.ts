/**
 * Token usage summary for the evals: totals, how many calls read the prompt cache, and an approximate cost.
 * Prices: Claude Haiku 5.5, prompts ≤ 100K tokens — $0.10 / $0.50 per MTok in/out, cache read 0.1×,
 * 5-minute cache write 1.25×. Other models: tokens only (the cost line says so).
 */
import type { TokenUsage } from "../supabase/functions/_shared/ai/provider.ts";

const PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

export function summarizeUsage(model: string, usages: Array<TokenUsage | null>): string {
  const known = usages.filter((u): u is TokenUsage => u !== null);
  if (known.length === 0) return "usage: нет данных";
  const sum = (k: keyof TokenUsage) => known.reduce((a, u) => a + u[k], 0);
  const input = sum("inputTokens");
  const output = sum("outputTokens");
  const read = sum("cacheReadInputTokens");
  const write = sum("cacheCreationInputTokens");
  const withRead = known.filter((u) => u.cacheReadInputTokens > 0).length;

  const price = PRICES[model];
  let cost = "стоимость: прайс для этой модели не задан";
  if (price) {
    const usd =
      (input * price.input +
        read * price.input * 0.1 +
        write * price.input * 1.25 +
        output * price.output) /
      1_000_000;
    cost = `≈ $${usd.toFixed(4)} всего, ≈ $${(usd / known.length).toFixed(5)} за вызов`;
  }
  return (
    `usage (${known.length} вызовов): input ${input}, cache read ${read}, cache write ${write}, output ${output}` +
    ` | вызовов с cache read: ${withRead}/${known.length} | ${cost}`
  );
}
