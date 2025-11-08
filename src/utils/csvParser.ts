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
  fileName: string;
  mesReferencia?: string;
}

export interface CSVParseResult {
  files: ParseResult[];
  totalSuccess: number;
  totalFailed: number;
}

// Normaliza nome de coluna (remove acentos, pontuação, espaços extras)
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
}

// Mapeamento de colunas CSV
const COLUMN_MAPPINGS: Record<string, string[]> = {
  talao: ['talao', 'taloes', 'talaos'],
  statusPagamento: ['statuspgto', 'statuspagamento', 'pgto', 'pagamento', 'statusdopagamento', 'statusdepagamento', 'pgt'],
  statusEscritura: ['statusesc', 'statusescritura', 'escritura', 'statusdaescritura', 'esc', 'statusdoesc'],
  rgiEntrega: ['rgientrega', 'rgi', 'entrega', 'rgiouentrega', 'matricula', 'rgioumatricula', 'protocolo'],
  natureza: ['natureza', 'tipo', 'tipodeato', 'tipoato'],
  edificioAdquirenteResponsavel: ['edfadquirenteresponsavel', 'edificio', 'adquirente', 'responsavel', 'edfadquirente', 'edificioadquirente', 'edfadquirenterespon'],
  valorEmolumentos: ['valoremolumentos', 'valor', 'emolumentos', 'valordoemolumento', 'emolumento', 'valorouemolumentos', 'status'],
  valorCorretor: ['corretor', 'valorcorretor', 'comissao', 'comissaocorretor', 'valordocorretor'],
  valorAssessoria: ['assessoria', 'valorassessoria', 'valordeassessoria', 'valordaassessoria'],
  numeroSicase: ['numerosicase', 'sicase', 'numerodosicase', 'nsicase', 'numsicase', 'numersicase']
};

// Encontra o nome do campo baseado no nome da coluna
function findFieldName(columnName: string): string | null {
  const normalized = normalizeColumnName(columnName);
  
  // Tenta match exato primeiro
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    if (variations.includes(normalized)) {
      return field;
    }
  }
  
  // Tenta match parcial
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
  
  return STATUS_PAGAMENTO.A_GERAR;
}

// Normaliza status de escritura
function normalizeStatusEscritura(value: string): typeof STATUS_ESCRITURA[keyof typeof STATUS_ESCRITURA] {
  const normalized = value.toLowerCase().trim();
  
  if (normalized.includes('pronta')) return STATUS_ESCRITURA.PRONTA;
  if (normalized.includes('tramit') || normalized.includes('tramitando')) return STATUS_ESCRITURA.EM_TRAMITACAO;
  if (normalized.includes('inventario') || normalized.includes('inventário')) return STATUS_ESCRITURA.INVENTARIO;
  if (normalized.includes('não') || normalized.includes('nao')) return STATUS_ESCRITURA.NAO_ENVIADO;
  
  return STATUS_ESCRITURA.EM_TRAMITACAO;
}

// Converte valor monetário
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number') return Math.round(value * 100);
  
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/R\$\s*/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  }
  
  return 0;
}

// Extrai mês de referência do nome do arquivo
function extractMesReferencia(fileName: string): string | undefined {
  // Padrões: "AGOSTO - 2025", "agosto_2025", "08-2025", etc
  const patterns = [
    /([A-Z]+)\s*-\s*(\d{4})/i,  // AGOSTO - 2025
    /([A-Z]+)_(\d{4})/i,         // agosto_2025
    /(\d{1,2})-(\d{4})/,         // 08-2025
    /(\d{4})-(\d{1,2})/          // 2025-08
  ];

  for (const pattern of patterns) {
    const match = fileName.match(pattern);
    if (match) {
      return match[0].toUpperCase();
    }
  }

  return undefined;
}

// Parseia linha do CSV
function parseCSVRow(
  row: Record<string, string>,
  columnMap: Record<string, string>,
  rowNumber: number,
  mesReferencia?: string
): ParsedRow {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: Partial<NovoProcessoData & { mesReferencia?: string }> = {};

  // Adiciona mês de referência se disponível
  if (mesReferencia) {
    data.mesReferencia = mesReferencia;
  }

  // Mapeia os dados
  for (const [csvCol, fieldName] of Object.entries(columnMap)) {
    const value = row[csvCol];
    
    if (!value || value.trim() === '') continue;

    switch (fieldName) {
      case 'talao':
        data.talao = value.trim();
        break;
        
      case 'statusPagamento':
        data.statusPagamento = normalizeStatusPagamento(value);
        break;
        
      case 'statusEscritura':
        data.statusEscritura = normalizeStatusEscritura(value);
        break;
        
      case 'rgiEntrega':
        data.rgiEntrega = value.trim();
        break;
        
      case 'natureza':
        data.natureza = value.trim();
        break;
        
      case 'edificioAdquirenteResponsavel':
        data.edificioAdquirenteResponsavel = value.trim();
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
        data.numeroSicase = value.trim();
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

// Parseia arquivo CSV
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) {
          reject(new Error('Arquivo CSV vazio ou sem dados'));
          return;
        }

        // Detecta o separador testando vírgula, ponto e vírgula e tab
        const firstLine = lines[0];
        const testComma = firstLine.split(',').filter(h => h.trim() !== '').length;
        const testSemicolon = firstLine.split(';').filter(h => h.trim() !== '').length;
        const testTab = firstLine.split('\t').filter(h => h.trim() !== '').length;
        
        console.log('=== DEBUG CSV ===');
        console.log('Arquivo:', file.name);
        console.log('Primeira linha RAW:', firstLine.substring(0, 200));
        console.log('Teste vírgula (,):', testComma, 'colunas');
        console.log('Teste ponto e vírgula (;):', testSemicolon, 'colunas');
        console.log('Teste tab (\\t):', testTab, 'colunas');
        
        // Usa o separador que gera mais colunas não-vazias
        let separator = ',';
        let maxCols = testComma;
        
        if (testSemicolon > maxCols) {
          separator = ';';
          maxCols = testSemicolon;
        }
        
        if (testTab > maxCols) {
          separator = '\t';
          maxCols = testTab;
        }
        
        console.log('Separador escolhido:', separator === '\t' ? 'tab (\\t)' : separator === ';' ? 'ponto e vírgula (;)' : 'vírgula (,)');

        // Primeira linha = cabeçalho
        const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
        
        console.log('Headers encontrados:', headers);
        
        // Cria mapeamento de colunas (ignora colunas vazias ou inválidas)
        const columnMap: Record<string, string> = {};
        headers.forEach((header, index) => {
          // Ignora headers vazios ou muito genéricos
          if (!header || header.trim() === '' || header.includes('CONTROLE FINANCEIRO')) {
            return;
          }
          
          const fieldName = findFieldName(header);
          console.log(`[${index}] Header "${header}" → Campo "${fieldName || 'NÃO MAPEADO'}"`);
          if (fieldName) {
            columnMap[header] = fieldName;
          }
        });
        
        console.log('Mapeamento final:', columnMap);
        console.log('Total de colunas mapeadas:', Object.keys(columnMap).length);
        
        if (lines.length > 1) {
          const firstDataLine = lines[1].split(separator);
          console.log('Primeira linha de dados (valores):', firstDataLine.slice(0, 5));
        }

        // Extrai mês de referência do nome do arquivo
        const mesReferencia = extractMesReferencia(file.name);

        // Parseia linhas de dados
        const success: ParsedRow[] = [];
        const failed: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
          
          // Cria objeto da linha
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Ignora linhas vazias
          const hasAnyData = Object.values(row).some(v => v !== '');
          if (!hasAnyData) continue;

          const parsed = parseCSVRow(row, columnMap, i + 1, mesReferencia);
          
          if (parsed.errors.length === 0) {
            success.push(parsed);
          } else {
            failed.push(parsed);
          }
        }

        resolve({
          files: [{
            success,
            failed,
            totalRows: lines.length - 1,
            fileName: file.name,
            mesReferencia
          }],
          totalSuccess: success.length,
          totalFailed: failed.length
        });
      } catch (error) {
        reject(new Error(`Erro ao processar CSV: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

// Parseia múltiplos arquivos CSV (um por mês)
export async function parseMultipleCSVFiles(files: File[]): Promise<CSVParseResult> {
  const allResults: ParseResult[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const file of files) {
    try {
      const result = await parseCSVFile(file);
      allResults.push(...result.files);
      totalSuccess += result.totalSuccess;
      totalFailed += result.totalFailed;
    } catch (error) {
      console.error(`Erro ao processar ${file.name}:`, error);
    }
  }

  return {
    files: allResults,
    totalSuccess,
    totalFailed
  };
}
