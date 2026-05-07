import Layout from '../components/Layout';
import { Upload, FileText, Info, ArrowLeft, Send, Users, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCausas, type Sujeto, type Expediente } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';

export default function UploadExpedient() {
  const navigate = useNavigate();
  const { id: causaId } = useParams<{ id: string }>();
  const { getCausa, addExpediente } = useCausas();
  const { canCreateExpediente } = usePermissions();

  const causa = causaId ? getCausa(causaId) : undefined;

  const [dragActive, setDragActive] = useState(false);
  const [nroExpediente, setNroExpediente] = useState('');
  const [fechaPresentacion, setFechaPresentacion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [objetoJuicio, setObjetoJuicio] = useState(causa?.objetoJuicio ?? '');
  const [montoDisputa, setMontoDisputa] = useState('');
  const [caratula, setCaratula] = useState(causa?.caratula ?? '');
  const [adjunto, setAdjunto] = useState<File | null>(null);
  const [sujetos, setSujetos] = useState<Sujeto[]>([
    { vinculo: 'ACTOR', nombre: '', representante: '' },
    { vinculo: 'DEMANDADO', nombre: '', representante: '' },
  ]);

  if (!canCreateExpediente) {
    return (
      <Layout>
        <p className="text-slate-500">No tiene permisos para crear expedientes.</p>
      </Layout>
    );
  }

  const updateSujeto = (i: number, field: keyof Sujeto, value: string) => {
    setSujetos((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addSujeto = () => setSujetos((prev) => [...prev, { vinculo: 'TERCERO', nombre: '', representante: '' }]);
  const removeSujeto = (i: number) => setSujetos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('es-AR');

    const exp: Expediente = {
      nroExpediente,
      caratula,
      fechaPresentacion,
      fechaInicio,
      ultimoMovimiento: today,
      objetoJuicio,
      montoDisputa,
      sujetos: sujetos.filter((s) => s.nombre.trim().length > 0),
      movimientos: [],
      comentarios: [],
      adjuntoNombre: adjunto?.name,
    };

    if (causaId) {
      addExpediente(causaId, exp);
      navigate(`/causas/${causaId}`);
    } else {
      navigate('/causas');
    }
  };

  const backHref = causaId ? `/causas/${causaId}` : '/causas';

  return (
    <Layout>
      <div className="mb-8">
        <Link
          to={backHref}
          className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] transition-colors text-sm mb-4 w-fit"
        >
          <ArrowLeft size={16} />
          {causa ? 'Volver a la causa' : 'Volver a causas'}
        </Link>
        {causa && (
          <div className="text-sm font-mono text-[#001f3f] font-semibold">
            {causa.identificador} · {causa.tribunal}
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Nuevo Expediente Electrónico
        </h1>
        <p className="text-slate-500 mt-1">
          Complete los detalles, sujetos involucrados y adjunte el archivo PDF.
        </p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#001f3f] mb-2">
              <Info size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Información General</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nro de Expediente" required>
                <input
                  value={nroExpediente}
                  onChange={(e) => setNroExpediente(e.target.value)}
                  placeholder="Ej: EXP-2026-001"
                  className="form-input"
                  required
                />
              </Field>
              <Field label="Fecha de Presentación" required>
                <input
                  type="date"
                  value={fechaPresentacion}
                  onChange={(e) => setFechaPresentacion(e.target.value)}
                  className="form-input"
                  required
                />
              </Field>
              <Field label="Fecha de Inicio" required>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="form-input"
                  required
                />
              </Field>
              <Field label="Objeto del Juicio" required>
                <input
                  value={objetoJuicio}
                  onChange={(e) => setObjetoJuicio(e.target.value)}
                  placeholder="Ej: Incumplimiento contractual"
                  className="form-input"
                  required
                />
              </Field>
              <Field label="Monto en Disputa">
                <input
                  value={montoDisputa}
                  onChange={(e) => setMontoDisputa(e.target.value)}
                  placeholder="Ej: $1.500.000"
                  className="form-input"
                />
              </Field>
            </div>

            <Field label="Carátula" required>
              <textarea
                rows={3}
                value={caratula}
                onChange={(e) => setCaratula(e.target.value)}
                placeholder="Ej: GIMENEZ FERNANDO RUBEN C/ LOS GASCONES SA P/ DESPIDO"
                className="form-input resize-none"
                required
              />
            </Field>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#001f3f]">
                <Users size={18} className="text-blue-600" />
                <h2 className="font-bold uppercase tracking-wider text-xs">Sujetos Involucrados</h2>
              </div>
              <button
                type="button"
                onClick={addSujeto}
                className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <Plus size={14} /> Agregar sujeto
              </button>
            </div>

            <div className="space-y-4">
              {sujetos.map((s, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Vínculo</label>
                    <select
                      value={s.vinculo}
                      onChange={(e) => updateSujeto(i, 'vinculo', e.target.value)}
                      className="form-input"
                    >
                      <option value="ACTOR">ACTOR</option>
                      <option value="DEMANDADO">DEMANDADO</option>
                      <option value="TERCERO">TERCERO</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Nombre / Denominación</label>
                    <input
                      value={s.nombre}
                      onChange={(e) => updateSujeto(i, 'nombre', e.target.value)}
                      placeholder="Nombre o razón social"
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Representante</label>
                    <input
                      value={s.representante ?? ''}
                      onChange={(e) => updateSujeto(i, 'representante', e.target.value)}
                      placeholder="Nombre del representante"
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {sujetos.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSujeto(i)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Quitar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[#001f3f] mb-4">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Documento Adjunto</h2>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files[0]) setAdjunto(e.dataTransfer.files[0]);
              }}
              className={`block border-2 border-dashed rounded-2xl p-10 transition-all text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="p-4 bg-white rounded-full shadow-sm mb-4 inline-flex">
                <Upload className="text-[#001f3f]" size={28} />
              </div>
              <p className="text-slate-700 font-semibold">
                {adjunto ? adjunto.name : 'Haga clic para subir o arrastre el archivo'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Solo se permiten archivos PDF (Máx. 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setAdjunto(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(backHref)}
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
