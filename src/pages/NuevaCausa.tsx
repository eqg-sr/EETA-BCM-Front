import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Users, Plus, Trash2, Send, Gavel, FileText, Upload } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas, type Sujeto } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';
import api from '../services/api';

const ARBITROS_TITULARES = [
  { nombre: 'Pedro Alvaro Pérez Catón',  matricula: '(pendiente)' }, // TODO: completar matrícula
  { nombre: 'Pablo Javier Olaiz',        matricula: '(pendiente)' }, // TODO: completar matrícula
  { nombre: 'Federico Pithod',           matricula: '(pendiente)' }, // TODO: completar matrícula
];
const SECRETARIO_TRIBUNAL = { nombre: 'Santiago María Cardozo', matricula: '(pendiente)' }; // TODO: completar matrícula

export default function NuevaCausa() {
  const navigate = useNavigate();
  const { crearCausa, subirCaratulaArchivo } = useCausas();
  const { canCreateCausa } = usePermissions();

  const [caratula, setCaratula]               = useState('');
  const [nroExpedienteElectronico, setNroExpedienteElectronico] = useState('');
  const [suplente1, setSuplente1]             = useState('');
  const [suplente2, setSuplente2]             = useState('');
  const [suplente3, setSuplente3]             = useState('');
  const [fechaPresentacion, setFechaPresentacion] = useState('');
  const [fechaInicio, setFechaInicio]         = useState('');
  const [objetoJuicio, setObjetoJuicio]       = useState('');
  const [sujetos, setSujetos]                 = useState<Sujeto[]>([
    { vinculo: 'ACTOR',    nombre: '', representante: '', domicilio: '', domicilioElectronico: '' },
    { vinculo: 'DEMANDADO',nombre: '', representante: '', domicilio: '', domicilioElectronico: '' },
  ]);
  const [caratulaArchivo, setCaratulaArchivo] = useState<File | null>(null);
  const [dragActive, setDragActive]           = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitError, setSubmitError]         = useState<string | null>(null);
  const [parseando, setParseando]             = useState(false);
  const [_parsedData, setParsedData]          = useState<Record<string, string>>({});

  if (!canCreateCausa) {
    return (
      <Layout>
        <p className="text-slate-500">No tiene permisos para crear expedientes.</p>
      </Layout>
    );
  }

  const updateSujeto = (i: number, field: keyof Sujeto, value: string) => {
    setSujetos((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addSujeto = () =>
    setSujetos((prev) => [...prev, { vinculo: 'TERCERO', nombre: '', representante: '', domicilio: '', domicilioElectronico: '' }]);

  const removeSujeto = (i: number) => setSujetos((prev) => prev.filter((_, idx) => idx !== i));

  const handleArchivoSeleccionado = async (file: File | null) => {
    setCaratulaArchivo(file);
    if (!file || file.type !== 'application/pdf') return;

    setParseando(true);
    try {
      const form = new FormData();
      form.append('archivo', file);
      const { data } = await api.post<Record<string, string>>('/causas/parse-demanda', form);
      setParsedData(data);

      if (data.caratula && !caratula) setCaratula(data.caratula);

      if (data.fecha) {
        // convert DD/MM/YYYY or DD-MM-YYYY → YYYY-MM-DD for <input type="date">
        const parts = data.fecha.split(/[\/\-]/);
        if (parts.length === 3) {
          const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if (!fechaInicio) setFechaInicio(iso);
          if (!fechaPresentacion) setFechaPresentacion(iso);
        }
      }
    } catch {
      // silently ignore — form stays as-is
    } finally {
      setParseando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const causa = await crearCausa({
        id:                `CAU-${Date.now()}`,
        caratula,
        nroExpedienteElectronico: nroExpedienteElectronico || undefined,
        arbitros:          [],
        arbitrosSuplentes: [suplente1, suplente2, suplente3].filter(Boolean),
        fechaPresentacion,
        fechaInicio,
        ultimoMovimiento:  fechaInicio || fechaPresentacion,
        objetoJuicio,
        sujetos:           sujetos.filter((s) => s.nombre.trim().length > 0),
        causasRelacionadas:[],
        status:            'pendiente',
      });
      if (caratulaArchivo) {
        await subirCaratulaArchivo(causa.id, caratulaArchivo);
      }
      navigate(`/causas/${causa.id}`);
    } catch {
      setSubmitError('Error al crear el expediente. Verificá los datos e intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <Link
          to="/causas"
          className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] transition-colors text-sm mb-4 w-fit"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Alta de Nuevo Expediente
        </h1>
        <p className="text-slate-500 mt-1">
          Registrá un nuevo expediente en el Tribunal Arbitral BCM.
        </p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#001f3f] mb-2">
              <Info size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Datos del Expediente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Fecha de Inicio" required>
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
              <Field label="Nro. Expediente Electrónico">
                <input
                  value={nroExpedienteElectronico}
                  onChange={(e) => setNroExpedienteElectronico(e.target.value)}
                  placeholder="Ej: EE-2026-12345678-BCM"
                  className="form-input"
                />
              </Field>
            </div>

            <Field label="Demanda" required>
              <textarea
                rows={3}
                value={caratula}
                onChange={(e) => setCaratula(e.target.value)}
                placeholder="Ej: VIÑEDOS DEL VALLE S.A. C/ AGROEXPORT CUYO S.R.L. P/ INCUMPLIMIENTO"
                className="form-input resize-none"
                required
              />
            </Field>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#001f3f] mb-2">
              <Gavel size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Composición del Tribunal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titulares — estático */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Árbitros Titulares</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  {ARBITROS_TITULARES.map((a, i) => (
                    <div key={i} className="text-sm text-slate-700">
                      <span className="font-semibold">{a.nombre}</span>
                      <span className="text-slate-400 ml-2 text-xs">Matr.: {a.matricula}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suplentes — editable */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Árbitros Suplentes</p>
                <div className="space-y-2">
                  <input value={suplente1} onChange={(e) => setSuplente1(e.target.value)} placeholder="Suplente 1 (opcional)" className="form-input" />
                  <input value={suplente2} onChange={(e) => setSuplente2(e.target.value)} placeholder="Suplente 2 (opcional)" className="form-input" />
                  <input value={suplente3} onChange={(e) => setSuplente3(e.target.value)} placeholder="Suplente 3 (opcional)" className="form-input" />
                </div>
              </div>
            </div>

            {/* Secretario — estático */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Secretario</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-sm font-semibold text-slate-700">{SECRETARIO_TRIBUNAL.nombre}</span>
                <span className="text-slate-400 ml-2 text-xs">Matr.: {SECRETARIO_TRIBUNAL.matricula}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[#001f3f] mb-4">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Demanda</h2>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files[0]) handleArchivoSeleccionado(e.dataTransfer.files[0]);
              }}
              className={`block border-2 border-dashed rounded-2xl p-10 transition-all text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="p-4 bg-white rounded-full shadow-sm mb-4 inline-flex">
                <Upload className="text-[#001f3f]" size={28} />
              </div>
              <p className="text-slate-700 font-semibold">
                {caratulaArchivo ? caratulaArchivo.name : 'Subí el documento de la demanda'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Solo se permiten archivos PDF (Máx. 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleArchivoSeleccionado(e.target.files?.[0] ?? null)}
              />
            </label>
            {parseando && (
              <p className="text-sm text-slate-500 mt-2">Analizando documento...</p>
            )}
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

            <div className="space-y-6">
              {sujetos.map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
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
                      <label className="text-xs font-semibold text-slate-700 ml-1">Patrocinante</label>
                      <input
                        value={s.representante ?? ''}
                        onChange={(e) => updateSujeto(i, 'representante', e.target.value)}
                        placeholder="Nombre del patrocinante"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 ml-1">Domicilio</label>
                      <input
                        value={s.domicilio ?? ''}
                        onChange={(e) => updateSujeto(i, 'domicilio', e.target.value)}
                        placeholder="Calle, número, localidad"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 ml-1">Domicilio Electrónico</label>
                      <input
                        type="email"
                        value={s.domicilioElectronico ?? ''}
                        onChange={(e) => updateSujeto(i, 'domicilioElectronico', e.target.value)}
                        placeholder="correo@dominio.com"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/causas')}
              className="px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3 bg-[#001f3f] text-white rounded-xl hover:bg-[#002d5a] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold active:scale-95 disabled:opacity-70"
            >
              <Send size={18} />
              {isSubmitting ? 'Creando...' : 'Crear Expediente'}
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
