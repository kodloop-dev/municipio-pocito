# Diseño: Pocito Municipio PWA

**Fecha:** 2026-04-26  
**Proyecto:** sisem-client  
**Stack:** React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Vite 8

---

## 1. Resumen

PWA institucional para el Municipio de Pocito, San Juan. Permite a vecinos registrarse, cargar sus datos personales y de ubicación, usar un botón de pánico, y recibir notificaciones. El frontend usa datos simulados en `localStorage`; la arquitectura del servicio está diseñada para que el reemplazo por un backend real sea mínimo.

---

## 2. Identidad Visual

| Token | Valor |
|---|---|
| Azul principal | `#0077C8` |
| Azul claro | `#27A9E1` |
| Amarillo | `#F5A623` |
| Blanco | `#FFFFFF` |
| Fondo | `#F4F6FB` |
| Texto oscuro | `#1A1A2E` |

**Tipografía:** Nunito (vía `@fontsource/nunito`, sin CDN externo para soporte offline PWA)  
**Íconos:** `lucide-react` (incluido con shadcn/ui)  
**Logo:** `src/assets/logo-municipio-pocito.jpeg`  
**Nombre de la app:** "Pocito Municipio" (nombre institucional provisional)

---

## 3. Estructura de Carpetas

```
src/
  assets/                        → logo-municipio-pocito.jpeg
  components/                    → Componentes compartidos
    Navbar.tsx                   → Barra de navegación inferior mobile-first
    Encabezado.tsx               → Header institucional
    RutaProtegida.tsx            → Wrapper de rutas autenticadas
  hooks/
    useAlmacenamientoLocal.ts    → Abstracción de localStorage
    useGeolocalizacion.ts        → Geolocalización del navegador
  interceptors/
    apiCliente.ts                → Fetch wrapper (swap a backend real aquí)
  layouts/
    DiseñoApp.tsx                → Layout con Encabezado + Navbar inferior
    DiseñoAutenticacion.tsx      → Layout centrado solo con logo
  modules/
    Autenticacion/
      PaginaLogin.tsx
      PaginaRegistro.tsx
      useAutenticacion.ts
    MisDatos/
      PaginaMisDatos.tsx
      SelectorMapa.tsx           → Componente Leaflet
      useMisDatos.ts
    Seguridad/
      PaginaSeguridad.tsx
      BotonPanico.tsx
      useSeguridad.ts
    Notificaciones/
      PaginaNotificaciones.tsx
      TarjetaNotificacion.tsx
      useNotificaciones.ts
  router/
    index.tsx                    → Configuración React Router v6
  services/
    apiSimulada.ts               → Mock API (localStorage); reemplazable por fetch
  context/
    ContextoApp.tsx              → Context API global + Provider
    tipos.ts                     → TypeScript types del estado global
  utils/
    formateadores.ts
    validaciones.ts
  App.tsx
  main.tsx
```

---

## 4. Estado Global (Context API)

```typescript
// context/tipos.ts
interface Usuario {
  nombre: string
  dni: string
  email: string
  telefono: string
  direccion: string
  estadoCivil: string
  cantidadPersonas: number
  observacionesMedicas: string
  coordenadas: { lat: number; lng: number } | null
}

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
}

interface EstadoApp {
  usuario: Usuario | null
  sesionActiva: boolean
  notificaciones: Notificacion[]
}
```

**Regla de acceso a datos:**  
Los módulos acceden a datos únicamente a través de sus hooks (`useMisDatos`, `useAutenticacion`, etc.). Los hooks llaman a `services/apiSimulada.ts`. Ninguna página accede directamente a `localStorage`.

---

## 5. Servicio Simulado (`services/apiSimulada.ts`)

Expone funciones con la misma firma que tendría el futuro backend:

```typescript
obtenerUsuario(): Promise<Usuario | null>
guardarDatos(datos: Partial<Usuario>): Promise<void>
iniciarSesion(dni: string, contraseña: string): Promise<Usuario>
registrarUsuario(datos: Usuario): Promise<void>
cerrarSesion(): Promise<void>
obtenerNotificaciones(): Promise<Notificacion[]>
marcarNotificacionLeida(id: string): Promise<void>
enviarAlerta(coordenadas: { lat: number; lng: number }): Promise<void>
```

Hoy escribe/lee en `localStorage`. Cuando llegue el backend, se reemplazan estas implementaciones por `fetch()` sin tocar el resto de la app.

---

## 6. Sistema de Rutas

```
/                       → redirige a /login
/login                  → PaginaLogin        (DiseñoAutenticacion)
/registro               → PaginaRegistro     (DiseñoAutenticacion)
/inicio                 → PaginaInicio       (DiseñoApp)
/mis-datos              → PaginaMisDatos     (DiseñoApp)
/seguridad              → PaginaSeguridad    (DiseñoApp)
/notificaciones         → PaginaNotificaciones (DiseñoApp)
```

**`RutaProtegida`:** Verifica `sesionActiva`. Sin sesión → redirige a `/login`. Con sesión en `/login` → redirige a `/inicio`.

---

## 7. Layouts

### `DiseñoAutenticacion`
- Fondo `#F4F6FB`
- Logo centrado + nombre del municipio
- Tarjeta blanca con formulario
- Sin navbar

### `DiseñoApp`
- **Header superior:** Logo pequeño + "POCITO / Municipio" + ícono campana (con badge amarillo de no leídas)
- **Contenido:** `<Outlet />` scrollable
- **Navbar inferior fija (mobile-first):**
  ```
  [🏠 Inicio] [👤 Mis Datos] [🆘 SOS elevado] [🛡️ Seguridad] [🔔 Notificaciones]
  ```
  El botón SOS está elevado (-16px) con fondo rojo, igual al prototipo HTML de referencia.

---

## 8. Módulos

### 8.0 Inicio (Dashboard)

**PaginaInicio** (módulo standalone, carpeta `modules/Inicio/`):
- Saludo personalizado: "Buenos días, {nombre}" con ícono de bienvenida
- **Badges de estado** (card):
  - Verde: "Cuenta activa"
  - Azul: "Ubicación cargada" (solo si `coordenadas !== null`)
  - Amarillo: "{n} alerta(s) activa(s)" (si hay notificaciones no leídas)
- **Accesos rápidos** (grid 2 columnas):
  - [Mis Datos] → navega a `/mis-datos`
  - [Seguridad] → navega a `/seguridad`
- **Botón de pánico** (igual al de `PaginaSeguridad`) — acceso directo desde inicio

### 8.1 Autenticación

**PaginaLogin:**
- Campo DNI (texto, requerido)
- Campo Contraseña (password, mínimo 6 caracteres)
- Botón "Ingresar" (azul principal)
- Link "¿No tenés cuenta? Registrarse"
- Validación: campos requeridos + longitud mínima contraseña

**PaginaRegistro:**
- Nombre completo
- DNI
- Dirección
- Estado civil (select: Soltero/a, Casado/a, Divorciado/a, Viudo/a)
- Email (validación de formato)
- Teléfono
- Contraseña (mínimo 6 caracteres)
- Botón "Registrarse"
- Link "¿Ya tenés cuenta? Iniciar sesión"

### 8.2 Mis Datos

**PaginaMisDatos:**
- Vista de datos del usuario (modo lectura/edición)
- Formulario editable con los mismos campos del registro + campos adicionales:
  - Cantidad de personas en la vivienda (número)
  - Observaciones médicas (textarea)
  - Coordenadas (auto-completadas desde el mapa, solo lectura)
- **SelectorMapa:** Componente Leaflet
  - Mapa interactivo centrado en Pocito, San Juan
  - Al hacer tap/click, fija un marcador y guarda lat/lng
  - Botón "Abrir en Google Maps" → link externo `https://www.google.com/maps?q={lat},{lng}`
- Botón "Guardar cambios" → Toast de confirmación

### 8.3 Seguridad

**PaginaSeguridad:**
- **BotonPanico:** Botón grande, rojo, con animación de pulso CSS
  - Texto: "BOTÓN DE PÁNICO" / "Solo en caso de emergencia"
  - Ícono de SOS (lucide-react)

**Lógica del botón de pánico:**
```
Si coordenadas === null:
  → Abrir Dialog (modal):
    "Debe cargar su ubicación exacta en Mis Datos antes de utilizar el botón de pánico."
    [Ir a Mis Datos] [Cerrar]

Si coordenadas !== null:
  → Llamar a apiSimulada.enviarAlerta(coordenadas)
  → Mostrar overlay de confirmación:
    "Su solicitud de seguridad está siendo atendida."
    [✓ verde] [Cerrar]
```

### 8.4 Notificaciones

**PaginaNotificaciones:**
- Lista de `TarjetaNotificacion`
- Indicador visual: punto amarillo (no leída) / borde gris (leída)
- Tap en tarjeta → marca como leída (actualiza estado en contexto + `apiSimulada`)
- Orden: no leídas primero, luego por fecha descendente

**TarjetaNotificacion:**
- Avatar circular con inicial del municipio (azul principal)
- Título, mensaje, fecha formateada
- Punto de estado (amarillo/gris)

---

## 9. Componentes shadcn/ui Utilizados

| Componente | Uso |
|---|---|
| `Button` | Variantes: `primario` (azul), `secundario`, `peligro` (rojo) |
| `Input` | Campos de formulario |
| `Form` + `FormField` | Formularios con validación Zod |
| `Card` | Tarjetas de datos y notificaciones |
| `Dialog` | Modal de validación del botón de pánico |
| `Toast` / `Toaster` | Feedback: guardado, alerta enviada, errores |
| `Badge` | Estado de notificaciones en navbar |
| `Label` | Etiquetas accesibles de formulario |
| `Select` | Estado civil |
| `Textarea` | Observaciones médicas |

**Tokens de color en `index.css`:**
```css
@theme {
  --color-azul-principal: #0077C8;
  --color-azul-claro: #27A9E1;
  --color-amarillo: #F5A623;
  --color-fondo: #F4F6FB;
  --color-texto: #1A1A2E;
}
```

---

## 10. Mapa (Leaflet)

- **Librería:** `leaflet` + `react-leaflet`
- **Tiles:** OpenStreetMap (gratuito, sin API key)
- **Centro inicial:** Pocito, San Juan (-31.6553, -68.5694)
- **Zoom inicial:** 14
- **Marcador:** Al hacer click en el mapa, se fija marcador y se guardan las coordenadas
- **Botón "Abrir en Google Maps":** Link externo, no requiere API key
- **PWA cache:** Tiles cacheados con estrategia `StaleWhileRevalidate`

---

## 11. Configuración PWA

**Plugin:** `vite-plugin-pwa`

**manifest.webmanifest:**
```json
{
  "name": "Pocito Municipio",
  "short_name": "Pocito",
  "theme_color": "#0077C8",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "start_url": "/login",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Estrategias de caché del Service Worker:**
| Recurso | Estrategia |
|---|---|
| JS, CSS, fuentes, imágenes | `CacheFirst` |
| Llamadas a API (futuro) | `NetworkFirst` |
| Tiles de Leaflet (OpenStreetMap) | `StaleWhileRevalidate` |

---

## 12. Dependencias a Instalar

```bash
# Routing
npm install react-router-dom

# shadcn/ui (init + componentes)
npx shadcn@latest init
npx shadcn@latest add button input form card dialog toast badge label select textarea

# Mapa
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Tipografía offline
npm install @fontsource/nunito

# Estado global (solo Context API, sin librería extra)

# PWA
npm install -D vite-plugin-pwa

# Validaciones de formulario
npm install zod @hookform/resolvers react-hook-form
```

---

## 13. Consideraciones de Seguridad (para el Backend)

Los siguientes datos se manejan como sensibles y en la implementación real deben:
- Transmitirse sobre HTTPS
- Almacenarse cifrados en la base de datos
- Requerir autenticación JWT
- Las coordenadas y datos médicos deben tener control de acceso estricto

Por ahora el frontend los trata como datos de sesión en `localStorage` (solo simulación).

---

## 14. Criterios de Éxito

- [ ] App instalable como PWA desde navegador móvil
- [ ] Funciona offline para datos ya cargados
- [ ] Login con DNI + contraseña funcional (simulado)
- [ ] Registro completo con validaciones
- [ ] Mapa Leaflet permite seleccionar y guardar coordenadas
- [ ] Botón de pánico valida coordenadas antes de activarse
- [ ] Notificaciones se pueden marcar como leídas
- [ ] Navbar inferior con SOS elevado en centro
- [ ] Diseño responsive mobile-first con paleta institucional
- [ ] Arquitectura de servicio lista para swap a backend real
