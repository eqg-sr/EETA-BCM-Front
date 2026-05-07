import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Causas from './pages/Causas';
import NuevaCausa from './pages/NuevaCausa';
import CausaDetalle from './pages/CausaDetalle';
import { useAuth } from './context/AuthContext';
import HelpCenter from './pages/Help';

export default function AppRoutes() {
  const { user } = useAuth();

  const requireAuth = (el: React.ReactNode) => (user ? el : <Navigate to="/login" />);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/help" element={<HelpCenter />} />

      <Route path="/causas" element={requireAuth(<Causas />)} />
      <Route path="/causas/new" element={requireAuth(<NuevaCausa />)} />
      <Route path="/causas/:id" element={requireAuth(<CausaDetalle />)} />

      <Route path="*" element={<Navigate to="/causas" />} />
    </Routes>
  );
}
