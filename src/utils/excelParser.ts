import * as XLSX from 'xlsx';
import { NovoProcessoData, STATUS_PAGAMENTO, STATUS_ESCRITURA } from '@/modules/processos/types';

export interface ParsedRow {
  data: NovoProcessoData & { mesReferencia?: string };
  rowNumber: number;
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  success: ParsedRow[];
  failed: ParsedRow[];
  totalRows: number;
  sheetName: string;
}

export interface ExcelParseResult {
  sheets: ParseResult[];
  totalSuccess: number;
  totalFailed: number;
}

// Mapeamento de colunas (aceita variações) - todas normalizadas (sem acentos, espaços, pontuação)
const COLUMN_MAPPINGS = {
  talao: ['talao', 'taloes', 'talaos'],
  statusPagamento: ['statuspgto', 'statuspagamento', 'pgto', 'pagamento', 'statusdopagamento', 'statusdepagamento'],
  statusEscritura: ['statusesc', 'statusescritura', 'escritura', 'statusdaescritura', 'esc', 'statusdoesc'],
  rgiEntrega: ['rgientrega', 'rgi', 'entrega', 'rgiouentrega', 'matricula', 'rgioumatricula'],
  natureza: ['natureza', 'tipo', 'tipodeato', 'tipoato'],
  edificioAdquirenteResponsavel: ['edfadquirenteresponsavel', 'edificio', 'adquirente', 'responsavel', 'edfadquirente', 'edificioadquirente', 'edfadquirenterespon'],
  valorEmolumentos: ['valoremolumentos', 'valor', 'emolumentos', 'valordoemolumento', 'emolumento', 'valorouemolumentos'],
  valorCorretor: ['corretor', 'valorcorretor', 'comissao', 'comissaocorretor', 'valordocorretor'],
  valorAssessoria: ['assessoria', 'valorassessoria', 'valordeassessoria', 'valordaassessoria'],
  numeroSicase: ['numerosicase', 'sicase', 'numerodosicase', 'nsicase', 'numsicase', 'numersicase']
};

// Normaliza nome de coluna (remove acentos, pontuação, espaços extras)
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s/g, ''); // Remove todos os espaços
}

// Encontra o nome do campo baseado no nome da coluna
function findFieldName(columnName: string): string | null {
  const normalized = normalizeColumnName(columnName);

  // Tenta match exato primeiro
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    if (variations.includes(normalized)) {
      return field;
    }
  }

  // Tenta match parcial (contém)
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
      return field;
    }
  }

  return null;
}

// Normaliza status de pagamento
function normalizeStatusPagamento(value: string): typeof STATUS_PAGAMENTO[keyof typeof STATUS_PAGAMENTO] {
  const normalized = value.toLowerCase().trim();

  if (normalized.includes('pago') && !normalized.includes('não')) return STATUS_PAGAMENTO.PAGO;
  if (normalized.includes('gerar') || normalized.includes('a gerar')) return STATUS_PAGAMENTO.A_GERAR;
  if (normalized.includes('gerado')) return STATUS_PAGAMENTO.GERADO;
  if (normalized.includes('não') || normalized.includes('nao')) return STATUS_PAGAMENTO.NAO_ENVIADO;

  return STATUS_PAGAMENTO.A_GERAR; // padrão
}

// Normaliza status de escritura
function normalizeStatusEscritura(value: string): typeof STATUS_ESCRITURA[keyof typeof STATUS_ESCRITURA] {
  const normalized = value.toLowerCase().trim();

  if (normalized.includes('pronta')) return STATUS_ESCRITURA.PRONTA;
  if (normalized.includes('tramit') || normalized.includes('tramitando')) return STATUS_ESCRITURA.EM_TRAMITACAO;
  if (normalized.includes('inventario') || normalized.includes('inventário')) return STATUS_ESCRITURA.INVENTARIO;
  if (normalized.includes('não') || normalized.includes('nao')) return STATUS_ESCRITURA.NAO_ENVIADO;

  return STATUS_ESCRITURA.EM_TRAMITACAO; // padrão
}

// Converte valor monetário (aceita R$ 1.234,56 ou 1234.56)
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number') return Math.round(value * 100); // centavos

  if (typeof value === 'string') {
    // Remove R$, espaços, pontos de milhar
    const cleaned = value
      .replace(/R\$\s*/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100); // centavos
  }

  return 0;
}

// Valida e parseia uma linha
function parseRow(row: any, columnMap: Record<string, string>, rowNumber: number, mesReferencia?: string): ParsedRow {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: Partial<NovoProcessoData & { mesReferencia?: string }> = {};

  // Adiciona mês de referência se disponível
  if (mesReferencia) {
    data.mesReferencia = mesReferencia;
  }

  // Mapeia os dados
  for (const [excelCol, fieldName] of Object.entries(columnMap)) {
    const value = row[excelCol];

    if (!value || value === '') continue;

    switch (fieldName) {
      case 'talao':
        data.talao = String(value).trim();
        break;

      case 'statusPagamento':
        data.statusPagamento = normalizeStatusPagamento(String(value));
        break;

      case 'statusEscritura':
        data.statusEscritura = normalizeStatusEscritura(String(value));
        break;

      case 'rgiEntrega':
        data.rgiEntrega = String(value).trim();
        break;

      case 'natureza':
        data.natureza = String(value).trim();
        break;

      case 'edificioAdquirenteResponsavel':
        data.edificioAdquirenteResponsavel = String(value).trim();
        break;

      case 'valorEmolumentos':
        data.valorEmolumentos = parseMonetaryValue(value);
        break;

      case 'valorCorretor':
        data.valorCorretor = parseMonetaryValue(value);
        break;

      case 'valorAssessoria':
        data.valorAssessoria = parseMonetaryValue(value);
        break;

      case 'numeroSicase':
        data.numeroSicase = String(value).trim();
        break;
    }
  }

  // Validações obrigatórias
  if (!data.rgiEntrega) errors.push('RGI/Entrega é obrigatório');
  if (!data.natureza) errors.push('Natureza é obrigatória');
  if (!data.edificioAdquirenteResponsavel) errors.push('Edifício/Adquirente/Responsável é obrigatório');
  if (!data.valorEmolumentos || data.valorEmolumentos === 0) errors.push('Valor de emolumentos é obrigatório');
  if (!data.numeroSicase) errors.push('Número SICASE é obrigatório');

  // Warnings
  if (!data.talao) warnings.push('Talão não informado (será gerado automaticamente)');
  if (!data.valorCorretor || data.valorCorretor === 0) warnings.push('Valor do corretor não informado');
  if (!data.valorAssessoria || data.valorAssessoria === 0) warnings.push('Valor da assessoria não informado');

  return {
    data: data as NovoProcessoData & { mesReferencia?: string },
    rowNumber,
    errors,
    warnings
  };
}

// Parseia uma planilha Excel
export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheets: ParseResult[] = [];
        let totalSuccess = 0;
        let totalFailed = 0;

        // Processa cada aba
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (jsonData.length === 0) continue;

          // Identifica o mapeamento de colunas
          const firstRow = jsonData[0] as any;
          const columnMap: Record<string, string> = {};

          // Detecta se a primeira linha contém os cabeçalhos reais (valores são strings de cabeçalho)
          const firstRowValues = Object.values(firstRow);
          const looksLikeHeader = firstRowValues.some(v =>
            typeof v === 'string' && (
              v.includes('TALÃO') ||
              v.includes('STATUS') ||
              v.includes('RGI') ||
              v.includes('NATUREZA') ||
              v.includes('SICASE')
            )
          );

          let dataStartIndex = 0;

          if (looksLikeHeader) {
            // Os valores da primeira linha são os cabeçalhos reais
            for (const [excelCol, value] of Object.entries(firstRow)) {
              if (typeof value === 'string' && value.trim() !== '') {
                const fieldName = findFieldName(value);
                if (fieldName) {
                  columnMap[excelCol] = fieldName;
                }
              }
            }
            dataStartIndex = 1; // Pula a primeira linha (cabeçalho)
          } else {
            // Usa os nomes das colunas diretamente
            for (const excelCol of Object.keys(firstRow)) {
              const fieldName = findFieldName(excelCol);
              if (fieldName) {
                columnMap[excelCol] = fieldName;
              }
            }
            dataStartIndex = 0;
          }

          // Parseia cada linha (pulando cabeçalho se necessário)
          const success: ParsedRow[] = [];
          const failed: ParsedRow[] = [];

          jsonData.slice(dataStartIndex).forEach((row, index) => {
            // Ignora linhas completamente vazias
            const hasAnyData = Object.values(row as any).some(v => v !== '' && v !== null && v !== undefined);
            if (!hasAnyData) return;

            const parsed = parseRow(row, columnMap, index + dataStartIndex + 2, sheetName); // +2 porque Excel começa em 1 e tem header, passa nome da aba como mês

            if (parsed.errors.length === 0) {
              success.push(parsed);
              totalSuccess++;
            } else {
              failed.push(parsed);
              totalFailed++;
            }
          });

          sheets.push({
            success,
            failed,
            totalRows: jsonData.length - dataStartIndex,
            sheetName
          });
        }

        resolve({
          sheets,
          totalSuccess,
          totalFailed
        });
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(file);
  });
}
