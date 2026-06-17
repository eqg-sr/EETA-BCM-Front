import Shepherd from 'shepherd.js';
import type { Role } from '../context/AuthContext';

const { Tour } = Shepherd;
type TourInstance = InstanceType<typeof Tour>;
type NavigateFn = (path: string) => void;

const STORAGE_KEY = (userId: string) => `eeta_tour_completado_${userId}`;

const BTN_PRIMARY =
  'px-4 py-2 bg-[#001f3f] text-white text-xs font-semibold rounded-lg hover:bg-[#002d5a] transition-colors';
const BTN_SECONDARY =
  'px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-slate-400 transition-colors';
const BTN_SKIP =
  'px-3 py-2 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors';

function waitForElement(selector: string, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) { resolve(true); return; }
    const start = Date.now();
    const poll = () => {
      if (document.querySelector(selector)) { resolve(true); return; }
      if (Date.now() - start > timeoutMs) { resolve(false); return; }
      setTimeout(poll, 80);
    };
    setTimeout(poll, 80);
  });
}

function makeStep(
  tour: TourInstance,
  navigate: NavigateFn,
  opts: {
    id: string;
    title: string;
    text: string;
    attachTo?: { element: string; on: 'bottom' | 'top' | 'left' | 'right' | 'bottom-start' | 'bottom-end' };
    navigateTo?: string;
    isLast?: boolean;
  }
) {
  const isFirst = tour.steps.length === 0;

  tour.addStep({
    id: opts.id,
    title: opts.title,
    text: opts.text,
    attachTo: opts.attachTo,
    scrollTo: true,
    cancelIcon: { enabled: true },
    beforeShowPromise: () =>
      new Promise<void>(async (resolve) => {
        if (opts.navigateTo) navigate(opts.navigateTo);
        if (opts.attachTo) {
          const found = await waitForElement(opts.attachTo.element);
          if (!found) { setTimeout(() => tour.next(), 0); }
        }
        resolve();
      }),
    buttons: [
      {
        text: 'Saltar tour',
        classes: BTN_SKIP,
        action() { tour.cancel(); },
      },
      ...(isFirst
        ? []
        : [{ text: 'Anterior', classes: BTN_SECONDARY, action() { tour.back(); } }]),
      {
        text: opts.isLast ? 'Finalizar' : 'Siguiente',
        classes: BTN_PRIMARY,
        action() { opts.isLast ? tour.complete() : tour.next(); },
      },
    ],
  });
}

function buildTour(role: Role, navigate: NavigateFn): TourInstance {
  const tour = new Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-2xl rounded-2xl border border-slate-100',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
    },
  });

  const s = (opts: Parameters<typeof makeStep>[2]) => makeStep(tour, navigate, opts);

  switch (role) {
    case 'secretario':
      s({
        id: 'sec-bienvenida',
        title: '¡Bienvenido/a al sistema!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Te vamos a guiar por las funciones principales para que puedas empezar a trabajar enseguida.',
      });
      s({
        id: 'sec-stats',
        title: 'Resumen del Tribunal',
        text: 'Acá tenés un pantallazo rápido del estado del tribunal: total de expedientes y cuántos están iniciados, en proceso o cerrados. También ves cuántos usuarios tienen aprobación pendiente.',
        attachTo: { element: '#tour-stats', on: 'bottom' },
        navigateTo: '/dashboard',
      });
      s({
        id: 'sec-graficos',
        title: 'Estadísticas',
        text: 'Estos gráficos te muestran la distribución de expedientes por estado y la cantidad de expedientes iniciados en los últimos meses. Muy útil para tener una visión general de la actividad del tribunal.',
        attachTo: { element: '#tour-graficos', on: 'top' },
      });
      s({
        id: 'sec-recientes',
        title: 'Actividad Reciente',
        text: 'Esta tabla muestra los expedientes con movimientos más recientes, con su estado actual. Podés hacer clic en cualquiera para abrirlo directamente.',
        attachTo: { element: '#tour-recientes', on: 'top' },
      });
      s({
        id: 'sec-expedientes',
        title: 'Panel de Expedientes',
        text: 'Acá encontrás <strong>todos los expedientes del tribunal</strong>. Podés ver el número de expediente electrónico, carátula, tribunal, árbitros asignados y la fecha del último movimiento.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'sec-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador para encontrar expedientes por carátula, número o tribunal. El selector de estado te permite ver solo los expedientes iniciados, en proceso o cerrados.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      s({
        id: 'sec-nuevo',
        title: 'Crear Expediente',
        text: 'Como secretario/a podés iniciar nuevos expedientes. Completás los datos de la demanda y opcionalmente subís el PDF. El sistema genera el número de expediente electrónico automáticamente.',
        attachTo: { element: '#tour-nuevo-expediente', on: 'bottom-end' },
      });
      s({
        id: 'sec-admin',
        title: 'Administración de Usuarios',
        text: 'Desde el panel de administración aprobás los nuevos usuarios que se registran, los asignás como parte actora o demandada en expedientes, y podés gestionar sus accesos. Es la función más importante de tu rol.',
        attachTo: { element: '#tour-nav-admin', on: 'bottom' },
      });
      s({
        id: 'sec-fin',
        title: '¡Todo listo!',
        text: 'Ya conocés las funciones principales del sistema. Recordá que podés volver a este tutorial en cualquier momento desde el <strong>Centro de Ayuda</strong> en el pie de página. ¡Bienvenido/a al tribunal!',
        isLast: true,
      });
      break;

    case 'actor':
      s({
        id: 'act-bienvenida',
        title: '¡Bienvenido/a!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Desde acá vas a poder gestionar tus expedientes como parte actora. Te mostramos cómo funciona.',
      });
      s({
        id: 'act-expedientes',
        title: 'Mis Expedientes',
        text: 'En este panel aparecen <strong>únicamente los expedientes donde sos parte actora</strong>. No verás los expedientes de otros usuarios. Podés ver el estado de cada uno y el último movimiento registrado.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'act-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Si tenés muchos expedientes, usá el buscador para encontrarlos por carátula o número. El filtro de estado te permite ver solo los que están en proceso, iniciados o ya cerrados.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      s({
        id: 'act-nuevo',
        title: 'Iniciar un Expediente',
        text: 'Desde acá podés iniciar un nuevo expediente. Completás los datos de la demanda, subís el PDF y el sistema completa algunos campos automáticamente. Una vez creado, el secretario del tribunal lo recibirá para su tramitación.',
        attachTo: { element: '#tour-nuevo-expediente', on: 'bottom-end' },
      });
      s({
        id: 'act-detalle',
        title: 'Detalle del Expediente',
        text: 'Haciendo clic en <strong>Abrir</strong> en cualquier expediente podés ver toda la información: estado, composición del tribunal, sujetos involucrados, movimientos registrados y documentación adjunta.',
        isLast: true,
      });
      break;

    case 'arbitro':
      s({
        id: 'arb-bienvenida',
        title: '¡Bienvenido/a, Árbitro!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Como árbitro tenés acceso a todos los expedientes del tribunal. Te mostramos las funciones disponibles.',
      });
      s({
        id: 'arb-stats',
        title: 'Dashboard del Tribunal',
        text: 'El dashboard te muestra el estado general del tribunal: cuántos expedientes hay en total y cómo se distribuyen por estado. Es tu punto de partida para tener una visión global.',
        attachTo: { element: '#tour-stats', on: 'bottom' },
        navigateTo: '/dashboard',
      });
      s({
        id: 'arb-graficos',
        title: 'Evolución del Tribunal',
        text: 'Estos gráficos muestran la distribución de expedientes por estado y la actividad de los últimos meses. Te permiten seguir la evolución del trabajo del tribunal.',
        attachTo: { element: '#tour-graficos', on: 'top' },
      });
      s({
        id: 'arb-recientes',
        title: 'Expedientes Recientes',
        text: 'Acá ves los expedientes con actividad más reciente. Hacé clic en cualquiera para acceder directamente al detalle.',
        attachTo: { element: '#tour-recientes', on: 'top' },
      });
      s({
        id: 'arb-expedientes',
        title: 'Todos los Expedientes',
        text: 'Como árbitro tenés <strong>visibilidad sobre todos los expedientes del tribunal</strong>, no solo los asignados a vos. Podés consultar el estado, los movimientos y la documentación de cada uno.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'arb-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador y los filtros para encontrar rápidamente los expedientes que necesitás consultar.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      s({
        id: 'arb-fin',
        title: '¡Todo listo!',
        text: 'Ya conocés el sistema. Podés consultar expedientes, revisar movimientos y documentación. Recordá que podés repetir este tutorial desde el <strong>Centro de Ayuda</strong>. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    case 'demandado':
      s({
        id: 'dem-bienvenida',
        title: '¡Bienvenido/a!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Desde acá podés consultar el estado de los expedientes en los que figurás como demandado.',
      });
      s({
        id: 'dem-expedientes',
        title: 'Mis Expedientes',
        text: 'En este panel aparecen <strong>únicamente los expedientes en los que figurás como demandado</strong>. Podés ver el estado actual y la fecha del último movimiento de cada uno.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'dem-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Si tenés varios expedientes, usá el buscador para encontrar uno específico, o filtrá por estado para ver solo los que están activos.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      s({
        id: 'dem-detalle',
        title: 'Consultá tu Expediente',
        text: 'Haciendo clic en <strong>Abrir</strong> podés ver el detalle completo: composición del tribunal, sujetos del proceso, todos los movimientos registrados y los documentos adjuntos. Recordá que podés volver a este tutorial desde el <strong>Centro de Ayuda</strong>.',
        isLast: true,
      });
      break;

    case 'perito':
      s({
        id: 'per-bienvenida',
        title: '¡Bienvenido/a, Perito!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Como perito tenés acceso de consulta a los expedientes del tribunal.',
      });
      s({
        id: 'per-expedientes',
        title: 'Expedientes Disponibles',
        text: 'Desde acá podés ver los expedientes del tribunal disponibles para consulta. Podés buscar por carátula, número o filtrar por estado.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'per-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador y los filtros para localizar rápidamente el expediente que necesitás consultar.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      s({
        id: 'per-fin',
        title: 'Acceso de Consulta',
        text: 'Podés consultar toda la información de cada expediente: movimientos, documentación y composición del tribunal. Tu rol es de <strong>solo lectura</strong>: no podés crear ni modificar expedientes. Recordá que podés volver a este tutorial desde el <strong>Centro de Ayuda</strong>. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    default:
      break;
  }

  return tour;
}

export function useTour() {
  function startTour(userId: string, role: Role, navigate: NavigateFn) {
    if (localStorage.getItem(STORAGE_KEY(userId))) return;
    const tour = buildTour(role, navigate);
    if (tour.steps.length > 0) {
      tour.on('complete', () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.on('cancel',   () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.start();
    }
  }

  function resetAndStartTour(userId: string, role: Role, navigate: NavigateFn) {
    localStorage.removeItem(STORAGE_KEY(userId));
    const tour = buildTour(role, navigate);
    if (tour.steps.length > 0) {
      tour.on('complete', () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.on('cancel',   () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.start();
    }
  }

  return { startTour, resetAndStartTour };
}
