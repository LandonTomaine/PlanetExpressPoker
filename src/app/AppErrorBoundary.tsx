import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { readStoredThemeId } from '../features/identity/storage'
import { getThemeConfig, getThemeCssVars } from '../features/theme/registry'

export function AppErrorBoundary() {
  const error = useRouteError()
  const theme = getThemeConfig(readStoredThemeId())
  const title = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'Page not found'
      : 'Page could not load'
    : 'Something went wrong'
  const detail = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'That room or page is not available.'
      : 'Refresh the page or head home and try again.'
    : 'Refresh the page or head home and try again.'

  return (
    <div
      data-pep-theme={theme.id}
      style={getThemeCssVars(theme.id)}
      className="min-h-screen bg-[var(--pep-bg)] px-4 py-6 text-[var(--pep-ink)] sm:px-6 lg:px-8"
    >
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[20px] border border-[var(--pep-line)] bg-white/88 p-6 text-center shadow-[0_18px_48px_rgba(12,32,42,0.12)]">
          <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-[18px] border border-[var(--pep-line)] bg-white shadow-[0_12px_26px_rgba(12,32,42,0.1)]">
            <img
              src={theme.logoPath}
              alt={theme.logoAlt}
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[var(--pep-accent)]">
            {theme.appTitle}
          </p>
          <h1 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--pep-ink-soft)]">
            {detail}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-[12px] border-2 border-[var(--pep-ink)] bg-[var(--pep-yellow)] px-5 py-3 text-sm font-black uppercase text-[var(--pep-ink)] shadow-[0_8px_0_rgba(20,38,51,0.18)] transition hover:-translate-y-0.5"
            >
              Refresh
            </button>
            <Link
              to="/"
              className="rounded-[12px] border-2 border-[var(--pep-line-strong)] bg-white px-5 py-3 text-sm font-black uppercase text-[var(--pep-ink)] transition hover:-translate-y-0.5"
            >
              Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
