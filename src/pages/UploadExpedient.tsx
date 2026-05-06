import Layout from '../components/Layout';
import { Upload, FileText, Info, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function UploadExpedient() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  // Simulación de envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando expediente...");
    // Redirigir después del éxito
    navigate('/expedients');
  };

  return (
    <Layout>
      {/* Navegación y Título */}
      <div className="mb-8">
        <Link 
          to="/expedients" 
          className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] transition-colors text-sm mb-4 w-fit"
        >
          <ArrowLeft size={16} />
          Volver a expedientes
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Subir Nuevo Expediente
        </h1>
        <p className="text-slate-500 mt-1">
          Complete los detalles y adjunte el archivo PDF correspondiente.
        </p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tarjeta de Información General */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#001f3f] mb-2">
              <Info size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Información General</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">ID del Expediente</label>
                <input 
                  placeholder="Ej: EXP-2026-001" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Descripción del Caso</label>
              <textarea 
                rows={4}
                placeholder="Describa brevemente el propósito de este documento..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all outline-none resize-none"
                required
              />
            </div>
          </div>

          {/* Zona de Carga de Archivo */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[#001f3f] mb-4">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Documento adjunto</h2>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Upload className="text-[#001f3f]" size={28} />
              </div>
              <p className="text-slate-700 font-semibold">Haga clic para subir o arrastre el archivo</p>
              <p className="text-slate-400 text-xs mt-1">Solo se permiten archivos PDF (Máx. 10MB)</p>
              <input type="file" className="hidden" accept=".pdf" />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate('/expedients')}
              className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-10 py-3 bg-[#001f3f] text-white rounded-xl hover:bg-[#002d5a] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold active:scale-95"
            >
              <Send size={18} />
              Guardar Expediente
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}