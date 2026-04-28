import { RouterProvider } from 'react-router-dom'
import { enrutador } from './router'
import { Toaster } from './components/ui/sonner'

export default function App() {
  return (
    <>
      <RouterProvider router={enrutador} />
      <Toaster />
    </>
  )
}
