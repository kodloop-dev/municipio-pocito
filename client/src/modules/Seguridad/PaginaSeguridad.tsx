import { Shield, Info, AlertCircle, MapPin, ShieldCheck } from 'lucide-react'
import { BotonPanico } from './BotonPanico'
import { useContextoApp } from '../../context/ContextoApp'

export default function PaginaSeguridad() {
  const { usuario } = useContextoApp()
  const tieneUbicacion = !!usuario?.coordenadas

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Seguridad</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Centro de emergencias vecinal</p>
      </div>

      <BotonPanico />

      {!tieneUbicacion && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
            Para usar el botón de pánico, primero cargá tu ubicación en <strong>Mis Datos</strong>.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          Como funciona
        </p>
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle size={14} className="text-red-500" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">Presioná en emergencia</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Activá el botón solo en caso de peligro real</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-[#0077C8]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">Ubicación automática</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Tu coordenada GPS se envía de inmediato</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <ShieldCheck size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">Atención municipal</p>
              <p className="text-[11px] text-gray-400 mt-0.5">El municipio recibe la alerta de inmediato</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
