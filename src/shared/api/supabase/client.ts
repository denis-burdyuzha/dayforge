import { createClient } from "@supabase/supabase-js";

import { env } from "@/shared/config/env";

import type { Database } from "./database.types";

export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey);
