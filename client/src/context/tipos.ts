export interface Coordenadas {
  lat: number
  lng: number
}

export interface Usuario {
  nombre: string
  dni: string
  email: string
  telefono: string
  direccion: string
  estadoCivil: string
  cantidadPersonas: number
  observacionesMedicas: string
  coordenadas: Coordenadas | null
}

export interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
}

export interface EstadoApp {
  usuario: Usuario | null
  sesionActiva: boolean
  notificaciones: Notificacion[]
}

export interface Reporte {
  id: string
  categoria: string
  descripcion: string
  coordenadas: Coordenadas | null
  estado: 'pendiente' | 'en_revision' | 'resuelto'
  fecha: string
}

export interface AccionesApp {
  iniciarSesion: (usuario: Usuario) => void
  cerrarSesion: () => void
  actualizarUsuario: (datos: Partial<Usuario>) => void
  actualizarNotificaciones: (notificaciones: Notificacion[]) => void
  marcarNotificacionLeida: (id: string) => void
}
