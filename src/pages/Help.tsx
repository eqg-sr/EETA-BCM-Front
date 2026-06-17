import { useState } from 'react';
import Layout from '../components/Layout';
import { MessageCircle, Mail, Headset, BookOpen, ArrowLeft, PlayCircle, ChevronDown, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/LogoNegro.png';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../hooks/useTour';

const FAQ_ITEMS = [
  {
    question: '¿Cómo inicio un nuevo expediente en el sistema?',
    answer: null,
  },
  {
    question: '¿Cómo cargo un movimiento en un expediente existente?',
    answer: null,
  },
  {
    question: '¿Cómo consulto el estado actual de mi expediente?',
    answer: null,
  },
  {
    question: '¿Qué significa cada estado del expediente (Iniciado, En proceso, Cerrado)?',
    answer: null,
  },
  {
    question: '¿Cómo descargo el PDF de la demanda adjunta?',
    answer: null,
  },
  {
    question: '¿Qué hago si olvidé mi contraseña o no puedo acceder al sistema?',
    answer: null,
  },
  {
    question: '¿Cómo se notifica a las partes cuando hay nuevos movimientos?',
    answer: null,
  },
  {
    question: '¿Cómo puedo ser asignado a un expediente?',
    answer: null,
  },
];

function FaqItem({ question, answer, open, onToggle }: {
  question: string;
  answer: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">{question}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100">
          {answer ? (
            <p className="text-sm text-slate-600 leading-relaxed">{answer}</p>
          ) : (
            <div className="flex items-center gap-2 py-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Próximamente
              </span>
              <span className="text-xs text-slate-400">Esta respuesta estará disponible en breve.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetAndStartTour } = useTour();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <div className="max-w-2xl mx-auto py-6 px-4">

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="w-28 h-28 mb-3 object-contain" />
          <h1 className="text-lg font-extrabold text-[#001f3f] tracking-tight">Centro de Ayuda</h1>
          <p className="text-slate-500 text-xs mt-0.5">¿En qué podemos ayudarte?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contacto */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Contacto</p>
            <div className="space-y-2">
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{method.title}</span>
                    <span className="text-slate-700 font-medium text-xs">{method.value}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Acciones</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#001f3f] text-white text-[11px] font-bold rounded-lg hover:bg-[#002d5a] transition-all shadow-md active:scale-95">
                <BookOpen size={14} />
                Manual de usuario
              </button>

              <button
                onClick={() => navigate(user?.role === 'secretario' || user?.role === 'arbitro' ? '/dashboard' : '/causas')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={14} />
                Volver al inicio
              </button>

              {user && (
                <button
                  onClick={() => resetAndStartTour(user._id, user.role, navigate)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
                >
                  <PlayCircle size={14} />
                  Ver tutorial de bienvenida
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={15} className="text-[#001f3f]" />
            <h2 className="text-sm font-extrabold text-[#001f3f] uppercase tracking-wider">Preguntas Frecuentes</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Próximamente
            </span>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                question={item.question}
                answer={item.answer}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Soporte IT • BCM</p>
        </div>
      </div>
    </Layout>
  );
}
