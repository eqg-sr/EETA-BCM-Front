import { FileText, Download, MessageSquare, ShieldCheck } from 'lucide-react';

type Props = {
  title: string; // Este sería el ID del expediente
  description: string;
  canComment: boolean;
};

export default function ExpedientCard({ title, description, canComment }: Props) {
  
  const handleDownload = () => {
    console.log(`Descargando PDF: ${title}`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-5">
        {/* Encabezado: ID, Descarga y Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 text-[#001f3f] rounded-lg group-hover:bg-[#001f3f] group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Expediente</span>
              <h2 className="font-bold text-slate-900 leading-tight">{title}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botón de Icono para Descarga */}
            <button 
              onClick={handleDownload}
              title="Descargar PDF"
              className="p-2.5 bg-slate-50 text-[#001f3f] border border-slate-200 rounded-xl hover:bg-[#001f3f] hover:text-white hover:border-[#001f3f] transition-all shadow-sm active:scale-90"
            >
              <Download size={18} />
            </button>

            {canComment && (
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1.5 rounded-lg border border-amber-100">
                <ShieldCheck size={12} />
                ADMIN
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          {description || "Sin descripción adicional disponible."}
        </p>

        {/* Acciones Secundarias */}
        {canComment && (
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors uppercase tracking-wide">
            <MessageSquare size={14} className="text-blue-600" />
            Añadir Comentario
          </button>
        )}
      </div>

      {/* Footer de estado */}
      <div className="bg-slate-50/50 px-5 py-2 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Verificado</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">PDF • 2.4 MB</span>
      </div>
    </div>
  );
}