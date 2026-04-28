import { useContextoApp } from '../../context/ContextoApp'
import { apiSimulada } from '../../services/apiSimulada'
import type { Usuario } from '../../context/tipos'

export function useMisDatos() {
  const { usuario, actualizarUsuario } = useContextoApp()

  const guardar = async (datos: Partial<Usuario>): Promise<void> => {
    await apiSimulada.guardarDatos(datos)
    actualizarUsuario(datos)
  }

  return { usuario, guardar }
}
