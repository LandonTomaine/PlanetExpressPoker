import { NavLink, Outlet, useLocation } from 'react-router'

export function App() {
  const location = useLocation()
  const shouldShowNav = location.pathname !== '/'

  return (
    <div className="min-h-screen bg-[var(--pep-bg)] text-[var(--pep-ink)]">
      <div className="mx-auto flex min-h-screen max-w-[100rem] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[16px] border border-[var(--pep-line)] bg-white/84 p-4 shadow-[0_16px_42px_rgba(12,32,42,0.1)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[var(--pep-line)] bg-white shadow-[0_12px_26px_rgba(12,32,42,0.1)]">
              <img
                src="/planet-express-logo.png"
                alt="Planet Express logo"
                className="h-12 w-12 object-contain"
              />
            </div>
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
            <nav className="flex gap-2 rounded-[12px] bg-[var(--pep-panel)] p-1">
              <AppNavLink to="/">Home</AppNavLink>
            </nav>
          ) : null}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
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
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-[var(--pep-accent)] text-white shadow-[0_10px_24px_rgba(212,47,38,0.28)]'
            : 'bg-white/55 text-[var(--pep-ink-soft)] hover:bg-white hover:text-[var(--pep-ink)]',
        ].join(' ')
      }}
    >
      {children}
    </NavLink>
  )
}
