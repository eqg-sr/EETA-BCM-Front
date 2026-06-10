import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Paperclip, FilePlus, Send, Upload, Info, Users, ListOrdered, Link2, Download, Trash2, FolderOpen, ChevronDown, ChevronRight, UserPlus, UserMinus, X, Search, Loader2, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useCausas, type Movimiento, type NuevoMovimiento, type MovimientoTipo, type CausaStatus, type Sujeto, type SujetoVinculo, type CausaRelacionada, type Expediente } from '../context/CausasContext';
import { useAuth, usePermissions } from '../context/AuthContext';
import api from '../services/api';

const SECTIONS = [
  { id: 'info',       label: 'Información General', icon: Info },
  { id: 'expedientes',label: 'Expedientes',          icon: FolderOpen },
  { id: 'sujetos',    label: 'Sujetos',              icon: Users },
  { id: 'movimientos',label: 'Movimientos',           icon: ListOrdered },
  { id: 'relacionadas',label: 'Causas Relacionadas',  icon: Link2 },
] as const;

const SUJETO_VINCULO_OPTIONS: { value: SujetoVinculo; label: string }[] = [
  { value: 'ACTOR',     label: 'Actor' },
  { value: 'DEMANDADO', label: 'Demandado' },
  { value: 'TERCERO',   label: 'Tercero' },
];

const STATUS_OPTIONS: { value: CausaStatus; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'iniciado',   label: 'Iniciado' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'cerrado',    label: 'Cerrado' },
];

export default function CausaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { currentCausa, isLoading, error, fetchCausa, cambiarStatus } = useCausas();
  const { user } = useAuth();
  const { isReadOnly } = usePermissions();
  const isSecretario = user?.role === 'secretario' && !isReadOnly;
  const isActor = user?.role === 'actor' && !isReadOnly;

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError]     = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCausa(id);
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#001f3f] rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !currentCausa) {
    return (
      <Layout>
        <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
          <ArrowLeft size={16} /> Volver al listado
        </Link>
        <p className="text-slate-500">{error ?? 'Expediente no encontrado.'}</p>
      </Layout>
    );
  }

  const causa = currentCausa;
  const allMovimientos = causa.expedientes.flatMap((e) => e.movimientos);

  const handleStatusChange = async (newStatus: CausaStatus) => {
    if (!id) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      await cambiarStatus(id, newStatus);
    } catch (e: any) {
      setStatusError(e.response?.data?.message ?? 'Error al cambiar el estado');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <Layout>
      <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
        <ArrowLeft size={16} /> Volver al listado
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
        <div>
          <div className="text-sm font-mono text-[#001f3f] font-semibold">
            {causa.identificador} <span className="text-slate-400">({causa.numeroInterno})</span> {causa.tribunal}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">{causa.caratula}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={causa.status} />
            {isSecretario && (
              <div className="flex items-center gap-2">
                <select
                  value={causa.status}
                  onChange={(e) => handleStatusChange(e.target.value as CausaStatus)}
                  disabled={statusLoading}
                  className="px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none text-slate-700 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {statusLoading && (
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-[#001f3f] rounded-full animate-spin" />
                )}
              </div>
            )}
          </div>
          {statusError && (
            <p className="mt-1.5 text-xs text-red-600">{statusError}</p>
          )}
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-400 uppercase font-semibold">Árbitro</div>
          <div className="text-slate-700 font-semibold">{causa.arbitro}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <nav className="lg:sticky lg:top-24 space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 mb-2">Secciones</p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#001f3f] transition-colors"
              >
                <Icon size={16} className="text-blue-600" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          <Section id="info" title="Información General" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Identificador"        value={`${causa.identificador} (${causa.numeroInterno})`} />
              <InfoRow label="Carátula"             value={causa.caratula} />
              <InfoRow label="Tribunal"             value={causa.tribunal} />
              <InfoRow label="Árbitro"              value={causa.arbitro} />
              <InfoRow label="Fecha de Presentación" value={causa.fechaPresentacion} />
              <InfoRow label="Fecha de Inicio"      value={causa.fechaInicio} />
              <InfoRow label="Último Movimiento"    value={causa.ultimoMovimiento} />
              <InfoRow label="Objeto del Juicio"    value={causa.objetoJuicio} />
            </div>
          </Section>

          <Section id="expedientes" title="Expedientes" icon={FolderOpen}>
            <ExpedientesBlock
              causaId={causa.id}
              expedientes={causa.expedientes}
              isSecretario={isSecretario}
              isActor={isActor}
            />
          </Section>

          <Section id="sujetos" title="Sujetos" icon={Users}>
            <SujetosBlock
              causaId={causa.id}
              sujetos={causa.sujetos}
              isSecretario={isSecretario}
            />
          </Section>

          <Section id="movimientos" title="Movimientos" icon={ListOrdered}>
            <MovimientosBlock causaId={causa.id} movimientos={allMovimientos} />
          </Section>

          <Section id="relacionadas" title="Causas Relacionadas" icon={Link2}>
            <CausasRelacionadasBlock
              causaId={causa.id}
              relacionadas={causa.causasRelacionadas}
              isSecretario={isSecretario}
            />
          </Section>
        </div>
      </div>
    </Layout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({
  id, title, icon: Icon, children,
}: {
  id: string; title: string; icon: typeof Info; children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
      <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-slate-100">
        <Icon size={18} className="text-blue-600" />
        <h2 className="font-bold uppercase tracking-wider text-xs text-[#001f3f]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-sm text-slate-800 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function SujetosTable({ sujetos }: { sujetos: Sujeto[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr className="text-blue-700 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 font-semibold">Vínculo</th>
            <th className="px-4 py-3 font-semibold">Nombre/Denominación</th>
            <th className="px-4 py-3 font-semibold">Representante</th>
            <th className="px-4 py-3 font-semibold">Domicilio</th>
            <th className="px-4 py-3 font-semibold">Domicilio Electrónico</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sujetos.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-700">{s.vinculo}</td>
              <td className="px-4 py-3 text-slate-800">{s.nombre}</td>
              <td className="px-4 py-3 text-blue-700">{s.representante ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700">{s.domicilio ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700 font-mono text-xs">{s.domicilioElectronico ?? '-'}</td>
              <td className="px-4 py-3">
                {s.aprobado === true && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Aprobado
                  </span>
                )}
                {s.aprobado === false && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Pendiente de aprobación
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SujetosBlock({
  causaId,
  sujetos,
  isSecretario,
}: {
  causaId: string;
  sujetos: Sujeto[];
  isSecretario: boolean;
}) {
  const { agregarSujetoCausa } = useCausas();

  const [vinculo, setVinculo]                 = useState<SujetoVinculo>('ACTOR');
  const [nombre, setNombre]                   = useState('');
  const [representante, setRepresentante]     = useState('');
  const [domicilio, setDomicilio]             = useState('');
  const [domicilioElectronico, setDomicilioElectronico] = useState('');
  const [isSending, setIsSending]             = useState(false);
  const [formError, setFormError]             = useState<string | null>(null);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsSending(true);
    setFormError(null);
    try {
      await agregarSujetoCausa(causaId, {
        vinculo,
        nombre: nombre.trim(),
        representante: representante.trim() || undefined,
        domicilio: domicilio.trim() || undefined,
        domicilioElectronico: domicilioElectronico.trim() || undefined,
      });
      setVinculo('ACTOR');
      setNombre('');
      setRepresentante('');
      setDomicilio('');
      setDomicilioElectronico('');
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al agregar el sujeto');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <SujetosTable sujetos={sujetos} />

      {isSecretario && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
            <UserPlus size={14} className="text-blue-600" />
            Agregar Sujeto
          </h3>
          <form onSubmit={handleAgregar} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value as SujetoVinculo)}
                className="form-input text-sm"
              >
                {SUJETO_VINCULO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre / Denominación"
                className="form-input text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={representante}
                onChange={(e) => setRepresentante(e.target.value)}
                placeholder="Representante (opcional)"
                className="form-input text-sm"
              />
              <input
                value={domicilio}
                onChange={(e) => setDomicilio(e.target.value)}
                placeholder="Domicilio (opcional)"
                className="form-input text-sm"
              />
              <input
                type="email"
                value={domicilioElectronico}
                onChange={(e) => setDomicilioElectronico(e.target.value)}
                placeholder="Domicilio electrónico (opcional)"
                className="form-input text-sm"
              />
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={!nombre.trim() || isSending}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'Agregando...' : 'Agregar sujeto'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

type UsuarioBusqueda = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

function ExpedientesBlock({
  causaId,
  expedientes,
  isSecretario,
  isActor,
}: {
  causaId: string;
  expedientes: Expediente[];
  isSecretario: boolean;
  isActor: boolean;
}) {
  const { agregarExpediente, eliminarExpediente, agregarSujeto } = useCausas();
  const canCreate = isSecretario || isActor;

  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [deletingExp, setDeletingExp] = useState<string | null>(null);

  const [sujVinculo, setSujVinculo]                 = useState<SujetoVinculo>('ACTOR');
  const [sujNombre, setSujNombre]                   = useState('');
  const [sujRepresentante, setSujRepresentante]     = useState('');
  const [sujDomicilio, setSujDomicilio]             = useState('');
  const [sujDomicilioElectronico, setSujDomicilioElectronico] = useState('');
  const [isSendingSujeto, setIsSendingSujeto]       = useState(false);
  const [sujetoError, setSujetoError]               = useState<string | null>(null);

  const [nroExpediente, setNroExpediente] = useState('');
  const [caratula, setCaratula]           = useState('');
  const [objetoJuicio, setObjetoJuicio]   = useState('');
  const [fechaInicio, setFechaInicio]     = useState('');
  const [montoDisputa, setMontoDisputa]   = useState('');
  const [asignados, setAsignados]         = useState<UsuarioBusqueda[]>([]);
  const [userSearch, setUserSearch]       = useState('');
  const [userResults, setUserResults]     = useState<UsuarioBusqueda[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [isSending, setIsSending]         = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);

  const [asignadosPorExp, setAsignadosPorExp]         = useState<Record<string, UsuarioBusqueda[]>>({});
  const [asigLoading, setAsigLoading]                 = useState<Record<string, boolean>>({});
  const [userSearchAsig, setUserSearchAsig]           = useState<Record<string, string>>({});
  const [userResultsAsig, setUserResultsAsig]         = useState<Record<string, UsuarioBusqueda[]>>({});
  const [userSearchLoadingAsig, setUserSearchLoadingAsig] = useState<Record<string, boolean>>({});

  const fetchAsignados = async (nro: string) => {
    setAsigLoading((prev) => ({ ...prev, [nro]: true }));
    try {
      const { data } = await api.get<UsuarioBusqueda[]>(`/admin/causas/${causaId}/expedientes/${nro}/asignados`);
      setAsignadosPorExp((prev) => ({ ...prev, [nro]: data }));
    } catch {
      setAsignadosPorExp((prev) => ({ ...prev, [nro]: [] }));
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nro]: false }));
    }
  };

  const toggleExpand = (nro: string) => {
    const next = expandedExp === nro ? null : nro;
    setExpandedExp(next);
    if (next && isSecretario && !asignadosPorExp[next]) {
      fetchAsignados(next);
    }
  };

  const handleUserSearchAsig = (nro: string, q: string) => {
    setUserSearchAsig((prev) => ({ ...prev, [nro]: q }));
    if (!q.trim()) { setUserResultsAsig((prev) => ({ ...prev, [nro]: [] })); return; }
    setUserSearchLoadingAsig((prev) => ({ ...prev, [nro]: true }));
    api.get<UsuarioBusqueda[]>('/admin/usuarios', { params: { search: q } })
      .then(({ data }) => setUserResultsAsig((prev) => ({ ...prev, [nro]: data })))
      .catch(() => setUserResultsAsig((prev) => ({ ...prev, [nro]: [] })))
      .finally(() => setUserSearchLoadingAsig((prev) => ({ ...prev, [nro]: false })));
  };

  const agregarAsignado = async (nro: string, u: UsuarioBusqueda) => {
    setAsigLoading((prev) => ({ ...prev, [nro]: true }));
    try {
      const { data } = await api.post<UsuarioBusqueda[]>(`/admin/causas/${causaId}/expedientes/${nro}/asignados`, { userId: u._id });
      setAsignadosPorExp((prev) => ({ ...prev, [nro]: data }));
      setUserSearchAsig((prev) => ({ ...prev, [nro]: '' }));
      setUserResultsAsig((prev) => ({ ...prev, [nro]: [] }));
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nro]: false }));
    }
  };

  const quitarAsignado = async (nro: string, userId: string) => {
    setAsigLoading((prev) => ({ ...prev, [nro]: true }));
    try {
      await api.delete(`/admin/causas/${causaId}/expedientes/${nro}/asignados/${userId}`);
      await fetchAsignados(nro);
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nro]: false }));
    }
  };

  const handleUserSearch = (q: string) => {
    setUserSearch(q);
    if (!q.trim()) { setUserResults([]); return; }
    setUserSearchLoading(true);
    api.get<UsuarioBusqueda[]>('/admin/usuarios', { params: { search: q } })
      .then(({ data }) => setUserResults(data))
      .catch(() => setUserResults([]))
      .finally(() => setUserSearchLoading(false));
  };

  const addAsignado = (u: UsuarioBusqueda) => {
    if (!asignados.some((a) => a._id === u._id)) {
      setAsignados((prev) => [...prev, u]);
    }
    setUserSearch('');
    setUserResults([]);
  };

  const removeAsignado = (id: string) => {
    setAsignados((prev) => prev.filter((a) => a._id !== id));
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nroExpediente.trim() || !caratula.trim() || !objetoJuicio.trim() || !fechaInicio) return;
    setIsSending(true);
    setFormError(null);
    try {
      const now = new Date().toISOString();
      const fechaInicioISO = new Date(fechaInicio).toISOString();
      await agregarExpediente(causaId, {
        nroExpediente:     nroExpediente.trim(),
        caratula:          caratula.trim(),
        fechaPresentacion: now,
        fechaInicio:       fechaInicioISO,
        ultimoMovimiento:  fechaInicioISO,
        objetoJuicio:      objetoJuicio.trim(),
        montoDisputa:      montoDisputa.trim() || undefined,
        asignados:         asignados.map((a) => a._id),
      });
      setNroExpediente('');
      setCaratula('');
      setObjetoJuicio('');
      setFechaInicio('');
      setMontoDisputa('');
      setAsignados([]);
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? 'Error al agregar el expediente');
    } finally {
      setIsSending(false);
    }
  };

  const handleEliminar = async (nro: string) => {
    setDeletingExp(nro);
    try {
      await eliminarExpediente(causaId, nro);
    } finally {
      setDeletingExp(null);
    }
  };

  const handleAgregarSujeto = async (e: React.FormEvent, nroExpediente: string) => {
    e.preventDefault();
    if (!sujNombre.trim()) return;
    setIsSendingSujeto(true);
    setSujetoError(null);
    try {
      await agregarSujeto(causaId, nroExpediente, {
        vinculo:              sujVinculo,
        nombre:               sujNombre.trim(),
        representante:        sujRepresentante.trim() || undefined,
        domicilio:            sujDomicilio.trim() || undefined,
        domicilioElectronico: sujDomicilioElectronico.trim() || undefined,
      });
      setSujVinculo('ACTOR');
      setSujNombre('');
      setSujRepresentante('');
      setSujDomicilio('');
      setSujDomicilioElectronico('');
    } catch (err: any) {
      setSujetoError(err.response?.data?.message ?? 'Error al agregar el sujeto');
    } finally {
      setIsSendingSujeto(false);
    }
  };

  return (
    <div className="space-y-6">
      {canCreate && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
            <FolderOpen size={14} className="text-blue-600" />
            Agregar Expediente
          </h3>
          <form onSubmit={handleAgregar} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={nroExpediente}
                onChange={(e) => setNroExpediente(e.target.value)}
                placeholder="Número de expediente"
                className="form-input text-sm"
                required
              />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="form-input text-sm"
                required
              />
            </div>
            <input
              value={caratula}
              onChange={(e) => setCaratula(e.target.value)}
              placeholder="Carátula"
              className="form-input text-sm"
              required
            />
            <textarea
              value={objetoJuicio}
              onChange={(e) => setObjetoJuicio(e.target.value)}
              placeholder="Objeto del juicio"
              rows={3}
              required
              className="form-input text-sm resize-none"
            />
            <input
              value={montoDisputa}
              onChange={(e) => setMontoDisputa(e.target.value)}
              placeholder="Monto en disputa (opcional)"
              className="form-input text-sm"
            />

            {isSecretario && (
              <div className="relative">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Usuarios asignados
                </p>
                {asignados.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {asignados.map((a) => (
                      <span key={a._id} className="flex items-center gap-1 bg-white border border-slate-200 rounded-full pl-2.5 pr-1 py-1 text-xs text-slate-700">
                        {a.name}
                        <button type="button" onClick={() => removeAsignado(a._id)} className="text-slate-400 hover:text-red-600">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Buscar usuario por nombre o email..."
                    className="form-input text-sm pl-8"
                  />
                  {userSearchLoading && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                  )}
                </div>
                {userResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {userResults.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => addAsignado(u)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-800">{u.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{u.email}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                          <UserPlus size={13} /> Agregar
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={!nroExpediente.trim() || !caratula.trim() || !objetoJuicio.trim() || !fechaInicio || isSending}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'Agregando...' : 'Agregar expediente'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-blue-700 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Nº Expediente</th>
              <th className="px-4 py-3 font-semibold">Objeto del Juicio</th>
              <th className="px-4 py-3 font-semibold">Fecha de Inicio</th>
              {isSecretario && <th className="px-4 py-3 font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expedientes.map((exp) => {
              const isExpanded = expandedExp === exp.nroExpediente;
              return (
                <Fragment key={exp.nroExpediente}>
                  <tr
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleExpand(exp.nroExpediente)}
                  >
                    <td className="px-4 py-3 font-mono text-[#001f3f] font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {exp.nroExpediente}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">
                      <div className="line-clamp-2">{exp.objetoJuicio}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{exp.fechaInicio}</td>
                    {isSecretario && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEliminar(exp.nroExpediente); }}
                          disabled={deletingExp === exp.nroExpediente}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={isSecretario ? 4 : 3} className="px-4 py-4 bg-slate-50">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                          Sujetos del expediente
                        </p>
                        {exp.sujetos.length > 0 ? (
                          <SujetosTable sujetos={exp.sujetos} />
                        ) : (
                          <p className="text-slate-400 text-sm">Sin sujetos asignados.</p>
                        )}

                        {isSecretario && (
                          <form
                            onSubmit={(e) => handleAgregarSujeto(e, exp.nroExpediente)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 space-y-2 bg-white rounded-xl border border-slate-200 p-4"
                          >
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                              Agregar sujeto
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <select
                                value={sujVinculo}
                                onChange={(e) => setSujVinculo(e.target.value as SujetoVinculo)}
                                className="form-input text-sm"
                              >
                                {SUJETO_VINCULO_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              <input
                                value={sujNombre}
                                onChange={(e) => setSujNombre(e.target.value)}
                                placeholder="Nombre / Denominación"
                                className="form-input text-sm"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input
                                value={sujRepresentante}
                                onChange={(e) => setSujRepresentante(e.target.value)}
                                placeholder="Representante (opcional)"
                                className="form-input text-sm"
                              />
                              <input
                                value={sujDomicilio}
                                onChange={(e) => setSujDomicilio(e.target.value)}
                                placeholder="Domicilio (opcional)"
                                className="form-input text-sm"
                              />
                              <input
                                value={sujDomicilioElectronico}
                                onChange={(e) => setSujDomicilioElectronico(e.target.value)}
                                placeholder="Domicilio electrónico (opcional)"
                                className="form-input text-sm"
                              />
                            </div>
                            {sujetoError && <p className="text-xs text-red-600">{sujetoError}</p>}
                            <button
                              type="submit"
                              disabled={!sujNombre.trim() || isSendingSujeto}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
                            >
                              <UserPlus size={14} /> {isSendingSujeto ? 'Agregando...' : 'Agregar sujeto'}
                            </button>
                          </form>
                        )}

                        {isSecretario && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 space-y-2 bg-white rounded-xl border border-slate-200 p-4"
                          >
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                              Usuarios asignados
                            </p>

                            {asigLoading[exp.nroExpediente] ? (
                              <div className="flex justify-center py-3">
                                <Loader2 size={18} className="animate-spin text-[#001f3f]" />
                              </div>
                            ) : (
                              <>
                                {(asignadosPorExp[exp.nroExpediente] ?? []).length === 0 ? (
                                  <p className="text-slate-400 text-sm">Sin usuarios asignados.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {(asignadosPorExp[exp.nroExpediente] ?? []).map((u) => (
                                      <div key={u._id} className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 px-3 py-2">
                                        <div>
                                          <span className="text-sm font-medium text-slate-800">{u.name}</span>
                                          <span className="text-xs text-slate-400 ml-2">{u.email}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => quitarAsignado(exp.nroExpediente, u._id)}
                                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                          <UserMinus size={13} /> Quitar
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="relative">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    value={userSearchAsig[exp.nroExpediente] ?? ''}
                                    onChange={(e) => handleUserSearchAsig(exp.nroExpediente, e.target.value)}
                                    placeholder="Buscar usuario por nombre o email..."
                                    className="form-input text-sm pl-8"
                                  />
                                  {userSearchLoadingAsig[exp.nroExpediente] && (
                                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                                  )}
                                  {(userResultsAsig[exp.nroExpediente] ?? []).length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                      {(userResultsAsig[exp.nroExpediente] ?? []).map((u) => (
                                        <button
                                          key={u._id}
                                          type="button"
                                          onClick={() => agregarAsignado(exp.nroExpediente, u)}
                                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between"
                                        >
                                          <div>
                                            <span className="text-sm font-medium text-slate-800">{u.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">{u.email}</span>
                                          </div>
                                          <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                                            <UserPlus size={13} /> Agregar
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {expedientes.length === 0 && (
              <tr>
                <td colSpan={isSecretario ? 4 : 3} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Sin expedientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DESCRIPCION_REL_MAX = 500;

function CausasRelacionadasBlock({
  causaId,
  relacionadas,
  isSecretario,
}: {
  causaId: string;
  relacionadas: CausaRelacionada[];
  isSecretario: boolean;
}) {
  const { agregarRelacionada, eliminarRelacionada } = useCausas();

  const [relIdentificador, setRelIdentificador] = useState('');
  const [relDescripcion, setRelDescripcion]     = useState('');
  const [relArchivo, setRelArchivo]             = useState<File | null>(null);
  const [isSending, setIsSending]               = useState(false);
  const [formError, setFormError]               = useState<string | null>(null);
  const [deletingId, setDeletingId]             = useState<string | null>(null);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relIdentificador.trim() || !relDescripcion.trim()) return;
    setIsSending(true);
    setFormError(null);
    try {
      await agregarRelacionada(causaId, relIdentificador.trim(), relDescripcion.trim(), relArchivo ?? undefined);
      setRelIdentificador('');
      setRelDescripcion('');
      setRelArchivo(null);
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? 'Error al agregar la causa relacionada');
    } finally {
      setIsSending(false);
    }
  };

  const handleEliminar = async (identificador: string) => {
    setDeletingId(identificador);
    try {
      await eliminarRelacionada(causaId, identificador);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDescargar = async (rel: CausaRelacionada) => {
    if (!rel._id) return;
    try {
      const response = await api.get(
        `/causas/${causaId}/relacionadas/${rel._id}/archivo`,
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = rel.nombreArchivo ?? 'archivo';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo descargar el archivo.');
    }
  };

  return (
    <div className="space-y-6">
      {isSecretario && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
            <Link2 size={14} className="text-blue-600" />
            Vincular Causa Relacionada
          </h3>
          <form onSubmit={handleAgregar} className="space-y-3">
            <input
              value={relIdentificador}
              onChange={(e) => setRelIdentificador(e.target.value)}
              placeholder="Identificador de la causa"
              className="form-input text-sm"
              required
            />
            <div>
              <textarea
                value={relDescripcion}
                onChange={(e) => setRelDescripcion(e.target.value.slice(0, DESCRIPCION_REL_MAX))}
                placeholder="Descripción de la vinculación"
                rows={3}
                required
                className="form-input text-sm resize-none"
              />
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {relDescripcion.length}/{DESCRIPCION_REL_MAX}
              </div>
            </div>
            <label className="flex items-center gap-2 bg-white border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
              <Upload size={14} className="text-[#001f3f]" />
              <span className="text-xs text-slate-600 truncate">
                {relArchivo ? relArchivo.name : 'Adjuntar archivo (opcional, PDF/DOC/DOCX/JPG/PNG)'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setRelArchivo(e.target.files?.[0] ?? null)}
              />
            </label>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={!relIdentificador.trim() || !relDescripcion.trim() || isSending}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'Vinculando...' : 'Vincular causa'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-blue-700 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Identificador</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold">Archivo</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              {isSecretario && <th className="px-4 py-3 font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {relacionadas.map((r, i) => (
              <tr key={r._id ?? i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-[#001f3f] font-semibold whitespace-nowrap">{r.identificador}</td>
                <td className="px-4 py-3 text-slate-700 max-w-xs">
                  <div className="line-clamp-3">{r.descripcion}</div>
                </td>
                <td className="px-4 py-3">
                  {r._id && r.nombreArchivo ? (
                    <button
                      onClick={() => handleDescargar(r)}
                      className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
                    >
                      <Download size={13} />
                      {r.nombreArchivo}
                    </button>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {r.creadoEn ? new Date(r.creadoEn).toLocaleDateString('es-AR') : '-'}
                </td>
                {isSecretario && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEliminar(r.identificador)}
                      disabled={deletingId === r.identificador}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Quitar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {relacionadas.length === 0 && (
              <tr>
                <td colSpan={isSecretario ? 5 : 4} className="px-4 py-10 text-center text-slate-400 text-sm">
                  No hay causas relacionadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MOVIMIENTO_TIPO_LABELS: Record<MovimientoTipo, string> = {
  ACT: 'Actuación',
  ESC: 'Escrito',
  CED: 'Cédula',
  RES: 'Resolución',
  NOT: 'Notificación',
  AUD: 'Audiencia',
  PER: 'Pericia',
};

const DESCRIPCION_MAX = 2000;
const MOV_ARCHIVO_MAX_SIZE = 20 * 1024 * 1024;

function MovimientosBlock({
  causaId,
  movimientos,
}: {
  causaId: string;
  movimientos: Movimiento[];
}) {
  const { currentCausa, agregarMovimiento } = useCausas();
  const { user } = useAuth();
  const { isReadOnly } = usePermissions();
  const isSecretario = user?.role === 'secretario' && !isReadOnly;

  const expediente = currentCausa?.expedientes[0];

  const [movTipo, setMovTipo]           = useState<MovimientoTipo>('ACT');
  const [movTitulo, setMovTitulo]       = useState('');
  const [movDescripcion, setMovDescripcion] = useState('');
  const [movArchivo, setMovArchivo]     = useState<File | null>(null);
  const [movArchivoError, setMovArchivoError] = useState<string | null>(null);
  const [isSending, setIsSending]       = useState(false);

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MOV_ARCHIVO_MAX_SIZE) {
      setMovArchivoError('El archivo no puede superar los 20MB');
      setMovArchivo(null);
      e.target.value = '';
      return;
    }
    setMovArchivoError(null);
    setMovArchivo(file);
  };

  const handleCargarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movTitulo.trim() || (!movDescripcion.trim() && !movArchivo) || !user || !expediente) return;
    setIsSending(true);
    try {
      const prefix = movTipo === 'ACT' ? 'AC' : movTipo === 'ESC' ? 'ES' : movTipo === 'CED' ? 'CD' : movTipo === 'RES' ? 'RS' : movTipo === 'NOT' ? 'NT' : movTipo === 'AUD' ? 'AU' : 'PE';
      const mov: NuevoMovimiento = {
        id:          `m-${Date.now()}`,
        fecha:       new Date().toISOString(),
        tipo:        movTipo,
        titulo:      movTitulo.trim(),
        descripcion: movDescripcion.trim() || undefined,
        numero:      `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
        tribunal:    'TRIBUNAL ARBITRAL BCM',
        presentante: user.name,
        acceso:      movTipo === 'ESC' ? 'Escrito de parte' : 'Resolución',
        archivo:     movArchivo ?? undefined,
      };
      await agregarMovimiento(causaId, expediente.nroExpediente, mov);
      setMovTipo('ACT');
      setMovTitulo('');
      setMovDescripcion('');
      setMovArchivo(null);
      setMovArchivoError(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleDescargarMovimiento = async (m: Movimiento) => {
    if (!expediente) return;
    try {
      const response = await api.get(
        `/causas/${causaId}/expedientes/${expediente.nroExpediente}/movimientos/${m.id}/archivo`,
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = m.nombreArchivo ?? 'archivo';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo descargar el archivo.');
    }
  };

  return (
    <div className="space-y-6">
      {isSecretario && expediente && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
            <FilePlus size={14} className="text-blue-600" />
            Cargar Movimiento
          </h3>
          <form onSubmit={handleCargarMovimiento} className="space-y-3">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <select
                  value={movTipo}
                  onChange={(e) => setMovTipo(e.target.value as MovimientoTipo)}
                  className="form-input text-sm"
                >
                  {(Object.keys(MOVIMIENTO_TIPO_LABELS) as MovimientoTipo[]).map((t) => (
                    <option key={t} value={t}>{MOVIMIENTO_TIPO_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-8">
                <input
                  value={movTitulo}
                  onChange={(e) => setMovTitulo(e.target.value)}
                  placeholder="Título / descripción"
                  className="form-input text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <textarea
                value={movDescripcion}
                onChange={(e) => setMovDescripcion(e.target.value.slice(0, DESCRIPCION_MAX))}
                placeholder="Descripción del movimiento (opcional si adjuntás un PDF)"
                rows={3}
                className="form-input text-sm resize-none"
              />
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {movDescripcion.length}/{DESCRIPCION_MAX}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 bg-white border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <Upload size={14} className="text-[#001f3f]" />
                <span className="text-xs text-slate-600 truncate">
                  {movArchivo ? movArchivo.name : 'Adjuntar archivo (opcional, PDF/DOC/DOCX/JPG/PNG, máx. 20MB)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleArchivoChange}
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                Si subís un PDF, la descripción se completará automáticamente
              </p>
              {movArchivo?.type === 'application/pdf' && (
                <p className="flex items-center gap-1 text-[11px] text-blue-700 mt-1">
                  <FileText size={12} />
                  Se intentará extraer el texto del PDF para completar la descripción
                </p>
              )}
              {movArchivoError && (
                <p className="text-[11px] text-red-600 mt-1">{movArchivoError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!movTitulo.trim() || (!movDescripcion.trim() && !movArchivo) || isSending}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-blue-700 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold">Origen - Destino</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Adjunto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{m.fecha}</td>
                <td className="px-4 py-3">
                  <div className="text-slate-800 font-medium">{m.titulo}</div>
                  {m.descripcion && (
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.descripcion}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  Origen: TRIBUNAL ARBITRAL BCM - Destino: {m.tribunal ?? 'TRIBUNAL ARBITRAL BCM'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{m.tipo}</td>
                <td className="px-4 py-3">
                  {m.nombreArchivo ? (
                    <button
                      onClick={() => handleDescargarMovimiento(m)}
                      className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
                    >
                      <Download size={13} />
                      {m.nombreArchivo}
                    </button>
                  ) : m.adjuntos ? (
                    <Paperclip size={14} className="text-slate-500" />
                  ) : null}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Sin movimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
