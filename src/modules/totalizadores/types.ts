import { Timestamp } from 'firebase/firestore';

/**
 * Interface para Totalizador
 * Armazena valores agregados de processos por mês ou totais gerais
 */
export interface Totalizador {
  mesReferencia: string; // Ex: "AGOSTO - 2025", "SETEMBRO - 2025", ou "GERAL"
  totalEmolumentos: number; // Valor em centavos
  totalCorretor: number; // Valor em centavos
  totalAssessoria: number; // Valor em centavos
  totalPagamento: number; // Valor em centavos
  quantidadeProcessos: number;
  dataAtualizacao: Timestamp;
}

/**
 * Constantes para identificadores especiais de totalizadores
 */
export const TOTALIZADOR_GERAL_ID = 'GERAL' as const;

/**
 * Tipo para resultado de recalculo de totalizadores
 */
export interface RecalculoResult {
  mesReferencia: string;
  totalizador: Totalizador;
  processosContados: number;
}
