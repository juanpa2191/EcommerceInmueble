'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  X,
  Loader2,
  Search,
} from 'lucide-react'
import { crearOferta, actualizarOferta } from '@/lib/actions/empresa'
import { createClient } from '@/lib/supabase/client'

// ----------- Types -----------

export type TipoInmueble = { id: string; nombre: string }
export type Actividad = { id: string; nombre: string; tipo: string }
export type Municipio = {
  id: string
  nombre: string
  departamento: { nombre: string }
}

export type WizardInitialData = {
  tipos: TipoInmueble[]
  actividades: Actividad[]
  municipios: Municipio[]
  // For edit mode
  ofertaId?: string
  defaultValues?: Partial<WizardFormData>
  actividadesIniciales?: string[]
  fotosIniciales?: string[]
}

export type WizardFormData = {
  matricula: string
  tipo_inmueble_id: string
  metros_cuadrados: number
  municipio_id: string
  precio: number
  descripcion: string
}

// ----------- Zod schemas per step -----------

const paso1Schema = z.object({
  matricula: z
    .string()
    .min(3, 'La matrícula debe tener al menos 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  tipo_inmueble_id: z.string().min(1, 'Selecciona un tipo de inmueble'),
  metros_cuadrados: z.coerce
    .number()
    .min(1, 'Mínimo 1 m²'),
  precio: z.coerce
    .number()
    .min(1_000_000, 'El precio mínimo es $1.000.000'),
  descripcion: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres'),
})

const paso2Schema = z.object({
  municipio_id: z.string().min(1, 'Selecciona un municipio'),
})

const STEPS = [
  { label: 'Datos del inmueble', id: 1 },
  { label: 'Ubicación', id: 2 },
  { label: 'Actividades', id: 3 },
  { label: 'Fotos', id: 4 },
]

// ----------- Step indicator -----------

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number
  completedSteps: Set<number>
}) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.has(step.id)
        const isActive = currentStep === step.id
        const isLast = idx === STEPS.length - 1

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isCompleted
                    ? 'bg-[#1F3A5F] text-white'
                    : isActive
                    ? 'border-2 border-[#1F3A5F] bg-white text-[#1F3A5F]'
                    : 'border-2 border-[#D9D9D9] bg-white text-[#6B6B6B]'
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  isActive ? 'text-[#1F3A5F]' : 'text-[#6B6B6B]'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'mx-2 mb-4 h-0.5 w-12 sm:w-16 transition-colors',
                  isCompleted ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ----------- Field error -----------

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

// ----------- Municipio select with search -----------

function MunicipioSelect({
  municipios,
  value,
  onChange,
  error,
}: {
  municipios: Municipio[]
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [search, setSearch] = useState('')

  // Group by departamento
  const grouped = municipios.reduce<Record<string, Municipio[]>>((acc, m) => {
    const dep = m.departamento?.nombre ?? 'Otros'
    if (!acc[dep]) acc[dep] = []
    acc[dep].push(m)
    return acc
  }, {})

  const filteredGrouped = Object.entries(grouped).reduce<
    Record<string, Municipio[]>
  >((acc, [dep, items]) => {
    const filtered = items.filter(
      (m) =>
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        dep.toLowerCase().includes(search.toLowerCase())
    )
    if (filtered.length > 0) acc[dep] = filtered
    return acc
  }, {})

  const selectedMunicipio = municipios.find((m) => m.id === value)

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={(v) => { if (v) onChange(v) }}>
        <SelectTrigger
          className={cn('w-full', error && 'border-red-500')}
          aria-invalid={!!error}
        >
          <SelectValue placeholder="Selecciona un municipio">
            {selectedMunicipio
              ? `${selectedMunicipio.nombre}, ${selectedMunicipio.departamento?.nombre}`
              : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Search className="size-4 shrink-0 text-[#6B6B6B]" />
            <input
              autoFocus
              placeholder="Buscar municipio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#6B6B6B]"
            />
          </div>
          <Separator />
          {Object.entries(filteredGrouped).map(([dep, items]) => (
            <SelectGroup key={dep}>
              <SelectLabel>{dep}</SelectLabel>
              {items.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {Object.keys(filteredGrouped).length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-[#6B6B6B]">
              No se encontraron municipios
            </p>
          )}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </div>
  )
}

// ----------- Activity chip -----------

function ActividadChip({
  nombre,
  selected,
  onClick,
}: {
  nombre: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-[#1F3A5F] bg-[#1F3A5F] text-white'
          : 'border-[#D9D9D9] bg-white text-[#2B2B2B] hover:border-[#4A7FB3] hover:bg-[#F5F5F5]'
      )}
    >
      {nombre}
    </button>
  )
}

// ----------- Photo preview -----------

type PhotoItem =
  | { type: 'file'; file: File; preview: string }
  | { type: 'url'; url: string }

// ----------- Main wizard -----------

export function WizardNuevoInmueble({
  tipos,
  actividades,
  municipios,
  ofertaId,
  defaultValues,
  actividadesIniciales = [],
  fotosIniciales = [],
}: WizardInitialData) {
  const isEditMode = !!ofertaId

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Step 1+2 form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<WizardFormData>({
    mode: 'onTouched',
    defaultValues: {
      matricula: defaultValues?.matricula ?? '',
      tipo_inmueble_id: defaultValues?.tipo_inmueble_id ?? '',
      metros_cuadrados: defaultValues?.metros_cuadrados ?? ('' as any),
      municipio_id: defaultValues?.municipio_id ?? '',
      precio: defaultValues?.precio ?? ('' as any),
      descripcion: defaultValues?.descripcion ?? '',
    },
  })

  // Step 3 — actividades
  const [selectedActividades, setSelectedActividades] = useState<Set<string>>(
    new Set(actividadesIniciales)
  )

  // Step 4 — fotos
  const [photos, setPhotos] = useState<PhotoItem[]>(
    fotosIniciales.map((url) => ({ type: 'url', url }))
  )

  // Loading
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  // empresa_id for uploads
  const [empresaId, setEmpresaId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('usuarios')
      .select('empresa_id')
      .single()
      .then(({ data }) => {
        const row = data as { empresa_id: string | null } | null
        if (row?.empresa_id) setEmpresaId(row.empresa_id)
      })
  }, [])

  // Matricula autocomplete
  const matriculaValue = watch('matricula')
  const [checkingMatricula, setCheckingMatricula] = useState(false)

  useEffect(() => {
    if (!matriculaValue || matriculaValue.length < 4 || isEditMode) return
    const timer = setTimeout(async () => {
      setCheckingMatricula(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('predios')
        .select('id, tipo_inmueble_id, metros_cuadrados, municipio_id')
        .eq('matricula', matriculaValue)
        .single()
      setCheckingMatricula(false)
      if (data) {
        const predio = data as any
        if (predio.tipo_inmueble_id) {
          setValue('tipo_inmueble_id', predio.tipo_inmueble_id)
        }
        if (predio.metros_cuadrados) {
          setValue('metros_cuadrados', predio.metros_cuadrados)
        }
        if (predio.municipio_id) {
          setValue('municipio_id', predio.municipio_id)
        }
        toast.info('Predio existente encontrado. Datos autocompletados.')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [matriculaValue, setValue, isEditMode])

  // Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = 5 - photos.length
      if (remaining <= 0) {
        toast.error('Máximo 5 fotos permitidas')
        return
      }
      const toAdd = acceptedFiles.slice(0, remaining)
      const newItems: PhotoItem[] = toAdd.map((file) => ({
        type: 'file',
        file,
        preview: URL.createObjectURL(file),
      }))
      setPhotos((prev) => [...prev, ...newItems])
    },
    [photos.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
    disabled: photos.length >= 5,
  })

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const item = prev[idx]
      if (item.type === 'file') URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // Navigation
  async function goNext() {
    let valid = false
    if (currentStep === 1) {
      valid = await trigger([
        'matricula',
        'tipo_inmueble_id',
        'metros_cuadrados',
        'precio',
        'descripcion',
      ])
    } else if (currentStep === 2) {
      valid = await trigger(['municipio_id'])
    } else {
      valid = true
    }

    if (!valid) return

    setCompletedSteps((prev) => new Set([...prev, currentStep]))
    setCurrentStep((prev) => prev + 1)
  }

  function goPrev() {
    setCurrentStep((prev) => prev - 1)
  }

  // Upload single photo
  async function subirFoto(
    file: File,
    eId: string
  ): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `ofertas/${eId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('fotos')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) return null

    const { data } = supabase.storage.from('fotos').getPublicUrl(path)
    return data.publicUrl
  }

  // Submit
  async function onSubmit() {
    setSubmitting(true)

    try {
      const values = getValues()

      // Upload new photos
      const newPhotoFiles = photos.filter(
        (p): p is Extract<PhotoItem, { type: 'file' }> => p.type === 'file'
      )

      const existingUrls = photos
        .filter((p): p is Extract<PhotoItem, { type: 'url' }> => p.type === 'url')
        .map((p) => p.url)

      let uploadedUrls: string[] = []

      if (newPhotoFiles.length > 0) {
        if (!empresaId) {
          toast.error('No se pudo obtener el ID de empresa')
          setSubmitting(false)
          return
        }
        setUploadProgress(`Subiendo fotos... 0/${newPhotoFiles.length}`)
        const results: string[] = []
        for (let i = 0; i < newPhotoFiles.length; i++) {
          setUploadProgress(
            `Subiendo fotos... ${i + 1}/${newPhotoFiles.length}`
          )
          const url = await subirFoto(newPhotoFiles[i].file, empresaId!)
          if (!url) {
            toast.error(`Error al subir la foto ${i + 1}`)
            setSubmitting(false)
            setUploadProgress(null)
            return
          }
          results.push(url)
        }
        uploadedUrls = results
      }

      setUploadProgress('Guardando oferta...')

      const foto_urls = [...existingUrls, ...uploadedUrls]
      const actividad_ids = Array.from(selectedActividades)

      if (isEditMode && ofertaId) {
        await actualizarOferta(ofertaId, {
          precio: values.precio,
          descripcion: values.descripcion,
          actividad_ids,
          foto_urls,
        })
      } else {
        await crearOferta({
          matricula: values.matricula,
          tipo_inmueble_id: values.tipo_inmueble_id,
          metros_cuadrados: values.metros_cuadrados,
          municipio_id: values.municipio_id,
          precio: values.precio,
          descripcion: values.descripcion,
          actividad_ids,
          foto_urls,
        })
      }
    } catch (err: any) {
      // redirect throws — ignore NEXT_REDIRECT
      if (err?.digest?.startsWith('NEXT_REDIRECT')) return
      const msg = err?.message ?? 'Error inesperado'
      toast.error(msg)
      setSubmitting(false)
      setUploadProgress(null)
    }
  }

  const actividadesInternas = actividades.filter((a) => a.tipo === 'interna')
  const actividadesEntorno = actividades.filter((a) => a.tipo === 'entorno')

  const municipioId = watch('municipio_id')
  const tipoId = watch('tipo_inmueble_id')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Step indicator */}
      <div className="flex justify-center">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Step content card */}
      <div className="rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2B2B]">
                Datos del inmueble
              </h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Ingresa la información principal del predio y la oferta
              </p>
            </div>

            <div className="space-y-4">
              {/* Matrícula */}
              <div className="space-y-1.5">
                <Label htmlFor="matricula">
                  Matrícula inmobiliaria
                  {checkingMatricula && (
                    <Loader2 className="ml-2 inline size-3 animate-spin text-[#6B6B6B]" />
                  )}
                </Label>
                <Input
                  id="matricula"
                  placeholder="Ej: ANT-001-2025"
                  {...register('matricula')}
                  aria-invalid={!!errors.matricula}
                  className={cn(errors.matricula && 'border-red-500')}
                  disabled={isEditMode}
                />
                <FieldError message={errors.matricula?.message} />
              </div>

              {/* Tipo de inmueble */}
              <div className="space-y-1.5">
                <Label htmlFor="tipo_inmueble_id">Tipo de inmueble</Label>
                <select
                  id="tipo_inmueble_id"
                  value={tipoId}
                  disabled={isEditMode}
                  onChange={(e) => { if (e.target.value) setValue('tipo_inmueble_id', e.target.value, { shouldValidate: true }) }}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm text-[#2B2B2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/30 disabled:opacity-50',
                    errors.tipo_inmueble_id ? 'border-red-500' : 'border-[#D9D9D9]'
                  )}
                >
                  <option value="">Selecciona un tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.tipo_inmueble_id?.message} />
              </div>

              {/* Metros cuadrados */}
              <div className="space-y-1.5">
                <Label htmlFor="metros_cuadrados">Metros cuadrados</Label>
                <Input
                  id="metros_cuadrados"
                  type="number"
                  min={1}
                  placeholder="Ej: 120"
                  {...register('metros_cuadrados')}
                  aria-invalid={!!errors.metros_cuadrados}
                  className={cn(errors.metros_cuadrados && 'border-red-500')}
                  disabled={isEditMode}
                />
                <FieldError message={errors.metros_cuadrados?.message} />
              </div>

              <Separator />

              {/* Precio */}
              <div className="space-y-1.5">
                <Label htmlFor="precio">Precio (COP)</Label>
                <Input
                  id="precio"
                  type="number"
                  min={1_000_000}
                  step={100_000}
                  placeholder="Ej: 250000000"
                  {...register('precio')}
                  aria-invalid={!!errors.precio}
                  className={cn(errors.precio && 'border-red-500')}
                />
                <FieldError message={errors.precio?.message} />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  rows={4}
                  placeholder="Describe el inmueble, sus características y condiciones..."
                  {...register('descripcion')}
                  aria-invalid={!!errors.descripcion}
                  className={cn(
                    'w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none',
                    errors.descripcion && 'border-red-500'
                  )}
                />
                <FieldError message={errors.descripcion?.message} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2B2B]">
                Ubicación
              </h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Selecciona el municipio donde se encuentra el inmueble
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Municipio</Label>
              <MunicipioSelect
                municipios={municipios}
                value={municipioId ?? ''}
                onChange={(v) => {
                  setValue('municipio_id', v)
                  void trigger('municipio_id')
                }}
                error={errors.municipio_id?.message}
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2B2B]">
                Actividades
              </h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Selecciona las actividades asociadas al inmueble (opcional)
              </p>
            </div>

            {actividadesInternas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#2B2B2B]">
                  Actividades internas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actividadesInternas.map((a) => (
                    <ActividadChip
                      key={a.id}
                      nombre={a.nombre}
                      selected={selectedActividades.has(a.id)}
                      onClick={() => {
                        setSelectedActividades((prev) => {
                          const next = new Set(prev)
                          if (next.has(a.id)) next.delete(a.id)
                          else next.add(a.id)
                          return next
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {actividadesEntorno.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#2B2B2B]">
                  Actividades del entorno
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actividadesEntorno.map((a) => (
                    <ActividadChip
                      key={a.id}
                      nombre={a.nombre}
                      selected={selectedActividades.has(a.id)}
                      onClick={() => {
                        setSelectedActividades((prev) => {
                          const next = new Set(prev)
                          if (next.has(a.id)) next.delete(a.id)
                          else next.add(a.id)
                          return next
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {actividades.length === 0 && (
              <p className="text-sm text-[#6B6B6B]">
                No hay actividades disponibles.
              </p>
            )}

            {selectedActividades.size > 0 && (
              <p className="text-xs text-[#6B6B6B]">
                {selectedActividades.size} actividad
                {selectedActividades.size !== 1 ? 'es' : ''} seleccionada
                {selectedActividades.size !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2B2B]">Fotos</h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Sube hasta 5 fotos del inmueble. La primera será la foto de
                portada.
              </p>
            </div>

            {/* Dropzone */}
            {photos.length < 5 && (
              <div
                {...getRootProps()}
                className={cn(
                  'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                  isDragActive
                    ? 'border-[#4A7FB3] bg-blue-50'
                    : 'border-[#D9D9D9] hover:border-[#4A7FB3] hover:bg-[#F5F5F5]'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto size-10 text-[#6B6B6B]" />
                <p className="mt-3 text-sm font-medium text-[#2B2B2B]">
                  {isDragActive
                    ? 'Suelta las fotos aquí'
                    : 'Arrastra y suelta fotos aquí'}
                </p>
                <p className="mt-1 text-xs text-[#6B6B6B]">
                  o haz click para seleccionar. Máximo 5 fotos.
                </p>
                <p className="mt-2 text-xs text-[#6B6B6B]">
                  {photos.length}/5 fotos añadidas
                </p>
              </div>
            )}

            {/* Preview grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((photo, idx) => {
                  const src =
                    photo.type === 'file' ? photo.preview : photo.url
                  return (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-[#D9D9D9]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Foto ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#1F3A5F]/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Eliminar foto ${idx + 1}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
                <Loader2 className="size-4 animate-spin text-[#2E5C8A]" />
                <p className="text-sm text-[#2E5C8A]">{uploadProgress}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 1 || submitting}
          className="gap-1.5"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={submitting}
            className="gap-1.5 bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]"
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="gap-1.5 bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {uploadProgress ?? 'Guardando...'}
              </>
            ) : (
              <>
                <Check className="size-4" />
                {isEditMode ? 'Guardar cambios' : 'Publicar oferta'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
