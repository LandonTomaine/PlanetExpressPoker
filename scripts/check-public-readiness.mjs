import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    windowsHide: true,
  }).trim()
}

function fail(message) {
  failures.push(message)
}

const failures = []
const trackedFiles = git(['ls-files']).split(/\r?\n/).filter(Boolean)

for (const requiredFile of [
  'LICENSE.md',
  'ASSET_NOTICES.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
]) {
  if (!trackedFiles.includes(requiredFile)) {
    fail(`missing public-repo file: ${requiredFile}`)
  }
}

const workflowFiles = trackedFiles.filter((filePath) =>
  /^\.github\/workflows\/.+\.ya?ml$/.test(filePath)
)

for (const workflowFile of workflowFiles) {
  const content = readFileSync(workflowFile, 'utf8')

  if (content.includes('pull_request_target')) {
    fail(`unsafe pull_request_target trigger in ${workflowFile}`)
  }

  if (!/^permissions:\r?\n\s+contents: read/m.test(content)) {
    fail(`workflow missing explicit read-only permissions: ${workflowFile}`)
  }
}

const deployWorkflow = '.github/workflows/deploy-cloudflare.yml'

if (trackedFiles.includes(deployWorkflow)) {
  const content = readFileSync(deployWorkflow, 'utf8')

  if (
    !content.includes("github.repository == 'LandonTomaine/PlanetExpressPoker'")
  ) {
    fail('deploy workflow missing repository guard')
  }
}

const forbiddenTrackedFiles = trackedFiles.filter(
  (filePath) => /^\.env(?:\.|$)/.test(filePath) && filePath !== '.env.example'
)

if (forbiddenTrackedFiles.length > 0) {
  fail(`tracked env files: ${forbiddenTrackedFiles.join(', ')}`)
}

const secretPatterns = [
  {
    name: 'private key',
    pattern: '-----BEGIN',
  },
  {
    name: 'GitHub token',
    pattern: 'ghp_[A-Za-z0-9]{20,}',
  },
  {
    name: 'OpenAI token',
    pattern: 'sk-[A-Za-z0-9_-]{20,}',
  },
  {
    name: 'database URL',
    pattern: 'postgres(ql)?://',
  },
  {
    name: 'hardcoded Supabase JWT env',
    pattern: 'VITE_SUPABASE_ANON_KEY=eyJ',
  },
  {
    name: 'local machine path',
    pattern: 'C:\\\\Users|latom',
  },
]

for (const { name, pattern } of secretPatterns) {
  try {
    const matches = git([
      'grep',
      '-n',
      '-I',
      '-E',
      '-e',
      pattern,
      '--',
      '.',
      ':!package-lock.json',
      ':!scripts/check-public-readiness.mjs',
    ])

    if (matches) {
      fail(`${name} pattern found:\n${matches}`)
    }
  } catch (error) {
    if (error.status !== 1) {
      throw error
    }
  }
}

const frontendFiles = trackedFiles.filter(
  (filePath) => filePath.startsWith('src/') && /\.[cm]?[jt]sx?$/.test(filePath)
)

for (const filePath of frontendFiles) {
  const content = readFileSync(filePath, 'utf8')

  if (content.includes('dangerouslySetInnerHTML')) {
    fail(`unsafe HTML rendering in ${filePath}`)
  }

  if (
    content.includes("from('votes'") ||
    content.includes('from("votes"') ||
    content.includes("from('participants'") ||
    content.includes('from("participants"')
  ) {
    fail(`direct sensitive table read in ${filePath}`)
  }

  if (
    content.includes('lib/supabase/client') &&
    !filePath.startsWith('src/features/room/data/') &&
    !filePath.startsWith('src/features/room/realtime/') &&
    filePath !== 'src/lib/supabase/client.ts'
  ) {
    fail(
      `Supabase client imported outside room data/realtime boundary: ${filePath}`
    )
  }
}

if (failures.length > 0) {
  console.error(`Public-readiness checks failed:\n\n${failures.join('\n\n')}`)
  process.exit(1)
}

console.log('Public-readiness checks passed.')
