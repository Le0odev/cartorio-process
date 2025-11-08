// Cores para status de pagamento - define cor da linha
export const STATUS_PAGAMENTO_COLORS = {
  'PAGO': 'bg-green-100 text-green-800 border-green-200',
  'A GERAR': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'GERADO': 'bg-blue-100 text-blue-800 border-blue-200',
  'NÃO ENVIADO': 'bg-red-100 text-red-800 border-red-200',
} as const;

// Cores para status de escritura - mostra estágio do processo
export const STATUS_ESCRITURA_COLORS = {
  'PRONTA': 'bg-green-100 text-green-800 border-green-200',
  'EM TRAMITAÇÃO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'INVENTÁRIO': 'bg-purple-100 text-purple-800 border-purple-200',
  'NÃO ENVIADO': 'bg-red-100 text-red-800 border-red-200',
} as const;

// Cores das linhas da tabela baseadas no status de pagamento
export const ROW_COLORS = {
  'PAGO': 'table-status-green',
  'A GERAR': 'table-status-yellow',
  'GERADO': 'table-status-blue',
  'NÃO ENVIADO': 'table-status-red',
} as const;

// Cores para RGI entrega
export const RGI_ENTREGA_COLORS = {
  'Sim': 'bg-green-100 text-green-800 border-green-200',
  'Não': 'bg-red-100 text-red-800 border-red-200',
  'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
} as const;

// Cores para status de corretor
export const CORRETOR_STATUS_COLORS = {
  'ativo': 'bg-green-100 text-green-800 border-green-200',
  'inativo': 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

// Função helper para obter cor por status
export const getStatusColor = (status: string, type: 'pagamento' | 'escritura' | 'rgi' | 'corretor') => {
  switch (type) {
    case 'pagamento':
      return STATUS_PAGAMENTO_COLORS[status as keyof typeof STATUS_PAGAMENTO_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
    case 'escritura':
      return STATUS_ESCRITURA_COLORS[status as keyof typeof STATUS_ESCRITURA_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rgi':
      return RGI_ENTREGA_COLORS[status as keyof typeof RGI_ENTREGA_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
    case 'corretor':
      return CORRETOR_STATUS_COLORS[status as keyof typeof CORRETOR_STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};