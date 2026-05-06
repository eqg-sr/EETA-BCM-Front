import Layout from '../components/Layout';
import ExpedientCard from '../components/ExpedientCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Filter } from 'lucide-react';

export default function ViewExpedients() {
  const { user } = useAuth();

  // Datos de ejemplo con IDs más realistas
  const expedients = [
    { title: 'EXP-2026-001', description: 'Documentación técnica para el proyecto de infraestructura vial.' },
    { title: 'EXP-2026-002', description: 'Registro de auditoría interna correspondiente al primer trimestre.' },
    { title: 'EXP-2026-003', description: 'Expediente de validación de proveedores estratégicos.' }
  ];

  return (
    <Layout>
      {/* Encabezado de la Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#001f3f] mb-1">
            <FolderOpen size={24} strokeWidth={2.5} />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Gestión de Expedientes
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Visualiza y administra los documentos oficiales del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de Filtro (Estético) */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm">
            <Filter size={18} />
            Filtrar
          </button>

          {/* Botón Principal de Acción */}
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#001f3f] text-white rounded-xl hover:bg-[#002d5a] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Subir Nuevo Expediente
          </Link>
        </div>
      </div>

      {/* Grid de Expedientes */}
      {expedients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {expedients.map((exp, i) => (
            <ExpedientCard
              key={i}
              title={exp.title}
              description={exp.description}
              canComment={user?.role === 'admin'}
            />
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <FolderOpen size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No hay expedientes registrados actualmente.</p>
        </div>
      )}
    </Layout>
  );
}