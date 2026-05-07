import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search, ExternalLink, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';

export default function Causas() {
  const { causas } = useCausas();
  const { canCreateCausa } = usePermissions();
  const [query, setQuery] = useState('');

  const filtered = causas.filter((c) =>
    `${c.identificador} ${c.caratula} ${c.tribunal}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#001f3f] mb-1">
            <FolderOpen size={24} strokeWidth={2.5} />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Expedientes
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Visualizá y administrá los expedientes del Tribunal Arbitral.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm">
            <Filter size={18} />
            Filtrar
          </button>

          {canCreateCausa && (
            <Link
              to="/causas/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#001f3f] text-white rounded-xl hover:bg-[#002d5a] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Nuevo Expediente
            </Link>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por identificador, carátula o tribunal..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none text-sm"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Identificador</th>
                <th className="px-4 py-3 font-semibold">Carátula</th>
                <th className="px-4 py-3 font-semibold">Tribunal</th>
                <th className="px-4 py-3 font-semibold">Árbitro/a</th>
                <th className="px-4 py-3 font-semibold">Últ. movimiento</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[#001f3f] font-semibold">
                    {c.identificador} <span className="text-slate-400">({c.numeroInterno})</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 max-w-md truncate" title={c.caratula}>
                    {c.caratula}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.tribunal}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.juez}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.ultimoMovimiento}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/causas/${c.id}`}
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold text-xs"
                    >
                      Abrir <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <FolderOpen size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron expedientes.</p>
        </div>
      )}
    </Layout>
  );
}
