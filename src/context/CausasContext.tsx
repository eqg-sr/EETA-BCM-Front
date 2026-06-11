import { createContext, useContext, useState } from 'react';
import api from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SujetoVinculo = 'ACTOR' | 'DEMANDADO' | 'TERCERO';

export type Sujeto = {
  vinculo: SujetoVinculo;
  nombre: string;
  representante?: string;
  domicilio?: string;
  domicilioElectronico?: string;
  aprobado?: boolean;
  aprobacionToken?: string;
};

export type MovimientoTipo = 'ACT' | 'ESC' | 'CED' | 'RES' | 'NOT' | 'AUD' | 'PER' | 'SEN';

export type Movimiento = {
  id: string;
  fecha: string;
  tipo: MovimientoTipo;
  titulo: string;
  descripcion?: string;
  numero?: string;
  tribunal?: string;
  presentante?: string;
  acceso?: string;
  adjuntos?: boolean;
  relaciones?: boolean;
  archivo?: string;
  nombreArchivo?: string;
};

export type NuevoMovimiento = Omit<Movimiento, 'archivo' | 'nombreArchivo'> & {
  archivo?: File;
};

export type Comentario = {
  id: string;
  autor: string;
  rol: string;
  fecha: string;
  texto: string;
};

export type Expediente = {
  nroExpediente: string;
  caratula: string;
  fechaPresentacion: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  objetoJuicio: string;
  montoDisputa?: string;
  sujetos: Sujeto[];
  movimientos: Movimiento[];
  comentarios: Comentario[];
  adjuntoNombre?: string;
  asignados?: string[];
};

export type NuevoExpediente = {
  nroExpediente: string;
  caratula: string;
  fechaPresentacion: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  objetoJuicio: string;
  montoDisputa?: string;
  asignados?: string[];
};

export type CausaRelacionada = {
  _id?: string;
  identificador: string;
  descripcion: string;
  caratula?: string;
  tribunal?: string;
  archivo?: string;
  nombreArchivo?: string;
  creadoEn?: string;
};

export type CausaStatus = 'pendiente' | 'iniciado' | 'en_proceso' | 'cerrado';

export type Causa = {
  id: string;
  identificador: string;
  numeroInterno: string;
  caratula: string;
  tribunal: string;
  nroExpedienteElectronico?: string;
  arbitro: string;
  fechaPresentacion: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  objetoJuicio: string;
  status: CausaStatus;
  archivo?: string;
  nombreArchivo?: string;
  sujetos: Sujeto[];
  expedientes: Expediente[];
  causasRelacionadas: CausaRelacionada[];
};

export type PaginatedCausas = {
  data: Causa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FetchCausasParams = {
  page?: number;
  limit?: number;
  search?: string;
  tribunal?: string;
  arbitro?: string;
  status?: CausaStatus;
};

type CreateCausaPayload = Omit<Causa, 'identificador' | 'numeroInterno' | 'expedientes' | 'causasRelacionadas' | 'sujetos' | 'tribunal'> & {
  sujetos?: Sujeto[];
  expedientes?: Expediente[];
  causasRelacionadas?: CausaRelacionada[];
  tribunal?: string;
};

type CausasContextType = {
  causas: PaginatedCausas;
  currentCausa: Causa | null;
  isLoading: boolean;
  error: string | null;
  fetchCausas: (params?: FetchCausasParams) => Promise<void>;
  fetchCausa: (id: string) => Promise<void>;
  crearCausa: (data: CreateCausaPayload) => Promise<Causa>;
  subirCaratulaArchivo: (causaId: string, archivo: File) => Promise<void>;
  actualizarCausa: (id: string, data: Partial<Causa>) => Promise<void>;
  eliminarCausa: (id: string) => Promise<void>;
  cambiarStatus: (causaId: string, status: CausaStatus) => Promise<void>;
  agregarMovimiento: (causaId: string, expNro: string, data: NuevoMovimiento) => Promise<void>;
  agregarSujeto: (causaId: string, expNro: string, data: Sujeto) => Promise<void>;
  agregarSujetoCausa: (causaId: string, data: Sujeto) => Promise<void>;
  agregarRelacionada: (causaId: string, identificador: string, descripcion: string, archivo?: File) => Promise<void>;
  eliminarRelacionada: (causaId: string, identificador: string) => Promise<void>;
  agregarExpediente: (causaId: string, data: NuevoExpediente) => Promise<void>;
  eliminarExpediente: (causaId: string, nroExpediente: string) => Promise<void>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_PAGE: PaginatedCausas = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

function fmtDate(raw: string | Date | undefined): string {
  if (!raw) return '';
  const value = String(raw);

  // Fechas que representan solo un día (sin hora significativa) llegan como
  // "YYYY-MM-DD" o "YYYY-MM-DDT00:00:00.000Z". Parsearlas directamente con
  // `new Date(...)` las interpreta como medianoche UTC, que en timezones
  // negativos (ej. Argentina, UTC-3) cae en el día anterior. Para evitarlo,
  // se parsean al mediodía local.
  const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:T00:00:00(?:\.000)?Z?)?$/);
  if (dateOnlyMatch) {
    const d = new Date(`${dateOnlyMatch[1]}T12:00:00`);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function mapMovimiento(m: any): Movimiento {
  return { ...m, fecha: fmtDate(m.fecha) };
}

function mapExpediente(e: any): Expediente {
  return {
    ...e,
    fechaPresentacion: fmtDate(e.fechaPresentacion),
    fechaInicio:       fmtDate(e.fechaInicio),
    ultimoMovimiento:  fmtDate(e.ultimoMovimiento),
    movimientos:  (e.movimientos  ?? []).map(mapMovimiento),
    comentarios:  (e.comentarios  ?? []).map((c: any) => ({ ...c, fecha: fmtDate(c.fecha) })),
  };
}

function mapCausa(raw: any): Causa {
  return {
    ...raw,
    fechaPresentacion: fmtDate(raw.fechaPresentacion),
    fechaInicio:       fmtDate(raw.fechaInicio),
    ultimoMovimiento:  fmtDate(raw.ultimoMovimiento),
    expedientes: (raw.expedientes ?? []).map(mapExpediente),
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const CausasContext = createContext<CausasContextType | null>(null);

export function CausasProvider({ children }: { children: React.ReactNode }) {
  const [causas, setCausas]           = useState<PaginatedCausas>(EMPTY_PAGE);
  const [currentCausa, setCurrentCausa] = useState<Causa | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchCausas = async (params: FetchCausasParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/causas', { params });
      setCausas({
        ...data,
        data: (data.data ?? []).map(mapCausa),
      });
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al cargar expedientes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCausa = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/causas/${id}`);
      setCurrentCausa(mapCausa(data));
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al cargar el expediente');
    } finally {
      setIsLoading(false);
    }
  };

  const crearCausa = async (payload: CreateCausaPayload): Promise<Causa> => {
    const { data } = await api.post('/causas', payload);
    const causa = mapCausa(data);
    return causa;
  };

  const subirCaratulaArchivo = async (causaId: string, archivo: File) => {
    const form = new FormData();
    form.append('archivo', archivo);
    await api.post(`/causas/${causaId}/caratula`, form);
  };

  const actualizarCausa = async (id: string, payload: Partial<Causa>) => {
    await api.put(`/causas/${id}`, payload);
    await fetchCausa(id);
  };

  const eliminarCausa = async (id: string) => {
    await api.delete(`/causas/${id}`);
    setCausas((prev) => ({
      ...prev,
      data: prev.data.filter((c) => c.id !== id),
      total: prev.total - 1,
    }));
  };

  const cambiarStatus = async (causaId: string, status: CausaStatus) => {
    await api.put(`/causas/${causaId}/status`, { status });
    await fetchCausa(causaId);
  };

  const agregarMovimiento = async (causaId: string, expNro: string, data: NuevoMovimiento) => {
    const { archivo, ...rest } = data;
    const form = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      form.append(key, String(value));
    });
    if (archivo) form.append('archivo', archivo);
    await api.post(`/causas/${causaId}/expedientes/${expNro}/movimientos`, form);
    await fetchCausa(causaId);
  };

  const agregarSujeto = async (causaId: string, expNro: string, data: Sujeto) => {
    await api.post(`/causas/${causaId}/expedientes/${expNro}/sujetos`, data);
    await fetchCausa(causaId);
  };

  const agregarSujetoCausa = async (causaId: string, data: Sujeto) => {
    await api.post(`/causas/${causaId}/sujetos`, data);
    await fetchCausa(causaId);
  };

  const agregarRelacionada = async (causaId: string, identificador: string, descripcion: string, archivo?: File) => {
    const form = new FormData();
    form.append('identificador', identificador);
    form.append('descripcion', descripcion);
    if (archivo) form.append('archivo', archivo);
    await api.post(`/causas/${causaId}/relacionadas`, form);
    await fetchCausa(causaId);
  };

  const eliminarRelacionada = async (causaId: string, identificador: string) => {
    await api.delete(`/causas/${causaId}/relacionadas/${encodeURIComponent(identificador)}`);
    await fetchCausa(causaId);
  };

  const agregarExpediente = async (causaId: string, data: NuevoExpediente) => {
    await api.post(`/causas/${causaId}/expedientes`, data);
    await fetchCausa(causaId);
  };

  const eliminarExpediente = async (causaId: string, nroExpediente: string) => {
    await api.delete(`/causas/${causaId}/expedientes/${encodeURIComponent(nroExpediente)}`);
    await fetchCausa(causaId);
  };

  return (
    <CausasContext.Provider value={{
      causas, currentCausa, isLoading, error,
      fetchCausas, fetchCausa, crearCausa, subirCaratulaArchivo, actualizarCausa, eliminarCausa, cambiarStatus,
      agregarMovimiento, agregarSujeto, agregarSujetoCausa, agregarRelacionada, eliminarRelacionada,
      agregarExpediente, eliminarExpediente,
    }}>
      {children}
    </CausasContext.Provider>
  );
}

export const useCausas = () => {
  const ctx = useContext(CausasContext);
  if (!ctx) throw new Error('useCausas must be used within CausasProvider');
  return ctx;
};
