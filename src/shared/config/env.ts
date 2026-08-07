import { z } from "zod";

const envSchema = z.object({
    VITE_APP_NAME: z.string().min(1),

    VITE_APP_ENV: z.enum([
        "development",
        "production",
    ]),

    VITE_SUPABASE_URL: z.url(),

    VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
    console.error(parsed.error.format());

    throw new Error("Invalid environment variables");
}

export const env = {
    appName: parsed.data.VITE_APP_NAME,

    appEnv: parsed.data.VITE_APP_ENV,

    supabase: {
        url: parsed.data.VITE_SUPABASE_URL,
        anonKey: parsed.data.VITE_SUPABASE_ANON_KEY,
    },
} as const;