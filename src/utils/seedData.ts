import { NovoProcessoData, STATUS_PAGAMENTO, STATUS_ESCRITURA, NATUREZAS_PADRAO } from '@/modules/processos/types';

// Dados de exemplo para gerar escrituras realistas
const exemploEdificios = [
  'Edifício Solar dos Ipês - João da Silva - Maria Santos',
  'Residencial Vista Alegre - Carlos Mendes - Ana Paula Costa',
  'Condomínio Jardim das Flores - Roberto Lima - Fernanda Oliveira',
  'Edifício Morada do Sol - Patricia Rocha - José Antonio',
  'Residencial Parque Verde - Marcos Pereira - Lucia Fernandes',
  'Condomínio Bela Vista - Sandra Martins - Paulo Henrique',
  'Edifício Primavera - Claudia Santos - Ricardo Alves',
  'Residencial Águas Claras - Renata Silva - Eduardo Campos',
  'Condomínio Recanto Feliz - Mariana Costa - Thiago Barbosa',
  'Edifício Harmonia - Juliana Rodrigues - Alexandre Nunes'
];

const exemploRGI = [
  'RGI123456',
  'MAT789012',
  'REG345678',
  'RGI901234',
  'MAT567890',
  'REG123789',
  'RGI456123',
  'MAT234567',
  'REG890456',
  'RGI678901'
];

const exemploSicase = [
  'BR-556-XYZ',
  'SP-789-ABC',
  'RJ-123-DEF',
  'MG-456-GHI',
  'RS-789-JKL',
  'PR-012-MNO',
  'SC-345-PQR',
  'BA-678-STU',
  'GO-901-VWX',
  'DF-234-YZA'
];

// Função para gerar valor aleatório dentro de uma faixa
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Função para selecionar item aleatório de um array
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Função para gerar dados de escritura de teste
export const generateTestProcesso = (index: number): NovoProcessoData => {
  const valorEmolumentos = randomBetween(50000, 500000); // R$ 500 a R$ 5.000
  const valorCorretor = Math.floor(valorEmolumentos * (randomBetween(2, 8) / 100)); // 2% a 8% dos emolumentos
  const valorAssessoria = Math.floor(valorEmolumentos * (randomBetween(1, 5) / 100)); // 1% a 5% dos emolumentos

  return {
    statusPagamento: randomItem(Object.values(STATUS_PAGAMENTO)),
    statusEscritura: randomItem(Object.values(STATUS_ESCRITURA)),
    rgiEntrega: exemploRGI[index],
    natureza: randomItem([...NATUREZAS_PADRAO]),
    edificioAdquirenteResponsavel: exemploEdificios[index],
    valorEmolumentos,
    valorCorretor,
    valorAssessoria,
    numeroSicase: exemploSicase[index],
  };
};

// Função para gerar múltiplas escrituras de teste
export const generateMultipleTestProcessos = (count: number = 10): NovoProcessoData[] => {
  return Array.from({ length: count }, (_, index) => generateTestProcesso(index));
};

// Dados específicos para os 10 processos de teste
export const testProcessosData: NovoProcessoData[] = [
  {
    statusPagamento: 'Pago',
    statusEscritura: 'Pronta',
    rgiEntrega: 'RGI123456',
    natureza: 'Compra e Venda',
    edificioAdquirenteResponsavel: 'Edifício Solar dos Ipês - João da Silva - Maria Santos',
    valorEmolumentos: 150000, // R$ 1.500,00
    valorCorretor: 7500, // R$ 75,00
    valorAssessoria: 4500, // R$ 45,00
    numeroSicase: 'BR-556-XYZ',
  },
  {
    statusPagamento: 'A gerar',
    statusEscritura: 'Em tramitação',
    rgiEntrega: 'MAT789012',
    natureza: 'Doação',
    edificioAdquirenteResponsavel: 'Residencial Vista Alegre - Carlos Mendes - Ana Paula Costa',
    valorEmolumentos: 85000, // R$ 850,00
    valorCorretor: 3400, // R$ 34,00
    valorAssessoria: 2550, // R$ 25,50
    numeroSicase: 'SP-789-ABC',
  },
  {
    statusPagamento: 'Gerado',
    statusEscritura: 'Inventário',
    rgiEntrega: 'REG345678',
    natureza: 'Inventário',
    edificioAdquirenteResponsavel: 'Condomínio Jardim das Flores - Roberto Lima - Fernanda Oliveira',
    valorEmolumentos: 320000, // R$ 3.200,00
    valorCorretor: 19200, // R$ 192,00
    valorAssessoria: 9600, // R$ 96,00
    numeroSicase: 'RJ-123-DEF',
  },
  {
    statusPagamento: 'Não enviado',
    statusEscritura: 'Não enviado',
    rgiEntrega: 'RGI901234',
    natureza: 'Permuta',
    edificioAdquirenteResponsavel: 'Edifício Morada do Sol - Patricia Rocha - José Antonio',
    valorEmolumentos: 95000, // R$ 950,00
    valorCorretor: 4750, // R$ 47,50
    valorAssessoria: 2850, // R$ 28,50
    numeroSicase: 'MG-456-GHI',
  },
  {
    statusPagamento: 'Pago',
    statusEscritura: 'Pronta',
    rgiEntrega: 'MAT567890',
    natureza: 'Hipoteca',
    edificioAdquirenteResponsavel: 'Residencial Parque Verde - Marcos Pereira - Lucia Fernandes',
    valorEmolumentos: 180000, // R$ 1.800,00
    valorCorretor: 10800, // R$ 108,00
    valorAssessoria: 5400, // R$ 54,00
    numeroSicase: 'RS-789-JKL',
  },
  {
    statusPagamento: 'A gerar',
    statusEscritura: 'Em tramitação',
    rgiEntrega: 'REG123789',
    natureza: 'Compra e Venda',
    edificioAdquirenteResponsavel: 'Condomínio Bela Vista - Sandra Martins - Paulo Henrique',
    valorEmolumentos: 275000, // R$ 2.750,00
    valorCorretor: 16500, // R$ 165,00
    valorAssessoria: 8250, // R$ 82,50
    numeroSicase: 'PR-012-MNO',
  },
  {
    statusPagamento: 'Gerado',
    statusEscritura: 'Em tramitação',
    rgiEntrega: 'RGI456123',
    natureza: 'Dação em Pagamento',
    edificioAdquirenteResponsavel: 'Edifício Primavera - Claudia Santos - Ricardo Alves',
    valorEmolumentos: 125000, // R$ 1.250,00
    valorCorretor: 6250, // R$ 62,50
    valorAssessoria: 3750, // R$ 37,50
    numeroSicase: 'SC-345-PQR',
  },
  {
    statusPagamento: 'Pago',
    statusEscritura: 'Inventário',
    rgiEntrega: 'MAT234567',
    natureza: 'Usucapião',
    edificioAdquirenteResponsavel: 'Residencial Águas Claras - Renata Silva - Eduardo Campos',
    valorEmolumentos: 450000, // R$ 4.500,00
    valorCorretor: 31500, // R$ 315,00
    valorAssessoria: 13500, // R$ 135,00
    numeroSicase: 'BA-678-STU',
  },
  {
    statusPagamento: 'A gerar',
    statusEscritura: 'Pronta',
    rgiEntrega: 'REG890456',
    natureza: 'Compra e Venda',
    edificioAdquirenteResponsavel: 'Condomínio Recanto Feliz - Mariana Costa - Thiago Barbosa',
    valorEmolumentos: 210000, // R$ 2.100,00
    valorCorretor: 12600, // R$ 126,00
    valorAssessoria: 6300, // R$ 63,00
    numeroSicase: 'GO-901-VWX',
  },
  {
    statusPagamento: 'Não enviado',
    statusEscritura: 'Em tramitação',
    rgiEntrega: 'RGI678901',
    natureza: 'Doação',
    edificioAdquirenteResponsavel: 'Edifício Harmonia - Juliana Rodrigues - Alexandre Nunes',
    valorEmolumentos: 75000, // R$ 750,00
    valorCorretor: 3000, // R$ 30,00
    valorAssessoria: 2250, // R$ 22,50
    numeroSicase: 'DF-234-YZA',
  },
];