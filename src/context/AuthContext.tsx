import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type Role = 'arbitro' | 'demandado' | 'actor' | 'secretario' | 'perito';

export type User = {
  _id: string;
  email: string;
  name: string;
  role: Role;
  activo?: boolean;
  aprobado?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, rehydrate session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) { setIsLoading(false); return; }
    api.get<User>('/auth/self')
      .then((res) => {
        setToken(stored);
        setUser({ _id: res.data._id, email: res.data.email, name: res.data.name, role: res.data.role, activo: res.data.activo, aprobado: res.data.aprobado });
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const me = await api.get<User>('/auth/self');
    setUser({ _id: me.data._id, email: me.data.email, name: me.data.name, role: me.data.role, activo: me.data.activo, aprobado: me.data.aprobado });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ROLE_LABELS: Record<Role, string> = {
  arbitro:    'Árbitro',
  demandado:  'Demandado',
  actor:      'Actor',
  secretario: 'Secretario/a del Tribunal',
  perito:     'Perito',
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return {
    role,
    canCreateExpediente: role === 'actor',
    canEditExpediente:   role === 'actor',
    canAddComment:       role === 'secretario',
    canCreateCausa:      role === 'actor' || role === 'secretario',
    isReadOnly:          role === 'arbitro' || role === 'demandado' || role === 'perito',
    isPerito:            role === 'perito',
  };
}
