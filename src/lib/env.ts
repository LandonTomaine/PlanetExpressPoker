import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .refine((value) => !value.includes('<'), 'must be set to a real anon key'),
})

const envInput = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

const envResult = envSchema.safeParse(envInput)

if (!envResult.success) {
  const missingKeys = envResult.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')

  throw new Error(
    `Missing required environment configuration: ${missingKeys}. Copy .env.example to .env and set Supabase values.`
  )
}

export const env = envResult.data
