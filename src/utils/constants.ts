// Coleções do Firestore
export const COLLECTIONS = {
  PROCESSOS: 'processos',
  CORRETORES: 'corretores',
  ASSESSORIAS: 'assessorias',
  NATUREZAS: 'naturezas',
  USUARIOS: 'usuarios',
  TOTALIZADORES: 'totalizadores',
} as const;

// Paths do Realtime Database
export const REALTIME_PATHS = {
  INDICADORES: 'indicadores',
  TOTAIS: 'totais',
  METRICAS: 'metricas',
  LOGS: 'logs',
} as const;

// Status de pagamento - define cor da linha e interfere no somatório
export const STATUS_PAGAMENTO_OPTIONS = [
  { value: 'Pago', label: 'Pago', color: 'green' },
  { value: 'A gerar', label: 'A gerar', color: 'yellow' },
  { value: 'Gerado', label: 'Gerado', color: 'blue' },
  { value: 'Não enviado', label: 'Não enviado', color: 'red' },
] as const;

// Status de escritura - mostra estágio do processo
export const STATUS_ESCRITURA_OPTIONS = [
  { value: 'Pronta', label: 'Pronta', color: 'green' },
  { value: 'Lavrada', label: 'Lavrada', color: 'blue' },
  { value: 'Em tramitação', label: 'Em tramitação', color: 'yellow' },
  { value: 'Enviada', label: 'Enviada', color: 'purple' },
  { value: 'Inventário', label: 'Inventário', color: 'orange' },
  { value: 'Não enviado', label: 'Não enviado', color: 'red' },
] as const;

// Naturezas padrão de escrituras
export const NATUREZAS_OPTIONS = [
  { value: 'COMPRA E VENDA', label: 'Compra e Venda' },
  { value: 'COMPRA E VENDA + CESSÃO', label: 'Compra e Venda + Cessão' },
  { value: 'C/V + USUFRUTO', label: 'C/V + Usufruto' },
  { value: 'DOAÇÃO', label: 'Doação' },
  { value: 'INVENTÁRIO', label: 'Inventário' },
  { value: 'PERMUTA', label: 'Permuta' },
  { value: 'ADJUDICAÇÃO', label: 'Adjudicação' },
  { value: 'USUCAPIÃO', label: 'Usucapião' },
  { value: 'PROCURAÇÃO', label: 'Procuração' },
  { value: 'ATA NOTARIAL', label: 'Ata Notarial' },
  { value: 'CESSÃO HERED.', label: 'Cessão Hereditária' },
  { value: 'NOMEAÇÃO DE INVENTARIANTE', label: 'Nomeação de Inventariante' },
  { value: 'HIPOTECA', label: 'Hipoteca' },
  { value: 'DAÇÃO EM PAGAMENTO', label: 'Dação em Pagamento' },
] as const;

// Status de corretor
export const CORRETOR_STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
] as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Configurações de formatação
export const CURRENCY_FORMAT = {
  locale: 'pt-BR',
  currency: 'BRL',
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Item não encontrado.',
  VALIDATION: 'Dados inválidos. Verifique os campos.',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CREATED: 'Item criado com sucesso!',
  UPDATED: 'Item atualizado com sucesso!',
  DELETED: 'Item excluído com sucesso!',
  SAVED: 'Dados salvos com sucesso!',
} as const;