import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/LogoNegro.png';
import axios from 'axios';

type Resultado = {
  ok: boolean;
  message: string;
  sujetoNombre?: string;
  causaCaratula?: string;
};

export default function Autorizar() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (!token) {
      setResultado({ ok: false, message: 'Link inválido' });
      setIsLoading(false);
      return;
    }

    const verificar = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/autorizar`, {
          params: { token },
        });
        setResultado({
          ok: true,
          message: res.data?.message,
          sujetoNombre: res.data?.sujetoNombre,
          causaCaratula: res.data?.causaCaratula,
        });
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ?? 'Token inválido o ya utilizado'
          : 'Token inválido o ya utilizado';
        setResultado({ ok: false, message });
      } finally {
        setIsLoading(false);
      }
    };

    verificar();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl shadow-blue-900/5 p-10 border border-slate-100">

        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#001f3f]">Expediente Electronico Tribunal Arbitral BCM</h1>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-slate-500 py-4">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Verificando...</p>
          </div>
        )}

        {!isLoading && resultado && resultado.ok && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-3 rounded-lg">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <span>
              Acceso de <strong>{resultado.sujetoNombre}</strong> al expediente <strong>{resultado.causaCaratula}</strong> fue autorizado correctamente.
            </span>
          </div>
        )}

        {!isLoading && resultado && !resultado.ok && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-3 rounded-lg">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{resultado.message}</span>
          </div>
        )}

        {!isLoading && (
          <p className="text-center mt-8 text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition">
              Volver al inicio
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
