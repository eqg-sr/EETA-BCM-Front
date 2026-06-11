import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Autorizar from './pages/Autorizar';
import Dashboard from './pages/Dashboard';
import Causas from './pages/Causas';
import NuevaCausa from './pages/NuevaCausa';
import CausaDetalle from './pages/CausaDetalle';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';
import HelpCenter from './pages/Help';

export default function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const requireAuth       = (el: React.ReactNode) => (user ? el : <Navigate to="/login" />);
  const requireSecretario = (el: React.ReactNode) =>
    user?.role === 'secretario' ? el : user ? <Navigate to="/causas" /> : <Navigate to="/login" />;

  return (
    <Routes>
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/help"      element={<HelpCenter />} />
      <Route path="/autorizar" element={<Autorizar />} />

      <Route path="/dashboard"   element={requireSecretario(<Dashboard />)} />
      <Route path="/causas"      element={requireAuth(<Causas />)} />
      <Route path="/causas/new"  element={requireAuth(<NuevaCausa />)} />
      <Route path="/causas/:id"  element={requireAuth(<CausaDetalle />)} />
      <Route path="/admin"       element={requireSecretario(<Admin />)} />

      <Route path="*" element={user?.role === 'secretario' ? <Navigate to="/dashboard" /> : <Navigate to="/causas" />} />
    </Routes>
  );
}
