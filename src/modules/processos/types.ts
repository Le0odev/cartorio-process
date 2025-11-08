import { Timestamp } from 'firebase/firestore';

// Tipos baseados exatamente na lógica de negócio das escrituras cartorárias
export interface Processo {
  id?: string;
  talao: string; // Identificador único físico (T0001, T0002...)
  statusPagamento: StatusPagamento;
  statusEscritura: StatusEscritura;
  rgiEntrega: string; // Registro, matrícula ou data de entrega
  natureza: string; // Tipo de escritura
  edificioAdquirenteResponsavel: string; // Campo multifuncional
  valorEmolumentos: number; // Valor de custas e taxas
  valorCorretor: number; // Valor da comissão do corretor
  valorAssessoria: number; // Valor da assessoria
  numeroSicase: string; // Identificador único do sistema jurídico
  mesReferencia?: string; // Mês de referência (ex: "AGOSTO - 2025", "SETEMBRO - 2025")
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
  historico?: HistoricoItem[];
}

export interface HistoricoItem {
  id: string;
  data: Timestamp;
  acao: string;
  usuario: string;
  campo_alterado?: string;
  valor_anterior?: any;
  valor_novo?: any;
  observacoes?: string;
}

export interface Corretor {
  id?: string;
  nome: string;
  contato: string;
  email?: string;
  status: 'ativo' | 'inativo';
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

export interface Assessoria {
  id?: string;
  nome: string;
  contato: string;
  email?: string;
  endereco?: string;
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

export interface Natureza {
  id?: string;
  nome: string;
  descricao?: string;
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

// Tipos para indicadores em tempo real
export interface Indicadores {
  total_processos: number;
  total_emolumentos: number;
  total_pago: number;
  total_pendente: number;
  processos_por_status: Record<string, number>;
  processos_por_corretor: Record<string, number>;
  processos_por_assessoria: Record<string, number>;
  processos_por_natureza: Record<string, number>;
  ultima_atualizacao: string;
}

// Tipos para filtros e busca
export interface ProcessoFiltros {
  statusPagamento?: StatusPagamento;
  statusEscritura?: StatusEscritura;
  corretor?: string;
  assessoria?: string;
  natureza?: string;
  dataInicio?: Date;
  dataFim?: Date;
  valorMin?: number;
  valorMax?: number;
}

// Tipos para paginação
export interface ProcessosPaginatedResult {
  processos: Processo[];
  lastDoc: any; // DocumentSnapshot do Firestore
  hasMore: boolean;
  total?: number;
}

// Tipos para formulários
export interface ProcessoFormData {
  talao: string;
  statusPagamento: StatusPagamento;
  statusEscritura: StatusEscritura;
  rgiEntrega: string;
  natureza: string;
  edificioAdquirenteResponsavel: string;
  valorEmolumentos: number;
  valorCorretor: number;
  valorAssessoria: number;
  numeroSicase: string;
}

// Tipo para criação de novo processo com valores padrão
export interface NovoProcessoData {
  talao?: string; // Será gerado automaticamente se não fornecido
  statusPagamento?: StatusPagamento; // Padrão: A_GERAR
  statusEscritura?: StatusEscritura; // Padrão: EM_TRAMITACAO
  rgiEntrega: string;
  natureza: string;
  edificioAdquirenteResponsavel: string;
  valorEmolumentos: number;
  valorCorretor: number;
  valorAssessoria: number;
  numeroSicase: string;
}

// Enums para valores fixos conforme regras de negócio
export const STATUS_PAGAMENTO = {
  PAGO: 'Pago',
  A_GERAR: 'A gerar',
  GERADO: 'Gerado',
  NAO_ENVIADO: 'Não enviado'
} as const;

export const STATUS_ESCRITURA = {
  PRONTA: 'Pronta',
  LAVRADA: 'Lavrada',
  EM_TRAMITACAO: 'Em tramitação',
  ENVIADA: 'Enviada',
  INVENTARIO: 'Inventário',
  NAO_ENVIADO: 'Não enviado'
} as const;

// Naturezas comuns de escrituras
export const NATUREZAS_PADRAO = [
  'Compra e Venda',
  'Doação',
  'Inventário',
  'Permuta',
  'Hipoteca',
  'Dação em Pagamento',
  'Usucapião'
] as const;

export type StatusPagamento = typeof STATUS_PAGAMENTO[keyof typeof STATUS_PAGAMENTO];
export type StatusEscritura = typeof STATUS_ESCRITURA[keyof typeof STATUS_ESCRITURA];