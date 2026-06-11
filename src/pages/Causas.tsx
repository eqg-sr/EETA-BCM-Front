import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useCausas, type Causa, type CausaStatus } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';
import api from '../services/api';

const STATUS_OPTIONS: { value: CausaStatus; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'iniciado',   label: 'Iniciado' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'cerrado',    label: 'Cerrado' },
];

export default function Causas() {
  const { causas, isLoading, error, fetchCausas } = useCausas();
  const { canCreateCausa } = usePermissions();
  const [query, setQuery]         = useState('');
  const [statusFilter, setStatusFilter] = useState<CausaStatus | ''>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    fetchCausas({ page: 1, limit: 20 });
  }, []);

  // Debounced search + status filter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCausas({
        page: 1,
        limit: 20,
        search: query || undefined,
        status: statusFilter || undefined,
      });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, statusFilter]);

  const goToPage = (page: number) => {
    fetchCausas({ page, limit: causas.limit, search: query || undefined, status: statusFilter || undefined });
  };

  const handleDescargarCaratula = async (causa: Causa) => {
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por identificador, carátula o tribunal..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CausaStatus | '')}
          className="sm:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none text-sm text-slate-700"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#001f3f] rounded-full animate-spin" />
        </div>
      ) : causas.data.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr className="text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Identificador</th>
                  <th className="px-4 py-3 font-semibold">Carátula</th>
                  <th className="px-4 py-3 font-semibold">Tribunal</th>
                  <th className="px-4 py-3 font-semibold">Árbitros</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Últ. movimiento</th>
                  <th className="px-4 py-3 font-semibold">Adjunto</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {causas.data.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[#001f3f] font-semibold">
                      {c.identificador} <span className="text-slate-400">({c.numeroInterno})</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-md truncate" title={c.caratula}>
                      {c.caratula}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{c.tribunal}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {c.arbitros && c.arbitros.length > 0 ? (
                        <>
                          {c.arbitros[0]}
                          {c.arbitros.length > 1 && (
                            <span className="text-slate-400"> +{c.arbitros.length - 1} más</span>
                          )}
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.ultimoMovimiento}</td>
                    <td className="px-4 py-3">
                      {c.nombreArchivo ? (
                        <button
                          onClick={() => handleDescargarCaratula(c)}
                          className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
                          title={c.nombreArchivo}
                        >
                          <Download size={13} />
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
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

          {causas.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-slate-500">
                {causas.total} expediente{causas.total !== 1 ? 's' : ''} · página {causas.page} de {causas.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(causas.page - 1)}
                  disabled={causas.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => goToPage(causas.page + 1)}
                  disabled={causas.page >= causas.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <FolderOpen size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron expedientes.</p>
        </div>
      )}
    </Layout>
  );
}
