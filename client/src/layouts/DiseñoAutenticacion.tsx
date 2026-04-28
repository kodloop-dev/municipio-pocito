import { Outlet } from 'react-router-dom'
import logoPocito from '../assets/logo-municipio-pocito.jpeg'

export default function DiseñoAutenticacion() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex flex-col"
      style={{ background: 'linear-gradient(155deg, #003f87 0%, #0077C8 52%, #27A9E1 100%)' }}
    >
      {/* Orbes decorativos */}
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute top-14 -left-14 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="absolute top-[38%] right-4 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />

      {/* Hero — logo + nombre */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 pt-16 pb-12 animate-auth-fade-in">
        <div
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 0 0 4px rgba(255,255,255,0.18)' }}
        >
          <img src={logoPocito} alt="Logo Pocito" className="w-20 h-20 object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-[30px] font-extrabold tracking-[0.18em] leading-none">
            POCITO
          </h1>
          <p className="text-white/60 text-[13px] mt-2 font-medium tracking-widest uppercase">
            Municipio · App Vecinal
          </p>
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        className="relative z-10 bg-white rounded-t-[36px] animate-auth-slide-up"
        style={{ boxShadow: '0 -10px 60px rgba(0,0,0,0.16)' }}
      >
        {/* Pill indicador */}
        <div className="flex justify-center pt-3.5 pb-0.5">
          <div className="w-11 h-1.5 rounded-full bg-gray-200" />
        </div>

        <div className="px-7 pt-5 pb-12">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
