import { defineConfig } from "vitest/config";

/** Config of `npm run eval:day-report` / `eval:day-plan` (real model calls) — kept out of the regular `npm test` run */
export default defineConfig({
  test: {
    include: ["scripts/**/*.eval.ts"],
    testTimeout: 15 * 60_000,
    // print the eval report straight to the terminal
    silent: false,
    disableConsoleIntercept: true,
  },
});
