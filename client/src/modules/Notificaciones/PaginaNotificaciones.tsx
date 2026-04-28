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
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Notificaciones</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
          </p>
        </div>
        {noLeidas > 0 && (
          <span className="bg-[#F5A623] text-white text-[11px] font-black px-3 py-1 rounded-full mb-0.5">
            {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {ordenadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Bell size={26} className="text-gray-300" />
          </div>
          <p className="text-[14px] font-semibold text-gray-400">Sin notificaciones</p>
          <p className="text-[12px] text-gray-300 text-center leading-relaxed">
            Acá aparecerán los avisos del municipio
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {ordenadas.map(n => (
            <TarjetaNotificacion key={n.id} notificacion={n} alMarcarLeida={marcarNotificacionLeida} />
          ))}
        </div>
      )}
    </div>
  )
}
