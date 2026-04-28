import { useNavigate } from 'react-router-dom'
import { useContextoApp } from '../../context/ContextoApp'
import { apiSimulada } from '../../services/apiSimulada'
import type { Usuario } from '../../context/tipos'

export function useAutenticacion() {
  const navigate = useNavigate()
  const { iniciarSesion, cerrarSesion } = useContextoApp()

  const login = async (dni: string, contraseña: string): Promise<void> => {
    const usuario = await apiSimulada.iniciarSesion(dni, contraseña)
    iniciarSesion(usuario)
    navigate('/inicio', { replace: true })
  }

  const registro = async (datos: Usuario): Promise<void> => {
    await apiSimulada.registrarUsuario(datos)
    iniciarSesion(datos)
    navigate('/inicio', { replace: true })
  }

  const logout = async (): Promise<void> => {
    await apiSimulada.cerrarSesion()
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return { login, registro, logout }
}
