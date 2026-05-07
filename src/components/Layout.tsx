import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Folder, FileText } from 'lucide-react';
import logo from '../assets/logo-header.png';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : 'AU';

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-slate-50">

      <header className="sticky top-0 z-50 bg-[#001f3f] text-white shadow-lg px-6 py-3 flex justify-between items-center">

        <div className="flex items-center gap-6">
          <Link to="/causas" className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg">
              <img src={logo} alt="Logo" className="w-48 h-12 object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Expediente Electronico <span className="text-blue-400">Tribunal Arbitral BCM</span>
            </h1>
          </Link>

          {user && (
            <nav className="flex items-center gap-1 ml-4">
              <Link
                to="/causas"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/causas') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Folder size={16} />
                Causas
              </Link>
              <Link
                to="/expedients"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/expedients') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FileText size={16} />
                Expedientes
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden md:flex text-right">
              <span className="text-sm font-semibold leading-tight">{user?.name ?? 'Admin Usuario'}</span>
              <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">
                {user ? ROLE_LABELS[user.role] : 'Sin sesión'}
              </span>
            </div>

            <Link
              to="/profile"
              className="group relative flex items-center justify-center w-10 h-10 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all shadow-inner font-bold text-sm"
            >
              {user ? initials : <User size={20} className="text-white" />}
            </Link>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-blue-300 hover:text-white transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[70vh]">
          {children}
        </div>
      </main>

      <footer className="bg-[#001f3f] text-white/70 py-6 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Expediente Electronico Tribunal Arbitral BCM</span>
            <span>&copy; 2026</span>
          </div>

          <div className="text-[11px] font-medium uppercase tracking-tighter">
            <a href="/help" className="hover:text-white transition-colors">Soporte </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
