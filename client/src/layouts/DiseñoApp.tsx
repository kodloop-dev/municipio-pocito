import { Outlet } from 'react-router-dom'
import { Encabezado } from '../components/Encabezado'
import { Navbar } from '../components/Navbar'

export default function DiseñoApp() {
  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <Encabezado />
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}
