import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FilePlus, Send, Upload, Info, Users, ListOrdered, Link2, Download, Trash2, UserPlus, FileText, Gavel, Search, ChevronDown } from 'lucide-react';

const ARBITROS_TITULARES = [
  { nombre: 'Pedro Alvaro Pérez Catón',  matricula: '(pendiente)' }, // TODO: completar matrícula
  { nombre: 'Pablo Javier Olaiz',        matricula: '(pendiente)' }, // TODO: completar matrícula
  { nombre: 'Federico Pithod',           matricula: '(pendiente)' }, // TODO: completar matrícula
];
const SECRETARIO_TRIBUNAL = { nombre: 'Santiago María Cardozo', matricula: '(pendiente)' }; // TODO: completar matrícula
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useCausas, type Causa, type Movimiento, type NuevoMovimiento, type MovimientoTipo, type CausaStatus, type Sujeto, type SujetoVinculo, type CausaRelacionada } from '../context/CausasContext';
import { useAuth, usePermissions } from '../context/AuthContext';
import api from '../services/api';

const SECTIONS = [
  { id: 'info',       label: 'Información General',   icon: Info },
  { id: 'tribunal',   label: 'Composición del Tribunal', icon: Gavel },
  { id: 'sujetos',    label: 'Sujetos',               icon: Users },
  { id: 'movimientos',label: 'Movimientos',            icon: ListOrdered },
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

  const handleDescargarCaratula = async () => {
    try {
      const response = await api.get(
        `/causas/${causa.id}/caratula/archivo`,
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = causa.nombreArchivo ?? 'caratula.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo descargar el archivo.');
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
            {causa.nroExpedienteElectronico || causa.numeroInterno} {causa.tribunal}
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
          <div className="text-slate-400 uppercase font-semibold">Secretario</div>
          <div className="text-slate-700 font-semibold">{SECRETARIO_TRIBUNAL.nombre}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-2">
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

        <div className="lg:col-span-10 space-y-8">
          <Section id="info" title="Información General" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="N° de Expediente"     value={causa.nroExpedienteElectronico || causa.numeroInterno} />
              <InfoRow label="Demanda"               value={causa.caratula} />
              <InfoRow label="Tribunal"             value={causa.tribunal} />
              <InfoRow label="Fecha de Inicio"     value={causa.fechaInicio} />
              <InfoRow label="Último Movimiento"    value={causa.ultimoMovimiento} />
              <InfoRow label="Objeto del Juicio"    value={causa.objetoJuicio} />
              {causa.nombreArchivo && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Adjunto de Demanda</div>
                  <button
                    type="button"
                    onClick={handleDescargarCaratula}
                    className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium"
                  >
                    <Download size={14} />
                    {causa.nombreArchivo}
                  </button>
                </div>
              )}
            </div>
          </Section>

          <Section id="tribunal" title="Composición del Tribunal" icon={Gavel}>
            <ComposicionTribunalBlock causa={causa} isSecretario={isSecretario} />
          </Section>

          <Section id="sujetos" title="Sujetos" icon={Users}>
            <SujetosBlock
              causaId={causa.id}
              sujetos={causa.sujetos}
              isSecretario={isSecretario}
            />
          </Section>

          <Section id="movimientos" title="Movimientos" icon={ListOrdered}>
            <MovimientosBlock causaId={causa.id} movimientos={allMovimientos} sujetos={causa.sujetos} />
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

function ComposicionTribunalBlock({ causa, isSecretario }: { causa: Causa; isSecretario: boolean }) {
  const { actualizarCausa } = useCausas();
  const [s1, setS1] = useState(causa.arbitrosSuplentes?.[0] ?? '');
  const [s2, setS2] = useState(causa.arbitrosSuplentes?.[1] ?? '');
  const [s3, setS3] = useState(causa.arbitrosSuplentes?.[2] ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await actualizarCausa(causa.id, {
        arbitrosSuplentes: [s1, s2, s3].filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const suplentesGuardados = causa.arbitrosSuplentes ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Titulares — estático */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Árbitros Titulares</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            {ARBITROS_TITULARES.map((a, i) => (
              <div key={i} className="text-sm text-slate-700">
                <span className="font-semibold">{a.nombre}</span>
                <span className="text-slate-400 ml-2 text-xs">Matr.: {a.matricula}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suplentes */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Árbitros Suplentes</p>
          {isSecretario ? (
            <div className="space-y-2">
              <input value={s1} onChange={(e) => setS1(e.target.value)} placeholder="Suplente 1 (opcional)" className="form-input text-sm" />
              <input value={s2} onChange={(e) => setS2(e.target.value)} placeholder="Suplente 2 (opcional)" className="form-input text-sm" />
              <input value={s3} onChange={(e) => setS3(e.target.value)} placeholder="Suplente 3 (opcional)" className="form-input text-sm" />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50 transition-all"
              >
                <Send size={12} />
                {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar suplentes'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 min-h-[60px]">
              {suplentesGuardados.length > 0 ? suplentesGuardados.map((s, i) => (
                <div key={i} className="text-sm font-semibold text-slate-700">{s}</div>
              )) : (
                <span className="text-sm text-slate-400">No designados</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secretario — estático */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Secretario</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-sm font-semibold text-slate-700">{SECRETARIO_TRIBUNAL.nombre}</span>
          <span className="text-slate-400 ml-2 text-xs">Matr.: {SECRETARIO_TRIBUNAL.matricula}</span>
        </div>
      </div>
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
            <th className="px-4 py-3 font-semibold">CUIT</th>
            <th className="px-4 py-3 font-semibold">Patrocinante</th>
            <th className="px-4 py-3 font-semibold">Domicilio</th>
            <th className="px-4 py-3 font-semibold">Domicilio Electrónico</th>
            {/* Estado de aprobación oculto: flujo de autorización por mail desactivado */}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sujetos.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-700">
                {s.vinculo}
                {s.calidad && (
                  <div className="text-xs font-normal text-slate-500 mt-0.5">{s.calidad}</div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-800">{s.nombre}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{s.cuit ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700">{s.representante ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700">{s.domicilio ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700 font-mono text-xs">{s.domicilioElectronico ?? '-'}</td>
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
  const [cuit, setCuit]                       = useState('');
  const [calidad, setCalidad]                 = useState('');
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
        cuit: cuit.trim() || undefined,
        calidad: vinculo === 'TERCERO' ? (calidad.trim() || undefined) : undefined,
      });
      setVinculo('ACTOR');
      setNombre('');
      setRepresentante('');
      setDomicilio('');
      setDomicilioElectronico('');
      setCuit('');
      setCalidad('');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="CUIT (XX-XXXXXXXX-X, opcional)"
                className="form-input text-sm"
              />
              <input
                value={representante}
                onChange={(e) => setRepresentante(e.target.value)}
                placeholder="Patrocinante (opcional)"
                className="form-input text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            {vinculo === 'TERCERO' && (
              <input
                value={calidad}
                onChange={(e) => setCalidad(e.target.value)}
                placeholder="Calidad / Rol (ej: Testigo, Perito, Patrocinante)"
                className="form-input text-sm"
              />
            )}
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
              <th className="px-4 py-3 font-semibold">Nro. Expediente Electrónico</th>
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
  DEMANDA_ACTUACION:      'DEMANDA DE ACTUACIÓN',
  DECRETO:                'DECRETO',
  CONTESTACION:           'CONTESTACIÓN DE LA DEMANDA',
  CONTESTACION_TRASLADO:  'CONTESTACIÓN TRASLADO DE LA DEMANDA',
  VISTA_CAUSA:            'VISTA DE CAUSA',
  AUDIENCIA_INICIAL:      'AUDIENCIA INICIAL',
  AUTOS_LAUDAR:           'AUTOS PARA LAUDAR',
  LAUDO:                  'LAUDO',
  ESCRITO:                'ESCRITO',
  CEDULA:                 'CÉDULA',
  NOTIFICACION:           'NOTIFICACIÓN',
  PERICIA:                'PERICIA',
};

type MovimientoCategoria = 'Resolución' | 'Presentación' | 'Notificación';

const MOVIMIENTO_CATEGORIA: Record<MovimientoTipo, MovimientoCategoria> = {
  DECRETO:               'Resolución',
  VISTA_CAUSA:           'Resolución',
  AUDIENCIA_INICIAL:     'Resolución',
  AUTOS_LAUDAR:          'Resolución',
  LAUDO:                 'Resolución',
  DEMANDA_ACTUACION:     'Presentación',
  CONTESTACION:          'Presentación',
  CONTESTACION_TRASLADO: 'Presentación',
  ESCRITO:               'Presentación',
  PERICIA:               'Presentación',
  CEDULA:                'Notificación',
  NOTIFICACION:          'Notificación',
};

const CATEGORIA_BADGE: Record<MovimientoCategoria, string> = {
  Resolución:   'bg-green-100 text-green-800',
  Presentación: 'bg-violet-100 text-violet-800',
  Notificación: 'bg-amber-100 text-amber-800',
};

const FILTER_TABS: { label: string; value: MovimientoCategoria | 'Todas' }[] = [
  { label: 'Todas',         value: 'Todas' },
  { label: 'Resoluciones',  value: 'Resolución' },
  { label: 'Presentaciones',value: 'Presentación' },
  { label: 'Notificaciones',value: 'Notificación' },
];

function formatMovFecha(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: iso, time: '' };
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return { date, time };
}

function isRecent(iso: string) {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;
}

const DESCRIPCION_MAX = 2000;
const MOV_ARCHIVO_MAX_SIZE = 20 * 1024 * 1024;

function MovimientosBlock({
  causaId,
  movimientos,
  sujetos,
}: {
  causaId: string;
  movimientos: Movimiento[];
  sujetos: Sujeto[];
}) {
  const { currentCausa, agregarMovimiento, eliminarMovimiento, agregarExpediente } = useCausas();
  const { user } = useAuth();

  const expediente = currentCausa?.expedientes[0];

  const isAsignado = !!user?._id && !!expediente?.asignados?.includes(user._id);
  const puedeCargarMovimiento =
    user?.role === 'secretario' || user?.role === 'arbitro' || isAsignado;
  const esSecretario = user?.role === 'secretario';

  const [movTipo, setMovTipo]           = useState<MovimientoTipo>('DEMANDA_ACTUACION');
  const [movTitulo, setMovTitulo]       = useState('');
  const [movDescripcion, setMovDescripcion] = useState('');
  const [movSujetoNombre, setMovSujetoNombre] = useState('');
  const [movArchivo, setMovArchivo]     = useState<File | null>(null);
  const [movArchivoError, setMovArchivoError] = useState<string | null>(null);
  const [isSending, setIsSending]       = useState(false);
  const [movError, setMovError]         = useState<string | null>(null);
  const [busqueda, setBusqueda]         = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<MovimientoCategoria | 'Todas'>('Todas');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [deletingMovId, setDeletingMovId] = useState<string | null>(null);

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
    if (!movTitulo.trim() || (!movDescripcion.trim() && !movArchivo) || !user || !currentCausa) return;
    setIsSending(true);
    setMovError(null);
    try {
      let nroExpediente = expediente?.nroExpediente;
      if (!nroExpediente) {
        nroExpediente = currentCausa.identificador;
        const now = new Date().toISOString();
        await agregarExpediente(causaId, {
          nroExpediente,
          caratula:          currentCausa.caratula,
          fechaPresentacion: now,
          fechaInicio:       now,
          ultimoMovimiento:  now,
          objetoJuicio:      currentCausa.objetoJuicio,
        });
      }

      const prefix = movTipo.slice(0, 3).toUpperCase();
      const mov: NuevoMovimiento = {
        id:          `m-${Date.now()}`,
        fecha:       new Date().toISOString(),
        tipo:        movTipo,
        titulo:      movTitulo.trim(),
        descripcion: movDescripcion.trim() || undefined,
        numero:      `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
        tribunal:    'TRIBUNAL ARBITRAL BCM',
        presentante: user.name,
        acceso:      movTipo === 'ESCRITO' ? 'Escrito de parte' : 'Resolución',
        sujetoNombre: movSujetoNombre || undefined,
        archivo:     movArchivo ?? undefined,
      };
      await agregarMovimiento(causaId, nroExpediente, mov);
      setMovTipo('DEMANDA_ACTUACION');
      setMovTitulo('');
      setMovDescripcion('');
      setMovSujetoNombre('');
      setMovArchivo(null);
      setMovArchivoError(null);
    } catch (err: any) {
      setMovError(err?.response?.data?.message || 'No se pudo registrar el movimiento.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEliminarMovimiento = async (m: Movimiento) => {
    if (!expediente || !confirm(`¿Eliminar el movimiento "${m.titulo}"?`)) return;
    setDeletingMovId(m.id);
    try {
      await eliminarMovimiento(causaId, expediente.nroExpediente, m.id);
    } catch {
      alert('No se pudo eliminar el movimiento.');
    } finally {
      setDeletingMovId(null);
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
      {puedeCargarMovimiento && currentCausa && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
            <FilePlus size={14} className="text-blue-600" />
            Cargar Movimiento
          </h3>
          <form onSubmit={handleCargarMovimiento} className="space-y-3">
            <select
              value={movTipo}
              onChange={(e) => setMovTipo(e.target.value as MovimientoTipo)}
              className="form-input text-sm w-full"
            >
              {(Object.keys(MOVIMIENTO_TIPO_LABELS) as MovimientoTipo[]).map((t) => (
                <option key={t} value={t}>{MOVIMIENTO_TIPO_LABELS[t]}</option>
              ))}
            </select>
            <input
              value={movTitulo}
              onChange={(e) => setMovTitulo(e.target.value)}
              placeholder="Título / descripción"
              className="form-input text-sm"
              required
            />
            <div>
              <select
                value={movSujetoNombre}
                onChange={(e) => setMovSujetoNombre(e.target.value)}
                className="form-input text-sm"
              >
                <option value="">Sujeto que realiza (opcional)</option>
                {sujetos.map((s) => (
                  <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
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
            {movError && (
              <p className="text-[11px] text-red-600">{movError}</p>
            )}
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

      {/* Buscador + filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm text-slate-500 w-44">
          <Search size={14} className="shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="outline-none bg-transparent w-full text-slate-800 placeholder:text-slate-400"
          />
        </div>
        {FILTER_TABS.map((tab) => {
          const count = tab.value === 'Todas'
            ? movimientos.length
            : movimientos.filter((m) => MOVIMIENTO_CATEGORIA[m.tipo] === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setCategoriaFiltro(tab.value)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                categoriaFiltro === tab.value
                  ? 'bg-[#001f3f] text-white border-[#001f3f]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                categoriaFiltro === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold text-left w-32">Fecha</th>
              <th className="px-4 py-3 font-semibold text-left">Descripción</th>
              <th className="px-4 py-3 font-semibold text-left w-40">Tipo</th>
              <th className="px-4 py-3 font-semibold text-left w-44">Adjunto</th>
              <th className="px-4 py-3 w-8" />
              {esSecretario && <th className="px-4 py-3 w-8" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos
              .filter((m) => {
                const q = busqueda.toLowerCase();
                const matchQ = !q || m.titulo.toLowerCase().includes(q) || (m.descripcion ?? '').toLowerCase().includes(q);
                const matchCat = categoriaFiltro === 'Todas' || MOVIMIENTO_CATEGORIA[m.tipo] === categoriaFiltro;
                return matchQ && matchCat;
              })
              .map((m) => {
                const { date, time } = formatMovFecha(m.fecha);
                const cat = MOVIMIENTO_CATEGORIA[m.tipo];
                const expanded = expandedId === m.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isRecent(m.fecha) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{date}</div>
                          {time && <div className="text-xs text-slate-400">{time} hs</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{m.titulo}</div>
                      {m.descripcion && (
                        <div className={`text-xs text-slate-500 mt-0.5 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                          {m.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORIA_BADGE[cat]}`}>
                        {cat}
                      </span>
                      {m.sujetoNombre && (
                        <div className="text-xs text-slate-500 mt-1">{m.sujetoNombre}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.nombreArchivo ? (
                        <button
                          onClick={() => handleDescargarMovimiento(m)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-400 transition-colors"
                        >
                          <Download size={12} className="text-slate-500" />
                          <span className="max-w-[120px] truncate">{m.nombreArchivo}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.descripcion && m.descripcion.length > 80 && (
                        <button
                          onClick={() => setExpandedId(expanded ? null : m.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </td>
                    {esSecretario && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEliminarMovimiento(m)}
                          disabled={deletingMovId === m.id}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                          title="Eliminar movimiento"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={esSecretario ? 6 : 5} className="px-4 py-10 text-center text-slate-400 text-sm">
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
