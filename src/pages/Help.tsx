import Layout from '../components/Layout';
import { MessageCircle, Mail, Headset, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/LogoNegro.png';

export default function HelpCenter() {
  const navigate = useNavigate();

  const contactMethods = [
    {
      title: 'WhatsApp',
      value: '+54 9 11 5328-8838',
      icon: <MessageCircle size={18} className="text-green-600" />,
      link: 'https://wa.me/5491153288838',
    },
    {
      title: 'E-mail',
      value: 'it@bcmdz.com.ar',
      icon: <Mail size={18} className="text-blue-600" />,
      link: 'mailto:it@bcmdz.com.ar',
    },
    {
      title: 'Soporte',
      value: 'Portal de Atención',
      icon: <Headset size={18} className="text-slate-600" />,
      link: '#',
    },
  ];

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-6 px-4">
        
        {/* Encabezado Minimalista */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-32 h-32 mb-3 object-contain" // Tamaño exacto 32x32
          />
          <h1 className="text-lg font-extrabold text-[#001f3f] tracking-tight">
            Centro de Ayuda
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">¿En qué podemos ayudarte?</p>
        </div>

        {/* Contacto Ultra-Compacto */}
        <div className="space-y-2 mb-6">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-slate-50 transition-all group"
            >
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                {method.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  {method.title}
                </span>
                <span className="text-slate-700 font-medium text-xs">
                  {method.value}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Acciones de Navegación */}
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#001f3f] text-white text-[11px] font-bold rounded-lg hover:bg-[#002d5a] transition-all shadow-md active:scale-95">
            <BookOpen size={14} />
            Manual
          </button>
          
          <button 
            onClick={() => navigate('/expedients')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={14} />
            Inicio
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
            Soporte IT • BCM
          </p>
        </div>
      </div>
    </Layout>
  );
}