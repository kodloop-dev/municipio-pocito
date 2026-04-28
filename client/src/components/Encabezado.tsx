import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useContextoApp } from '../context/ContextoApp'
import logoPocito from '../assets/logo-municipio-pocito.jpeg'

export function Encabezado() {
  const navigate = useNavigate()
  const { notificaciones } = useContextoApp()
  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <header
      className="px-4 py-3 flex items-center justify-between shrink-0"
      style={{ background: '#003f87' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <img src={logoPocito} alt="Logo Pocito" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <p className="text-white text-[13px] font-black leading-tight tracking-[0.12em]">POCITO</p>
          <p className="text-white/65 text-[10px] font-medium leading-none mt-0.5">Municipio · App Vecinal</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/notificaciones')}
        aria-label="Ver notificaciones"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:opacity-80"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <Bell size={17} className="text-white" />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full" />
        )}
      </button>
    </header>
  )
}
