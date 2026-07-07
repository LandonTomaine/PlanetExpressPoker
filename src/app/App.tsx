import { useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ThemeProvider } from '../features/theme/context'
import { useTheme } from '../features/theme/useTheme'

type DeploymentInfo = {
  branchName: string
  commitShortSha: string
  commitUrl: string
  deployedAt: string
  repositoryUrl: string
}

declare const __PEP_DEPLOYMENT__: DeploymentInfo

export function App() {
  return (
    <ThemeProvider>
      <AppFrame />
    </ThemeProvider>
  )
}

function AppFrame() {
  const location = useLocation()
  const shouldShowNav = location.pathname !== '/'
  const pendingTouchLogoClickCountRef = useRef(0)
  const { activeTheme, cssVars } = useTheme()

  function dispatchHypnotoadLogoClick() {
    window.dispatchEvent(new CustomEvent('pep:hypnotoad-logo-click'))
  }

  function handleLogoClick() {
    if (pendingTouchLogoClickCountRef.current > 0) {
      pendingTouchLogoClickCountRef.current -= 1
      return
    }

    dispatchHypnotoadLogoClick()
  }

  function handleLogoTouchEnd() {
    pendingTouchLogoClickCountRef.current += 1
    dispatchHypnotoadLogoClick()
  }

  return (
    <div
      data-pep-theme={activeTheme.id}
      style={cssVars}
      className="min-h-screen bg-[var(--pep-bg)] text-[var(--pep-ink)]"
    >
      <div className="mx-auto flex min-h-screen max-w-[100rem] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[16px] border border-[var(--pep-line)] bg-white/84 p-4 shadow-[0_16px_42px_rgba(12,32,42,0.1)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLogoClick}
              onTouchEnd={handleLogoTouchEnd}
              aria-label={activeTheme.logoAlt}
              style={{ cursor: 'default', touchAction: 'manipulation' }}
              className="grid h-14 w-14 shrink-0 cursor-default place-items-center overflow-hidden rounded-[12px] border border-[var(--pep-line)] bg-white shadow-[0_12px_26px_rgba(12,32,42,0.1)]"
            >
              <img
                src={activeTheme.logoPath}
                alt={activeTheme.logoAlt}
                className="h-12 w-12 object-contain"
              />
            </button>
            <div>
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                {activeTheme.appTitle}
              </p>
              <h1 className="font-[var(--pep-font-display)] text-3xl leading-none sm:text-4xl">
                {activeTheme.tagline}
              </h1>
              <p className="mt-1 text-sm text-[var(--pep-ink-soft)]">
                Simple realtime estimation for teams.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {shouldShowNav ? (
              <nav className="flex gap-2">
                <AppNavLink to="/">Home</AppNavLink>
              </nav>
            ) : null}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="mt-5 flex flex-col gap-3 rounded-[16px] border border-[var(--pep-line)] bg-white/84 px-4 py-3 shadow-[0_16px_42px_rgba(12,32,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <RepositoryLink repositoryUrl={__PEP_DEPLOYMENT__.repositoryUrl} />
          <DeploymentStamp deploymentInfo={__PEP_DEPLOYMENT__} />
        </footer>
      </div>
    </div>
  )
}

type AppNavLinkProps = {
  children: string
  to: string
}

function AppNavLink({ children, to }: AppNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => {
        return [
          'rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.04em] transition hover:-translate-y-0.5',
          isActive
            ? 'border-[var(--pep-ink)] bg-[linear-gradient(180deg,_#ffffff,_#e3edf0)] text-[var(--pep-ink)] shadow-[0_6px_0_rgba(20,38,51,0.18)]'
            : 'border-slate-300 bg-[linear-gradient(180deg,_#f9fbfc,_#dfe8ec)] text-[var(--pep-ink)] shadow-[0_5px_12px_rgba(12,32,42,0.1)] hover:border-[var(--pep-line-strong)] hover:bg-[linear-gradient(180deg,_#ffffff,_#e9f0f2)]',
        ].join(' ')
      }}
    >
      {children}
    </NavLink>
  )
}

function DeploymentStamp({
  deploymentInfo,
}: {
  deploymentInfo: DeploymentInfo
}) {
  const deployedAt = formatDeploymentDate(deploymentInfo.deployedAt)
  const commitLabel = deploymentInfo.commitShortSha || 'local'
  const branchLabel = deploymentInfo.branchName || 'local'

  return (
    <p className="max-w-full rounded-[14px] border border-slate-300/80 bg-slate-100/78 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-600 shadow-[0_4px_12px_rgba(12,32,42,0.04)] backdrop-blur">
      <span className="sr-only">Deployment details: </span>
      <span className="flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1">
        <span>Build</span>
        <span aria-hidden="true">/</span>
        <span>{deployedAt}</span>
        <span aria-hidden="true">/</span>
        <span>{branchLabel}</span>
        <span aria-hidden="true">/</span>
        {deploymentInfo.commitUrl ? (
          <a
            href={deploymentInfo.commitUrl}
            className="text-slate-700 underline decoration-slate-400/70 underline-offset-3"
            rel="noreferrer"
            target="_blank"
          >
            {commitLabel}
          </a>
        ) : (
          <span>{commitLabel}</span>
        )}
      </span>
    </p>
  )
}

function RepositoryLink({ repositoryUrl }: { repositoryUrl: string }) {
  if (!repositoryUrl) {
    return null
  }

  return (
    <a
      href={repositoryUrl}
      className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--pep-line-strong)] bg-[linear-gradient(180deg,_#f9fbfc,_#dfe8ec)] px-3.5 py-2 text-xs font-black uppercase tracking-[0.06em] text-[var(--pep-ink)] shadow-[0_6px_14px_rgba(12,32,42,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--pep-ink)] hover:bg-[linear-gradient(180deg,_#ffffff,_#e9f0f2)]"
      rel="noreferrer"
      target="_blank"
    >
      GitHub repo
    </a>
  )
}

function formatDeploymentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'unknown time'
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    timeZoneName: 'short',
    year: 'numeric',
  }).format(date)
}
