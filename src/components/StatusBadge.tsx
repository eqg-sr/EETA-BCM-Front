import type { CausaStatus } from '../context/CausasContext';

const STATUS_LABELS: Record<CausaStatus, string> = {
  pendiente:  'Pendiente',
  iniciado:   'Iniciado',
  en_proceso: 'En proceso',
  cerrado:    'Cerrado',
};

const STATUS_CLASSES: Record<CausaStatus, string> = {
  pendiente:  'bg-slate-100 text-slate-600',
  iniciado:   'bg-blue-100 text-blue-700',
  en_proceso: 'bg-amber-100 text-amber-700',
  cerrado:    'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }: { status: CausaStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
