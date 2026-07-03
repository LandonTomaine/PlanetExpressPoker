import { createBrowserRouter } from 'react-router'
import { App } from './App'
import { AppErrorBoundary } from './AppErrorBoundary'
import { DevMultiplayerPage } from '../routes/DevMultiplayerPage'
import { HomePage } from '../routes/HomePage'
import { RoomPage } from '../routes/RoomPage'

const appChildren = [
  {
    index: true,
    element: <HomePage />,
  },
  {
    path: 'rooms/:roomName',
    element: <RoomPage />,
  },
]

if (import.meta.env.DEV) {
  appChildren.push({
    path: 'dev/multiplayer',
    element: <DevMultiplayerPage />,
  })
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: appChildren,
  },
])
