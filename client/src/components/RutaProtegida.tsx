import { Navigate, Outlet } from 'react-router-dom'
import { useContextoApp } from '../context/ContextoApp'

export default function RutaProtegida() {
  const { sesionActiva } = useContextoApp()
  return sesionActiva ? <Outlet /> : <Navigate to="/login" replace />
}
