# Pocito Municipio PWA — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una PWA municipal completa con autenticación (DNI), gestión de datos + mapa Leaflet, botón de pánico y notificaciones, usando React 19 + TypeScript + Tailwind v4 + shadcn/ui.

**Architecture:** Context API + useReducer como estado global. Capa de servicio simulada en localStorage (intercambiable por fetch real). Módulos por feature en español, carpetas core en inglés.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, shadcn/ui, React Router v6, Leaflet + react-leaflet, vite-plugin-pwa, Zod + react-hook-form, Vitest + React Testing Library.

**Working directory:** `client/sisem-client/`

---

## Task 1: Instalar dependencias y configurar entorno de testing

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/configuracion.ts`

- [ ] **Step 1: Instalar dependencias de producción**

```bash
cd client/sisem-client
npm install react-router-dom leaflet react-leaflet zod @hookform/resolvers react-hook-form @fontsource/nunito
npm install @types/leaflet -D
```

- [ ] **Step 2: Instalar shadcn/ui**

```bash
npx shadcn@latest init
```

Responder al prompt:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 3: Instalar componentes shadcn/ui necesarios**

```bash
npx shadcn@latest add button input form card dialog toast badge label select textarea
```

- [ ] **Step 4: Instalar dependencias de PWA**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 5: Instalar dependencias de testing**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 6: Crear `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/configuracion.ts'],
  },
})
```

- [ ] **Step 7: Crear `src/test/configuracion.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Agregar script de test en `package.json`**

Añadir a `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: configuración inicial de dependencias y testing"
```

---

## Task 2: Tokens de color Tailwind v4 y fuente Nunito

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Reemplazar contenido de `src/index.css`**

```css
@import "tailwindcss";
@import "@fontsource/nunito/400.css";
@import "@fontsource/nunito/600.css";
@import "@fontsource/nunito/700.css";
@import "@fontsource/nunito/800.css";
@import "@fontsource/nunito/900.css";

@theme {
  --color-azul-principal: #0077C8;
  --color-azul-claro: #27A9E1;
  --color-amarillo: #F5A623;
  --color-fondo: #F4F6FB;
  --color-texto: #1A1A2E;
  --font-family-sans: "Nunito", sans-serif;
}

@layer base {
  body {
    font-family: var(--font-family-sans);
    background-color: var(--color-fondo);
    color: var(--color-texto);
  }
}

/* Animación para botón de pánico */
@keyframes pulso-lento {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
}
.animate-pulso-lento {
  animation: pulso-lento 2s ease-in-out infinite;
}
```

- [ ] **Step 2: Verificar que la app arranca sin errores**

```bash
npm run dev
```

Abrir `http://localhost:5173` — debe mostrar "Welcome to SISEM Client" con fuente Nunito.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: tokens de color institucional y fuente Nunito"
```

---

## Task 3: Types y Context API

**Files:**
- Create: `src/context/tipos.ts`
- Create: `src/context/ContextoApp.tsx`
- Create: `src/context/ContextoApp.test.tsx`

- [ ] **Step 1: Crear `src/context/tipos.ts`**

```typescript
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

export interface AccionesApp {
  iniciarSesion: (usuario: Usuario) => void
  cerrarSesion: () => void
  actualizarUsuario: (datos: Partial<Usuario>) => void
  actualizarNotificaciones: (notificaciones: Notificacion[]) => void
  marcarNotificacionLeida: (id: string) => void
}
```

- [ ] **Step 2: Crear `src/context/ContextoApp.tsx`**

```typescript
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
```

- [ ] **Step 3: Escribir test del reductor**

Crear `src/context/ContextoApp.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProveedorApp, useContextoApp } from './ContextoApp'
import type { Usuario } from './tipos'

const usuarioPrueba: Usuario = {
  nombre: 'María González',
  dni: '28341567',
  email: 'maria@example.com',
  telefono: '2644000000',
  direccion: 'San Martín 123',
  estadoCivil: 'Soltero/a',
  cantidadPersonas: 2,
  observacionesMedicas: '',
  coordenadas: null,
}

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
})
```

- [ ] **Step 4: Ejecutar test**

```bash
npm run test:run
```

Esperado: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/context/
git commit -m "feat: Context API global con tipos y reductor"
```

---

## Task 4: Servicio simulado (apiSimulada)

**Files:**
- Create: `src/services/apiSimulada.ts`
- Create: `src/services/apiSimulada.test.ts`

- [ ] **Step 1: Escribir tests primero**

Crear `src/services/apiSimulada.test.ts`:

```typescript
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
```

- [ ] **Step 2: Ejecutar test para verificar que falla**

```bash
npm run test:run
```

Esperado: FAIL — "Cannot find module './apiSimulada'"

- [ ] **Step 3: Crear `src/services/apiSimulada.ts`**

```typescript
import type { Usuario, Notificacion, Coordenadas } from '../context/tipos'

const CLAVE_USUARIO = 'pocito_usuario'
const CLAVE_NOTIFICACIONES = 'pocito_notificaciones'

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

  async enviarAlerta(coordenadas: Coordenadas): Promise<void> {
    // En producción: POST /api/alertas con JWT
    console.info('Alerta enviada con coordenadas:', coordenadas)
  },
}
```

- [ ] **Step 4: Ejecutar tests**

```bash
npm run test:run
```

Esperado: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/services/
git commit -m "feat: servicio simulado con localStorage y tests"
```

---

## Task 5: Hooks base e interceptor

**Files:**
- Create: `src/hooks/useAlmacenamientoLocal.ts`
- Create: `src/hooks/useGeolocalizacion.ts`
- Create: `src/interceptors/apiCliente.ts`

- [ ] **Step 1: Crear `src/hooks/useAlmacenamientoLocal.ts`**

```typescript
import { useState, useEffect } from 'react'

export function useAlmacenamientoLocal<T>(clave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => {
    const guardado = localStorage.getItem(clave)
    return guardado ? (JSON.parse(guardado) as T) : valorInicial
  })

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor))
  }, [clave, valor])

  return [valor, setValor] as const
}
```

- [ ] **Step 2: Crear `src/hooks/useGeolocalizacion.ts`**

```typescript
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
```

- [ ] **Step 3: Crear `src/interceptors/apiCliente.ts`**

```typescript
// Wrapper de fetch listo para cuando llegue el backend real.
// Hoy no se usa directamente (apiSimulada usa localStorage),
// pero centraliza headers, base URL y manejo de errores HTTP.

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
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/ src/interceptors/
git commit -m "feat: hooks base y cliente de API"
```

---

## Task 6: Router, Layouts y RutaProtegida

**Files:**
- Create: `src/components/RutaProtegida.tsx`
- Create: `src/layouts/DiseñoAutenticacion.tsx`
- Create: `src/layouts/DiseñoApp.tsx`
- Create: `src/router/index.tsx`

- [ ] **Step 1: Crear `src/components/RutaProtegida.tsx`**

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useContextoApp } from '../context/ContextoApp'

export default function RutaProtegida() {
  const { sesionActiva } = useContextoApp()
  return sesionActiva ? <Outlet /> : <Navigate to="/login" replace />
}
```

- [ ] **Step 2: Crear `src/layouts/DiseñoAutenticacion.tsx`**

```typescript
import { Outlet } from 'react-router-dom'
import logoPocito from '../assets/logo-municipio-pocito.jpeg'

export default function DiseñoAutenticacion() {
  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      <div className="bg-[#0077C8] px-6 py-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
          <img src={logoPocito} alt="Logo Pocito" className="w-16 h-16 object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl font-black tracking-wide">POCITO</h1>
          <p className="text-white/75 text-xs">Municipio · App Vecinal</p>
        </div>
      </div>
      <div className="flex-1 px-5 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `src/layouts/DiseñoApp.tsx`**

```typescript
import { Outlet } from 'react-router-dom'
import { Encabezado } from '../components/Encabezado'
import { Navbar } from '../components/Navbar'

export default function DiseñoApp() {
  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      <Encabezado />
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}
```

- [ ] **Step 4: Crear `src/router/index.tsx`**

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RutaProtegida from '../components/RutaProtegida'
import DiseñoAutenticacion from '../layouts/DiseñoAutenticacion'
import DiseñoApp from '../layouts/DiseñoApp'
import PaginaLogin from '../modules/Autenticacion/PaginaLogin'
import PaginaRegistro from '../modules/Autenticacion/PaginaRegistro'
import PaginaInicio from '../modules/Inicio/PaginaInicio'
import PaginaMisDatos from '../modules/MisDatos/PaginaMisDatos'
import PaginaSeguridad from '../modules/Seguridad/PaginaSeguridad'
import PaginaNotificaciones from '../modules/Notificaciones/PaginaNotificaciones'

export const enrutador = createBrowserRouter([
  { index: true, element: <Navigate to="/login" replace /> },
  {
    element: <DiseñoAutenticacion />,
    children: [
      { path: 'login', element: <PaginaLogin /> },
      { path: 'registro', element: <PaginaRegistro /> },
    ],
  },
  {
    element: <RutaProtegida />,
    children: [
      {
        element: <DiseñoApp />,
        children: [
          { path: 'inicio', element: <PaginaInicio /> },
          { path: 'mis-datos', element: <PaginaMisDatos /> },
          { path: 'seguridad', element: <PaginaSeguridad /> },
          { path: 'notificaciones', element: <PaginaNotificaciones /> },
        ],
      },
    ],
  },
])
```

- [ ] **Step 5: Commit**

```bash
git add src/components/RutaProtegida.tsx src/layouts/ src/router/
git commit -m "feat: router, layouts y protección de rutas"
```

---

## Task 7: Componentes compartidos (Encabezado y Navbar)

**Files:**
- Create: `src/components/Encabezado.tsx`
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Crear `src/components/Encabezado.tsx`**

```typescript
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useContextoApp } from '../context/ContextoApp'
import logoPocito from '../assets/logo-municipio-pocito.jpeg'

export function Encabezado() {
  const navigate = useNavigate()
  const { notificaciones } = useContextoApp()
  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <header className="bg-[#0077C8] px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img src={logoPocito} alt="Logo Pocito" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <p className="text-white text-sm font-black leading-tight">POCITO</p>
          <p className="text-white/75 text-[10px]">Municipio</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/notificaciones')}
        aria-label="Ver notificaciones"
        className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
      >
        <Bell size={18} className="text-white" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F5A623] rounded-full border-2 border-[#0077C8]" />
        )}
      </button>
    </header>
  )
}
```

- [ ] **Step 2: Crear `src/components/Navbar.tsx`**

```typescript
import { Home, User, AlertCircle, Shield, Bell } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useContextoApp } from '../context/ContextoApp'

function claseTab(activa: boolean) {
  return `flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-bold transition-colors ${
    activa ? 'text-[#0077C8]' : 'text-gray-400'
  }`
}

export function Navbar() {
  const { notificaciones } = useContextoApp()
  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-end z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <NavLink to="/inicio" className={({ isActive }) => claseTab(isActive)}>
        <Home size={20} />
        Inicio
      </NavLink>

      <NavLink to="/mis-datos" className={({ isActive }) => claseTab(isActive)}>
        <User size={20} />
        Mis Datos
      </NavLink>

      {/* SOS central elevado */}
      <div className="flex-1 flex flex-col items-center pb-2">
        <NavLink to="/seguridad" className="flex flex-col items-center gap-0.5">
          <div className="w-12 h-12 -mt-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 animate-pulso-lento">
            <AlertCircle size={22} className="text-white" />
          </div>
          <span className="text-[9px] font-black text-red-600">SOS</span>
        </NavLink>
      </div>

      <NavLink to="/seguridad" className={({ isActive }) => claseTab(isActive)}>
        <Shield size={20} />
        Seguridad
      </NavLink>

      <NavLink to="/notificaciones" className={({ isActive }) => claseTab(isActive)}>
        <div className="relative">
          <Bell size={20} />
          {noLeidas > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5A623] rounded-full text-[8px] font-black text-white flex items-center justify-center">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </div>
        Alertas
      </NavLink>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: Encabezado y Navbar con SOS elevado"
```

---

## Task 8: App.tsx y main.tsx (integración base)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Reemplazar `src/App.tsx`**

```typescript
import { RouterProvider } from 'react-router-dom'
import { enrutador } from './router'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <>
      <RouterProvider router={enrutador} />
      <Toaster />
    </>
  )
}
```

- [ ] **Step 2: Reemplazar `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ProveedorApp } from './context/ContextoApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProveedorApp>
      <App />
    </ProveedorApp>
  </StrictMode>
)
```

- [ ] **Step 3: Crear stubs vacíos para que el router no rompa**

Crear los siguientes archivos con contenido mínimo:

`src/modules/Autenticacion/PaginaLogin.tsx`:
```typescript
export default function PaginaLogin() {
  return <div>Login</div>
}
```

`src/modules/Autenticacion/PaginaRegistro.tsx`:
```typescript
export default function PaginaRegistro() {
  return <div>Registro</div>
}
```

`src/modules/Inicio/PaginaInicio.tsx`:
```typescript
export default function PaginaInicio() {
  return <div>Inicio</div>
}
```

`src/modules/MisDatos/PaginaMisDatos.tsx`:
```typescript
export default function PaginaMisDatos() {
  return <div>Mis Datos</div>
}
```

`src/modules/Seguridad/PaginaSeguridad.tsx`:
```typescript
export default function PaginaSeguridad() {
  return <div>Seguridad</div>
}
```

`src/modules/Notificaciones/PaginaNotificaciones.tsx`:
```typescript
export default function PaginaNotificaciones() {
  return <div>Notificaciones</div>
}
```

- [ ] **Step 4: Verificar que la app abre sin errores**

```bash
npm run dev
```

Navegar a `http://localhost:5173` — debe redirigir a `/login` y mostrar el header con logo.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/modules/
git commit -m "feat: integración base con stubs de páginas"
```

---

## Task 9: Módulo Autenticación — useAutenticacion + PaginaLogin

**Files:**
- Create: `src/modules/Autenticacion/useAutenticacion.ts`
- Modify: `src/modules/Autenticacion/PaginaLogin.tsx`

- [ ] **Step 1: Crear `src/modules/Autenticacion/useAutenticacion.ts`**

```typescript
import { useNavigate } from 'react-router-dom'
import { useContextoApp } from '../../context/ContextoApp'
import { apiSimulada } from '../../services/apiSimulada'
import type { Usuario } from '../../context/tipos'

export function useAutenticacion() {
  const navigate = useNavigate()
  const { iniciarSesion, cerrarSesion } = useContextoApp()

  const login = async (dni: string, contraseña: string): Promise<void> => {
    const usuario = await apiSimulada.iniciarSesion(dni, contraseña)
    iniciarSesion(usuario)
  }

  const registro = async (datos: Usuario): Promise<void> => {
    await apiSimulada.registrarUsuario(datos)
    iniciarSesion(datos)
  }

  const logout = async (): Promise<void> => {
    await apiSimulada.cerrarSesion()
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return { login, registro, logout }
}
```

- [ ] **Step 2: Reemplazar `src/modules/Autenticacion/PaginaLogin.tsx`**

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAutenticacion } from './useAutenticacion'
import { useToast } from '../../hooks/use-toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'

const esquema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 dígitos').max(8, 'DNI inválido'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Datos = z.infer<typeof esquema>

export default function PaginaLogin() {
  const navigate = useNavigate()
  const { login } = useAutenticacion()
  const { toast } = useToast()

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { dni: '', contraseña: '' },
  })

  const alEnviar = async (datos: Datos) => {
    try {
      await login(datos.dni, datos.contraseña)
      navigate('/inicio', { replace: true })
    } catch {
      toast({ title: 'Error', description: 'DNI o contraseña incorrectos', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-black text-[#1A1A2E]">Iniciar sesión</h2>
        <p className="text-xs text-gray-400 mt-0.5">Ingresá con tu DNI y contraseña</p>
      </div>
      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-4">
          <FormField control={formulario.control} name="dni" render={({ field }) => (
            <FormItem>
              <FormLabel>DNI</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 28341567" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={formulario.control} name="contraseña" render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button
            type="submit"
            className="w-full bg-[#0077C8] hover:bg-[#27A9E1] font-bold"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-gray-400">
        ¿No tenés cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/registro')}
          className="text-[#0077C8] font-bold"
        >
          Registrarse
        </button>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verificar en el navegador**

```bash
npm run dev
```

Ir a `http://localhost:5173/login`. Verificar:
- Aparece formulario con campos DNI y Contraseña
- Botón "Ingresar" deshabilitado mientras envía
- Link "Registrarse" visible

- [ ] **Step 4: Commit**

```bash
git add src/modules/Autenticacion/
git commit -m "feat: módulo login con validación Zod"
```

---

## Task 10: Módulo Autenticación — PaginaRegistro

**Files:**
- Modify: `src/modules/Autenticacion/PaginaRegistro.tsx`

- [ ] **Step 1: Reemplazar `src/modules/Autenticacion/PaginaRegistro.tsx`**

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAutenticacion } from './useAutenticacion'
import { useToast } from '../../hooks/use-toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'

const esquema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  dni: z.string().min(7, 'DNI inválido').max(8, 'DNI inválido'),
  direccion: z.string().min(3, 'Dirección requerida'),
  estadoCivil: z.string().min(1, 'Seleccioná un estado civil'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Datos = z.infer<typeof esquema>

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente']

export default function PaginaRegistro() {
  const navigate = useNavigate()
  const { registro } = useAutenticacion()
  const { toast } = useToast()

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: '', dni: '', direccion: '', estadoCivil: '',
      email: '', telefono: '', contraseña: '',
    },
  })

  const alEnviar = async (datos: Datos) => {
    try {
      await registro({
        nombre: datos.nombre,
        dni: datos.dni,
        email: datos.email,
        telefono: datos.telefono,
        direccion: datos.direccion,
        estadoCivil: datos.estadoCivil,
        cantidadPersonas: 1,
        observacionesMedicas: '',
        coordenadas: null,
      })
      toast({ title: '¡Cuenta creada!', description: 'Bienvenido/a a Pocito Municipio' })
      navigate('/inicio', { replace: true })
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear la cuenta', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-black text-[#1A1A2E]">Crear cuenta</h2>
        <p className="text-xs text-gray-400 mt-0.5">Completá todos los campos</p>
      </div>
      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-3">
          {[
            { name: 'nombre' as const, label: 'Nombre completo', placeholder: 'Ej: María González' },
            { name: 'dni' as const, label: 'DNI', placeholder: 'Ej: 28341567', inputMode: 'numeric' as const },
            { name: 'email' as const, label: 'Email', placeholder: 'correo@ejemplo.com', type: 'email' },
            { name: 'telefono' as const, label: 'Teléfono', placeholder: 'Ej: 2644123456', inputMode: 'tel' as const },
            { name: 'direccion' as const, label: 'Dirección', placeholder: 'Calle y número' },
          ].map(({ name, label, placeholder, type, inputMode }) => (
            <FormField key={name} control={formulario.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholder} type={type} inputMode={inputMode} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}

          <FormField control={formulario.control} name="estadoCivil" render={({ field }) => (
            <FormItem>
              <FormLabel>Estado civil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS_CIVILES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={formulario.control} name="contraseña" render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button
            type="submit"
            className="w-full bg-[#0077C8] hover:bg-[#27A9E1] font-bold mt-2"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-gray-400">
        ¿Ya tenés cuenta?{' '}
        <button type="button" onClick={() => navigate('/login')} className="text-[#0077C8] font-bold">
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verificar en el navegador**

Ir a `http://localhost:5173/registro`. Verificar todos los campos y el select de estado civil.

- [ ] **Step 3: Commit**

```bash
git add src/modules/Autenticacion/PaginaRegistro.tsx
git commit -m "feat: pantalla de registro con validaciones"
```

---

## Task 11: Módulo Inicio (Dashboard)

**Files:**
- Modify: `src/modules/Inicio/PaginaInicio.tsx`

- [ ] **Step 1: Reemplazar `src/modules/Inicio/PaginaInicio.tsx`**

```typescript
import { useNavigate } from 'react-router-dom'
import { User, Shield, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { useContextoApp } from '../../context/ContextoApp'
import { BotonPanico } from '../Seguridad/BotonPanico'

export default function PaginaInicio() {
  const navigate = useNavigate()
  const { usuario, notificaciones } = useContextoApp()
  const noLeidas = notificaciones.filter(n => !n.leida).length
  const tieneUbicacion = !!usuario?.coordenadas

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="flex flex-col gap-4">
      {/* Saludo */}
      <div className="bg-[#0077C8] -mx-4 -mt-4 px-5 pt-5 pb-6 rounded-b-3xl">
        <p className="text-white/75 text-sm">{saludo},</p>
        <p className="text-white text-xl font-black">{usuario?.nombre ?? 'Vecino/a'} 👋</p>
      </div>

      {/* Estado */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-3">Mi estado</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Cuenta activa
            </span>
            {tieneUbicacion ? (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#0077C8] rounded-full" />
                Ubicación cargada
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#F5A623] rounded-full" />
                Sin ubicación
              </span>
            )}
            {noLeidas > 0 && (
              <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#F5A623] rounded-full" />
                {noLeidas} alerta{noLeidas !== 1 ? 's' : ''} nueva{noLeidas !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón de pánico */}
      <BotonPanico />

      {/* Accesos rápidos */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-3">Accesos rápidos</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/mis-datos')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-blue-100 bg-blue-50 text-[#0077C8] font-bold text-xs"
            >
              <User size={22} />
              Mis Datos
            </button>
            <button
              onClick={() => navigate('/seguridad')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold text-xs"
            >
              <Shield size={22} />
              Seguridad
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verificar en el navegador**

Registrar una cuenta de prueba y verificar que el dashboard muestra saludo, badges de estado y accesos rápidos.

- [ ] **Step 3: Commit**

```bash
git add src/modules/Inicio/
git commit -m "feat: dashboard con saludo, estado y accesos rápidos"
```

---

## Task 12: Módulo Seguridad — BotonPanico y PaginaSeguridad

**Files:**
- Create: `src/modules/Seguridad/BotonPanico.tsx`
- Modify: `src/modules/Seguridad/PaginaSeguridad.tsx`
- Create: `src/modules/Seguridad/useSeguridad.ts`

- [ ] **Step 1: Crear `src/modules/Seguridad/useSeguridad.ts`**

```typescript
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
```

- [ ] **Step 2: Crear `src/modules/Seguridad/BotonPanico.tsx`**

```typescript
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { useContextoApp } from '../../context/ContextoApp'
import { useSeguridad } from './useSeguridad'

export function BotonPanico() {
  const { usuario } = useContextoApp()
  const navigate = useNavigate()
  const { enviando, alertaEnviada, activarAlerta, resetear } = useSeguridad()
  const [modalAbierto, setModalAbierto] = useState(false)

  const manejarPresion = () => {
    if (!usuario?.coordenadas) {
      setModalAbierto(true)
      return
    }
    activarAlerta(usuario.coordenadas)
  }

  if (alertaEnviada) {
    return (
      <div className="w-full bg-white rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-green-100">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-white" />
        </div>
        <p className="text-base font-bold text-green-700">
          Su solicitud de seguridad está siendo atendida.
        </p>
        <Button variant="outline" onClick={resetear}>Cerrar</Button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={manejarPresion}
        disabled={enviando}
        className="w-full py-5 rounded-2xl bg-red-600 text-white font-black text-lg flex items-center justify-center gap-4 shadow-lg shadow-red-600/40 animate-pulso-lento active:scale-95 transition-transform disabled:opacity-70"
      >
        {enviando ? (
          <Loader2 size={28} className="animate-spin" />
        ) : (
          <>
            <div className="w-10 h-10 bg-white/25 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={22} />
            </div>
            <div className="text-left">
              <div>BOTÓN DE PÁNICO</div>
              <div className="text-sm font-medium opacity-80">Solo en caso de emergencia</div>
            </div>
          </>
        )}
      </button>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubicación requerida</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Debe cargar su ubicación exacta en <strong>Mis Datos</strong> antes de utilizar el botón de pánico.
          </p>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cerrar
            </Button>
            <Button
              className="bg-[#0077C8]"
              onClick={() => { setModalAbierto(false); navigate('/mis-datos') }}
            >
              Ir a Mis Datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 3: Reemplazar `src/modules/Seguridad/PaginaSeguridad.tsx`**

```typescript
import { Shield, Info } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { BotonPanico } from './BotonPanico'
import { useContextoApp } from '../../context/ContextoApp'

export default function PaginaSeguridad() {
  const { usuario } = useContextoApp()
  const tieneUbicacion = !!usuario?.coordenadas

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={20} className="text-[#0077C8]" />
        <h1 className="text-lg font-black text-[#1A1A2E]">Seguridad</h1>
      </div>

      <BotonPanico />

      {!tieneUbicacion && (
        <div className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <Info size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700 font-medium">
            Para usar el botón de pánico, primero cargá tu ubicación en <strong>Mis Datos</strong>.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-3">
            ¿Cómo funciona?
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <p>🔴 Presioná el botón en caso de emergencia.</p>
            <p>📍 Tu ubicación GPS se enviará automáticamente.</p>
            <p>👮 El municipio recibirá la alerta de inmediato.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Verificar en el navegador**

Iniciar sesión → ir a Seguridad. Sin coordenadas: el botón debe abrir el modal. Con coordenadas cargadas: debe mostrar el overlay de confirmación.

- [ ] **Step 5: Commit**

```bash
git add src/modules/Seguridad/
git commit -m "feat: botón de pánico con validación de coordenadas"
```

---

## Task 13: Módulo Mis Datos — useMisDatos y SelectorMapa

**Files:**
- Create: `src/modules/MisDatos/useMisDatos.ts`
- Create: `src/modules/MisDatos/SelectorMapa.tsx`
- Modify: `src/modules/MisDatos/PaginaMisDatos.tsx`

- [ ] **Step 1: Crear `src/modules/MisDatos/useMisDatos.ts`**

```typescript
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
```

- [ ] **Step 2: Crear `src/modules/MisDatos/SelectorMapa.tsx`**

```typescript
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordenadas } from '../../context/tipos'

// Fix: Leaflet no resuelve bien los iconos con Vite por defecto
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CENTRO_POCITO: [number, number] = [-31.6553, -68.5694]

function ManejadorClic({ alSeleccionar }: { alSeleccionar: (c: Coordenadas) => void }) {
  useMapEvents({
    click(e) {
      alSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

interface Props {
  coordenadas: Coordenadas | null
  alSeleccionar: (c: Coordenadas) => void
}

export function SelectorMapa({ coordenadas, alSeleccionar }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-48 rounded-xl overflow-hidden border-2 border-dashed border-[#27A9E1]">
        <MapContainer
          center={coordenadas ? [coordenadas.lat, coordenadas.lng] : CENTRO_POCITO}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ManejadorClic alSeleccionar={alSeleccionar} />
          {coordenadas && <Marker position={[coordenadas.lat, coordenadas.lng]} />}
        </MapContainer>
      </div>
      {coordenadas ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">
            Lat: {coordenadas.lat.toFixed(6)} · Lng: {coordenadas.lng.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0077C8] font-bold underline underline-offset-2"
          >
            Abrir en Google Maps ↗
          </a>
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">Tocá el mapa para marcar tu ubicación exacta</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Reemplazar `src/modules/MisDatos/PaginaMisDatos.tsx`**

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from 'lucide-react'
import { useMisDatos } from './useMisDatos'
import { SelectorMapa } from './SelectorMapa'
import { useToast } from '../../hooks/use-toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { Card, CardContent } from '../../components/ui/card'
import type { Coordenadas } from '../../context/tipos'
import { useState, useEffect } from 'react'

const esquema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  dni: z.string().min(7, 'DNI inválido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  direccion: z.string().min(3, 'Dirección requerida'),
  estadoCivil: z.string().min(1, 'Requerido'),
  cantidadPersonas: z.coerce.number().min(1, 'Mínimo 1').max(20, 'Máximo 20'),
  observacionesMedicas: z.string(),
})
type Datos = z.infer<typeof esquema>

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente']

export default function PaginaMisDatos() {
  const { usuario, guardar } = useMisDatos()
  const { toast } = useToast()
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(usuario?.coordenadas ?? null)

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      dni: usuario?.dni ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
      estadoCivil: usuario?.estadoCivil ?? '',
      cantidadPersonas: usuario?.cantidadPersonas ?? 1,
      observacionesMedicas: usuario?.observacionesMedicas ?? '',
    },
  })

  useEffect(() => {
    if (usuario) formulario.reset({ ...usuario, cantidadPersonas: usuario.cantidadPersonas })
    setCoordenadas(usuario?.coordenadas ?? null)
  }, [usuario])

  const alEnviar = async (datos: Datos) => {
    try {
      await guardar({ ...datos, coordenadas })
      toast({ title: 'Datos guardados', description: 'Tu perfil fue actualizado correctamente.' })
    } catch {
      toast({ title: 'Error', description: 'No se pudieron guardar los datos', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <User size={20} className="text-[#0077C8]" />
        <h1 className="text-lg font-black text-[#1A1A2E]">Mis Datos</h1>
      </div>

      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-4 flex flex-col gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Información personal</p>
              {([
                { name: 'nombre' as const, label: 'Nombre completo' },
                { name: 'dni' as const, label: 'DNI', inputMode: 'numeric' as const },
                { name: 'email' as const, label: 'Email', type: 'email' },
                { name: 'telefono' as const, label: 'Teléfono', inputMode: 'tel' as const },
                { name: 'direccion' as const, label: 'Dirección' },
              ] as const).map(({ name, label, type, inputMode }) => (
                <FormField key={name} control={formulario.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type={type} inputMode={inputMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}

              <FormField control={formulario.control} name="estadoCivil" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado civil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccioná..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_CIVILES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="cantidadPersonas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Personas en la vivienda</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" min={1} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="observacionesMedicas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones médicas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alergias, condiciones médicas relevantes..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 flex flex-col gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Ubicación</p>
              <SelectorMapa coordenadas={coordenadas} alSeleccionar={setCoordenadas} />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#0077C8] hover:bg-[#27A9E1] font-bold"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

- [ ] **Step 4: Verificar en el navegador**

Ir a Mis Datos. Verificar que:
- Los campos muestran los datos del usuario
- El mapa se renderiza centrado en Pocito
- Al hacer click en el mapa aparece un marcador y se muestran las coordenadas
- El botón "Abrir en Google Maps" abre el link correcto
- Guardar muestra el toast de confirmación

- [ ] **Step 5: Commit**

```bash
git add src/modules/MisDatos/
git commit -m "feat: módulo Mis Datos con mapa Leaflet y selector de coordenadas"
```

---

## Task 14: Módulo Notificaciones

**Files:**
- Create: `src/modules/Notificaciones/TarjetaNotificacion.tsx`
- Modify: `src/modules/Notificaciones/PaginaNotificaciones.tsx`

- [ ] **Step 1: Crear `src/modules/Notificaciones/TarjetaNotificacion.tsx`**

```typescript
import type { Notificacion } from '../../context/tipos'

interface Props {
  notificacion: Notificacion
  alMarcarLeida: (id: string) => void
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  const ahora = new Date()
  const diff = ahora.getTime() - fecha.getTime()
  const horas = Math.floor(diff / 3600000)
  if (horas < 1) return 'Hace un momento'
  if (horas < 24) return `Hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'Ayer'
  return `Hace ${dias} días`
}

export function TarjetaNotificacion({ notificacion, alMarcarLeida }: Props) {
  return (
    <button
      onClick={() => !notificacion.leida && alMarcarLeida(notificacion.id)}
      className={`w-full flex gap-3 items-start p-4 rounded-xl text-left transition-colors ${
        notificacion.leida
          ? 'bg-white border border-gray-100'
          : 'bg-blue-50 border border-[#27A9E1]/30'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-[#0077C8] flex items-center justify-center text-white text-sm font-black shrink-0">
        P
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{notificacion.titulo}</p>
          <span
            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
              notificacion.leida ? 'border border-gray-300' : 'bg-[#F5A623]'
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notificacion.mensaje}</p>
        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{formatearFecha(notificacion.fecha)}</p>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Reemplazar `src/modules/Notificaciones/PaginaNotificaciones.tsx`**

```typescript
import { Bell } from 'lucide-react'
import { TarjetaNotificacion } from './TarjetaNotificacion'
import { useContextoApp } from '../../context/ContextoApp'

export default function PaginaNotificaciones() {
  const { notificaciones, marcarNotificacionLeida } = useContextoApp()

  const ordenadas = [...notificaciones].sort((a, b) => {
    if (a.leida !== b.leida) return a.leida ? 1 : -1
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[#0077C8]" />
          <h1 className="text-lg font-black text-[#1A1A2E]">Notificaciones</h1>
        </div>
        {noLeidas > 0 && (
          <span className="bg-[#F5A623] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
            {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {ordenadas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sin notificaciones</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ordenadas.map(n => (
            <TarjetaNotificacion key={n.id} notificacion={n} alMarcarLeida={marcarNotificacionLeida} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar en el navegador**

Ir a Notificaciones. Verificar que:
- Las notificaciones no leídas aparecen primero con fondo azul claro y punto amarillo
- Al tocar una notificación no leída, el punto desaparece
- El badge en la campana del Encabezado se actualiza

- [ ] **Step 4: Commit**

```bash
git add src/modules/Notificaciones/
git commit -m "feat: módulo de notificaciones con marcar como leída"
```

---

## Task 15: Configuración PWA

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icons/icon-192.png` (manual)
- Create: `public/icons/icon-512.png` (manual)

- [ ] **Step 1: Crear íconos PWA**

Convertir `src/assets/logo-municipio-pocito.jpeg` a PNG en dos tamaños.
Usando cualquier herramienta (Squoosh, GIMP, o un script Node):

```bash
node -e "
const sharp = require('sharp');
// Si no tenés sharp: npm install sharp -D
// O crear íconos simples manualmente en public/icons/
"
```

**Alternativa simple:** Copiar el logo y renombrarlo (para desarrollo):
```bash
mkdir -p public/icons
cp src/assets/logo-municipio-pocito.jpeg public/icons/icon-192.png
cp src/assets/logo-municipio-pocito.jpeg public/icons/icon-512.png
```

> Para producción, generar PNGs reales de 192×192 y 512×512.

- [ ] **Step 2: Reemplazar `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Pocito Municipio',
        short_name: 'Pocito',
        description: 'App vecinal del Municipio de Pocito, San Juan',
        theme_color: '#0077C8',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/login',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 3: Verificar build de producción**

```bash
npm run build
npm run preview
```

Abrir `http://localhost:4173`. En Chrome DevTools → Application → Manifest: verificar que aparece el nombre "Pocito Municipio" y los íconos. En Application → Service Workers: verificar que el SW está activo.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts public/
git commit -m "feat: configuración PWA con manifest y service worker"
```

---

## Task 16: Revisión final e integración

- [ ] **Step 1: Flujo completo de registro → login**

1. Abrir `http://localhost:5173`
2. Ir a Registro → completar todos los campos → enviar
3. Verificar redirección al Dashboard
4. Verificar que el nombre aparece en el saludo

- [ ] **Step 2: Flujo de Mis Datos + botón de pánico**

1. Ir a Mis Datos → tocar el mapa en una ubicación → Guardar
2. Verificar toast "Datos guardados"
3. Ir a Seguridad → presionar "BOTÓN DE PÁNICO"
4. Verificar que aparece el overlay de confirmación (no el modal de error)

- [ ] **Step 3: Flujo sin ubicación**

1. Registrar nuevo usuario (sin guardar ubicación)
2. Ir a Seguridad → presionar el botón de pánico
3. Verificar que aparece el modal "Debe cargar su ubicación..."
4. Presionar "Ir a Mis Datos" → verificar redirección

- [ ] **Step 4: Flujo de notificaciones**

1. Ir a Notificaciones
2. Verificar que hay notificaciones no leídas (punto amarillo)
3. Tocar una → verificar que el punto desaparece
4. Verificar que el badge en el Encabezado se actualiza

- [ ] **Step 5: Verificar TypeScript**

```bash
npm run build
```

Esperado: 0 errores de TypeScript.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "feat: PWA Pocito Municipio - implementación completa"
```

---

## Checklist de spec

| Requisito del spec | Task |
|---|---|
| Login con DNI + contraseña | Task 9 |
| Registro completo con validaciones | Task 10 |
| Context API global | Task 3 |
| Servicio simulado (localStorage) | Task 4 |
| Router con rutas protegidas | Task 6 |
| Layout con Navbar + SOS elevado | Tasks 6-7 |
| Dashboard con saludo y badges | Task 11 |
| Mis Datos con formulario + mapa Leaflet | Task 13 |
| Botón "Abrir en Google Maps" | Task 13 |
| Botón de pánico con validación de coordenadas | Task 12 |
| Modal cuando no hay coordenadas | Task 12 |
| Overlay de confirmación al enviar alerta | Task 12 |
| Notificaciones con marcar como leída | Task 14 |
| Badge de no leídas en campana | Task 7 |
| shadcn/ui como base de componentes | Tasks 9-14 |
| Tailwind v4 con tokens institucionales | Task 2 |
| Fuente Nunito offline | Task 2 |
| PWA instalable con manifest y SW | Task 15 |
| Caché offline de assets | Task 15 |
| Caché de tiles Leaflet | Task 15 |
| Interceptor preparado para backend | Task 5 |
