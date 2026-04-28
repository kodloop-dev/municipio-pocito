import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, ChevronLeft, Send, ClipboardList, CircleDashed, Lightbulb, Trash2, TreePine, Hammer, MoreHorizontal, MapPin, Camera, ImagePlus, X, CircleCheck, XCircle, type LucideIcon } from 'lucide-react'
import { useContextoApp } from '../../context/ContextoApp'
import { apiSimulada } from '../../services/apiSimulada'
import type { Reporte } from '../../context/tipos'

const CATEGORIAS: { id: string; icono: LucideIcon; color: string; bg: string; label: string }[] = [
  { id: 'bache',      icono: CircleDashed, color: 'text-orange-500', bg: 'bg-orange-50',  label: 'Bache' },
  { id: 'luminaria',  icono: Lightbulb,    color: 'text-yellow-500', bg: 'bg-yellow-50',  label: 'Luminaria' },
  { id: 'basura',     icono: Trash2,       color: 'text-green-600',  bg: 'bg-green-50',   label: 'Basura' },
  { id: 'arbol',      icono: TreePine,     color: 'text-emerald-600',bg: 'bg-emerald-50', label: 'Árbol caído' },
  { id: 'vandalismo', icono: Hammer,       color: 'text-red-500',    bg: 'bg-red-50',     label: 'Vandalismo' },
  { id: 'otro',       icono: MoreHorizontal,color: 'text-gray-500',  bg: 'bg-gray-100',   label: 'Otro' },
]

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  resuelto:    { label: 'Resuelto',    color: 'bg-green-100 text-green-700' },
}

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ListaReportes({ onNuevo }: { onNuevo: () => void }) {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    apiSimulada.obtenerReportes().then(r => { setReportes(r); setCargando(false) })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Reportes</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Problemas del barrio</p>
        </div>
        <button
          onClick={onNuevo}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-[13px] font-bold active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)' }}
        >
          <Plus size={15} />
          Nuevo
        </button>
      </div>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : reportes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ClipboardList size={28} className="text-gray-300" />
          </div>
          <p className="text-[14px] font-semibold text-gray-400">Sin reportes todavía</p>
          <p className="text-[12px] text-gray-300 text-center max-w-[200px]">
            Reportá un problema del barrio y hacele seguimiento desde acá
          </p>
          <button
            onClick={onNuevo}
            className="mt-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold"
            style={{ background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)' }}
          >
            Hacer primer reporte
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reportes.map(r => {
            const cat = CATEGORIAS.find(c => c.id === r.categoria)
            const estado = ESTADO_CONFIG[r.estado]
            return (
              <div
                key={r.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                {r.foto && (
                  <img src={r.foto} alt="Foto del reporte" className="w-full h-36 object-cover" />
                )}
                <div className="p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat?.bg ?? 'bg-gray-100'}`}>
                    {cat ? <cat.icono size={18} className={cat.color} /> : <ClipboardList size={18} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#1A1A2E] truncate">{cat?.label ?? r.categoria}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{r.descripcion}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatearFecha(r.fecha)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type Aviso = { tipo: 'exito' | 'error'; mensaje: string } | null

function AvisoFlotante({ aviso, alCerrar }: { aviso: NonNullable<Aviso>; alCerrar: () => void }) {
  const esExito = aviso.tipo === 'exito'
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-sm"
        style={{
          background: esExito
            ? 'linear-gradient(135deg, rgba(22,163,74,0.95) 0%, rgba(34,197,94,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(220,38,38,0.95) 0%, rgba(239,68,68,0.92) 100%)',
          borderColor: 'rgba(255,255,255,0.2)',
          boxShadow: esExito
            ? '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)'
            : '0 8px 32px rgba(220,38,38,0.35), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {esExito ? <CircleCheck size={20} className="text-white" /> : <XCircle size={20} className="text-white" />}
        </div>
        <p className="text-[14px] font-semibold text-white flex-1">{aviso.mensaje}</p>
        <button onClick={alCerrar} className="text-white/70 hover:text-white transition-colors shrink-0">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

function comprimirImagen(file: File, maxAncho = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const escala = Math.min(1, maxAncho / img.width)
        canvas.width = img.width * escala
        canvas.height = img.height * escala
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function FormularioReporte({ onVolver, onEnviado }: { onVolver: () => void; onEnviado: () => void }) {
  const { usuario } = useContextoApp()
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<Aviso>(null)
  const inputFotoRef = useRef<HTMLInputElement>(null)
  const inputCamaraRef = useRef<HTMLInputElement>(null)

  const mostrarAviso = useCallback((tipo: 'exito' | 'error', mensaje: string) => {
    setAviso({ tipo, mensaje })
    setTimeout(() => setAviso(null), 3500)
  }, [])

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await comprimirImagen(file)
      setFoto(dataUrl)
    } catch {
      mostrarAviso('error', 'No se pudo cargar la imagen')
    }
    e.target.value = ''
  }

  async function handleEnviar() {
    if (!categoria) { mostrarAviso('error', 'Seleccioná una categoría'); return }
    if (descripcion.trim().length < 10) { mostrarAviso('error', 'Describí el problema (mínimo 10 caracteres)'); return }
    setEnviando(true)
    try {
      await apiSimulada.guardarReporte({
        categoria,
        descripcion: descripcion.trim(),
        coordenadas: usuario?.coordenadas ?? null,
        foto: foto ?? undefined,
      })
      mostrarAviso('exito', 'Reporte enviado correctamente')
      setTimeout(onEnviado, 1200)
    } catch {
      mostrarAviso('error', 'No se pudo enviar el reporte')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {aviso && <AvisoFlotante aviso={aviso} alCerrar={() => setAviso(null)} />}
      <input ref={inputFotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
      <input ref={inputCamaraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} />

      <div className="flex items-center gap-3">
        <button
          onClick={onVolver}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Nuevo reporte</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Informá un problema del barrio</p>
        </div>
      </div>

      {/* Categoría */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIAS.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all active:scale-[0.97] ${
                categoria === c.id
                  ? 'border-[#0077C8] bg-blue-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${categoria === c.id ? 'bg-blue-100' : c.bg}`}>
                <c.icono size={18} className={categoria === c.id ? 'text-[#0077C8]' : c.color} />
              </div>
              <span className={`text-[11px] font-bold ${categoria === c.id ? 'text-[#0077C8]' : 'text-gray-500'}`}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</p>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describí el problema con el mayor detalle posible..."
          rows={4}
          className="w-full text-[14px] text-[#1A1A2E] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#0077C8] focus:bg-white transition-colors placeholder:text-gray-400"
        />
        <p className="text-[11px] text-gray-400 text-right">{descripcion.length}/500</p>
      </div>

      {/* Foto */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto (opcional)</p>
        {foto ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={foto} alt="Foto del reporte" className="w-full h-48 object-cover rounded-xl" />
            <button
              onClick={() => setFoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => inputCamaraRef.current?.click()}
              className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#0077C8] hover:bg-blue-50 transition-all active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Camera size={20} className="text-[#0077C8]" />
              </div>
              <span className="text-[11px] font-bold text-gray-500">Sacar foto</span>
            </button>
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#0077C8] hover:bg-blue-50 transition-all active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <ImagePlus size={20} className="text-purple-500" />
              </div>
              <span className="text-[11px] font-bold text-gray-500">Galería</span>
            </button>
          </div>
        )}
      </div>

      {/* Ubicación */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-[#0077C8]" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación</p>
          {usuario?.coordenadas ? (
            <p className="text-[12px] font-semibold text-[#1A1A2E] mt-0.5">Usando tu ubicación guardada</p>
          ) : (
            <p className="text-[12px] text-yellow-600 font-semibold mt-0.5">Sin ubicación — cargala en Mis Datos</p>
          )}
        </div>
      </div>

      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="w-full h-14 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)',
          boxShadow: '0 6px 24px rgba(0,119,200,0.30)',
        }}
      >
        <Send size={17} />
        {enviando ? 'Enviando...' : 'Enviar reporte'}
      </button>
    </div>
  )
}

export default function PaginaReportes() {
  const [vista, setVista] = useState<'lista' | 'form'>('lista')
  const [version, setVersion] = useState(0)

  function handleEnviado() {
    setVista('lista')
    setVersion(v => v + 1)
  }

  if (vista === 'form') {
    return <FormularioReporte onVolver={() => setVista('lista')} onEnviado={handleEnviado} />
  }

  return <ListaReportes key={version} onNuevo={() => setVista('form')} />
}
