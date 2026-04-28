// Wrapper de fetch listo para cuando llegue el backend real.
// Hoy no se usa directamente (apiSimulada usa localStorage),
// pero centraliza headers, base URL y manejo de errores HTTP.
// TODO: cuando se implemente el backend, escribir 'pocito_token' en localStorage al hacer login.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export async function apiFetch<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const token = localStorage.getItem('pocito_token')
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones?.headers,
    },
  })
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}: ${respuesta.statusText}`)
  }
  return respuesta.json() as Promise<T>
}
