import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useCallback } from 'react'
import { CircleCheck, XCircle, X } from 'lucide-react'
import { useMisDatos } from './useMisDatos'
import { SelectorMapa } from './SelectorMapa'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { type ReactNode } from 'react'
import type { Coordenadas } from '../../context/tipos'

const esquema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  dni: z.string()
    .min(7, 'DNI inválido')
    .max(8, 'DNI inválido')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  direccion: z.string().min(3, 'Dirección requerida'),
  estadoCivil: z.string().min(1, 'Requerido'),
  cantidadPersonas: z.string().min(1, 'Requerido'),
  observacionesMedicas: z.string(),
})
type Datos = z.infer<typeof esquema>

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente']

const labelClass = 'text-[11px] font-semibold text-gray-400 tracking-widest uppercase'
const inputClass = 'h-11 text-[14px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white focus-visible:bg-white transition-colors'

function SeccionCard({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
    >
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest -mb-1">{titulo}</p>
      {children}
    </div>
  )
}

type Aviso = { tipo: 'exito' | 'error'; mensaje: string } | null

function AvisoFlotante({ aviso, alCerrar }: { aviso: NonNullable<Aviso>; alCerrar: () => void }) {
  const esExito = aviso.tipo === 'exito'
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-sm"
        style={{
          background: esExito
            ? 'linear-gradient(135deg, rgba(22,163,74,0.95) 0%, rgba(34,197,94,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(220,38,38,0.95) 0%, rgba(239,68,68,0.92) 100%)',
          borderColor: esExito ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
          boxShadow: esExito
            ? '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)'
            : '0 8px 32px rgba(220,38,38,0.35), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {esExito
            ? <CircleCheck size={20} className="text-white" />
            : <XCircle size={20} className="text-white" />
          }
        </div>
        <p className="text-[14px] font-semibold text-white flex-1">{aviso.mensaje}</p>
        <button onClick={alCerrar} className="text-white/70 hover:text-white transition-colors shrink-0">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default function PaginaMisDatos() {
  const { usuario, guardar } = useMisDatos()
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(usuario?.coordenadas ?? null)
  const [aviso, setAviso] = useState<Aviso>(null)

  const mostrarAviso = useCallback((tipo: 'exito' | 'error', mensaje: string) => {
    setAviso({ tipo, mensaje })
    setTimeout(() => setAviso(null), 3500)
  }, [])

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      dni: usuario?.dni ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
      estadoCivil: usuario?.estadoCivil ?? '',
      cantidadPersonas: String(usuario?.cantidadPersonas ?? 1),
      observacionesMedicas: usuario?.observacionesMedicas ?? '',
    },
  })

  useEffect(() => {
    if (usuario) {
      formulario.reset({
        nombre: usuario.nombre,
        dni: usuario.dni,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        estadoCivil: usuario.estadoCivil,
        cantidadPersonas: String(usuario.cantidadPersonas),
        observacionesMedicas: usuario.observacionesMedicas,
      })
      setCoordenadas(usuario.coordenadas)
    }
  }, [usuario, formulario])

  const alEnviar = async (datos: Datos) => {
    const cantidad = Number(datos.cantidadPersonas)
    if (isNaN(cantidad) || cantidad < 1 || cantidad > 20) {
      formulario.setError('cantidadPersonas', { message: 'Valor entre 1 y 20' })
      return
    }
    try {
      await guardar({ ...datos, cantidadPersonas: cantidad, coordenadas })
      mostrarAviso('exito', 'Datos guardados correctamente')
    } catch {
      mostrarAviso('error', 'No se pudieron guardar los datos')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {aviso && <AvisoFlotante aviso={aviso} alCerrar={() => setAviso(null)} />}
      <div>
        <h1 className="text-[22px] font-black text-[#1A1A2E] leading-tight">Mis Datos</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Perfil y datos del hogar</p>
      </div>

      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-4">

          <SeccionCard titulo="Información personal">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={formulario.control} name="nombre" render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Nombre completo</FormLabel>
                  <FormControl>
                    <Input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="dni" render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>DNI</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="telefono" render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Teléfono</FormLabel>
                  <FormControl>
                    <Input inputMode="tel" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="email" render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Email</FormLabel>
                  <FormControl>
                    <Input type="email" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="direccion" render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Dirección</FormLabel>
                  <FormControl>
                    <Input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="estadoCivil" render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Estado civil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 text-[14px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors">
                        <SelectValue placeholder="Seleccioná..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_CIVILES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="cantidadPersonas" render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Personas hogar</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" min={1} max={20} className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={formulario.control} name="observacionesMedicas" render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Observaciones médicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alergias, condiciones médicas relevantes..."
                      className="text-[14px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white focus-visible:bg-white resize-none transition-colors"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>
          </SeccionCard>

          <SeccionCard titulo="Ubicación">
            <SelectorMapa coordenadas={coordenadas} alSeleccionar={setCoordenadas} />
          </SeccionCard>

          <button
            type="submit"
            disabled={formulario.formState.isSubmitting}
            className="w-full h-14 rounded-2xl text-white text-[15px] font-bold tracking-wide active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)',
              boxShadow: '0 6px 24px rgba(0, 119, 200, 0.30)',
            }}
          >
            {formulario.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </Form>
    </div>
  )
}
