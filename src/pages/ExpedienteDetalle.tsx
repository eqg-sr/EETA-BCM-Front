import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Paperclip, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { useCausas, type Comentario } from '../context/CausasContext';
import { useAuth, usePermissions, ROLE_LABELS } from '../context/AuthContext';

export default function ExpedienteDetalle() {
  const { id, nro } = useParams<{ id: string; nro: string }>();
  const { getCausa, addComentario } = useCausas();
  const { user } = useAuth();
  const { canAddComment, isReadOnly } = usePermissions();

  const causa = id ? getCausa(id) : undefined;
  const expediente = causa?.expedientes.find((e) => e.nroExpediente === nro);

  const [texto, setTexto] = useState('');

  if (!causa || !expediente) {
    return (
      <Layout>
        <Link to="/causas" className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
          <ArrowLeft size={16} /> Volver a causas
        </Link>
        <p className="text-slate-500">Expediente no encontrado.</p>
      </Layout>
    );
  }

  const handleAgregarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !user) return;
    const nuevo: Comentario = {
      id: `c-${Date.now()}`,
      autor: user.name,
      rol: ROLE_LABELS[user.role],
      fecha: new Date().toLocaleString('es-AR'),
      texto: texto.trim(),
    };
    addComentario(causa.id, expediente.nroExpediente, nuevo);
    setTexto('');
  };

  return (
    <Layout>
      <Link to={`/causas/${causa.id}`} className="flex items-center gap-2 text-slate-500 hover:text-[#001f3f] text-sm mb-4 w-fit">
        <ArrowLeft size={16} /> Volver a la causa
      </Link>

      <div className="mb-6 pb-5 border-b border-slate-200">
        <div className="text-sm font-mono text-[#001f3f] font-semibold">
          {expediente.nroExpediente} · {causa.tribunal}
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">{expediente.caratula}</h1>
        {isReadOnly && (
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
            Modo lectura
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Nro de Expediente" value={expediente.nroExpediente} />
              <Info label="Fecha de Presentación" value={expediente.fechaPresentacion} />
              <Info label="Fecha de Inicio" value={expediente.fechaInicio} />
              <Info label="Último Movimiento" value={expediente.ultimoMovimiento} />
              <Info label="Objeto del Juicio" value={expediente.objetoJuicio} />
              {expediente.montoDisputa && <Info label="Monto en Disputa" value={expediente.montoDisputa} />}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4">Sujetos</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr className="text-blue-700 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2 font-semibold">Vínculo</th>
                    <th className="px-4 py-2 font-semibold">Nombre/Denominación</th>
                    <th className="px-4 py-2 font-semibold">Representante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expediente.sujetos.map((s, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 font-semibold text-slate-700">{s.vinculo}</td>
                      <td className="px-4 py-2">{s.nombre}</td>
                      <td className="px-4 py-2 text-blue-700">{s.representante ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {expediente.adjuntoNombre && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4">Documento Adjunto</h3>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Paperclip size={18} className="text-[#001f3f]" />
                  <span className="text-sm font-semibold text-slate-700">{expediente.adjuntoNombre}</span>
                </div>
                <button className="p-2 text-[#001f3f] hover:bg-white rounded-lg" title="Descargar">
                  <Download size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4">Movimientos</h3>
            {expediente.movimientos.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin movimientos registrados aún.</p>
            ) : (
              <div className="space-y-2">
                {expediente.movimientos.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      m.tipo === 'COMENTARIO' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.tipo}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{m.titulo}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.fecha} · {m.tribunal ?? ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001f3f] mb-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-600" />
              Comentarios
            </h3>

            {canAddComment ? (
              <form onSubmit={handleAgregarComentario} className="space-y-2 mb-4">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  placeholder="Escribir un comentario..."
                  className="form-input resize-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!texto.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#001f3f] text-white rounded-lg text-xs font-bold hover:bg-[#002d5a] disabled:opacity-50"
                >
                  <Send size={14} /> Agregar comentario
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400 italic mb-4">
                Solo el secretario del tribunal puede agregar comentarios.
              </p>
            )}

            <div className="space-y-3">
              {expediente.comentarios.length === 0 && (
                <p className="text-xs text-slate-400">Sin comentarios.</p>
              )}
              {expediente.comentarios.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{c.autor}</span>
                    <span className="text-[10px] text-slate-500">{c.fecha}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold mb-1.5">{c.rol}</div>
                  <p className="text-sm text-slate-700">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-sm text-slate-800 font-medium mt-0.5">{value}</div>
    </div>
  );
}
