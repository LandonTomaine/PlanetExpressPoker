import { createBrowserRouter } from 'react-router'
import { App } from './App'
import { AppErrorBoundary } from './AppErrorBoundary'
import { HomeRoute, RoomRoute, SimulatorRoomRoute } from './routeElements'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: 'rooms/:roomName/dev',
        element: <SimulatorRoomRoute />,
      },
      {
        path: 'rooms/:roomName',
        element: <RoomRoute />,
      },
    ],
  },
])
