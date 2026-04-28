import { describe, it, expect, beforeEach } from 'vitest'
import { apiSimulada } from './apiSimulada'
import type { Usuario } from '../context/tipos'

const usuario: Usuario = {
  nombre: 'María González',
  dni: '28341567',
  email: 'maria@test.com',
  telefono: '2644000000',
  direccion: 'San Martín 123',
  estadoCivil: 'Soltero/a',
  cantidadPersonas: 2,
  observacionesMedicas: '',
  coordenadas: null,
}

describe('apiSimulada', () => {
  beforeEach(() => localStorage.clear())

  it('obtenerUsuario retorna null cuando no hay datos', async () => {
    expect(await apiSimulada.obtenerUsuario()).toBeNull()
  })

  it('registrarUsuario y obtenerUsuario funcionan juntos', async () => {
    await apiSimulada.registrarUsuario(usuario)
    expect(await apiSimulada.obtenerUsuario()).toEqual(usuario)
  })

  it('iniciarSesion retorna usuario si el DNI existe', async () => {
    await apiSimulada.registrarUsuario(usuario)
    const resultado = await apiSimulada.iniciarSesion('28341567', 'cualquier')
    expect(resultado.dni).toBe('28341567')
  })

  it('iniciarSesion lanza error si el DNI no existe', async () => {
    await expect(apiSimulada.iniciarSesion('99999999', 'pass')).rejects.toThrow()
  })

  it('guardarDatos actualiza datos del usuario existente', async () => {
    await apiSimulada.registrarUsuario(usuario)
    await apiSimulada.guardarDatos({ nombre: 'Carlos López', coordenadas: { lat: -31.6, lng: -68.5 } })
    const resultado = await apiSimulada.obtenerUsuario()
    expect(resultado?.nombre).toBe('Carlos López')
    expect(resultado?.coordenadas).toEqual({ lat: -31.6, lng: -68.5 })
  })

  it('marcarNotificacionLeida actualiza el estado de leída', async () => {
    const notificaciones = await apiSimulada.obtenerNotificaciones()
    const primeraId = notificaciones[0].id
    await apiSimulada.marcarNotificacionLeida(primeraId)
    const actualizadas = await apiSimulada.obtenerNotificaciones()
    expect(actualizadas.find(n => n.id === primeraId)?.leida).toBe(true)
  })
})
