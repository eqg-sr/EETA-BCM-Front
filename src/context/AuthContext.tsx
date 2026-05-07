import { createContext, useContext, useState } from 'react';

export type Role = 'juez' | 'demandado' | 'actor' | 'secretario';

type User = {
  email: string;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
  juez: 'Juez/a',
  demandado: 'Demandado',
  actor: 'Actor',
  secretario: 'Secretario/a del Tribunal',
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return {
    role,
    canCreateExpediente: role === 'actor',
    canEditExpediente: role === 'actor',
    canAddComment: role === 'secretario',
    canCreateCausa: role === 'actor' || role === 'secretario',
    isReadOnly: role === 'juez' || role === 'demandado',
  };
}
