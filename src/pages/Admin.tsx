import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { AlertCircle, Search, UserPlus, UserMinus, Users, Link2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ROLE_LABELS, type Role } from '../context/AuthContext';

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  activo: boolean;
  aprobado: boolean;
};

type CausaResult = {
  id: string;
  identificador: string;
  nroExpedienteElectronico?: string;
  caratula: string;
  expedientes: { nroExpediente: string; caratula: string }[];
};

type AssignedUser = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

const ASSIGNABLE_ROLES: Role[] = ['actor', 'demandado', 'perito', 'arbitro'];

// ── Usuarios Tab ───────────────────────────────────────────────────────────────

function UsuariosTab() {
  const [users, setUsers]             = useState<AdminUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AdminUser[]>('/admin/usuarios');
      setUsers(data);
    } catch {
      setError('Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const withLoading = async (userId: string, fn: () => Promise<void>) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await fn();
      await fetchUsers();
    } catch {
      // errors are silent — the table re-fetches regardless
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const aprobar    = (id: string) => withLoading(id, () => api.put(`/admin/usuarios/${id}/aprobar`));
  const activar    = (id: string) => withLoading(id, () => api.put(`/admin/usuarios/${id}/activar`));
  const desactivar = (id: string) => withLoading(id, () => api.put(`/admin/usuarios/${id}/desactivar`));
  const cambiarRol = (id: string, role: Role) => withLoading(id, () => api.put(`/admin/usuarios/${id}/rol`, { rol: role }));

  const displayed = showPending ? users.filter((u) => !u.aprobado) : users;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[#001f3f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
        <AlertCircle size={16} className="flex-shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={showPending}
            onChange={(e) => setShowPending(e.target.checked)}
            className="w-4 h-4 accent-[#001f3f]"
          />
          Mostrar solo pendientes de aprobación
        </label>
        <span className="text-xs text-slate-400">{displayed.length} usuario{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-blue-700 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Aprobado</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {showPending ? 'No hay usuarios pendientes.' : 'No hay usuarios.'}
                </td>
              </tr>
            )}
            {displayed.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={actionLoading[u._id]}
                    onChange={(e) => cambiarRol(u._id, e.target.value as Role)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#001f3f]"
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                    {u.role === 'secretario' && (
                      <option value="secretario">{ROLE_LABELS.secretario}</option>
                    )}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.aprobado ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {u.aprobado ? 'Sí' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!u.aprobado && (
                      <ActionBtn
                        label="Aprobar"
                        loading={actionLoading[u._id]}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => aprobar(u._id)}
                      />
                    )}
                    {u.activo ? (
                      <ActionBtn
                        label="Desactivar"
                        loading={actionLoading[u._id]}
                        className="bg-red-100 hover:bg-red-200 text-red-700"
                        onClick={() => desactivar(u._id)}
                      />
                    ) : (
                      <ActionBtn
                        label="Activar"
                        loading={actionLoading[u._id]}
                        className="bg-green-100 hover:bg-green-200 text-green-700"
                        onClick={() => activar(u._id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ label, loading, className, onClick }: { label: string; loading?: boolean; className: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
}

// ── Asignaciones Tab ───────────────────────────────────────────────────────────

function AsignacionesTab() {
  const [causaSearch, setCausaSearch]     = useState('');
  const [causaResults, setCausaResults]   = useState<CausaResult[]>([]);
  const [allCausas, setAllCausas]         = useState<CausaResult[]>([]);
  const [allCausasLoading, setAllCausasLoading] = useState(false);
  const [causaListOpen, setCausaListOpen] = useState(false);
  const [selectedCausa, setSelectedCausa] = useState<CausaResult | null>(null);
  const [asignados, setAsignados]         = useState<Record<string, AssignedUser[]>>({});
  const [asigLoading, setAsigLoading]     = useState<Record<string, boolean>>({});
  const [userSearch, setUserSearch]       = useState<Record<string, string>>({});
  const [userResults, setUserResults]     = useState<Record<string, AdminUser[]>>({});
  const [userSearchLoading, setUserSearchLoading] = useState<Record<string, boolean>>({});

  const userDebounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleCausaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setCausaSearch(q);
    setCausaListOpen(true);
    const term = q.trim().toLowerCase();
    if (!term) { setCausaResults([]); return; }
    setCausaResults(
      allCausas.filter((c) => (c.nroExpedienteElectronico ?? '').toLowerCase().includes(term))
    );
  };

  useEffect(() => {
    setAllCausasLoading(true);
    api.get<{ data: CausaResult[] }>('/causas', { params: { limit: 1000 } })
      .then(({ data }) => setAllCausas(data.data ?? []))
      .catch(() => setAllCausas([]))
      .finally(() => setAllCausasLoading(false));
  }, []);

  const fetchAsignados = useCallback(async (causaId: string, nroExpediente: string) => {
    setAsigLoading((prev) => ({ ...prev, [nroExpediente]: true }));
    try {
      const { data } = await api.get<AssignedUser[]>(`/admin/causas/${causaId}/expedientes/${nroExpediente}/asignados`);
      setAsignados((prev) => ({ ...prev, [nroExpediente]: data }));
    } catch {
      setAsignados((prev) => ({ ...prev, [nroExpediente]: [] }));
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nroExpediente]: false }));
    }
  }, []);

  const selectCausa = async (causa: CausaResult) => {
    setSelectedCausa(causa);
    setCausaSearch(causa.nroExpedienteElectronico || causa.identificador);
    setCausaResults([]);
    setCausaListOpen(false);
    setAsignados({});
    setUserSearch({});
    setUserResults({});
    for (const exp of causa.expedientes ?? []) {
      await fetchAsignados(causa.id, exp.nroExpediente);
    }
  };

  const quitarUsuario = async (causaId: string, nroExpediente: string, userId: string) => {
    setAsigLoading((prev) => ({ ...prev, [nroExpediente]: true }));
    try {
      await api.delete(`/admin/causas/${causaId}/expedientes/${nroExpediente}/asignados/${userId}`);
      await fetchAsignados(causaId, nroExpediente);
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nroExpediente]: false }));
    }
  };

  const agregarUsuario = async (causaId: string, nroExpediente: string, userId: string) => {
    setAsigLoading((prev) => ({ ...prev, [nroExpediente]: true }));
    try {
      await api.post(`/admin/causas/${causaId}/expedientes/${nroExpediente}/asignados`, { userId });
      await fetchAsignados(causaId, nroExpediente);
      setUserSearch((prev) => ({ ...prev, [nroExpediente]: '' }));
      setUserResults((prev) => ({ ...prev, [nroExpediente]: [] }));
    } finally {
      setAsigLoading((prev) => ({ ...prev, [nroExpediente]: false }));
    }
  };

  const handleUserInput = (nroExpediente: string, q: string) => {
    setUserSearch((prev) => ({ ...prev, [nroExpediente]: q }));
    if (userDebounceRefs.current[nroExpediente]) clearTimeout(userDebounceRefs.current[nroExpediente]);
    if (!q.trim()) { setUserResults((prev) => ({ ...prev, [nroExpediente]: [] })); return; }
    userDebounceRefs.current[nroExpediente] = setTimeout(async () => {
      setUserSearchLoading((prev) => ({ ...prev, [nroExpediente]: true }));
      try {
        const { data } = await api.get<AdminUser[]>('/admin/usuarios', { params: { search: q } });
        setUserResults((prev) => ({ ...prev, [nroExpediente]: data }));
      } catch {
        setUserResults((prev) => ({ ...prev, [nroExpediente]: [] }));
      } finally {
        setUserSearchLoading((prev) => ({ ...prev, [nroExpediente]: false }));
      }
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Buscar causa</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={causaSearch}
            onChange={handleCausaInput}
            placeholder="Escribí carátula o nro. de expediente electrónico..."
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
          />
          {allCausasLoading ? (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
          ) : (
            <button
              type="button"
              onClick={() => setCausaListOpen((open) => !open)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {causaListOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {(() => {
          if (!causaListOpen) return null;
          const list = causaSearch.trim() ? causaResults : allCausas;
          if (list.length === 0) return null;
          return (
            <div className="mt-1 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCausa(c)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="text-xs font-mono text-[#001f3f] font-semibold">{c.nroExpedienteElectronico || c.identificador}</div>
                  <div className="text-sm text-slate-700">{c.caratula}</div>
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {selectedCausa && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-[#001f3f]">{selectedCausa.nroExpedienteElectronico || selectedCausa.identificador}</h3>
            <span className="text-slate-400 text-sm">—</span>
            <span className="text-sm text-slate-600">{selectedCausa.caratula}</span>
          </div>

          {(selectedCausa.expedientes ?? []).length === 0 && (
            <p className="text-slate-400 text-sm">Esta causa no tiene expedientes.</p>
          )}

          {(selectedCausa.expedientes ?? []).map((exp) => (
            <div key={exp.nroExpediente} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div>
                <div className="text-xs font-mono text-[#001f3f] font-semibold">{exp.nroExpediente}</div>
                <div className="text-sm text-slate-700">{exp.caratula}</div>
              </div>

              {asigLoading[exp.nroExpediente] ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-[#001f3f]" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Agregar usuario</p>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={userSearch[exp.nroExpediente] ?? ''}
                        onChange={(e) => handleUserInput(exp.nroExpediente, e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#001f3f] transition-all"
                      />
                      {userSearchLoading[exp.nroExpediente] && (
                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                      )}
                    </div>
                    {(userResults[exp.nroExpediente] ?? []).length > 0 && (
                      <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                        {(userResults[exp.nroExpediente] ?? []).map((u) => (
                          <button
                            key={u._id}
                            onClick={() => agregarUsuario(selectedCausa.id, exp.nroExpediente, u._id)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <span className="text-sm font-medium text-slate-800">{u.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{u.email}</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                              <UserPlus size={13} /> Agregar
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Usuarios asignados</p>
                    {(asignados[exp.nroExpediente] ?? []).length === 0 ? (
                      <p className="text-sm text-slate-400">Sin usuarios asignados.</p>
                    ) : (
                      <div className="space-y-1">
                        {(asignados[exp.nroExpediente] ?? []).map((u) => (
                          <div key={u._id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-2">
                            <div>
                              <span className="text-sm font-medium text-slate-800">{u.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{ROLE_LABELS[u.role]}</span>
                            </div>
                            <button
                              onClick={() => quitarUsuario(selectedCausa.id, exp.nroExpediente, u._id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <UserMinus size={13} /> Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────

type Tab = 'usuarios' | 'asignaciones';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('usuarios');

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500 text-sm mt-1">Gestión de usuarios y asignaciones a expedientes</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <TabBtn active={tab === 'usuarios'} icon={<Users size={15} />} label="Usuarios" onClick={() => setTab('usuarios')} />
        <TabBtn active={tab === 'asignaciones'} icon={<Link2 size={15} />} label="Asignaciones" onClick={() => setTab('asignaciones')} />
      </div>

      {tab === 'usuarios'      && <UsuariosTab />}
      {tab === 'asignaciones'  && <AsignacionesTab />}
    </Layout>
  );
}

function TabBtn({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
        active
          ? 'border-[#001f3f] text-[#001f3f]'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
