import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

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
const workingFiles = trackedFiles.filter((filePath) => existsSync(filePath))

for (const requiredFile of [
  '.env.example',
  '.gitignore',
  '.github/workflows/ci.yml',
  '.husky/pre-push',
  'LICENSE.md',
  'ASSET_NOTICES.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.github/dependabot.yml',
  '.github/workflows/codeql.yml',
]) {
  if (!trackedFiles.includes(requiredFile) || !existsSync(requiredFile)) {
    fail(`missing public-repo file: ${requiredFile}`)
  }
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const expectedTestScripts = {
  'test:architecture': 'node scripts/check-public-readiness.mjs',
  'test:integration': 'vitest run --project integration',
  'test:unit': 'vitest run --project unit',
}

for (const [name, command] of Object.entries(expectedTestScripts)) {
  if (packageJson.scripts?.[name] !== command) {
    fail(`package script ${name} must be: ${command}`)
  }
}

const requiredGateScripts = [
  'format:check',
  'lint',
  'typecheck',
  'test:unit',
  'test:integration',
  'test:architecture',
  'build',
]

for (const gateFile of ['.github/workflows/ci.yml', '.husky/pre-push']) {
  const content = readFileSync(gateFile, 'utf8')

  for (const scriptName of requiredGateScripts) {
    if (!content.includes(`npm run ${scriptName}`)) {
      fail(`${gateFile} does not run ${scriptName}`)
    }
  }
}

const allowedFrontendEnvKeys = ['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_URL']
const envExampleKeys = readFileSync('.env.example', 'utf8')
  .split(/\r?\n/)
  .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
  .filter(Boolean)
  .sort()

if (envExampleKeys.join(',') !== allowedFrontendEnvKeys.join(',')) {
  fail(`.env.example must contain only: ${allowedFrontendEnvKeys.join(', ')}`)
}

const gitignoreLines = readFileSync('.gitignore', 'utf8').split(/\r?\n/)

for (const pattern of ['.env', '.env.*', '!.env.example']) {
  if (!gitignoreLines.includes(pattern)) {
    fail(`.gitignore missing environment rule: ${pattern}`)
  }
}

const workflowFiles = workingFiles.filter((filePath) =>
  /^\.github\/workflows\/.+\.ya?ml$/.test(filePath)
)

for (const workflowFile of workflowFiles) {
  const content = readFileSync(workflowFile, 'utf8')

  if (content.includes('pull_request_target')) {
    fail(`unsafe pull_request_target trigger in ${workflowFile}`)
  }

  if (
    !/^permissions:\r?\n(?:\s+[a-z-]+: (?:read|write)\r?\n)+/m.test(content)
  ) {
    fail(`workflow missing explicit permissions block: ${workflowFile}`)
  }

  if (!/^\s+contents: read$/m.test(content)) {
    fail(`workflow missing explicit contents: read permission: ${workflowFile}`)
  }

  if (/^\s+contents: write$/m.test(content)) {
    fail(`workflow grants write access to repository contents: ${workflowFile}`)
  }
}

const deployWorkflow = '.github/workflows/deploy-cloudflare.yml'

if (workingFiles.includes(deployWorkflow)) {
  const content = readFileSync(deployWorkflow, 'utf8')

  if (
    !content.includes("github.repository == 'LandonTomaine/PlanetExpressPoker'")
  ) {
    fail('deploy workflow missing repository guard')
  }
}

const forbiddenTrackedFiles = workingFiles.filter(
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
    name: 'GitHub fine-grained token',
    pattern: 'github_pat_[A-Za-z0-9_]{20,}',
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
    name: 'Supabase access token',
    pattern: 'sbp_[A-Za-z0-9]{20,}',
  },
  {
    name: 'Supabase secret key',
    pattern: 'sb_secret_[A-Za-z0-9_-]{20,}',
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

const frontendFiles = workingFiles.filter(
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

  const frontendEnvKeys = content.match(/\bVITE_[A-Z0-9_]+/g) ?? []

  for (const envKey of frontendEnvKeys) {
    if (!allowedFrontendEnvKeys.includes(envKey)) {
      fail(`unapproved frontend environment variable in ${filePath}: ${envKey}`)
    }
  }
}

const textFiles = workingFiles.filter((filePath) =>
  /\.(?:[cm]?[jt]sx?|json|md|ya?ml|css|html)$/.test(filePath)
)

for (const filePath of textFiles) {
  const content = readFileSync(filePath, 'utf8')

  if (/[\u00c2\u00c3\u00e2]|\ufffd/.test(content)) {
    fail(`possible mojibake in ${filePath}`)
  }
}

if (failures.length > 0) {
  console.error(`Public-readiness checks failed:\n\n${failures.join('\n\n')}`)
  process.exit(1)
}

console.log('Public-readiness checks passed.')
