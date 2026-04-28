import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, MapPin, CheckCircle2, BellRing, Bell, ClipboardList,
  CircleDashed, Lightbulb, Trash2, TreePine, Hammer, MoreHorizontal,
  ChevronRight, type LucideIcon,
} from 'lucide-react'
import { useContextoApp } from '../../context/ContextoApp'
import { apiSimulada } from '../../services/apiSimulada'
import type { Reporte } from '../../context/tipos'

const ICONO_CATEGORIA: Record<string, { icono: LucideIcon; color: string; bg: string }> = {
  bache:      { icono: CircleDashed,   color: 'text-orange-500',  bg: 'bg-orange-50' },
  luminaria:  { icono: Lightbulb,      color: 'text-yellow-500',  bg: 'bg-yellow-50' },
  basura:     { icono: Trash2,         color: 'text-green-600',   bg: 'bg-green-50' },
  arbol:      { icono: TreePine,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  vandalismo: { icono: Hammer,         color: 'text-red-500',     bg: 'bg-red-50' },
  otro:       { icono: MoreHorizontal, color: 'text-gray-500',    bg: 'bg-gray-100' },
}

const LABEL_CATEGORIA: Record<string, string> = {
  bache: 'Bache', luminaria: 'Luminaria', basura: 'Basura',
  arbol: 'Árbol caído', vandalismo: 'Vandalismo', otro: 'Otro',
}

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  resuelto:    { label: 'Resuelto',    color: 'bg-green-100 text-green-700' },
}

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export default function PaginaInicio() {
  const navigate = useNavigate()
  const { usuario, notificaciones } = useContextoApp()
  const [ultimoReporte, setUltimoReporte] = useState<Reporte | null>(null)

  const noLeidas = notificaciones.filter(n => !n.leida).length
  const tieneUbicacion = !!usuario?.coordenadas
  const ultimaNoLeida = notificaciones.find(n => !n.leida) ?? null

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = usuario?.nombre?.split(' ')[0] ?? 'Vecino/a'

  useEffect(() => {
    apiSimulada.obtenerReportes().then(r => setUltimoReporte(r[0] ?? null))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div
        className="-mx-4 -mt-4 px-5 pt-6 pb-7 rounded-b-[32px] relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #003f87 0%, #0077C8 60%, #27A9E1 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute top-8 -right-4 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <p className="text-white/65 text-[13px] font-medium relative z-10">{saludo},</p>
        <p className="text-white text-[23px] font-black leading-tight relative z-10 mt-0.5">{nombre}</p>

        <div className="flex flex-wrap gap-2 mt-4 relative z-10">
          <span className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <CheckCircle2 size={11} />
            Cuenta activa
          </span>
          {tieneUbicacion ? (
            <span className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <MapPin size={11} />
              Ubicación cargada
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(245,166,35,0.75)' }}>
              <MapPin size={11} />
              Sin ubicación
            </span>
          )}
          {noLeidas > 0 && (
            <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(245,166,35,0.75)' }}>
              <BellRing size={11} />
              {noLeidas} alerta{noLeidas !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Último reporte */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-0.5">
          Último reporte
        </p>
        {ultimoReporte ? (() => {
          const cfg = ICONO_CATEGORIA[ultimoReporte.categoria]
          const Icono = cfg?.icono ?? ClipboardList
          const estado = ESTADO_CONFIG[ultimoReporte.estado]
          return (
            <button
              onClick={() => navigate('/reportes')}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg?.bg ?? 'bg-gray-100'}`}>
                <Icono size={18} className={cfg?.color ?? 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-[#1A1A2E] truncate">
                    {LABEL_CATEGORIA[ultimoReporte.categoria] ?? ultimoReporte.categoria}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${estado.color}`}>
                    {estado.label}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 mt-0.5 truncate">{ultimoReporte.descripcion}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatearFecha(ultimoReporte.fecha)}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )
        })() : (
          <button
            onClick={() => navigate('/reportes')}
            className="w-full bg-white border border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <ClipboardList size={18} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-400 font-medium">Sin reportes aún — hacé el primero</p>
            <ChevronRight size={16} className="text-gray-300 shrink-0 ml-auto" />
          </button>
        )}
      </div>

      {/* Última notificación no leída */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-0.5">
          Última alerta
        </p>
        {ultimaNoLeida ? (
          <button
            onClick={() => navigate('/notificaciones')}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 relative">
              <Bell size={18} className="text-[#0077C8]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#1A1A2E] truncate">{ultimaNoLeida.titulo}</p>
              <p className="text-[12px] text-gray-500 mt-0.5 truncate">{ultimaNoLeida.mensaje}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{formatearFecha(ultimaNoLeida.fecha)}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        ) : (
          <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-400 font-medium">Sin alertas pendientes</p>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-0.5">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/mis-datos')}
            className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 text-left active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <User size={18} className="text-[#0077C8]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1A1A2E]">Mis Datos</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Perfil y ubicación</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/reportes')}
            className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 text-left active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <ClipboardList size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1A1A2E]">Reportes</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Problemas del barrio</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
