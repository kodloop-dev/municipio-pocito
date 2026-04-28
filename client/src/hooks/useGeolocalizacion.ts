import { useState } from 'react'
import type { Coordenadas } from '../context/tipos'

interface EstadoGeo {
  coordenadas: Coordenadas | null
  error: string | null
  cargando: boolean
}

export function useGeolocalizacion() {
  const [estado, setEstado] = useState<EstadoGeo>({
    coordenadas: null,
    error: null,
    cargando: false,
  })

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setEstado(e => ({ ...e, error: 'Geolocalización no disponible en este dispositivo' }))
      return
    }
    setEstado(e => ({ ...e, cargando: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      pos => setEstado({
        coordenadas: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        error: null,
        cargando: false,
      }),
      () => setEstado({ coordenadas: null, error: 'No se pudo obtener la ubicación', cargando: false })
    )
  }

  return { ...estado, obtenerUbicacion }
}
