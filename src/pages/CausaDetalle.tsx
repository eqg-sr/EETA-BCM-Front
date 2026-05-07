import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Paperclip, Link2, FilePlus, Send, Upload, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas, type Movimiento, type MovimientoTipo, type Comentario } from '../context/CausasContext';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

type TabKey = 'info' | 'sujetos' | 'movimientos' | 'expediente' | 'relacionadas';

export default function CausaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { getCausa } = useCausas();
  const causa = id ? getCausa(id) : undefined;

  const [tab, setTab] = useState<TabKey>('info');
  const [filters, setFilters] = useState({ act: true, esc: true, ced: true, mov: false });
  const [search, setSearch] = useState('');

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
  const filteredMov = allMovimientos.filter((m) => {
    if (m.tipo === 'ACT' && !filters.act) return false;
    if (m.tipo === 'ESC' && !filters.esc) return false;
    if (m.tipo === 'CED' && !filters.ced) return false;
    if (m.tipo === 'MOV' && !filters.mov) return false;
    if (search && !`${m.titulo} ${m.numero}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
        <ArrowLeft size={16} /> Volver al listado
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <div className="text-sm font-mono text-[#001f3f] font-semibold">
            {causa.identificador} <span className="text-slate-400">({causa.numeroInterno})</span> {causa.tribunal}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">{causa.caratula}</h1>
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-400 uppercase font-semibold">Árbitro/a</div>
          <div className="text-slate-700 font-semibold">{causa.juez}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 mb-6">
        {([
          ['info', 'Información General'],
          ['sujetos', 'Sujetos'],
          ['movimientos', 'Movimientos'],
          ['expediente', 'Expediente Electrónico'],
          ['relacionadas', 'Causas Relacionadas'],
        ] as [TabKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === key ? 'border-[#001f3f] text-[#001f3f]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && <FichaTab causa={causa} />}

      {tab === 'sujetos' && <SujetosTab sujetos={causa.sujetos} />}

      {tab === 'movimientos' && <MovimientosTab causaId={causa.id} movimientos={allMovimientos} />}

      {tab === 'expediente' && (
        <ExpedienteTab
          movimientos={filteredMov}
          filters={filters}
          setFilters={setFilters}
          search={search}
          setSearch={setSearch}
        />
      )}

      {tab === 'relacionadas' && <CausasRelacionadasTab relacionadas={causa.causasRelacionadas} />}
    </Layout>
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

function FichaTab({ causa }: { causa: ReturnType<typeof useCausas>['causas'][number] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Identificador" value={`${causa.identificador} (${causa.numeroInterno})`} />
          <InfoRow label="Carátula" value={causa.caratula} />
          <InfoRow label="Tribunal" value={causa.tribunal} />
          <InfoRow label="Juez/a" value={causa.juez} />
          <InfoRow label="Fecha de Presentación" value={causa.fechaPresentacion} />
          <InfoRow label="Fecha de Inicio" value={causa.fechaInicio} />
          <InfoRow label="Último Movimiento" value={causa.ultimoMovimiento} />
          <InfoRow label="Objeto del Juicio" value={causa.objetoJuicio} />
        </div>
      </div>
    </div>
  );
}

type ExpedienteTabProps = {
  movimientos: ReturnType<typeof useCausas>['causas'][number]['expedientes'][number]['movimientos'];
  filters: { act: boolean; esc: boolean; ced: boolean; mov: boolean };
  setFilters: (f: ExpedienteTabProps['filters']) => void;
  search: string;
  setSearch: (s: string) => void;
};

function ExpedienteTab({ movimientos, filters, setFilters, search, setSearch }: ExpedienteTabProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const total = movimientos.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const slice = movimientos.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {([
          ['act', 'Actuaciones'],
          ['esc', 'Escritos'],
          ['ced', 'Cédulas'],
          ['mov', 'Movimientos'],
        ] as [keyof typeof filters, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
              className="w-4 h-4 accent-[#001f3f]"
            />
            {label}
          </label>
        ))}

        <div className="flex items-center gap-2 ml-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Número"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] outline-none"
          />
          <button
            type="button"
            onClick={() => setSearch('')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Número</th>
              <th className="px-4 py-3 font-semibold">Adjuntos</th>
              <th className="px-4 py-3 font-semibold">Relaciones</th>
              <th className="px-4 py-3 font-semibold">Tribunal / Presentante</th>
              <th className="px-4 py-3 font-semibold">Acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{m.fecha}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{m.tipo}</td>
                <td className="px-4 py-3 text-blue-700 font-medium">{m.titulo}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{m.numero ?? '-'}</td>
                <td className="px-4 py-3">{m.adjuntos ? <Paperclip size={16} className="text-slate-500" /> : null}</td>
                <td className="px-4 py-3">{m.relaciones ? <Link2 size={16} className="text-slate-500" /> : null}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{m.tribunal ?? m.presentante ?? '-'}</td>
                <td className="px-4 py-3 text-blue-700 text-xs">{m.acceso ?? '-'}</td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Sin resultados con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-4 mt-4 text-xs text-slate-500">
        <span>Elementos por página: {pageSize}</span>
        <span>{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 disabled:opacity-30">|&lt;</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 disabled:opacity-30">&lt;</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 disabled:opacity-30">&gt;</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 disabled:opacity-30">&gt;|</button>
        </div>
      </div>
    </div>
  );
}

function SujetosTab({ sujetos }: { sujetos: ReturnType<typeof useCausas>['causas'][number]['sujetos'] }) {
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

function CausasRelacionadasTab({ relacionadas }: { relacionadas: ReturnType<typeof useCausas>['causas'][number]['causasRelacionadas'] }) {
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

function MovimientosTab({ causaId, movimientos }: {
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
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
              <label className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
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

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
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
