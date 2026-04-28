import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, Phone, CreditCard } from 'lucide-react'
import { useContextoApp } from '../../context/ContextoApp'

export default function PaginaCuenta() {
  const { usuario, cerrarSesion } = useContextoApp()
  const navigate = useNavigate()

  const iniciales = usuario?.nombre
    ?.split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() ?? '?'

  function handleCerrarSesion() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Mi Cuenta</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Información y sesión</p>
      </div>

      {/* Avatar + nombre */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white text-[18px] font-black"
          style={{ background: 'linear-gradient(135deg, #003f87 0%, #0077C8 100%)' }}
        >
          {iniciales}
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-black text-[#1A1A2E] truncate">{usuario?.nombre ?? '—'}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Vecino/a registrado/a</p>
        </div>
      </div>

      {/* Datos */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">
          Datos de la cuenta
        </p>

        {[
          { icono: Mail,       valor: usuario?.email,    label: 'Email' },
          { icono: Phone,      valor: usuario?.telefono, label: 'Teléfono' },
          { icono: CreditCard, valor: usuario?.dni,      label: 'DNI' },
        ].map(({ icono: Icono, valor, label }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Icono size={14} className="text-[#0077C8]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">{valor ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={handleCerrarSesion}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-red-500 text-[15px] font-bold border-2 border-red-100 bg-red-50 active:scale-[0.98] transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  )
}
