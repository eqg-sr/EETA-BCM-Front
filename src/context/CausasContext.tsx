import { createContext, useContext, useState } from 'react';

export type SujetoVinculo = 'ACTOR' | 'DEMANDADO' | 'TERCERO';

export type Sujeto = {
  vinculo: SujetoVinculo;
  nombre: string;
  representante?: string;
  domicilio?: string;
  domicilioElectronico?: string;
};

export type MovimientoTipo = 'ACT' | 'ESC' | 'CED' | 'MOV' | 'COMENTARIO';

export type Movimiento = {
  id: string;
  fecha: string;
  tipo: MovimientoTipo;
  titulo: string;
  numero?: string;
  tribunal?: string;
  presentante?: string;
  acceso?: string;
  adjuntos?: boolean;
  relaciones?: boolean;
};

export type Comentario = {
  id: string;
  autor: string;
  rol: string;
  fecha: string;
  texto: string;
};

export type Expediente = {
  nroExpediente: string;
  caratula: string;
  fechaPresentacion: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  objetoJuicio: string;
  montoDisputa?: string;
  sujetos: Sujeto[];
  movimientos: Movimiento[];
  comentarios: Comentario[];
  adjuntoNombre?: string;
};

export type CausaRelacionada = {
  identificador: string;
  caratula: string;
  tribunal: string;
};

export type Causa = {
  id: string;
  identificador: string;
  numeroInterno: string;
  caratula: string;
  tribunal: string;
  arbitro: string;
  fechaPresentacion: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  objetoJuicio: string;
  sujetos: Sujeto[];
  expedientes: Expediente[];
  causasRelacionadas: CausaRelacionada[];
};

type CausasContextType = {
  causas: Causa[];
  getCausa: (id: string) => Causa | undefined;
  addCausa: (c: Causa) => void;
  addExpediente: (causaId: string, exp: Expediente) => void;
  addComentario: (causaId: string, nroExp: string, comentario: Comentario) => void;
  addMovimiento: (causaId: string, nroExp: string, mov: Movimiento) => void;
};

const CausasContext = createContext<CausasContextType | null>(null);

const TRIBUNAL = 'TRIBUNAL ARBITRAL BCM';

// === Causa 1: Compraventa de uva — incumplimiento ===
const sujetos1: Sujeto[] = [
  { vinculo: 'ACTOR', nombre: 'VIÑEDOS DEL VALLE S.A.', representante: 'DR. MARTÍN RODRÍGUEZ ESCALANTE', domicilio: 'Av. San Martín 1245, Mendoza', domicilioElectronico: 'mrodriguez@estudio-rye.com.ar' },
  { vinculo: 'DEMANDADO', nombre: 'AGROEXPORT CUYO S.R.L.', representante: 'DRA. LUCÍA FERREYRA', domicilio: 'Belgrano 2380, Godoy Cruz', domicilioElectronico: 'lferreyra@ferreyra-asoc.com.ar' },
];

const movs1: Movimiento[] = [
  { id: 'c1-m1', fecha: '24/04/2026 10:42:18', tipo: 'ACT', titulo: 'AUDIENCIA PRELIMINAR – ACTA', numero: 'AC-2026-00482', tribunal: TRIBUNAL, presentante: 'Secretaría', acceso: 'Acta pública', relaciones: true },
  { id: 'c1-m2', fecha: '22/04/2026 16:08:55', tipo: 'ESC', titulo: 'Contesta demanda y opone excepciones', numero: 'ES-2026-01093', tribunal: TRIBUNAL, presentante: 'Dra. Ferreyra', acceso: 'Escrito de parte', adjuntos: true, relaciones: true },
  { id: 'c1-m3', fecha: '15/04/2026 09:21:03', tipo: 'CED', titulo: 'Cédula de notificación traslado de demanda', numero: 'CD-2026-00318', tribunal: TRIBUNAL, presentante: 'Notificaciones', acceso: 'Cédula electrónica', adjuntos: true },
  { id: 'c1-m4', fecha: '12/04/2026 14:55:40', tipo: 'ACT', titulo: 'DESIGNACIÓN DE ÁRBITRO ÚNICO', numero: 'AC-2026-00461', tribunal: TRIBUNAL, presentante: 'Cámara Arbitral', acceso: 'Resolución', relaciones: true },
  { id: 'c1-m5', fecha: '08/04/2026 11:14:22', tipo: 'ESC', titulo: 'Promueve demanda arbitral – acompaña prueba documental', numero: 'ES-2026-01005', tribunal: TRIBUNAL, presentante: 'Dr. Rodríguez Escalante', acceso: 'Escrito de parte', adjuntos: true },
];

const expediente1: Expediente = {
  nroExpediente: 'EXP-BCM-2026-014',
  caratula: 'VIÑEDOS DEL VALLE S.A. C/ AGROEXPORT CUYO S.R.L. P/ INCUMPLIMIENTO DE CONTRATO DE COMPRAVENTA',
  fechaPresentacion: '08/04/2026',
  fechaInicio: '08/04/2026',
  ultimoMovimiento: '24/04/2026',
  objetoJuicio: 'Incumplimiento contractual',
  montoDisputa: '$ 28.450.000',
  sujetos: sujetos1,
  movimientos: movs1,
  comentarios: [],
};

const causa1: Causa = {
  id: 'CAU-2026-014',
  identificador: 'BCM-2026-00014',
  numeroInterno: '00214',
  caratula: 'VIÑEDOS DEL VALLE S.A. C/ AGROEXPORT CUYO S.R.L. P/ INCUMPLIMIENTO DE CONTRATO DE COMPRAVENTA',
  tribunal: 'TRIBUNAL ARBITRAL BCM – SALA COMERCIAL',
  arbitro: 'DRA. ANALÍA PÉREZ DE OLIVERA',
  fechaPresentacion: '08/04/2026',
  fechaInicio: '08/04/2026',
  ultimoMovimiento: '24/04/2026',
  objetoJuicio: 'Incumplimiento contractual',
  sujetos: sujetos1,
  expedientes: [expediente1],
  causasRelacionadas: [
    { identificador: 'BCM-2026-00009', caratula: 'VIÑEDOS DEL VALLE S.A. C/ AGROEXPORT CUYO S.R.L. P/ MEDIDA CAUTELAR PREVIA', tribunal: 'TRIBUNAL ARBITRAL BCM – SALA COMERCIAL' },
  ],
};

// === Causa 2: Disputa societaria ===
const sujetos2: Sujeto[] = [
  { vinculo: 'ACTOR', nombre: 'INVERSIONES ANDINAS S.A.', representante: 'DR. JAVIER MOYANO', domicilio: '9 de Julio 985, Ciudad de Mendoza', domicilioElectronico: 'jmoyano@moyano-legal.com.ar' },
  { vinculo: 'DEMANDADO', nombre: 'BODEGAS LOS CERROS S.A.', representante: 'DRA. CECILIA AGUIRRE', domicilio: 'Ruta 60 Km 12, Luján de Cuyo', domicilioElectronico: 'caguirre@aguirre-abogados.com.ar' },
  { vinculo: 'TERCERO', nombre: 'ESTUDIO CONTABLE LATORRE & ASOC.', representante: 'CR. RAÚL LATORRE', domicilio: 'Patricias Mendocinas 460, Mendoza', domicilioElectronico: 'rlatorre@latorre-contadores.com.ar' },
];

const movs2: Movimiento[] = [
  { id: 'c2-m1', fecha: '02/05/2026 17:30:12', tipo: 'ACT', titulo: 'PROVIDENCIA – APERTURA A PRUEBA', numero: 'AC-2026-00521', tribunal: TRIBUNAL, presentante: 'Secretaría', acceso: 'Resolución', relaciones: true },
  { id: 'c2-m2', fecha: '28/04/2026 13:05:44', tipo: 'ESC', titulo: 'Ofrece prueba pericial contable', numero: 'ES-2026-01184', tribunal: TRIBUNAL, presentante: 'Dr. Moyano', acceso: 'Escrito de parte', adjuntos: true },
  { id: 'c2-m3', fecha: '20/04/2026 10:18:09', tipo: 'ESC', titulo: 'Contesta demanda – reconvención por daños', numero: 'ES-2026-01122', tribunal: TRIBUNAL, presentante: 'Dra. Aguirre', acceso: 'Escrito de parte', adjuntos: true, relaciones: true },
  { id: 'c2-m4', fecha: '11/04/2026 09:48:33', tipo: 'CED', titulo: 'Cédula de notificación – traslado de demanda', numero: 'CD-2026-00372', tribunal: TRIBUNAL, presentante: 'Notificaciones', acceso: 'Cédula electrónica' },
];

const expediente2: Expediente = {
  nroExpediente: 'EXP-BCM-2026-021',
  caratula: 'INVERSIONES ANDINAS S.A. C/ BODEGAS LOS CERROS S.A. P/ CONFLICTO SOCIETARIO',
  fechaPresentacion: '04/04/2026',
  fechaInicio: '04/04/2026',
  ultimoMovimiento: '02/05/2026',
  objetoJuicio: 'Conflicto societario',
  montoDisputa: '$ 64.200.000',
  sujetos: sujetos2,
  movimientos: movs2,
  comentarios: [],
};

const causa2: Causa = {
  id: 'CAU-2026-021',
  identificador: 'BCM-2026-00021',
  numeroInterno: '00221',
  caratula: 'INVERSIONES ANDINAS S.A. C/ BODEGAS LOS CERROS S.A. P/ CONFLICTO SOCIETARIO',
  tribunal: 'TRIBUNAL ARBITRAL BCM – SALA SOCIETARIA',
  arbitro: 'DR. FERNANDO ARIAS LAGOS',
  fechaPresentacion: '04/04/2026',
  fechaInicio: '04/04/2026',
  ultimoMovimiento: '02/05/2026',
  objetoJuicio: 'Conflicto societario',
  sujetos: sujetos2,
  expedientes: [expediente2],
  causasRelacionadas: [],
};

// === Causa 3: Resolución contractual y daños ===
const sujetos3: Sujeto[] = [
  { vinculo: 'ACTOR', nombre: 'CONSTRUCTORA CUYANA S.A.', representante: 'DR. NICOLÁS BUSTOS', domicilio: 'Pedro Molina 750, Mendoza', domicilioElectronico: 'nbustos@bustos-legal.com.ar' },
  { vinculo: 'DEMANDADO', nombre: 'DESARROLLOS URBANOS DEL OESTE S.A.', representante: 'DRA. PATRICIA QUIROGA', domicilio: 'Av. Boulogne Sur Mer 1380, Las Heras', domicilioElectronico: 'pquiroga@quiroga-abogados.com.ar' },
];

const movs3: Movimiento[] = [
  { id: 'c3-m1', fecha: '05/05/2026 18:12:01', tipo: 'ACT', titulo: 'AUDIENCIA DE CONCILIACIÓN – SIN ACUERDO', numero: 'AC-2026-00540', tribunal: TRIBUNAL, presentante: 'Secretaría', acceso: 'Acta pública' },
  { id: 'c3-m2', fecha: '30/04/2026 11:42:55', tipo: 'ESC', titulo: 'Acompaña dictamen pericial técnico', numero: 'ES-2026-01210', tribunal: TRIBUNAL, presentante: 'Ing. Hugo Domínguez (perito)', acceso: 'Escrito de parte', adjuntos: true, relaciones: true },
  { id: 'c3-m3', fecha: '18/04/2026 15:20:48', tipo: 'ESC', titulo: 'Contesta demanda', numero: 'ES-2026-01098', tribunal: TRIBUNAL, presentante: 'Dra. Quiroga', acceso: 'Escrito de parte', adjuntos: true },
];

const expediente3: Expediente = {
  nroExpediente: 'EXP-BCM-2026-027',
  caratula: 'CONSTRUCTORA CUYANA S.A. C/ DESARROLLOS URBANOS DEL OESTE S.A. P/ RESOLUCIÓN DE CONTRATO Y DAÑOS',
  fechaPresentacion: '02/04/2026',
  fechaInicio: '02/04/2026',
  ultimoMovimiento: '05/05/2026',
  objetoJuicio: 'Resolución contractual',
  montoDisputa: '$ 112.800.000',
  sujetos: sujetos3,
  movimientos: movs3,
  comentarios: [],
};

const causa3: Causa = {
  id: 'CAU-2026-027',
  identificador: 'BCM-2026-00027',
  numeroInterno: '00227',
  caratula: 'CONSTRUCTORA CUYANA S.A. C/ DESARROLLOS URBANOS DEL OESTE S.A. P/ RESOLUCIÓN DE CONTRATO Y DAÑOS',
  tribunal: 'TRIBUNAL ARBITRAL BCM – SALA COMERCIAL',
  arbitro: 'DRA. ANALÍA PÉREZ DE OLIVERA',
  fechaPresentacion: '02/04/2026',
  fechaInicio: '02/04/2026',
  ultimoMovimiento: '05/05/2026',
  objetoJuicio: 'Resolución contractual',
  sujetos: sujetos3,
  expedientes: [expediente3],
  causasRelacionadas: [
    { identificador: 'BCM-2026-00018', caratula: 'CONSTRUCTORA CUYANA S.A. C/ DESARROLLOS URBANOS DEL OESTE S.A. P/ MEDIDA CAUTELAR – EMBARGO PREVENTIVO', tribunal: 'TRIBUNAL ARBITRAL BCM – SALA COMERCIAL' },
  ],
};

export function CausasProvider({ children }: { children: React.ReactNode }) {
  const [causas, setCausas] = useState<Causa[]>([causa1, causa2, causa3]);

  const getCausa = (id: string) => causas.find((c) => c.id === id);

  const addCausa = (c: Causa) => setCausas((prev) => [...prev, c]);

  const addExpediente = (causaId: string, exp: Expediente) =>
    setCausas((prev) =>
      prev.map((c) =>
        c.id === causaId
          ? { ...c, expedientes: [...c.expedientes, exp], ultimoMovimiento: exp.ultimoMovimiento }
          : c
      )
    );

  const addComentario = (causaId: string, nroExp: string, comentario: Comentario) =>
    setCausas((prev) =>
      prev.map((c) => {
        if (c.id !== causaId) return c;
        return {
          ...c,
          ultimoMovimiento: comentario.fecha,
          expedientes: c.expedientes.map((e) => {
            if (e.nroExpediente !== nroExp) return e;
            const movimientoComentario: Movimiento = {
              id: comentario.id,
              fecha: comentario.fecha,
              tipo: 'COMENTARIO',
              titulo: `Comentario de ${comentario.autor} (${comentario.rol})`,
              tribunal: 'TRIBUNAL ARBITRAL BCM',
              presentante: comentario.autor,
              acceso: 'Movimiento interno',
            };
            return {
              ...e,
              comentarios: [...e.comentarios, comentario],
              movimientos: [movimientoComentario, ...e.movimientos],
              ultimoMovimiento: comentario.fecha,
            };
          }),
        };
      })
    );

  const addMovimiento = (causaId: string, nroExp: string, mov: Movimiento) =>
    setCausas((prev) =>
      prev.map((c) => {
        if (c.id !== causaId) return c;
        return {
          ...c,
          ultimoMovimiento: mov.fecha,
          expedientes: c.expedientes.map((e) =>
            e.nroExpediente === nroExp
              ? { ...e, movimientos: [mov, ...e.movimientos], ultimoMovimiento: mov.fecha }
              : e
          ),
        };
      })
    );

  return (
    <CausasContext.Provider value={{ causas, getCausa, addCausa, addExpediente, addComentario, addMovimiento }}>
      {children}
    </CausasContext.Provider>
  );
}

export const useCausas = () => {
  const ctx = useContext(CausasContext);
  if (!ctx) throw new Error('useCausas must be used within CausasProvider');
  return ctx;
};
