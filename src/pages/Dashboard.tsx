import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Clock, UserCheck, ExternalLink, LayoutDashboard, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import type { CausaStatus } from '../context/CausasContext';

type CausaResumen = {
  id: string;
  identificador: string;
  numeroInterno: string;
  nroExpedienteElectronico?: string;
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

const STATUS_CHART_COLORS: Record<CausaStatus, string> = {
  pendiente:  '#94a3b8',
  iniciado:   '#2563eb',
  en_proceso: '#d97706',
  cerrado:    '#16a34a',
};

const STATUS_LABELS: Record<CausaStatus, string> = {
  pendiente:  'Pendiente',
  iniciado:   'Iniciado',
  en_proceso: 'En proceso',
  cerrado:    'Cerrado',
};

const TOTAL_LABELS: Record<string, string> = {
  secretario: 'Total de expedientes en el sistema',
  arbitro:    'Total de expedientes asignados',
  perito:     'Total de expedientes asignados',
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

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function buildExpedientesPorMes(causas: { fechaInicio?: string }[], meses = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; cantidad: number }[] = [];

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`,
      cantidad: 0,
    });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const c of causas) {
    if (!c.fechaInicio) continue;
    const d = new Date(c.fechaInicio);
    if (isNaN(d.getTime())) continue;
    const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.cantidad++;
  }

  return buckets;
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
  const [porMes, setPorMes] = useState<{ key: string; label: string; cantidad: number }[]>([]);

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
        setPorMes(buildExpedientesPorMes(allRes.data.data ?? []));

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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Bienvenido/a, {user ? ROLE_LABELS[user.role] : ''}.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#001f3f] mb-4">
            <PieChartIcon size={18} className="text-blue-600" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Distribución por estado</h2>
          </div>
          {total > 0 ? (
            <DonutChart
              data={STATUS_OPTIONS.map((s) => ({
                label: STATUS_LABELS[s.value],
                value: statusCounts[s.value],
                color: STATUS_CHART_COLORS[s.value],
              }))}
            />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-slate-400">
              Sin datos para mostrar.
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#001f3f] mb-4">
            <BarChart3 size={18} className="text-blue-600" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Expedientes iniciados por mes</h2>
          </div>
          {porMes.some((m) => m.cantidad > 0) ? (
            <BarsChart data={porMes.map((m) => ({ label: m.label, value: m.cantidad }))} />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-slate-400">
              Sin datos para mostrar.
            </div>
          )}
        </div>
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
                  <th className="px-4 py-3 font-semibold">Nro. Expediente Electrónico</th>
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
                      {c.nroExpedienteElectronico || c.identificador} <span className="text-slate-400">({c.numeroInterno})</span>
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

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 h-[260px]">
      <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90 flex-shrink-0">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="20" />
        {total > 0 && data.filter((d) => d.value > 0).map((d) => {
          const dash = (d.value / total) * circumference;
          const dashOffset = -offsetAcc;
          offsetAcc += dash;
          return (
            <circle
              key={d.label}
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="space-y-2 w-full">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-semibold text-slate-900 ml-auto">{d.value}</span>
            <span className="text-slate-400 text-xs w-10 text-right">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end justify-between gap-2 h-[260px] px-1 pt-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1 h-full justify-end gap-2">
          <span className="text-xs font-semibold text-slate-700">{d.value}</span>
          <div
            className="w-full max-w-10 bg-[#001f3f] rounded-t-md transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
