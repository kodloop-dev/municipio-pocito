import type { Usuario, Notificacion, Coordenadas, Reporte } from '../context/tipos'

const CLAVE_USUARIO = 'pocito_usuario'
const CLAVE_NOTIFICACIONES = 'pocito_notificaciones'
const CLAVE_REPORTES = 'pocito_reportes'

const notificacionesEjemplo: Notificacion[] = [
  {
    id: '1',
    titulo: 'Bienvenido/a a Pocito Municipio',
    mensaje: 'Gracias por registrarte. Completá tu perfil para usar el botón de pánico.',
    leida: false,
    fecha: new Date().toISOString(),
  },
  {
    id: '2',
    titulo: 'Actualización del sistema',
    mensaje: 'Nuevas funcionalidades disponibles en la app municipal.',
    leida: true,
    fecha: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const apiSimulada = {
  async obtenerUsuario(): Promise<Usuario | null> {
    const datos = localStorage.getItem(CLAVE_USUARIO)
    return datos ? (JSON.parse(datos) as Usuario) : null
  },

  async registrarUsuario(datos: Usuario): Promise<void> {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(datos))
  },

  async guardarDatos(datos: Partial<Usuario>): Promise<void> {
    const actual = await this.obtenerUsuario()
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify({ ...actual, ...datos }))
  },

  async iniciarSesion(dni: string, _contraseña: string): Promise<Usuario> {
    const usuario = await this.obtenerUsuario()
    if (usuario && usuario.dni === dni) return usuario
    throw new Error('DNI o contraseña incorrectos')
  },

  async cerrarSesion(): Promise<void> {
    // En producción: invalidar JWT. Aquí no eliminamos datos del perfil.
  },

  async obtenerNotificaciones(): Promise<Notificacion[]> {
    const datos = localStorage.getItem(CLAVE_NOTIFICACIONES)
    if (datos) return JSON.parse(datos) as Notificacion[]
    localStorage.setItem(CLAVE_NOTIFICACIONES, JSON.stringify(notificacionesEjemplo))
    return notificacionesEjemplo
  },

  async marcarNotificacionLeida(id: string): Promise<void> {
    const lista = await this.obtenerNotificaciones()
    const actualizada = lista.map(n => (n.id === id ? { ...n, leida: true } : n))
    localStorage.setItem(CLAVE_NOTIFICACIONES, JSON.stringify(actualizada))
  },

  async enviarAlerta(coordenadas: Coordenadas): Promise<Notificacion> {
    console.info('Alerta enviada con coordenadas:', coordenadas)
    const nueva: Notificacion = {
      id: crypto.randomUUID(),
      titulo: 'Alerta de pánico activada',
      mensaje: `Se envió una alerta de emergencia con su ubicación (${coordenadas.lat.toFixed(4)}, ${coordenadas.lng.toFixed(4)}).`,
      leida: false,
      fecha: new Date().toISOString(),
    }
    const lista = await this.obtenerNotificaciones()
    localStorage.setItem(CLAVE_NOTIFICACIONES, JSON.stringify([nueva, ...lista]))
    return nueva
  },

  async obtenerReportes(): Promise<Reporte[]> {
    const datos = localStorage.getItem(CLAVE_REPORTES)
    return datos ? (JSON.parse(datos) as Reporte[]) : []
  },

  async guardarReporte(datos: Pick<Reporte, 'categoria' | 'descripcion' | 'coordenadas'> & { foto?: string }): Promise<Reporte> {
    const lista = await this.obtenerReportes()
    const nuevo: Reporte = {
      id: crypto.randomUUID(),
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      ...datos,
    }
    localStorage.setItem(CLAVE_REPORTES, JSON.stringify([nuevo, ...lista]))
    return nuevo
  },
}
