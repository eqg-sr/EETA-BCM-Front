import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import logo from '../assets/LogoNegro.png';
import api from '../services/api';
import axios from 'axios';

const ROLES = [
  { value: 'actor',     label: 'Actor' },
  { value: 'demandado', label: 'Demandado' },
  { value: 'perito',    label: 'Perito' },
  { value: 'arbitro',   label: 'Árbitro' },
] as const;

export default function Register() {
  const [nombre, setNombre]         = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol]               = useState<string>('actor');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { name: nombre.trim(), email: email.trim(), password, role: rol });
      setSuccess(true);
      setTimeout(() => nav('/login'), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const fieldError = data?.errors?.fieldErrors
          ? (Object.values(data.errors.fieldErrors).flat()[0] as string | undefined)
          : undefined;
        setError(data?.message ?? fieldError ?? 'Error al registrar. Intentá de nuevo.');
      } else {
        setError('Error al registrar. Intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl shadow-blue-900/5 p-10 border border-slate-100">

        <div className="text-center mb-10">
          <img src={logo} alt="Logo" className="w-32 h-32 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-[#001f3f]">Crear Cuenta</h1>
          <p className="text-slate-500 mt-2 text-sm">Completá tus datos para registrarte</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-center text-slate-700 font-medium">
              Tu cuenta fue creada. Un administrador debe aprobarla antes de que puedas ingresar.
            </p>
            <p className="text-sm text-slate-400">Redirigiendo al login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Nombre completo</label>
              <input
                type="text"
                placeholder="Juan García"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repetí la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-[#001f3f]"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}

        <p className="text-center mt-8 text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
