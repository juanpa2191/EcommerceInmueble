'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registrarEmpresa } from '@/lib/actions/auth'

/* ------------------------------------------------------------------ */
/* Schemas                                                              */
/* ------------------------------------------------------------------ */

const paso1Schema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

const paso2Schema = z.object({
  nit: z.string().min(5, 'NIT inválido').max(20, 'NIT demasiado largo'),
  nombre: z.string().min(2, 'Nombre requerido'),
  telefono: z
    .string()
    .regex(/^3\d{9}$/, 'Teléfono inválido (10 dígitos, empieza por 3)'),
  correo: z.string().email('Correo inválido'),
  encargado_nombre: z.string().min(2, 'Nombre del encargado requerido'),
  encargado_telefono: z
    .string()
    .regex(/^3\d{9}$/, 'Teléfono inválido (10 dígitos, empieza por 3)'),
})

type Paso1Values = z.infer<typeof paso1Schema>
type Paso2Values = z.infer<typeof paso2Schema>

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                               */
/* ------------------------------------------------------------------ */

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600">{message}</p>
}

function PasswordInput({
  id,
  placeholder,
  autoComplete,
  hasError,
  ...rest
}: React.ComponentProps<'input'> & { hasError?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        className="pr-10"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B6B6B] hover:text-[#2B2B2B]"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Barra de progreso                                                    */
/* ------------------------------------------------------------------ */

function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#6B6B6B]">
          Paso {step} de 2
        </span>
        <span className="text-xs text-[#6B6B6B]">
          {step === 1 ? 'Cuenta' : 'Datos de empresa'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#D9D9D9]">
        <div
          className="h-full rounded-full bg-[#1F3A5F] transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step >= 1
                ? 'bg-[#1F3A5F] text-white'
                : 'border-2 border-[#D9D9D9] text-[#6B6B6B]'
            }`}
          >
            1
          </div>
          <span className="text-[10px] text-[#6B6B6B]">Cuenta</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step >= 2
                ? 'bg-[#1F3A5F] text-white'
                : 'border-2 border-[#D9D9D9] text-[#6B6B6B]'
            }`}
          >
            2
          </div>
          <span className="text-[10px] text-[#6B6B6B]">Empresa</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pantalla de éxito                                                    */
/* ------------------------------------------------------------------ */

function SuccessScreen() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl bg-white shadow-md border border-[#D9D9D9] px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[#1F3A5F]">
          Registro exitoso
        </h1>
        <p className="mb-8 text-sm text-[#6B6B6B] leading-relaxed">
          Tu solicitud está siendo revisada por el administrador. Te
          notificaremos cuando sea aprobada.
        </p>
        <Link href="/login">
          <Button className="h-10 w-full bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]">
            Ir al inicio de sesión
          </Button>
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Página principal                                                     */
/* ------------------------------------------------------------------ */

export default function RegistroPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [paso1Data, setPaso1Data] = useState<Paso1Values | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  /* Formulario paso 1 */
  const formPaso1 = useForm<Paso1Values>({
    resolver: zodResolver(paso1Schema),
    defaultValues: paso1Data ?? undefined,
  })

  /* Formulario paso 2 */
  const formPaso2 = useForm<Paso2Values>({
    resolver: zodResolver(paso2Schema),
  })

  const handlePaso1Submit = (data: Paso1Values) => {
    setPaso1Data(data)
    setError(null)
    setStep(2)
  }

  const handlePaso2Submit = (data: Paso2Values) => {
    if (!paso1Data) return
    setError(null)

    const formData = new FormData()
    formData.set('email', paso1Data.email)
    formData.set('password', paso1Data.password)
    formData.set('nit', data.nit)
    formData.set('nombre', data.nombre)
    formData.set('telefono', data.telefono)
    formData.set('correo', data.correo)
    formData.set('encargado_nombre', data.encargado_nombre)
    formData.set('encargado_telefono', data.encargado_telefono)

    startTransition(async () => {
      const result = await registrarEmpresa(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  if (success) return <SuccessScreen />

  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl bg-white shadow-md border border-[#D9D9D9] px-8 py-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F3A5F]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F3A5F]">Crear cuenta</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Registra tu empresa en la plataforma
          </p>
        </div>

        {/* Barra de progreso */}
        <ProgressBar step={step} />

        {/* Error global */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* -------------------- PASO 1 -------------------- */}
        {step === 1 && (
          <form
            onSubmit={formPaso1.handleSubmit(handlePaso1Submit)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                aria-invalid={!!formPaso1.formState.errors.email}
                {...formPaso1.register('email')}
              />
              <FieldError message={formPaso1.formState.errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                id="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                hasError={!!formPaso1.formState.errors.password}
                {...formPaso1.register('password')}
              />
              <FieldError
                message={formPaso1.formState.errors.password?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
              <PasswordInput
                id="confirmarPassword"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                hasError={!!formPaso1.formState.errors.confirmarPassword}
                {...formPaso1.register('confirmarPassword')}
              />
              <FieldError
                message={
                  formPaso1.formState.errors.confirmarPassword?.message
                }
              />
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]"
            >
              Siguiente
            </Button>
          </form>
        )}

        {/* -------------------- PASO 2 -------------------- */}
        {step === 2 && (
          <form
            onSubmit={formPaso2.handleSubmit(handlePaso2Submit)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                type="text"
                placeholder="900123456-1"
                aria-invalid={!!formPaso2.formState.errors.nit}
                {...formPaso2.register('nit')}
              />
              <FieldError message={formPaso2.formState.errors.nit?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre de la empresa</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Inmobiliaria S.A.S."
                aria-invalid={!!formPaso2.formState.errors.nombre}
                {...formPaso2.register('nombre')}
              />
              <FieldError
                message={formPaso2.formState.errors.nombre?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono empresa</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="3101234567"
                aria-invalid={!!formPaso2.formState.errors.telefono}
                {...formPaso2.register('telefono')}
              />
              <FieldError
                message={formPaso2.formState.errors.telefono?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo empresa</Label>
              <Input
                id="correo"
                type="email"
                placeholder="contacto@empresa.com"
                aria-invalid={!!formPaso2.formState.errors.correo}
                {...formPaso2.register('correo')}
              />
              <FieldError
                message={formPaso2.formState.errors.correo?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="encargado_nombre">Nombre del encargado</Label>
              <Input
                id="encargado_nombre"
                type="text"
                placeholder="Juan Pérez"
                aria-invalid={!!formPaso2.formState.errors.encargado_nombre}
                {...formPaso2.register('encargado_nombre')}
              />
              <FieldError
                message={
                  formPaso2.formState.errors.encargado_nombre?.message
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="encargado_telefono">
                Teléfono del encargado
              </Label>
              <Input
                id="encargado_telefono"
                type="tel"
                placeholder="3109876543"
                aria-invalid={!!formPaso2.formState.errors.encargado_telefono}
                {...formPaso2.register('encargado_telefono')}
              />
              <FieldError
                message={
                  formPaso2.formState.errors.encargado_telefono?.message
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null)
                  setStep(1)
                }}
                disabled={isPending}
                className="h-10 flex-1 border-[#D9D9D9] text-[#2B2B2B] hover:bg-[#F5F5F5]"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Atrás
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="h-10 flex-1 bg-[#1F3A5F] text-white hover:bg-[#2E5C8A] disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Link a login */}
        <p className="mt-6 text-center text-sm text-[#6B6B6B]">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-[#2E5C8A] underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
