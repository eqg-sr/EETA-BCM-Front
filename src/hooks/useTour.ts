import Shepherd from 'shepherd.js';
import type { Role } from '../context/AuthContext';

const { Tour } = Shepherd;
type TourInstance = InstanceType<typeof Tour>;
type NavigateFn = (path: string) => void;

const STORAGE_KEY        = (userId: string) => `eeta_tour_completado_${userId}`;
const DETALLE_STORAGE_KEY = (userId: string) => `eeta_tour_detalle_${userId}`;

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
  navigate: NavigateFn | null,
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
        if (opts.navigateTo && navigate) navigate(opts.navigateTo);
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

function makeTour(): TourInstance {
  return new Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-2xl rounded-2xl border border-slate-100',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
    },
  });
}

function wireStorage(tour: TourInstance, key: string) {
  const done = () => localStorage.setItem(key, 'true');
  tour.on('complete', done);
  tour.on('cancel', done);
}

// ─── Pasos del detalle de expediente (compartidos por todos los roles) ──────

function addDetallePasos(tour: TourInstance, navigate: NavigateFn | null, role: Role) {
  const s = (opts: Parameters<typeof makeStep>[2]) => makeStep(tour, navigate, opts);

  s({
    id: 'det-nav',
    title: 'Navegación del Expediente',
    text: 'Este menú lateral te permite saltar a cada sección del expediente. Hacé clic en cualquier sección para ir directo a ella.',
    attachTo: { element: '#tour-detalle-nav', on: 'right' },
  });
  s({
    id: 'det-info',
    title: 'Información General',
    text: 'Acá están los datos principales: número de expediente electrónico, carátula, tribunal, fechas y el PDF de la demanda adjunto para descargar.',
    attachTo: { element: '#info', on: 'top' },
  });
  s({
    id: 'det-tribunal',
    title: 'Composición del Tribunal',
    text: 'Muestra los árbitros titulares (fijos para todos los expedientes), los árbitros suplentes designados y el secretario del tribunal.' +
      (role === 'secretario' ? ' Como secretario/a podés modificar los árbitros suplentes desde acá.' : ''),
    attachTo: { element: '#tribunal', on: 'top' },
  });
  s({
    id: 'det-sujetos',
    title: 'Sujetos Involucrados',
    text: 'Lista de todos los involucrados en el proceso: actores, demandados y terceros. Se muestra nombre, CUIT, patrocinante y domicilio electrónico de cada uno.' +
      (role === 'secretario' ? ' Podés agregar nuevos sujetos desde el formulario al pie.' : ''),
    attachTo: { element: '#sujetos', on: 'top' },
  });
  s({
    id: 'det-movimientos',
    title: 'Movimientos',
    text: 'Historial cronológico de todas las actuaciones del expediente. Podés filtrar por tipo (Resoluciones, Presentaciones, Notificaciones) y buscar por texto.' +
      (role === 'secretario' || role === 'arbitro'
        ? ' Tenés habilitado el formulario para cargar nuevos movimientos con o sin archivo adjunto.'
        : ''),
    attachTo: { element: '#movimientos', on: 'top' },
  });
  s({
    id: 'det-relacionadas',
    title: 'Causas Relacionadas',
    text: 'Si el expediente está vinculado a otros procesos, aparecen acá con su número, descripción de la vinculación y documentos adjuntos.' +
      (role === 'secretario' ? ' Como secretario/a podés vincular y desvincular causas.' : ''),
    attachTo: { element: '#relacionadas', on: 'top' },
  });
}

// ─── Pasos del formulario Nuevo Expediente ───────────────────────────────────

function addNuevaCausaPasos(tour: TourInstance, navigate: NavigateFn | null) {
  const s = (opts: Parameters<typeof makeStep>[2]) => makeStep(tour, navigate, opts);

  s({
    id: 'new-datos',
    title: 'Datos del Expediente',
    text: 'Completá la <strong>fecha de inicio</strong>, el <strong>objeto del juicio</strong> (tipo de disputa) y la <strong>carátula</strong> (identificación formal de las partes y la acción). El número de expediente electrónico es opcional: podés ingresarlo o dejarlo vacío.',
    attachTo: { element: '#tour-nueva-datos', on: 'bottom' },
    navigateTo: '/causas/new',
  });
  s({
    id: 'new-tribunal',
    title: 'Composición del Tribunal',
    text: 'Los <strong>árbitros titulares</strong> y el <strong>secretario</strong> son fijos para todos los expedientes del tribunal. Si corresponde, podés designar hasta 3 <strong>árbitros suplentes</strong> ingresando sus nombres.',
    attachTo: { element: '#tour-nueva-tribunal', on: 'top' },
  });
  s({
    id: 'new-demanda',
    title: 'Adjunto de la Demanda',
    text: 'Subí el <strong>PDF de la demanda</strong> arrastrándolo o haciendo clic. El sistema intentará extraer automáticamente la carátula y la fecha del documento para completar los campos del formulario.',
    attachTo: { element: '#tour-nueva-demanda', on: 'top' },
  });
  s({
    id: 'new-sujetos',
    title: 'Sujetos Involucrados',
    text: 'Cargá al menos el <strong>Actor</strong> y el <strong>Demandado</strong>. Podés agregar terceros (peritos, testigos, patrocinantes) con el botón Agregar sujeto. Para cada uno podés registrar CUIT, domicilio real y domicilio electrónico.',
    attachTo: { element: '#tour-nueva-sujetos', on: 'top' },
  });
  s({
    id: 'new-enviar',
    title: 'Crear Expediente',
    text: 'Una vez completados todos los datos, hacé clic en <strong>Crear Expediente</strong>. Serás redirigido automáticamente al detalle del expediente recién creado, donde podrás empezar a cargar movimientos.',
    attachTo: { element: '#tour-nueva-enviar', on: 'top' },
  });
}

// ─── Paso final con referencia al soporte ────────────────────────────────────

function addPasoFinal(tour: TourInstance, navigate: NavigateFn | null, navigateTo?: string) {
  makeStep(tour, navigate, {
    id: 'fin-soporte',
    title: '¡Ya conocés el sistema!',
    text: 'Si tenés dudas o necesitás ayuda, contactate con el equipo de soporte IT. Y si querés volver a ver este tutorial en cualquier momento, hacé clic en el enlace de <strong>Soporte</strong> que está aquí abajo en el pie de página.',
    attachTo: { element: '#tour-soporte', on: 'top' },
    navigateTo,
    isLast: true,
  });
}

// ─── Tour principal por rol ──────────────────────────────────────────────────

function buildMainTour(role: Role, navigate: NavigateFn): TourInstance {
  const tour = makeTour();
  const s = (opts: Parameters<typeof makeStep>[2]) => makeStep(tour, navigate, opts);

  switch (role) {
    case 'secretario':
      s({
        id: 'sec-bienvenida',
        title: '¡Bienvenido/a al sistema!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Te vamos a guiar por todas las funciones disponibles para que puedas empezar a trabajar enseguida.',
      });
      s({
        id: 'sec-stats',
        title: 'Resumen del Tribunal',
        text: 'Acá tenés un pantallazo del estado general: total de expedientes, cuántos están iniciados, en proceso o cerrados, y la cantidad de usuarios con aprobación pendiente.',
        attachTo: { element: '#tour-stats', on: 'bottom' },
        navigateTo: '/dashboard',
      });
      s({
        id: 'sec-graficos',
        title: 'Estadísticas',
        text: 'Estos gráficos muestran la distribución de expedientes por estado y la cantidad de expedientes iniciados en los últimos meses. Muy útil para tener una visión general de la actividad del tribunal.',
        attachTo: { element: '#tour-graficos', on: 'top' },
      });
      s({
        id: 'sec-recientes',
        title: 'Actividad Reciente',
        text: 'Muestra los últimos expedientes con actividad. Hacé clic en cualquiera para abrirlo directamente.',
        attachTo: { element: '#tour-recientes', on: 'top' },
      });
      s({
        id: 'sec-expedientes',
        title: 'Panel de Expedientes',
        text: 'Acá encontrás <strong>todos los expedientes del tribunal</strong>. Podés ver número electrónico, carátula, tribunal, árbitros asignados y la fecha del último movimiento.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'sec-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador para encontrar expedientes por carátula, número o tribunal. El selector de estado filtra por iniciados, en proceso o cerrados.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      addNuevaCausaPasos(tour, navigate);
      s({
        id: 'sec-admin',
        title: 'Administración de Usuarios',
        text: 'Desde el panel de administración aprobás nuevos usuarios que se registran, los asignás como parte actora o demandada en expedientes, y gestionás sus accesos. Es la función más importante de tu rol.',
        attachTo: { element: '#tour-nav-admin', on: 'bottom' },
        navigateTo: '/causas',
      });
      addPasoFinal(tour, navigate, '/causas');
      break;

    case 'actor':
      s({
        id: 'act-bienvenida',
        title: '¡Bienvenido/a!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Desde acá vas a poder gestionar tus expedientes como parte actora.',
      });
      s({
        id: 'act-expedientes',
        title: 'Mis Expedientes',
        text: 'Aparecen <strong>únicamente los expedientes donde sos parte actora</strong>. Podés ver el estado de cada uno y la fecha del último movimiento.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'act-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador para encontrar un expediente por carátula o número, y el filtro de estado para ver solo los activos o los ya cerrados.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      addNuevaCausaPasos(tour, navigate);
      addPasoFinal(tour, navigate, '/causas');
      break;

    case 'arbitro':
      s({
        id: 'arb-bienvenida',
        title: '¡Bienvenido/a, Árbitro!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Como árbitro tenés acceso a todos los expedientes del tribunal.',
      });
      s({
        id: 'arb-stats',
        title: 'Dashboard del Tribunal',
        text: 'El dashboard muestra el estado general: cuántos expedientes hay en total y cómo se distribuyen por estado.',
        attachTo: { element: '#tour-stats', on: 'bottom' },
        navigateTo: '/dashboard',
      });
      s({
        id: 'arb-graficos',
        title: 'Estadísticas',
        text: 'Gráficos de distribución por estado y actividad mensual para seguir la evolución del trabajo del tribunal.',
        attachTo: { element: '#tour-graficos', on: 'top' },
      });
      s({
        id: 'arb-recientes',
        title: 'Expedientes Recientes',
        text: 'Los expedientes con actividad más reciente. Hacé clic en cualquiera para abrirlo.',
        attachTo: { element: '#tour-recientes', on: 'top' },
      });
      s({
        id: 'arb-expedientes',
        title: 'Todos los Expedientes',
        text: 'Tenés <strong>visibilidad sobre todos los expedientes del tribunal</strong>. Podés consultar estado, movimientos y documentación de cada uno.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'arb-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador y los filtros para encontrar rápidamente el expediente que necesitás.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      addPasoFinal(tour, navigate, '/causas');
      break;

    case 'demandado':
      s({
        id: 'dem-bienvenida',
        title: '¡Bienvenido/a!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Desde acá podés consultar los expedientes en los que figurás como demandado.',
      });
      s({
        id: 'dem-expedientes',
        title: 'Mis Expedientes',
        text: 'Aparecen <strong>únicamente los expedientes en los que figurás como demandado</strong>. Podés ver el estado actual y la fecha del último movimiento.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'dem-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Usá el buscador para encontrar un expediente específico o filtrá por estado.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      addPasoFinal(tour, navigate, '/causas');
      break;

    case 'perito':
      s({
        id: 'per-bienvenida',
        title: '¡Bienvenido/a, Perito!',
        text: 'Este es el <strong>Expediente Electrónico del Tribunal Arbitral BCM</strong>. Como perito tenés acceso de consulta a los expedientes.',
      });
      s({
        id: 'per-expedientes',
        title: 'Expedientes Disponibles',
        text: 'Desde acá podés ver y buscar los expedientes disponibles para consulta.',
        attachTo: { element: '#tour-expedientes', on: 'bottom-start' },
        navigateTo: '/causas',
      });
      s({
        id: 'per-filtros',
        title: 'Búsqueda y Filtros',
        text: 'Buscá por carátula, número o filtrá por estado para localizar el expediente que necesitás.',
        attachTo: { element: '#tour-filtros', on: 'bottom' },
      });
      addPasoFinal(tour, navigate, '/causas');
      break;

    default:
      break;
  }

  return tour;
}

// ─── Mini-tour del detalle de expediente ────────────────────────────────────

function buildDetalleTour(role: Role): TourInstance {
  const tour = makeTour();
  const s = (opts: Parameters<typeof makeStep>[2]) => makeStep(tour, null, opts);

  s({
    id: 'det-intro',
    title: 'Detalle del Expediente',
    text: 'Estás viendo el detalle completo de un expediente. Te mostramos brevemente cada sección disponible.',
  });
  addDetallePasos(tour, null, role);
  makeStep(tour, null, {
    id: 'det-fin',
    title: '¡Listo!',
    text: 'Ya conocés todas las secciones del expediente. Podés volver a este tutorial en cualquier momento desde el enlace de <strong>Soporte</strong> en el pie de página.',
    attachTo: { element: '#tour-soporte', on: 'top' },
    isLast: true,
  });

  return tour;
}

// ─── Hook público ─────────────────────────────────────────────────────────────

export function useTour() {
  function startTour(userId: string, role: Role, navigate: NavigateFn) {
    if (localStorage.getItem(STORAGE_KEY(userId))) return;
    const tour = buildMainTour(role, navigate);
    if (tour.steps.length > 0) {
      wireStorage(tour, STORAGE_KEY(userId));
      tour.start();
    }
  }

  function resetAndStartTour(userId: string, role: Role, navigate: NavigateFn) {
    localStorage.removeItem(STORAGE_KEY(userId));
    localStorage.removeItem(DETALLE_STORAGE_KEY(userId));
    const tour = buildMainTour(role, navigate);
    if (tour.steps.length > 0) {
      wireStorage(tour, STORAGE_KEY(userId));
      tour.start();
    }
  }

  function startDetalleTour(userId: string, role: Role) {
    if (localStorage.getItem(DETALLE_STORAGE_KEY(userId))) return;
    const tour = buildDetalleTour(role);
    if (tour.steps.length > 0) {
      wireStorage(tour, DETALLE_STORAGE_KEY(userId));
      tour.start();
    }
  }

  return { startTour, resetAndStartTour, startDetalleTour };
}
