import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { User, Lock } from 'lucide-react'
import { useAutenticacion } from './useAutenticacion'
import { Input } from '../../components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form'

const esquema = z.object({
  dni: z.string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'DNI inválido')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Datos = z.infer<typeof esquema>

const labelClass = 'text-[11px] font-semibold text-gray-400 tracking-widest uppercase'
const inputClass = 'h-12 pl-10 text-[15px] rounded-xl bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white focus-visible:bg-white transition-colors'

export default function PaginaLogin() {
  const navigate = useNavigate()
  const { login } = useAutenticacion()

  const formulario = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { dni: '', contraseña: '' },
  })

  const alEnviar = async (datos: Datos) => {
    try {
      await login(datos.dni, datos.contraseña)
    } catch {
      toast.error('DNI o contraseña incorrectos')
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
          Bienvenido/a
        </h2>
        <p className="text-[14px] text-gray-400 font-medium leading-snug">
          Ingresá tu DNI y contraseña para continuar
        </p>
      </div>

      <Form {...formulario}>
        <form onSubmit={formulario.handleSubmit(alEnviar)} className="flex flex-col gap-5">
          <FormField
            control={formulario.control}
            name="dni"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>DNI</FormLabel>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={15} />
                  <FormControl>
                    <Input
                      placeholder="Ej: 28341567"
                      inputMode="numeric"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={formulario.control}
            name="contraseña"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className={labelClass}>Contraseña</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={15} />
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={formulario.formState.isSubmitting}
            className="mt-1 w-full h-14 rounded-2xl text-white text-[15px] font-bold tracking-wide active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0077C8 0%, #27A9E1 100%)',
              boxShadow: '0 6px 24px rgba(0, 119, 200, 0.30)',
            }}
          >
            {formulario.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
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
        onClick={() => navigate('/registro')}
        className="-mt-2 w-full h-12 rounded-2xl text-[#0077C8] text-[14px] font-bold border border-[#0077C8]/25 bg-blue-50/70 hover:bg-blue-50 active:scale-[0.98] transition-all duration-150"
      >
        Crear cuenta
      </button>
    </div>
  )
}
