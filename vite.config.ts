import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const repositoryUrl = 'https://github.com/LandonTomaine/PlanetExpressPoker'
const commitSha =
  process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? ''
const commitShortSha = commitSha.slice(0, 7)
const branchName =
  process.env.CF_PAGES_BRANCH ?? process.env.GITHUB_REF_NAME ?? ''

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@supabase')) {
            return 'supabase'
          }

          if (id.includes('motion')) {
            return 'motion'
          }

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'react'
          }

          return 'vendor'
        },
      },
    },
  },
  define: {
    __PEP_DEPLOYMENT__: JSON.stringify({
      branchName,
      commitShortSha,
      commitUrl: commitSha ? `${repositoryUrl}/commit/${commitSha}` : '',
      deployedAt: new Date().toISOString(),
      repositoryUrl,
    }),
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/integration/setup.ts',
  },
})
