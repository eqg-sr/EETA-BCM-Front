import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadExpedient from './pages/UploadExpedient';
import ViewExpedients from './pages/ViewExpedients';
import Causas from './pages/Causas';
import CausaDetalle from './pages/CausaDetalle';
import ExpedienteDetalle from './pages/ExpedienteDetalle';
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
      <Route path="/causas/:id" element={requireAuth(<CausaDetalle />)} />
      <Route path="/causas/:id/expedientes/new" element={requireAuth(<UploadExpedient />)} />
      <Route path="/causas/:id/expedientes/:nro" element={requireAuth(<ExpedienteDetalle />)} />

      <Route path="/expedients" element={requireAuth(<ViewExpedients />)} />
      <Route path="/upload" element={requireAuth(<UploadExpedient />)} />

      <Route path="*" element={<Navigate to="/causas" />} />
    </Routes>
  );
}
