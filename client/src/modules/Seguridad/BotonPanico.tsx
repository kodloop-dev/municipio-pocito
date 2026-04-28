import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { useContextoApp } from '../../context/ContextoApp'
import { useSeguridad } from './useSeguridad'

export function BotonPanico() {
  const { usuario } = useContextoApp()
  const navigate = useNavigate()
  const { enviando, alertaEnviada, activarAlerta, resetear } = useSeguridad()
  const [modalAbierto, setModalAbierto] = useState(false)

  const manejarPresion = () => {
    if (!usuario?.coordenadas) {
      setModalAbierto(true)
      return
    }
    activarAlerta(usuario.coordenadas)
  }

  if (alertaEnviada) {
    return (
      <div
        className="w-full bg-white rounded-2xl p-6 flex flex-col items-center gap-3 text-center border border-green-100"
        style={{ boxShadow: '0 4px 20px rgba(22,163,74,0.12)' }}
      >
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
          <CheckCircle2 size={34} className="text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-green-700">Alerta enviada</p>
          <p className="text-[12px] text-green-600/80 mt-0.5">Su solicitud está siendo atendida</p>
        </div>
        <button
          onClick={resetear}
          className="mt-1 px-6 h-10 rounded-xl text-[13px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
        >
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={manejarPresion}
        disabled={enviando}
        className="w-full rounded-2xl text-white flex items-center justify-center gap-4 active:scale-[0.98] transition-transform disabled:opacity-70"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)',
          boxShadow: '0 8px 28px rgba(220,38,38,0.40)',
          padding: '20px 24px',
        }}
      >
        {enviando ? (
          <Loader2 size={28} className="animate-spin" />
        ) : (
          <>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 animate-pulso-lento"
              style={{ background: 'rgba(255,255,255,0.20)' }}
            >
              <AlertCircle size={22} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[17px] font-black tracking-wide">BOTON DE PANICO</div>
              <div className="text-[12px] font-medium opacity-75 mt-0.5">Solo en caso de emergencia real</div>
            </div>
          </>
        )}
      </button>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubicación requerida</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Debe cargar su ubicación en <strong className="text-[#1A1A2E]">Mis Datos</strong> antes de usar el botón de pánico.
          </p>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cerrar
            </Button>
            <Button
              className="bg-[#0077C8] hover:bg-[#27A9E1]"
              onClick={() => { setModalAbierto(false); navigate('/mis-datos') }}
            >
              Ir a Mis Datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
