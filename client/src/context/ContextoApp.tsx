import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { EstadoApp, AccionesApp, Usuario, Notificacion } from './tipos'
import { apiSimulada } from '../services/apiSimulada'

type Accion =
  | { tipo: 'INICIAR_SESION'; usuario: Usuario }
  | { tipo: 'CERRAR_SESION' }
  | { tipo: 'ACTUALIZAR_USUARIO'; datos: Partial<Usuario> }
  | { tipo: 'ACTUALIZAR_NOTIFICACIONES'; notificaciones: Notificacion[] }
  | { tipo: 'MARCAR_LEIDA'; id: string }

const estadoInicial: EstadoApp = {
  usuario: null,
  sesionActiva: false,
  notificaciones: [],
}

function reductor(estado: EstadoApp, accion: Accion): EstadoApp {
  switch (accion.tipo) {
    case 'INICIAR_SESION':
      return { ...estado, usuario: accion.usuario, sesionActiva: true }
    case 'CERRAR_SESION':
      return { ...estadoInicial }
    case 'ACTUALIZAR_USUARIO':
      return {
        ...estado,
        usuario: estado.usuario ? { ...estado.usuario, ...accion.datos } : null,
      }
    case 'ACTUALIZAR_NOTIFICACIONES':
      return { ...estado, notificaciones: accion.notificaciones }
    case 'MARCAR_LEIDA':
      return {
        ...estado,
        notificaciones: estado.notificaciones.map(n =>
          n.id === accion.id ? { ...n, leida: true } : n
        ),
      }
    default:
      return estado
  }
}

const ContextoApp = createContext<(EstadoApp & AccionesApp) | null>(null)

export function ProveedorApp({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reductor, estadoInicial)

  useEffect(() => {
    apiSimulada.obtenerUsuario().then(usuario => {
      if (usuario) {
        despachar({ tipo: 'INICIAR_SESION', usuario })
        apiSimulada.obtenerNotificaciones().then(notificaciones =>
          despachar({ tipo: 'ACTUALIZAR_NOTIFICACIONES', notificaciones })
        )
      }
    })
  }, [])

  const acciones: AccionesApp = {
    iniciarSesion: (usuario: Usuario) => {
      despachar({ tipo: 'INICIAR_SESION', usuario })
      apiSimulada.obtenerNotificaciones().then(notificaciones =>
        despachar({ tipo: 'ACTUALIZAR_NOTIFICACIONES', notificaciones })
      )
    },
    cerrarSesion: () => despachar({ tipo: 'CERRAR_SESION' }),
    actualizarUsuario: (datos: Partial<Usuario>) =>
      despachar({ tipo: 'ACTUALIZAR_USUARIO', datos }),
    actualizarNotificaciones: (notificaciones: Notificacion[]) =>
      despachar({ tipo: 'ACTUALIZAR_NOTIFICACIONES', notificaciones }),
    marcarNotificacionLeida: (id: string) => {
      despachar({ tipo: 'MARCAR_LEIDA', id })
      apiSimulada.marcarNotificacionLeida(id)
    },
  }

  return (
    <ContextoApp.Provider value={{ ...estado, ...acciones }}>
      {children}
    </ContextoApp.Provider>
  )
}

export function useContextoApp() {
  const contexto = useContext(ContextoApp)
  if (!contexto) throw new Error('useContextoApp debe usarse dentro de ProveedorApp')
  return contexto
}
