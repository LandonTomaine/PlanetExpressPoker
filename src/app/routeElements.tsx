import { lazy, Suspense, type ReactNode } from 'react'

const HomePage = lazy(() =>
  import('../routes/HomePage').then((module) => ({ default: module.HomePage }))
)
const RoomPage = lazy(() =>
  import('../routes/RoomPage').then((module) => ({ default: module.RoomPage }))
)
const RoomsPage = lazy(() =>
  import('../routes/RoomsPage').then((module) => ({
    default: module.RoomsPage,
  }))
)

export function HomeRoute() {
  return (
    <RouteSuspense>
      <HomePage />
    </RouteSuspense>
  )
}

export function RoomRoute() {
  return (
    <RouteSuspense>
      <RoomPage />
    </RouteSuspense>
  )
}

export function RoomsRoute() {
  return (
    <RouteSuspense>
      <RoomsPage />
    </RouteSuspense>
  )
}

export function SimulatorRoomRoute() {
  return (
    <RouteSuspense>
      <RoomPage mode="simulator" />
    </RouteSuspense>
  )
}

function RouteSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <section className="rounded-[20px] border border-[var(--pep-line)] bg-white/80 p-6 text-sm font-bold text-[var(--pep-ink-soft)] shadow-[0_18px_44px_rgba(12,32,42,0.12)]">
          Loading route...
        </section>
      }
    >
      {children}
    </Suspense>
  )
}
