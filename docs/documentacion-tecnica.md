# Documentacion Tecnica - Pocito App Vecinal

**Proyecto:** PWA Municipal - Municipio de Pocito  
**Version:** Demo 1.0  
**Fecha:** Abril 2026  
**Autor:** thomivargas  

---

## 1. Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework UI | React | 19.2.5 |
| Lenguaje | TypeScript | 6.0.2 |
| Bundler | Vite | 8.0.10 |
| Estilos | Tailwind CSS | v4.2.4 |
| Componentes | shadcn/ui + Radix UI | - |
| Iconos | Lucide React | 1.11.0 |
| Mapas | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Enrutamiento | React Router DOM | 7.14.2 |
| Formularios | React Hook Form | 7.74.0 |
| Validacion | Zod | 4.3.6 |
| Notificaciones | Sonner | 2.0.7 |
| PWA | vite-plugin-pwa | 1.2.0 |
| Tipografia | Plus Jakarta Sans | 5.2.8 |
| Testing | Vitest | - |

### Compilacion con React Compiler

Vite esta configurado con el preset `babel-plugin-react-compiler` dentro del plugin `@vitejs/plugin-react`. Esto activa la optimizacion automatica de re-renders sin necesidad de `useMemo`/`useCallback` manual.

```ts
// vite.config.ts (extracto)
react({
  babel: {
    plugins: [["babel-plugin-react-compiler"]]
  }
})
```

---

## 2. Estructura de Directorios

```
sisem/
└── client/
    ├── public/
    │   ├── favicon.svg
    │   └── icons/           # Iconos PWA (192x192, 512x512)
    ├── src/
    │   ├── assets/          # Logo municipal
    │   ├── components/      # Componentes globales + shadcn/ui
    │   │   ├── Encabezado.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── RutaProtegida.tsx
    │   │   └── ui/
    │   ├── context/         # Estado global
    │   │   ├── ContextoApp.tsx
    │   │   └── tipos.ts
    │   ├── hooks/           # Hooks utilitarios
    │   ├── interceptors/    # Wrapper de fetch (apiCliente.ts)
    │   ├── layouts/         # Layouts de rutas
    │   ├── lib/             # Utils (cn)
    │   ├── modules/         # Modulos por funcionalidad
    │   │   ├── Autenticacion/
    │   │   ├── Inicio/
    │   │   ├── MisDatos/
    │   │   ├── Seguridad/
    │   │   ├── Notificaciones/
    │   │   ├── Reportes/
    │   │   └── Cuenta/
    │   ├── router/          # Definicion de rutas
    │   ├── services/        # API simulada (localStorage)
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css        # Tailwind + tokens + animaciones
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 3. Arquitectura de la App

### Patron de modulos

Cada modulo tiene esta estructura interna:

```
/modules/NombreModulo/
├── PaginaNombreModulo.tsx   # Componente de pagina (vista)
├── useNombreModulo.ts       # Hook de logica de negocio
└── ComponenteEspecifico.tsx # Componentes locales si aplica
```

La pagina no tiene logica: delega en el hook. El hook no tiene JSX: delega en la pagina.

### Estado global (Context + Reducer)

```
main.tsx
  └── ProveedorApp (ContextoApp.tsx)
        └── App.tsx
              └── RouterProvider
                    └── DiseñoApp / DiseñoAutenticacion
                          └── Paginas
```

`ContextoApp.tsx` usa `useReducer`. Al montar, llama a `apiSimulada` para hidratar el estado con el usuario y notificaciones de `localStorage`.

Acciones del reducer:
- `INICIAR_SESION` — guarda `usuario` y activa `sesionActiva`
- `CERRAR_SESION` — limpia todo
- `ACTUALIZAR_USUARIO` — merge parcial de datos del usuario
- `ACTUALIZAR_NOTIFICACIONES` — reemplaza el array completo
- `MARCAR_LEIDA` — actualiza `leida: true` en notificacion por id

---

## 4. Rutas

| Ruta | Componente | Autenticada |
|------|-----------|-------------|
| `/` | Redirect a `/login` | No |
| `/login` | PaginaLogin | No |
| `/registro` | PaginaRegistro | No |
| `/inicio` | PaginaInicio | Si |
| `/mis-datos` | PaginaMisDatos | Si |
| `/seguridad` | PaginaSeguridad | Si |
| `/notificaciones` | PaginaNotificaciones | Si |
| `/reportes` | PaginaReportes | Si |
| `/cuenta` | PaginaCuenta | Si |
| `*` | Redirect a `/login` | No |

`RutaProtegida.tsx` verifica `sesionActiva` del contexto. Si es `false`, redirige a `/login`.

---

## 5. Modelos de Datos

### Usuario

```typescript
interface Usuario {
  nombre: string
  dni: string
  email: string
  telefono: string
  direccion: string
  estadoCivil: 'Soltero/a' | 'Casado/a' | 'Divorciado/a' | 'Viudo/a' | 'Conviviente'
  cantidadPersonas: number
  observacionesMedicas: string
  coordenadas: Coordenadas | null
}

interface Coordenadas {
  lat: number
  lng: number
}
```

### Notificacion

```typescript
interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string   // ISO 8601
}
```

### Reporte

```typescript
interface Reporte {
  id: string
  categoria: 'bache' | 'luminaria' | 'basura' | 'arbol' | 'vandalismo' | 'otro'
  descripcion: string
  coordenadas: Coordenadas | null
  estado: 'pendiente' | 'en_revision' | 'resuelto'
  fecha: string   // ISO 8601
}
```

---

## 6. Capa de Servicio (apiSimulada)

Archivo: `src/services/apiSimulada.ts`

Simula una API REST usando `localStorage`. Las claves son:

| Clave localStorage | Contenido |
|-------------------|-----------|
| `pocito_usuario` | Objeto `Usuario` (JSON) |
| `pocito_notificaciones` | Array de `Notificacion[]` (JSON) |
| `pocito_reportes` | Array de `Reporte[]` (JSON) |

Todos los metodos devuelven `Promise` para simular latencia de red y facilitar el reemplazo posterior por `fetch`.

### Metodos disponibles

```typescript
obtenerUsuario(): Promise<Usuario | null>
registrarUsuario(datos: Usuario): Promise<void>
guardarDatos(datos: Partial<Usuario>): Promise<void>
iniciarSesion(dni: string, contraseña: string): Promise<Usuario>
cerrarSesion(): Promise<void>
obtenerNotificaciones(): Promise<Notificacion[]>
marcarNotificacionLeida(id: string): Promise<void>
enviarAlerta(coordenadas: Coordenadas): Promise<void>
obtenerReportes(): Promise<Reporte[]>
guardarReporte(datos: Pick<Reporte, 'categoria' | 'descripcion' | 'coordenadas'>): Promise<Reporte>
```

`iniciarSesion` valida que el `dni` exista en `pocito_usuario` y que la contraseña coincida. Si no, rechaza la promesa con un `Error`.

### Preparacion para backend real

`src/interceptors/apiCliente.ts` es el wrapper de `fetch` listo para cuando llegue el backend. Al conectar:

1. Reemplazar el cuerpo de cada metodo en `apiSimulada.ts` por una llamada a `apiCliente`.
2. En login exitoso, guardar el JWT en `localStorage` bajo la clave `pocito_token`.
3. `apiCliente` ya lee ese token y lo incluye en el header `Authorization: Bearer`.

---

## 7. Hooks Personalizados

### useAlmacenamientoLocal

Sincroniza un valor de estado de React con `localStorage`. Evita doble escritura en el primer render.

```typescript
const [valor, setValor] = useAlmacenamientoLocal<T>('clave', valorInicial)
```

### useGeolocalizacion

Envuelve `navigator.geolocation.getCurrentPosition`.

```typescript
const { coordenadas, error, cargando, obtenerUbicacion } = useGeolocalizacion()
```

Llamar `obtenerUbicacion()` activa la solicitud de permisos del navegador.

### useAutenticacion

Logica de login, registro y logout. Llama a `apiSimulada`, despacha acciones al contexto y navega.

### useMisDatos

Obtiene el usuario del contexto y expone `guardar(datos)` que persiste en `apiSimulada` y actualiza el contexto.

### useSeguridad

Maneja el estado del boton panico: `enviando`, `alertaEnviada`. Expone `activarAlerta(coords)` y `resetear()`.

---

## 8. Validaciones con Zod

### Quirk importante: cantidadPersonas

```typescript
// CORRECTO para Zod v4 + React Hook Form
cantidadPersonas: z.string()

// INCORRECTO - rompe con hookform/resolvers en Zod v4
cantidadPersonas: z.coerce.number()
```

Los inputs numericos como `cantidadPersonas` deben validarse como `z.string()` porque React Hook Form registra todos los inputs como strings. La conversion a numero la hace el handler `onSubmit` antes de guardar.

### Esquemas definidos

- **Login:** `dni` (7-8 digitos numericos), `contrasena` (min 6)
- **Registro:** todos los campos del `Usuario` mas `contrasena`
- **MisDatos:** igual que Registro sin `contrasena`
- **Reporte:** `categoria` (enum 6 valores), `descripcion` (10-500 chars)

---

## 9. Mapa (Leaflet)

Componente: `src/modules/MisDatos/SelectorMapa.tsx`

- Centro inicial: Pocito, San Juan (`-31.6553, -68.5694`)
- Tiles: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- Click en el mapa llama `alSeleccionar({ lat, lng })`
- Muestra marcador `L.Marker` y coordenadas con 6 decimales
- Link directo a Google Maps con las coordenadas

El `vite.config.ts` configura Workbox para cachear los tiles de OSM con estrategia `StaleWhileRevalidate` y TTL de 1 semana, lo que permite usar el mapa offline dentro del area cacheada.

---

## 10. PWA

Configurado via `vite-plugin-pwa` en `vite.config.ts`.

| Parametro | Valor |
|-----------|-------|
| `registerType` | `autoUpdate` |
| `name` | Pocito Municipio |
| `theme_color` | #0077C8 |
| `start_url` | /login |
| `display` | standalone |

El service worker se actualiza automaticamente cuando hay una nueva build. Los tiles de OSM quedan cacheados para modo offline.

Para instalar en Android: Chrome muestra el banner "Agregar a pantalla de inicio" si se sirve desde HTTPS.

---

## 11. Design System

### Colores (tokens Tailwind v4)

```css
--color-azul-principal: #0077C8
--color-azul-claro:     #27A9E1
--color-amarillo:       #F5A623
--color-fondo:          #F4F6FB
--color-texto:          #1A1A2E
```

El azul oscuro `#003f87` se usa en el header y el gradiente de autenticacion pero no tiene token definido (usar como clase arbitraria `bg-[#003f87]`).

### Tipografia

- **Principal:** Plus Jakarta Sans (400, 500, 600, 700, 800) - importada via `@fontsource`
- **Secundaria:** Nunito - importada via `@fontsource`

### Animaciones

- `animate-auth-slide-up` — slide de 52px hacia arriba, 0.55s (bottom sheet de auth)
- `animate-auth-fade-in` — fade in 0.6s (contenido del sheet)
- `animate-pulso-lento` — pulseo escala 1 → 1.1 → 1, 2s infinito (boton panico)

### Convenciones de componentes

- `rounded-2xl` en cards
- `px-4` padding horizontal en paginas
- `pb-24` en `<main>` de DiseñoApp (espacio para navbar fija)
- Gradiente principal: `from-[#003f87] to-[#0077C8]`
- Gradiente de boton: `from-[#0077C8] to-[#27A9E1]`

---

## 12. Layouts

### DiseñoAutenticacion

Para `/login` y `/registro`. Estructura:

```
fondo-gradiente-azul
  └── orbes-decorativos (blur)
  └── hero (logo + "POCITO")
  └── bottom-sheet-blanco-redondeado (animate-auth-slide-up)
        └── <Outlet /> (PaginaLogin o PaginaRegistro)
```

### DiseñoApp

Para todas las rutas autenticadas. Estructura:

```
<div>
  <Encabezado />  ← header fijo superior
  <main pb-24>    ← contenido desplazable
    <Outlet />
  </main>
  <Navbar />      ← barra fija inferior
</div>
```

---

## 13. Navbar

5 items fijos en el orden:

| Posicion | Label | Ruta | Especial |
|----------|-------|------|---------|
| 1 | Inicio | `/inicio` | - |
| 2 | Mis Datos | `/mis-datos` | - |
| 3 | SOS | `/seguridad` | Boton rojo elevado (-mt-6) con pulso |
| 4 | Reportes | `/reportes` | Badge contador si hay reportes pendientes |
| 5 | Cuenta | `/cuenta` | - |

La ruta activa muestra un indicator line azul debajo del icono.

---

## 14. Flujos de Datos

### Login

```
PaginaLogin → useAutenticacion.login(dni, contrasena)
  → apiSimulada.iniciarSesion(dni, contrasena)
    → lee pocito_usuario de localStorage
    → valida credenciales
    → resuelve con Usuario | rechaza con Error
  → contexto.INICIAR_SESION(usuario)
  → navigate('/inicio')
```

### Guardar ubicacion

```
SelectorMapa.onClick → alSeleccionar(coords)
  → PaginaMisDatos actualiza estado local (coordenadas)
  → usuario hace click "Guardar cambios"
  → useMisDatos.guardar(datosFormulario)
    → apiSimulada.guardarDatos({ ...datos, coordenadas })
    → contexto.ACTUALIZAR_USUARIO(datos)
  → toast "Datos guardados"
```

### Boton panico

```
BotonPanico.onClick
  → si sin coordenadas: abre Dialog "ir a Mis Datos"
  → si con coordenadas: useSeguridad.activarAlerta(coords)
      → apiSimulada.enviarAlerta(coords)
      → alertaEnviada = true
      → render PantallaExito
```

### Nuevo reporte

```
PaginaReportes (vista formulario)
  → usuario selecciona categoria + escribe descripcion
  → onClick "Enviar reporte"
    → apiSimulada.guardarReporte({ categoria, descripcion, coordenadas })
      → genera id con crypto.randomUUID()
      → estado inicial: 'pendiente'
      → guarda en pocito_reportes (localStorage)
    → setVista('lista') + incrementa version (fuerza re-render lista)
```

---

## 15. Pasos para Conectar el Backend

1. Implementar los endpoints REST correspondientes a cada metodo de `apiSimulada.ts`.
2. En `src/interceptors/apiCliente.ts`:
   - Configurar la `BASE_URL` del servidor.
   - Leer `pocito_token` del localStorage para el header `Authorization`.
3. En `src/services/apiSimulada.ts`, reemplazar cada metodo por una llamada al `apiCliente`.
4. En `useAutenticacion.login()`, al recibir la respuesta del backend, guardar el JWT en `localStorage` bajo `pocito_token`.
5. En `useAutenticacion.logout()`, eliminar `pocito_token`.

No hay cambios necesarios en los componentes ni en el contexto.

---

## 16. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (con HMR)
npm run dev

# Build de produccion
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Tests
npm run test       # modo watch
npm run test:run   # una sola ejecucion
```

---

## 17. Notas Conocidas

- **cantidadPersonas con Zod v4:** usar `z.string()`, no `z.coerce.number()`. Bug de incompatibilidad con `@hookform/resolvers`.
- **Leaflet en SSR:** React-Leaflet requiere que el componente sea client-side. Si se agrega SSR en el futuro, usar `dynamic import` con `ssr: false`.
- **Tiles OSM en produccion:** La clave de tiles de OpenStreetMap tiene limitaciones de uso. Para produccion con mucho trafico, considerar Mapbox o Stadia Maps.
- **localStorage como "base de datos":** Solo para demo. Al conectar backend real, limpiar `pocito_usuario`, `pocito_notificaciones` y `pocito_reportes` del localStorage. Solo debe quedar `pocito_token`.
- **Tests vacios:** `ContextoApp.test.tsx` y `apiSimulada.test.ts` existen pero no tienen casos implementados. Pendiente para cuando se conecte el backend.
