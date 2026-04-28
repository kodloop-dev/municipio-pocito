import { useState } from 'react'
import { apiSimulada } from '../../services/apiSimulada'
import { useContextoApp } from '../../context/ContextoApp'
import type { Coordenadas } from '../../context/tipos'

export function useSeguridad() {
  const { actualizarNotificaciones } = useContextoApp()
  const [enviando, setEnviando] = useState(false)
  const [alertaEnviada, setAlertaEnviada] = useState(false)

  const activarAlerta = async (coordenadas: Coordenadas) => {
    setEnviando(true)
    try {
      await apiSimulada.enviarAlerta(coordenadas)
      const notificaciones = await apiSimulada.obtenerNotificaciones()
      actualizarNotificaciones(notificaciones)
      setAlertaEnviada(true)
    } finally {
      setEnviando(false)
    }
  }

  const resetear = () => setAlertaEnviada(false)

  return { enviando, alertaEnviada, activarAlerta, resetear }
}
