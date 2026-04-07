export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nit: string
          nombre: string
          telefono: string
          correo: string
          encargado_nombre: string
          encargado_telefono: string
          estado: 'pendiente' | 'aprobada' | 'inactiva'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nit: string
          nombre: string
          telefono: string
          correo: string
          encargado_nombre: string
          encargado_telefono: string
          estado?: 'pendiente' | 'aprobada' | 'inactiva'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nit?: string
          nombre?: string
          telefono?: string
          correo?: string
          encargado_nombre?: string
          encargado_telefono?: string
          estado?: 'pendiente' | 'aprobada' | 'inactiva'
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          empresa_id: string | null
          rol: 'admin' | 'empresa'
          created_at: string
        }
        Insert: {
          id: string
          empresa_id?: string | null
          rol: 'admin' | 'empresa'
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          rol?: 'admin' | 'empresa'
          created_at?: string
        }
      }
      departamentos: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
        }
      }
      municipios: {
        Row: {
          id: string
          nombre: string
          departamento_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          departamento_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          departamento_id?: string
          created_at?: string
        }
      }
      tipos_inmueble: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
        }
      }
      actividades: {
        Row: {
          id: string
          nombre: string
          imagen_url: string | null
          tipo: 'interna' | 'entorno'
          activo: boolean
          mostrar_en_landing: boolean
          orden_landing: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          imagen_url?: string | null
          tipo: 'interna' | 'entorno'
          activo?: boolean
          mostrar_en_landing?: boolean
          orden_landing?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          imagen_url?: string | null
          tipo?: 'interna' | 'entorno'
          activo?: boolean
          mostrar_en_landing?: boolean
          orden_landing?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      hero_imagenes: {
        Row: {
          id: string
          imagen_url: string
          actividad_id: string | null
          activo: boolean
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          imagen_url: string
          actividad_id?: string | null
          activo?: boolean
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          imagen_url?: string
          actividad_id?: string | null
          activo?: boolean
          orden?: number
          created_at?: string
        }
      }
      predios: {
        Row: {
          id: string
          matricula: string
          metros_cuadrados: number
          municipio_id: string
          tipo_inmueble_id: string
          destacado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          matricula: string
          metros_cuadrados: number
          municipio_id: string
          tipo_inmueble_id: string
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          matricula?: string
          metros_cuadrados?: number
          municipio_id?: string
          tipo_inmueble_id?: string
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ofertas: {
        Row: {
          id: string
          predio_id: string
          empresa_id: string
          precio: number
          descripcion: string | null
          activo: boolean
          vistas: number
          clicks_whatsapp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          predio_id: string
          empresa_id: string
          precio: number
          descripcion?: string | null
          activo?: boolean
          vistas?: number
          clicks_whatsapp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          predio_id?: string
          empresa_id?: string
          precio?: number
          descripcion?: string | null
          activo?: boolean
          vistas?: number
          clicks_whatsapp?: number
          created_at?: string
          updated_at?: string
        }
      }
      oferta_fotos: {
        Row: {
          id: string
          oferta_id: string
          imagen_url: string
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          oferta_id: string
          imagen_url: string
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          oferta_id?: string
          imagen_url?: string
          orden?: number
          created_at?: string
        }
      }
      oferta_actividades: {
        Row: {
          oferta_id: string
          actividad_id: string
        }
        Insert: {
          oferta_id: string
          actividad_id: string
        }
        Update: {
          oferta_id?: string
          actividad_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rol: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_empresa_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_vistas: {
        Args: { oferta_id: string }
        Returns: void
      }
      increment_whatsapp: {
        Args: { oferta_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Aliases de entidades
export type Empresa = Tables<'empresas'>
export type Usuario = Tables<'usuarios'>
export type Departamento = Tables<'departamentos'>
export type Municipio = Tables<'municipios'>
export type TipoInmueble = Tables<'tipos_inmueble'>
export type Actividad = Tables<'actividades'>
export type HeroImagen = Tables<'hero_imagenes'>
export type Predio = Tables<'predios'>
export type Oferta = Tables<'ofertas'>
export type OfertaFoto = Tables<'oferta_fotos'>
export type OfertaActividad = Tables<'oferta_actividades'>

// Tipos compuestos para queries con JOINs
export type PredioConDetalle = Predio & {
  municipio: Municipio & { departamento: Departamento }
  tipo_inmueble: TipoInmueble
  ofertas: Array<Oferta & {
    empresa: Empresa
    fotos: OfertaFoto[]
    actividades: Array<{ actividad: Actividad }>
  }>
}

export type OfertaConEmpresa = Oferta & {
  empresa: Empresa
  fotos: OfertaFoto[]
  actividades: Array<{ actividad: Actividad }>
}

export type PredioTarjeta = {
  id: string
  matricula: string
  metros_cuadrados: number
  destacado: boolean
  municipio: Pick<Municipio, 'id' | 'nombre'> & {
    departamento: Pick<Departamento, 'id' | 'nombre'>
  }
  tipo_inmueble: Pick<TipoInmueble, 'id' | 'nombre'>
  precio_minimo: number
  total_empresas: number
  foto_portada: string | null
}
