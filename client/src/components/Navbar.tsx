import { Home, User, AlertCircle, ClipboardList, UserCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

function ItemNav({ to, icono: Icono, label, badge }: {
  to: string
  icono: LucideIcon
  label: string
  badge?: number
}) {
  return (
    <NavLink to={to} className="flex-1 flex flex-col items-center gap-1 py-2.5 relative">
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-[#0077C8]" />
          )}
          <div className={`relative transition-colors ${isActive ? 'text-[#0077C8]' : 'text-gray-400'}`}>
            <Icono size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] bg-[#F5A623] rounded-full text-[8px] font-black text-white flex items-center justify-center px-0.5">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>
          <span className={`text-[9px] font-bold transition-colors ${isActive ? 'text-[#0077C8]' : 'text-gray-400'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function Navbar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white flex items-end z-50"
      style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 20px rgba(0,0,0,0.07)' }}
    >
      <ItemNav to="/inicio" icono={Home} label="Inicio" />
      <ItemNav to="/mis-datos" icono={User} label="Mis Datos" />

      {/* SOS central elevado */}
      <div className="flex-1 flex flex-col items-center pb-2.5">
        <NavLink to="/seguridad" className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-12 -mt-6 rounded-full flex items-center justify-center animate-pulso-lento"
            style={{
              background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
              boxShadow: '0 4px 18px rgba(220,38,38,0.45)',
            }}
          >
            <AlertCircle size={21} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[9px] font-black text-red-600">SOS</span>
        </NavLink>
      </div>

      <ItemNav to="/reportes" icono={ClipboardList} label="Reportes" />
      <ItemNav to="/cuenta" icono={UserCircle} label="Cuenta" />
    </nav>
  )
}
