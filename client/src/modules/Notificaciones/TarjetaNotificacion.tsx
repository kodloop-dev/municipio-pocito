import type { Notificacion } from '../../context/tipos'
import { Bell } from 'lucide-react'

interface Props {
  notificacion: Notificacion
  alMarcarLeida: (id: string) => void
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  const ahora = new Date()
  const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const diff = ahora.getTime() - fecha.getTime()
  const horas = Math.floor(diff / 3600000)
  if (horas < 1) return `Hace un momento · ${hora}`
  if (horas < 24) return `Hoy ${hora}`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return `Ayer ${hora}`
  return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} · ${hora}`
}

export function TarjetaNotificacion({ notificacion, alMarcarLeida }: Props) {
  return (
    <button
      onClick={() => !notificacion.leida && alMarcarLeida(notificacion.id)}
      className={`w-full flex gap-3 items-start p-4 rounded-2xl text-left transition-all active:scale-[0.99] ${
        notificacion.leida
          ? 'bg-white border border-gray-100'
          : 'bg-white border border-[#0077C8]/12'
      }`}
      style={
        notificacion.leida
          ? { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
          : { boxShadow: '0 2px 14px rgba(0,119,200,0.10)' }
      }
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          notificacion.leida ? 'bg-gray-100' : 'bg-[#0077C8]'
        }`}
      >
        <Bell size={15} className={notificacion.leida ? 'text-gray-400' : 'text-white'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] font-bold leading-tight ${
            notificacion.leida ? 'text-gray-500' : 'text-[#1A1A2E]'
          }`}>
            {notificacion.titulo}
          </p>
          {!notificacion.leida && (
            <span className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-[12px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {notificacion.mensaje}
        </p>
        <p className="text-[10px] text-gray-300 mt-2 font-medium">
          {formatearFecha(notificacion.fecha)}
        </p>
      </div>
    </button>
  )
}
