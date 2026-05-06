import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadExpedient from './pages/UploadExpedient';
import ViewExpedients from './pages/ViewExpedients';
import { useAuth } from './context/AuthContext';
import HelpCenter from './pages/Help';
export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route
        path="/upload"
        element={user ? <UploadExpedient /> : <Navigate to="/login" />}
      />
      <Route
        path="/expedients"
        element={user ? <ViewExpedients /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/expedients" />} />
    </Routes>
  );
}