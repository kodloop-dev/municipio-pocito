import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProveedorApp, useContextoApp } from './ContextoApp'

function ComponentePrueba() {
  const { sesionActiva, usuario } = useContextoApp()
  return (
    <div>
      <span data-testid="sesion">{sesionActiva ? 'activa' : 'inactiva'}</span>
      <span data-testid="nombre">{usuario?.nombre ?? 'sin-usuario'}</span>
    </div>
  )
}

describe('ProveedorApp', () => {
  it('inicia con sesión inactiva', () => {
    render(<ProveedorApp><ComponentePrueba /></ProveedorApp>)
    expect(screen.getByTestId('sesion').textContent).toBe('inactiva')
  })

  it('lanza error si useContextoApp se usa fuera del Provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ComponentePrueba />)).toThrow('useContextoApp debe usarse dentro de ProveedorApp')
    consoleSpy.mockRestore()
  })
})
