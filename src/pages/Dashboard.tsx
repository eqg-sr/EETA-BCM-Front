import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Clock, UserCheck, ExternalLink, LayoutDashboard } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CausaStatus } from '../context/CausasContext';

type CausaResumen = {
  id: string;
  identificador: string;
  numeroInterno: string;
  caratula: string;
  status: CausaStatus;
  ultimoMovimiento: string;
};

const STATUS_OPTIONS: { value: CausaStatus; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'iniciado',   label: 'Iniciado' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'cerrado',    label: 'Cerrado' },
];

const STATUS_CARD_CLASSES: Record<CausaStatus, string> = {
  pendiente:  'bg-slate-50 text-slate-700 border-slate-200',
  iniciado:   'bg-blue-50 text-blue-700 border-blue-100',
  en_proceso: 'bg-amber-50 text-amber-700 border-amber-100',
  cerrado:    'bg-green-50 text-green-700 border-green-100',
};

const TOTAL_LABELS: Record<string, string> = {
  secretario: 'Total de expedientes en el sistema',
  arbitro:    'Total de expedientes',
  perito:     'Total de expedientes visibles',
  actor:      'Total de expedientes asignados',
  demandado:  'Total de expedientes asignados',
};

const EMPTY_COUNTS: Record<CausaStatus, number> = {
  pendiente: 0, iniciado: 0, en_proceso: 0, cerrado: 0,
};

function formatFecha(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const isSecretario = user?.role === 'secretario';

  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [total, setTotal]             = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<CausaStatus, number>>(EMPTY_COUNTS);
  const [recientes, setRecientes]     = useState<CausaResumen[]>([]);
  const [pendientesUsuarios, setPendientesUsuarios] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const requests: Promise<any>[] = [
      api.get('/causas', { params: { page: 1, limit: 5 } }),
      api.get('/causas', { params: { page: 1, limit: 1000 } }),
    ];
    if (isSecretario) {
      requests.push(api.get('/admin/usuarios', { params: { pendientes: true } }));
    }

    Promise.all(requests)
      .then(([recentRes, allRes, pendientesRes]) => {
        if (cancelled) return;

        setTotal(recentRes.data.total ?? 0);
        setRecientes(recentRes.data.data ?? []);

        const counts: Record<CausaStatus, number> = { ...EMPTY_COUNTS };
        for (const c of allRes.data.data ?? []) {
          if (c.status in counts) counts[c.status as CausaStatus]++;
        }
        setStatusCounts(counts);

        if (pendientesRes) setPendientesUsuarios((pendientesRes.data ?? []).length);
      })
      .catch(() => { if (!cancelled) setError('Error al cargar el dashboard.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [isSecretario]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#001f3f] rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#001f3f] mb-1">
          <LayoutDashboard size={24} strokeWidth={2.5} />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Inicio</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Bienvenido/a, {user?.name}.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <FolderOpen size={16} />
            <span className="text-[11px] uppercase font-bold tracking-widest">
              {TOTAL_LABELS[user?.role ?? ''] ?? 'Total de expedientes'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
        </div>

        {STATUS_OPTIONS.map((s) => (
          <div key={s.value} className={`border rounded-2xl p-5 shadow-sm ${STATUS_CARD_CLASSES[s.value]}`}>
            <div className="text-[11px] uppercase font-bold tracking-widest mb-2 opacity-70">{s.label}</div>
            <div className="text-3xl font-extrabold">{statusCounts[s.value]}</div>
          </div>
        ))}

        {isSecretario && (
          <Link
            to="/admin"
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#001f3f]/30 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <UserCheck size={16} />
              <span className="text-[11px] uppercase font-bold tracking-widest">Usuarios pendientes</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-extrabold text-slate-900">{pendientesUsuarios}</div>
              <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                Ver panel <ExternalLink size={12} />
              </span>
            </div>
          </Link>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 text-[#001f3f] mb-4">
          <Clock size={18} className="text-blue-600" />
          <h2 className="font-bold uppercase tracking-wider text-xs">Expedientes recientes</h2>
        </div>

        {recientes.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr className="text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Identificador</th>
                  <th className="px-4 py-3 font-semibold">Carátula</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Últ. movimiento</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[#001f3f] font-semibold">
                      {c.identificador} <span className="text-slate-400">({c.numeroInterno})</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-md truncate" title={c.caratula}>
                      {c.caratula}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatFecha(c.ultimoMovimiento)}</td>
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
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FolderOpen size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">No hay expedientes recientes.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
