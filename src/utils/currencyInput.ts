/**
 * Converte input do usuário para centavos
 * 
 * REGRA SIMPLES:
 * - PONTO (.) = sempre separador de milhares → remove
 * - VÍRGULA (,) = sempre decimal → troca por ponto
 * 
 * Exemplos:
 * - "10000" → 10000 → 1.000.000 centavos → R$ 10.000,00
 * - "10.000" → 10000 → 1.000.000 centavos → R$ 10.000,00
 * - "10,50" → 10.50 → 1.050 centavos → R$ 10,50
 * - "10.000,50" → 10000.50 → 1.000.050 centavos → R$ 10.000,50
 * - "1.500.000" → 1500000 → 150.000.000 centavos → R$ 1.500.000,00
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  
  // Remove tudo exceto números, pontos e vírgulas
  let cleaned = value.replace(/[^\d.,]/g, '');
  
  // Se não tem nada, retorna 0
  if (!cleaned) return 0;
  
  // SEMPRE: remove pontos (milhares) e troca vírgula por ponto (decimal)
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  
  const numValue = parseFloat(cleaned) || 0;
  return Math.round(numValue * 100);
}

/**
 * Formata centavos para exibição (sem formatação automática para evitar bugs)
 */
export function formatCentsToDisplay(cents: number): string {
  const reais = cents / 100;
  // Formato simples: 1500.27 vira "1500,27"
  return reais.toFixed(2).replace('.', ',');
}
