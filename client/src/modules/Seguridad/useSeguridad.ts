import { useState } from 'react'
import { apiSimulada } from '../../services/apiSimulada'
import type { Coordenadas } from '../../context/tipos'

export function useSeguridad() {
  const [enviando, setEnviando] = useState(false)
  const [alertaEnviada, setAlertaEnviada] = useState(false)

  const activarAlerta = async (coordenadas: Coordenadas) => {
    setEnviando(true)
    try {
      await apiSimulada.enviarAlerta(coordenadas)
      setAlertaEnviada(true)
    } finally {
      setEnviando(false)
    }
  }

  const resetear = () => setAlertaEnviada(false)

  return { enviando, alertaEnviada, activarAlerta, resetear }
}
