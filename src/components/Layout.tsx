import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import logo from '../assets/logo-header.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-slate-50">
      
      {/* Barra Superior (Topbar) - Navy Blue */}
      <header className="sticky top-0 z-50 bg-[#001f3f] text-white shadow-lg px-6 py-3 flex justify-between items-center">
        
        {/* Branding / Logo */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg">
            <img src={logo} alt="Logo" className="w-48 h-12 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Sistema De <span className="text-blue-400">Expedientes</span>
          </h1>
        </div>

        {/* Acciones de Usuario */}
        <div className="flex items-center gap-4">
          {/* Notificaciones (Opcional) */}
          {/* <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#001f3f]"></span>
          </button> */}

          {/* Configuración */}
          {/* <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Configuración">
            <Settings size={20} />
          </button> */}

          {/* Divisor */}
          <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

          {/* Perfil / Usuario */}
          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden md:flex text-right">
              <span className="text-sm font-semibold leading-tight">Admin Usuario</span>
              <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Administrador</span>
            </div>
            
            <Link 
              to="/profile" 
              className="group relative flex items-center justify-center w-10 h-10 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all shadow-inner"
            >
              <User size={20} className="text-white" />
            </Link>

            <button className="ml-2 p-2 text-blue-300 hover:text-white transition-colors" title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Área de Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        {/* Este contenedor ayuda a que el contenido respire */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[70vh]">
          {children}
        </div>
      </main>

      {/* Footer - Navy Blue */}
      <footer className="bg-[#001f3f] text-white/70 py-6 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Sistema de Expedientes</span>
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