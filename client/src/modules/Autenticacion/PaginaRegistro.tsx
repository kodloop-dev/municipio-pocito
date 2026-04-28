import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { type ReactNode } from 'react'
import { User, CreditCard, Phone, Mail, MapPin, Heart, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAutenticacion } from './useAutenticacion'
import { Input } from '../../components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'

const esquema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  dni: z.string()
    .min(7, 'DNI inválido')
    .max(8, 'DNI inválido')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
  direccion: z.string().min(3, 'Dirección requerida'),
  estadoCivil: z.string().min(1, 'Seleccioná un estado civil'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Datos = z.infer<typeof esquema>

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente']

const labelClass = 'text-[11px] font-semibold text-gray-400 tracking-widest uppercase'
const inputClass = 'h-11 pl-9 text-[14px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white focus-visible:bg-white transition-colors'

function CampoConIcono({ icono: Icono, children }: { icono: LucideIcon; children: ReactNode }) {
  return (
    <div className="relative">
      <Icono className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
      {children}
    </div>
  )
}

export default function PaginaRegistro() {
  const navigate = useNavigate()
  const { registro } = useAutenticacion()

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: '', dni: '', direccion: '', estadoCivil: '',
      email: '', telefono: '', contraseña: '',
    },
  })

  const alEnviar = async (datos: Datos) => {
    try {
      await registro({
        nombre: datos.nombre,
        dni: datos.dni,
        email: datos.email,
        telefono: datos.telefono,
        direccion: datos.direccion,
        estadoCivil: datos.estadoCivil,
        cantidadPersonas: 1,
        observacionesMedicas: '',
        coordenadas: null,
      })
      toast.success('Cuenta creada correctamente')
    } catch {
      toast.error('No se pudo crear la cuenta')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
          Crear cuenta
        </h2>
        <p className="text-[14px] text-gray-400 font-medium leading-snug">
          Completá tus datos para registrarte
        </p>
      </div>

      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-4">

          <FormField
            control={formulario.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Nombre completo</FormLabel>
                <CampoConIcono icono={User}>
                  <FormControl>
                    <Input placeholder="Ej: María González" className={inputClass} {...field} />
                  </FormControl>
                </CampoConIcono>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={formulario.control}
              name="dni"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>DNI</FormLabel>
                  <CampoConIcono icono={CreditCard}>
                    <FormControl>
                      <Input
                        placeholder="28341567"
                        inputMode="numeric"
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                  </CampoConIcono>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={formulario.control}
              name="telefono"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className={labelClass}>Teléfono</FormLabel>
                  <CampoConIcono icono={Phone}>
                    <FormControl>
                      <Input
                        placeholder="2644123456"
                        inputMode="tel"
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                  </CampoConIcono>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={formulario.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Email</FormLabel>
                <CampoConIcono icono={Mail}>
                  <FormControl>
                    <Input
                      placeholder="correo@ejemplo.com"
                      type="email"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                </CampoConIcono>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={formulario.control}
            name="direccion"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Dirección</FormLabel>
                <CampoConIcono icono={MapPin}>
                  <FormControl>
                    <Input placeholder="Calle y número" className={inputClass} {...field} />
                  </FormControl>
                </CampoConIcono>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={formulario.control}
            name="estadoCivil"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Estado civil</FormLabel>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none z-10" size={14} />
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 pl-9 text-[14px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors">
                        <SelectValue placeholder="Seleccioná..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_CIVILES.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] font-semibold text-gray-300 tracking-widest uppercase shrink-0">Acceso</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <FormField
            control={formulario.control}
            name="contraseña"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Contraseña</FormLabel>
                <CampoConIcono icono={Lock}>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                </CampoConIcono>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={formulario.formState.isSubmitting}
            className="mt-2 w-full h-14 rounded-2xl text-white text-[15px] font-bold tracking-wide active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)',
              boxShadow: '0 6px 24px rgba(0, 119, 200, 0.30)',
            }}
          >
            {formulario.formState.isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
      </Form>

      <div className="flex items-center gap-3 -mt-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[12px] text-gray-300 font-medium shrink-0">o</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => navigate('/login')}
        className="-mt-2 w-full h-12 rounded-2xl text-[#0077C8] text-[14px] font-bold border border-[#0077C8]/25 bg-blue-50/70 hover:bg-blue-50 active:scale-[0.98] transition-all duration-150"
      >
        Iniciar sesión
      </button>
    </div>
  )
}
