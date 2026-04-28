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
import PaginaCuenta from '../modules/Cuenta/PaginaCuenta'
import PaginaReportes from '../modules/Reportes/PaginaReportes'

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
          { path: 'cuenta', element: <PaginaCuenta /> },
          { path: 'reportes', element: <PaginaReportes /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
