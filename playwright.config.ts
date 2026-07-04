import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

const viteEnv = loadEnv('development', process.cwd(), 'VITE_')
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ??
  viteEnv.VITE_SUPABASE_URL ??
  'http://127.0.0.1:54321'
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ?? viteEnv.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY for Playwright. Set it in .env or the process environment before running npm run test:e2e.'
  )
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    env: {
      VITE_SUPABASE_URL: supabaseUrl,
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:5173',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
