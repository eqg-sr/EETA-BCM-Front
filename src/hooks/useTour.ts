import Shepherd from 'shepherd.js';
import type { Role } from '../context/AuthContext';

const { Tour } = Shepherd;
type TourInstance = InstanceType<typeof Tour>;

const STORAGE_KEY = (userId: string) => `eeta_tour_completado_${userId}`;

const BTN_PRIMARY =
  'px-4 py-2 bg-[#001f3f] text-white text-xs font-semibold rounded-lg hover:bg-[#002d5a] transition-colors';
const BTN_SECONDARY =
  'px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-slate-400 transition-colors';
const BTN_SKIP =
  'px-3 py-2 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors';

function elExists(selector: string): boolean {
  return !!document.querySelector(selector);
}

function makeStep(
  tour: TourInstance,
  opts: {
    id: string;
    title: string;
    text: string;
    attachTo?: { element: string; on: 'bottom' | 'top' | 'left' | 'right' | 'bottom-start' | 'bottom-end' };
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
    beforeShowPromise: opts.attachTo
      ? () =>
          new Promise<void>((resolve) => {
            if (elExists(opts.attachTo!.element)) resolve();
            else {
              // elemento no montado → saltar paso
              setTimeout(() => tour.next(), 0);
              resolve();
            }
          })
      : undefined,
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

function buildTour(role: Role): TourInstance {
  const tour = new Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-2xl rounded-2xl border border-slate-100',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
    },
  });

  switch (role) {
    case 'secretario':
      makeStep(tour, {
        id: 'sec-1',
        title: 'Panel de Expedientes',
        text: 'Desde acá tenés acceso completo a todos los expedientes del tribunal. Podés filtrar por estado y buscar por carátula o número.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
      });
      makeStep(tour, {
        id: 'sec-2',
        title: 'Crear Expediente',
        text: 'Iniciá un nuevo expediente cargando los datos de la demanda. Podés subir el PDF y el sistema completará algunos campos automáticamente.',
        attachTo: { element: '#tour-nuevo-expediente', on: 'bottom-end' },
      });
      makeStep(tour, {
        id: 'sec-3',
        title: 'Panel de Administración',
        text: 'Desde acá aprobás nuevos usuarios, los asignás a expedientes y gestionás el acceso al sistema.',
        attachTo: { element: '#tour-nav-admin', on: 'bottom' },
      });
      makeStep(tour, {
        id: 'sec-4',
        title: 'Dashboard',
        text: 'En el dashboard encontrás un resumen del estado general de los expedientes, estadísticas y movimientos recientes.',
        attachTo: { element: '#tour-nav-dashboard', on: 'bottom' },
      });
      makeStep(tour, {
        id: 'sec-5',
        title: '¡Todo listo!',
        text: 'Sos el administrador del sistema. Tenés acceso total para gestionar expedientes, usuarios y movimientos. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    case 'actor':
      makeStep(tour, {
        id: 'act-1',
        title: 'Mis Expedientes',
        text: 'Acá aparecen únicamente los expedientes donde sos parte actora. No verás expedientes de otros usuarios.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
      });
      makeStep(tour, {
        id: 'act-2',
        title: 'Iniciar un Expediente',
        text: 'Podés iniciar un nuevo expediente subiendo el PDF de la demanda. El sistema intentará completar los datos automáticamente.',
        attachTo: { element: '#tour-nuevo-expediente', on: 'bottom-end' },
      });
      makeStep(tour, {
        id: 'act-3',
        title: 'Consultá tus expedientes',
        text: 'Haciendo clic en cualquier expediente podés ver su estado, los movimientos registrados y los documentos adjuntos. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    case 'arbitro':
      makeStep(tour, {
        id: 'arb-1',
        title: 'Expedientes del Tribunal',
        text: 'Como árbitro tenés visibilidad sobre todos los expedientes del tribunal, no solo los que te fueron asignados.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
      });
      makeStep(tour, {
        id: 'arb-2',
        title: 'Panel de resumen',
        text: 'Desde el dashboard podés ver un resumen del estado general de los expedientes.',
        attachTo: { element: '#tour-nav-dashboard', on: 'bottom' },
      });
      makeStep(tour, {
        id: 'arb-3',
        title: 'Tu rol como Árbitro',
        text: 'Podés cargar movimientos en los expedientes y consultar toda la documentación. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    case 'demandado':
      makeStep(tour, {
        id: 'dem-1',
        title: 'Mis Expedientes',
        text: 'Acá aparecen únicamente los expedientes en los que figurás como demandado.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
      });
      makeStep(tour, {
        id: 'dem-2',
        title: 'Consultá el estado de tu caso',
        text: 'Podés hacer clic en cualquier expediente para ver los movimientos registrados y los documentos del proceso. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    case 'perito':
      makeStep(tour, {
        id: 'per-1',
        title: 'Expedientes disponibles',
        text: 'Como perito tenés acceso de consulta a todos los expedientes del tribunal.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
      });
      makeStep(tour, {
        id: 'per-2',
        title: 'Acceso de solo lectura',
        text: 'Podés consultar expedientes, movimientos y documentos, pero no realizar modificaciones en el sistema. ¡Bienvenido/a!',
        isLast: true,
      });
      break;

    default:
      break;
  }

  return tour;
}

export function useTour() {
  function startTour(userId: string, role: Role) {
    if (localStorage.getItem(STORAGE_KEY(userId))) return;
    const tour = buildTour(role);
    if (tour.steps.length > 0) {
      tour.on('complete', () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.on('cancel',   () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.start();
    }
  }

  function resetAndStartTour(userId: string, role: Role) {
    localStorage.removeItem(STORAGE_KEY(userId));
    const tour = buildTour(role);
    if (tour.steps.length > 0) {
      tour.on('complete', () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.on('cancel',   () => localStorage.setItem(STORAGE_KEY(userId), 'true'));
      tour.start();
    }
  }

  return { startTour, resetAndStartTour };
}
