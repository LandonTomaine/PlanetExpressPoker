import { execSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const repositoryUrl = resolveRepositoryUrl()
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

function resolveRepositoryUrl() {
  const explicitRepositoryUrl = normalizeRepositoryUrl(
    process.env.PEP_REPOSITORY_URL
  )

  if (explicitRepositoryUrl) {
    return explicitRepositoryUrl
  }

  if (process.env.GITHUB_REPOSITORY) {
    return `https://github.com/${process.env.GITHUB_REPOSITORY}`
  }

  const gitOriginUrl = readGitOriginUrl()

  if (gitOriginUrl) {
    return gitOriginUrl
  }

  return 'https://github.com/LandonTomaine/PlanetExpressPoker'
}

function readGitOriginUrl() {
  try {
    return normalizeRepositoryUrl(
      execSync('git config --get remote.origin.url', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    )
  } catch {
    return ''
  }
}

function normalizeRepositoryUrl(value: string | undefined) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return ''
  }

  const githubScpMatch = trimmedValue.match(
    /^git@github\.com:(.+?)(?:\.git)?$/i
  )

  if (githubScpMatch) {
    return `https://github.com/${githubScpMatch[1]}`
  }

  const githubSshMatch = trimmedValue.match(
    /^ssh:\/\/git@github\.com\/(.+?)(?:\.git)?$/i
  )

  if (githubSshMatch) {
    return `https://github.com/${githubSshMatch[1]}`
  }

  return trimmedValue.replace(/\.git$/i, '').replace(/\/$/, '')
}
