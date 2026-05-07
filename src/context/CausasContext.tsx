import { createContext, useContext, useState } from 'react';

export type SujetoVinculo = 'ACTOR' | 'DEMANDADO' | 'TERCERO';

export type Sujeto = {
  vinculo: SujetoVinculo;
  nombre: string;
  representante?: string;
  domicilio?: string;
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
  juez: string;
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
};

const CausasContext = createContext<CausasContextType | null>(null);

const seedMovimientos: Movimiento[] = [
  { id: 'm1', fecha: '16/04/2026 12:51:23', tipo: 'ACT', titulo: 'PAGO DIRECTO', numero: '1052918378', tribunal: '020401 | CAMARAS DEL TRABAJO-PRIMERA - 2DA CIRC.', acceso: 'Lista diaria: 17/04/2026', relaciones: true },
  { id: 'm2', fecha: '16/04/2026 11:32:42', tipo: 'ESC', titulo: 'Presenta Factura - Solicita transferencia', numero: '10894425', tribunal: 'Paula Marcela LLugany - SCJ', acceso: 'Escrito Público', adjuntos: true, relaciones: true },
  { id: 'm3', fecha: '10/04/2026 9:53:47', tipo: 'ACT', titulo: 'DOCUMENTACION PAGO DIRECTO', numero: '1052860126', tribunal: '020401 | CAMARAS DEL TRABAJO-PRIMERA - 2DA CIRC.', acceso: 'Lista diaria: 13/04/2026', relaciones: true },
  { id: 'm4', fecha: '09/04/2026 19:11:02', tipo: 'ESC', titulo: 'Denuncia datos - Solicita transferencia', numero: '10868161', tribunal: 'Paula Marcela LLugany - SCJ', acceso: 'Escrito Público', relaciones: true },
  { id: 'm5', fecha: '09/04/2026 8:48:59', tipo: 'ACT', titulo: 'CONSTANCIA DE NOTIFICACIÓN', numero: '1052843985', tribunal: '020401 | CAMARAS DEL TRABAJO-PRIMERA - 2DA CIRC.', acceso: 'Lista diaria: 10/04/2026' },
];

const seedSujetos: Sujeto[] = [
  { vinculo: 'DEMANDADO', nombre: 'LOS GASCONES SA', representante: 'Ver Representantes', domicilio: 'Ver domicilios' },
  { vinculo: 'ACTOR', nombre: 'GIMENEZ FERNANDO RUBEN', representante: 'ABOGADO/A: PALLARES JULIO FEDERICO', domicilio: 'Ver domicilios' },
];

const seedExpediente: Expediente = {
  nroExpediente: 'EXP-2026-001',
  caratula: 'GIMENEZ FERNANDO RUBEN C/ LOS GASCONES SA P/ DESPIDO',
  fechaPresentacion: '16/04/2026',
  fechaInicio: '09/04/2026',
  ultimoMovimiento: '16/04/2026',
  objetoJuicio: 'Despido',
  montoDisputa: '$1.500.000',
  sujetos: seedSujetos,
  movimientos: seedMovimientos,
  comentarios: [],
};

const seedCausa: Causa = {
  id: 'CAU-001',
  identificador: '13-07863500-7',
  numeroInterno: '33269',
  caratula: 'GIMENEZ FERNANDO RUBEN C/ LOS GASCONES SA P/ DESPIDO',
  tribunal: 'CAMARAS DEL TRABAJO-PRIMERA - 2DA CIRC.-SEGUNDA',
  juez: 'DR DANTE CARLOS GRANADOS',
  fechaPresentacion: '09/04/2026',
  fechaInicio: '09/04/2026',
  ultimoMovimiento: '16/04/2026',
  objetoJuicio: 'Despido',
  sujetos: seedSujetos,
  expedientes: [seedExpediente],
  causasRelacionadas: [
    { identificador: '13-07863200-1', caratula: 'GIMENEZ FERNANDO RUBEN C/ LOS GASCONES SA P/ MEDIDA CAUTELAR', tribunal: 'CAMARAS DEL TRABAJO-PRIMERA' },
  ],
};

export function CausasProvider({ children }: { children: React.ReactNode }) {
  const [causas, setCausas] = useState<Causa[]>([seedCausa]);

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

  return (
    <CausasContext.Provider value={{ causas, getCausa, addCausa, addExpediente, addComentario }}>
      {children}
    </CausasContext.Provider>
  );
}

export const useCausas = () => {
  const ctx = useContext(CausasContext);
  if (!ctx) throw new Error('useCausas must be used within CausasProvider');
  return ctx;
};
