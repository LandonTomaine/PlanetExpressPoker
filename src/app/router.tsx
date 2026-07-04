import { createBrowserRouter } from 'react-router'
import { App } from './App'
import { AppErrorBoundary } from './AppErrorBoundary'
import { HomePage } from '../routes/HomePage'
import { RoomPage } from '../routes/RoomPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'rooms/:roomName/dev',
        element: <RoomPage mode="simulator" />,
      },
      {
        path: 'rooms/:roomName',
        element: <RoomPage />,
      },
    ],
  },
])
