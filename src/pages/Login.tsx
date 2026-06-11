import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import logo from '../assets/LogoNegro.png';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      nav('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError(err.response.data?.message ?? 'Acceso denegado.');
      } else {
        setError('Credenciales inválidas. Verificá el email y la contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl shadow-blue-900/5 p-10 border border-slate-100">

        <div className="text-center mb-10">
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#001f3f]">Expediente Electronico Tribunal Arbitral BCM</h1>
          <p className="text-slate-500 mt-2 text-sm">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@bcm.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <a href="#" className="text-xs font-medium text-blue-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-[#001f3f]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#001f3f] text-white font-semibold py-3 rounded-xl hover:bg-[#002d5a] transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-lg shadow-blue-900/20"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800 transition">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
