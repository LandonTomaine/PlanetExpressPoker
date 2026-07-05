import { NavLink, Outlet, useLocation } from 'react-router'

type DeploymentInfo = {
  branchName: string
  commitShortSha: string
  commitUrl: string
  deployedAt: string
  repositoryUrl: string
}

declare const __PEP_DEPLOYMENT__: DeploymentInfo

export function App() {
  const location = useLocation()
  const shouldShowNav = location.pathname !== '/'

  function handleLogoClick() {
    window.dispatchEvent(new CustomEvent('pep:hypnotoad-logo-click'))
  }

  return (
    <div className="min-h-screen bg-[var(--pep-bg)] text-[var(--pep-ink)]">
      <div className="mx-auto flex min-h-screen max-w-[100rem] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[16px] border border-[var(--pep-line)] bg-white/84 p-4 shadow-[0_16px_42px_rgba(12,32,42,0.1)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLogoClick}
              aria-label="Planet Express logo"
              style={{ cursor: 'default' }}
              className="grid h-14 w-14 shrink-0 cursor-default place-items-center overflow-hidden rounded-[12px] border border-[var(--pep-line)] bg-white shadow-[0_12px_26px_rgba(12,32,42,0.1)]"
            >
              <img
                src="/planet-express-logo.png"
                alt="Planet Express logo"
                className="h-12 w-12 object-contain"
              />
            </button>
            <div>
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Planet Express Poker
              </p>
              <h1 className="font-[var(--pep-font-display)] text-3xl leading-none sm:text-4xl">
                Realtime planning poker
              </h1>
              <p className="mt-1 text-sm text-[var(--pep-ink-soft)]">
                Simple realtime estimation for teams.
              </p>
            </div>
          </div>

          {shouldShowNav ? (
            <nav className="flex gap-2">
              <AppNavLink to="/">Home</AppNavLink>
            </nav>
          ) : null}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <DeploymentStamp deploymentInfo={__PEP_DEPLOYMENT__} />
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
  const branchLabel = deploymentInfo.branchName || 'local build'

  return (
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[var(--pep-line)] bg-white/62 px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-[var(--pep-ink-soft)] shadow-[0_10px_28px_rgba(12,32,42,0.06)]">
      <span>Deployment</span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{deployedAt}</span>
        <span aria-hidden="true">/</span>
        <span>{branchLabel}</span>
        <span aria-hidden="true">/</span>
        {deploymentInfo.commitUrl ? (
          <a
            href={deploymentInfo.commitUrl}
            className="text-[var(--pep-accent)] underline decoration-[var(--pep-accent)]/35 underline-offset-4"
            rel="noreferrer"
            target="_blank"
          >
            {commitLabel}
          </a>
        ) : (
          <span>{commitLabel}</span>
        )}
      </span>
    </footer>
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
