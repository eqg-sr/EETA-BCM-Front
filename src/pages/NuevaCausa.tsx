import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Users, Plus, Trash2, Send, Gavel, FileText, Upload } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas, type Causa, type Sujeto } from '../context/CausasContext';
import { usePermissions } from '../context/AuthContext';

const SALAS = [
  'TRIBUNAL ARBITRAL BCM – SALA COMERCIAL',
  'TRIBUNAL ARBITRAL BCM – SALA SOCIETARIA',
  'TRIBUNAL ARBITRAL BCM – SALA DE COMERCIO EXTERIOR',
  'TRIBUNAL ARBITRAL BCM – SALA DE CONCURSOS Y QUIEBRAS',
];

export default function NuevaCausa() {
  const navigate = useNavigate();
  const { addCausa } = useCausas();
  const { canCreateCausa } = usePermissions();

  const [identificador, setIdentificador] = useState('');
  const [numeroInterno, setNumeroInterno] = useState('');
  const [caratula, setCaratula] = useState('');
  const [tribunal, setTribunal] = useState(SALAS[0]);
  const [arbitro, setArbitro] = useState('');
  const [fechaPresentacion, setFechaPresentacion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [objetoJuicio, setObjetoJuicio] = useState('');
  const [sujetos, setSujetos] = useState<Sujeto[]>([
    { vinculo: 'ACTOR', nombre: '', representante: '', domicilio: '', domicilioElectronico: '' },
    { vinculo: 'DEMANDADO', nombre: '', representante: '', domicilio: '', domicilioElectronico: '' },
  ]);
  const [caratulaArchivo, setCaratulaArchivo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!canCreateCausa) {
    return (
      <Layout>
        <p className="text-slate-500">No tiene permisos para crear causas.</p>
      </Layout>
    );
  }

  const updateSujeto = (i: number, field: keyof Sujeto, value: string) => {
    setSujetos((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addSujeto = () =>
    setSujetos((prev) => [...prev, { vinculo: 'TERCERO', nombre: '', representante: '', domicilio: '', domicilioElectronico: '' }]);

  const removeSujeto = (i: number) => setSujetos((prev) => prev.filter((_, idx) => idx !== i));

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `CAU-${Date.now()}`;
    const causa: Causa = {
      id,
      identificador,
      numeroInterno,
      caratula,
      tribunal,
      arbitro,
      fechaPresentacion: formatDate(fechaPresentacion),
      fechaInicio: formatDate(fechaInicio),
      ultimoMovimiento: formatDate(fechaInicio || fechaPresentacion),
      objetoJuicio,
      sujetos: sujetos.filter((s) => s.nombre.trim().length > 0),
      expedientes: [],
      causasRelacionadas: [],
    };
    addCausa(causa);
    navigate(`/causas/${id}`);
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
              <h2 className="font-bold uppercase tracking-wider text-xs">Datos de la Causa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Identificador" required>
                <input
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="Ej: BCM-2026-00045"
                  className="form-input"
                  required
                />
              </Field>
              <Field label="Número Interno" required>
                <input
                  value={numeroInterno}
                  onChange={(e) => setNumeroInterno(e.target.value)}
                  placeholder="Ej: 00245"
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
            </div>

            <Field label="Carátula" required>
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
              <h2 className="font-bold uppercase tracking-wider text-xs">Tribunal y Árbitro/a</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Sala / Tribunal" required>
                <select
                  value={tribunal}
                  onChange={(e) => setTribunal(e.target.value)}
                  className="form-input"
                >
                  {SALAS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Árbitro/a designado/a">
                <input
                  value={arbitro}
                  onChange={(e) => setArbitro(e.target.value)}
                  placeholder="Ej: DRA. ANALÍA PÉREZ DE OLIVERA (a designar si vacío)"
                  className="form-input"
                />
              </Field>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-[#001f3f] mb-4">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Carátula del Expediente</h2>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files[0]) setCaratulaArchivo(e.dataTransfer.files[0]);
              }}
              className={`block border-2 border-dashed rounded-2xl p-10 transition-all text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="p-4 bg-white rounded-full shadow-sm mb-4 inline-flex">
                <Upload className="text-[#001f3f]" size={28} />
              </div>
              <p className="text-slate-700 font-semibold">
                {caratulaArchivo ? caratulaArchivo.name : 'Subí el documento de la carátula'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Solo se permiten archivos PDF (Máx. 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setCaratulaArchivo(e.target.files?.[0] ?? null)}
              />
            </label>
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
              className="flex items-center gap-2 px-10 py-3 bg-[#001f3f] text-white rounded-xl hover:bg-[#002d5a] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold active:scale-95"
            >
              <Send size={18} />
              Crear Expediente
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
