/**
 * Edge Function parse-day-report (Deno). Wiring only — the logic is in handler.ts / parseDayReport.ts.
 * Secrets: ANTHROPIC_API_KEY (required), AI_MODEL (default claude-haiku-4-5). SUPABASE_URL,
 * SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by the Supabase runtime.
 */
import { createClient } from "@supabase/supabase-js";

import { AnthropicProvider } from "./anthropicProvider.ts";
import { handleRequest } from "./handler.ts";
import { LIMITS } from "./schema.ts";
import { createSupabaseStore } from "./supabaseStore.ts";

const env = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`missing env ${name}`);
  return value;
};

const supabaseUrl = env("SUPABASE_URL");
const anonKey = env("SUPABASE_ANON_KEY");
const serviceClient = createClient(supabaseUrl, env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const provider = new AnthropicProvider({
  apiKey: env("ANTHROPIC_API_KEY"),
  model: Deno.env.get("AI_MODEL"),
  timeoutMs: LIMITS.timeoutMs,
});

const userClient = (authorization: string) =>
  createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

Deno.serve((req) =>
  handleRequest(req, {
    async authenticate(authorization) {
      const jwt = authorization.replace(/^Bearer\s+/, "");
      const { data, error } = await serviceClient.auth.getUser(jwt);
      return error || !data.user ? null : data.user.id;
    },
    parseDeps(authorization) {
      return { store: createSupabaseStore(userClient(authorization), serviceClient), provider };
    },
  }),
);
