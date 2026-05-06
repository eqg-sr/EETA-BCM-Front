import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// Asegúrate de que la ruta sea correcta según tu carpeta de assets
import logo from '../assets/LogoNegro.png'; 

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de carga
    setTimeout(() => {
      login({ email, role: email === 'admin@test.com' ? 'admin' : 'user' });
      setIsLoading(false);
      nav('/expedients');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl shadow-blue-900/5 p-10 border border-slate-100">
        
        {/* Encabezado con Imagen */}
        <div className="text-center mb-10">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#001f3f]">Bienvenido</h1>
          <p className="text-slate-500 mt-2 text-sm">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@empresa.com"
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
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 focus:border-[#001f3f] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#001f3f] text-white font-semibold py-3 rounded-xl hover:bg-[#002d5a] transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-lg shadow-blue-900/20"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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