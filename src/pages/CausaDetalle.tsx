import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Paperclip, Link2, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';

type TabKey = 'ficha' | 'expediente' | 'sujetos' | 'relacionadas' | 'movimientos';

export default function CausaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { getCausa } = useCausas();
  const { canCreateExpediente } = usePermissions();
  const causa = id ? getCausa(id) : undefined;

  const [tab, setTab] = useState<TabKey>('expediente');
  const [filters, setFilters] = useState({ act: true, esc: true, ced: true, mov: false });
  const [search, setSearch] = useState('');

  if (!causa) {
    return (
      <Layout>
        <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
          <ArrowLeft size={16} /> Volver a causas
        </Link>
        <p className="text-slate-500">Causa no encontrada.</p>
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
        <ArrowLeft size={16} /> Volver a causas
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <div className="text-sm font-mono text-[#001f3f] font-semibold">
            {causa.identificador} <span className="text-slate-400">({causa.numeroInterno})</span> {causa.tribunal}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">{causa.caratula}</h1>
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-400 uppercase font-semibold">Juez/a</div>
          <div className="text-slate-700 font-semibold">{causa.juez}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 mb-6">
        {([
          ['ficha', 'Ficha'],
          ['expediente', 'Expediente electrónico'],
          ['sujetos', 'Sujetos'],
          ['relacionadas', 'Causas Relacionadas'],
          ['movimientos', 'Movimientos'],
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

      {tab === 'ficha' && <FichaTab causa={causa} />}

      {tab === 'expediente' && (
        <ExpedienteTab
          causaId={causa.id}
          movimientos={filteredMov}
          filters={filters}
          setFilters={setFilters}
          search={search}
          setSearch={setSearch}
          canCreate={canCreateExpediente}
        />
      )}

      {tab === 'sujetos' && <SujetosTab sujetos={causa.sujetos} />}

      {tab === 'relacionadas' && <CausasRelacionadasTab relacionadas={causa.causasRelacionadas} />}

      {tab === 'movimientos' && <MovimientosTab movimientos={allMovimientos} />}
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
  causaId: string;
  movimientos: ReturnType<typeof useCausas>['causas'][number]['expedientes'][number]['movimientos'];
  filters: { act: boolean; esc: boolean; ced: boolean; mov: boolean };
  setFilters: (f: ExpedienteTabProps['filters']) => void;
  search: string;
  setSearch: (s: string) => void;
  canCreate: boolean;
};

function ExpedienteTab({ causaId, movimientos, filters, setFilters, search, setSearch, canCreate }: ExpedienteTabProps) {
  const { getCausa } = useCausas();
  const expedientes = getCausa(causaId)?.expedientes ?? [];
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const total = movimientos.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const slice = movimientos.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
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

        {canCreate && (
          <Link
            to={`/causas/${causaId}/expedientes/new`}
            className="flex items-center gap-2 px-4 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a]"
          >
            <Plus size={14} /> Nuevo Expediente
          </Link>
        )}
      </div>

      {expedientes.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {expedientes.map((e) => (
            <Link
              key={e.nroExpediente}
              to={`/causas/${causaId}/expedientes/${e.nroExpediente}`}
              className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              {e.nroExpediente}
            </Link>
          ))}
        </div>
      )}

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
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sujetos.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-700">{s.vinculo}</td>
              <td className="px-4 py-3 text-slate-800">{s.nombre}</td>
              <td className="px-4 py-3 text-blue-700">{s.representante ?? '-'}</td>
              <td className="px-4 py-3 text-blue-700">{s.domicilio ?? '-'}</td>
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

function MovimientosTab({ movimientos }: { movimientos: ReturnType<typeof useCausas>['causas'][number]['expedientes'][number]['movimientos'] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr className="text-blue-700 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Descripción</th>
            <th className="px-4 py-3 font-semibold">Origen - Destino</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
