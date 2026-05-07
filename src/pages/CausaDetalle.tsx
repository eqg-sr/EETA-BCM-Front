import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Paperclip, FilePlus, Send, Upload, MessageSquare, Info, Users, ListOrdered, Link2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas, type Movimiento, type MovimientoTipo, type Comentario } from '../context/CausasContext';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

const SECTIONS = [
  { id: 'info', label: 'Información General', icon: Info },
  { id: 'sujetos', label: 'Sujetos', icon: Users },
  { id: 'movimientos', label: 'Movimientos', icon: ListOrdered },
  { id: 'relacionadas', label: 'Causas Relacionadas', icon: Link2 },
] as const;

export default function CausaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { getCausa } = useCausas();
  const causa = id ? getCausa(id) : undefined;

  if (!causa) {
    return (
      <Layout>
        <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
          <ArrowLeft size={16} /> Volver al listado
        </Link>
        <p className="text-slate-500">Expediente no encontrado.</p>
      </Layout>
    );
  }

  const allMovimientos = causa.expedientes.flatMap((e) => e.movimientos);

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
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-400 uppercase font-semibold">Árbitro/a</div>
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
              <InfoRow label="Identificador" value={`${causa.identificador} (${causa.numeroInterno})`} />
              <InfoRow label="Carátula" value={causa.caratula} />
              <InfoRow label="Tribunal" value={causa.tribunal} />
              <InfoRow label="Árbitro/a" value={causa.arbitro} />
              <InfoRow label="Fecha de Presentación" value={causa.fechaPresentacion} />
              <InfoRow label="Fecha de Inicio" value={causa.fechaInicio} />
              <InfoRow label="Último Movimiento" value={causa.ultimoMovimiento} />
              <InfoRow label="Objeto del Juicio" value={causa.objetoJuicio} />
            </div>
          </Section>

          <Section id="sujetos" title="Sujetos" icon={Users}>
            <SujetosTable sujetos={causa.sujetos} />
          </Section>

          <Section id="movimientos" title="Movimientos" icon={ListOrdered}>
            <MovimientosBlock causaId={causa.id} movimientos={allMovimientos} />
          </Section>

          <Section id="relacionadas" title="Causas Relacionadas" icon={Link2}>
            <CausasRelacionadasBlock relacionadas={causa.causasRelacionadas} />
          </Section>
        </div>
      </div>
    </Layout>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: typeof Info;
  children: React.ReactNode;
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

function SujetosTable({ sujetos }: { sujetos: ReturnType<typeof useCausas>['causas'][number]['sujetos'] }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CausasRelacionadasBlock({ relacionadas }: { relacionadas: ReturnType<typeof useCausas>['causas'][number]['causasRelacionadas'] }) {
  if (relacionadas.length === 0) {
    return <p className="text-slate-500 text-sm">No hay causas relacionadas.</p>;
  }
  return (
    <div className="space-y-3">
      {relacionadas.map((r, i) => (
        <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-mono text-[#001f3f] font-semibold">{r.identificador}</div>
            <div className="text-sm font-semibold text-slate-800">{r.caratula}</div>
            <div className="text-xs text-slate-500 mt-1">{r.tribunal}</div>
          </div>
          <ExternalLink size={16} className="text-slate-400" />
        </div>
      ))}
    </div>
  );
}

function MovimientosBlock({
  causaId,
  movimientos,
}: {
  causaId: string;
  movimientos: ReturnType<typeof useCausas>['causas'][number]['expedientes'][number]['movimientos'];
}) {
  const { getCausa, addMovimiento, addComentario } = useCausas();
  const { user } = useAuth();
  const isSecretario = user?.role === 'secretario';

  const causa = getCausa(causaId);
  const expediente = causa?.expedientes[0];

  const [movTipo, setMovTipo] = useState<MovimientoTipo>('ACT');
  const [movTitulo, setMovTitulo] = useState('');
  const [movArchivo, setMovArchivo] = useState<File | null>(null);
  const [comentario, setComentario] = useState('');

  const handleCargarMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movTitulo.trim() || !user || !expediente) return;
    const prefix = movTipo === 'ACT' ? 'AC' : movTipo === 'ESC' ? 'ES' : movTipo === 'CED' ? 'CD' : 'MV';
    const mov: Movimiento = {
      id: `m-${Date.now()}`,
      fecha: new Date().toLocaleString('es-AR'),
      tipo: movTipo,
      titulo: movTitulo.trim(),
      numero: `${prefix}-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
      tribunal: 'TRIBUNAL ARBITRAL BCM',
      presentante: user.name,
      acceso: movTipo === 'ESC' ? 'Escrito de parte' : 'Resolución',
      adjuntos: !!movArchivo,
    };
    addMovimiento(causaId, expediente.nroExpediente, mov);
    setMovTipo('ACT');
    setMovTitulo('');
    setMovArchivo(null);
  };

  const handleAgregarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim() || !user || !expediente) return;
    const nuevo: Comentario = {
      id: `c-${Date.now()}`,
      autor: user.name,
      rol: ROLE_LABELS[user.role],
      fecha: new Date().toLocaleString('es-AR'),
      texto: comentario.trim(),
    };
    addComentario(causaId, expediente.nroExpediente, nuevo);
    setComentario('');
  };

  return (
    <div className="space-y-6">
      {isSecretario && expediente && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <option value="ACT">Actuación</option>
                    <option value="ESC">Escrito</option>
                    <option value="CED">Cédula</option>
                    <option value="MOV">Movimiento</option>
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
              <label className="flex items-center gap-2 bg-white border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <Upload size={14} className="text-[#001f3f]" />
                <span className="text-xs text-slate-600 truncate">
                  {movArchivo ? movArchivo.name : 'Adjuntar PDF (opcional)'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setMovArchivo(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="submit"
                disabled={!movTitulo.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
              >
                <Send size={14} /> Registrar movimiento
              </button>
            </form>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-600" />
              Agregar Comentario
            </h3>
            <form onSubmit={handleAgregarComentario} className="space-y-3">
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder="Escribir un comentario interno..."
                className="form-input text-sm resize-none"
              />
              <p className="text-[11px] text-slate-400 italic">
                El comentario se registra como movimiento del expediente.
              </p>
              <button
                type="submit"
                disabled={!comentario.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
              >
                <Send size={14} /> Agregar comentario
              </button>
            </form>
          </div>
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
                <td className="px-4 py-3 text-slate-800">{m.titulo}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  Origen: TRIBUNAL ARBITRAL BCM - Destino: {m.tribunal ?? 'TRIBUNAL ARBITRAL BCM'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{m.tipo}</td>
                <td className="px-4 py-3">{m.adjuntos ? <Paperclip size={14} className="text-slate-500" /> : null}</td>
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
