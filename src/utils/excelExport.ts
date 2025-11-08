import * as XLSX from 'xlsx';
import { Processo } from '@/modules/processos/types';
import { formatCurrencyFromCents } from './formatters';

export function exportProcessosToExcel(processos: Processo[], mesReferencia: string | null) {
  // Calcular totais
  const totalEmolumentos = processos.reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);
  const totalCorretor = processos.reduce((sum, p) => sum + (p.valorCorretor || 0), 0);
  const totalAssessoria = processos.reduce((sum, p) => sum + (p.valorAssessoria || 0), 0);

  // Preparar dados para exportação
  const data = processos.map(processo => ({
    'Talão': processo.talao || '',
    'Número SICASE': processo.numeroSicase || '',
    'Status Pagamento': processo.statusPagamento || '',
    'Status Escritura': processo.statusEscritura || '',
    'RGI/Entrega': processo.rgiEntrega || '',
    'Natureza': processo.natureza || '',
    'Edifício/Adquirente/Responsável': processo.edificioAdquirenteResponsavel || '',
    'Valor Emolumentos': formatCurrencyFromCents(processo.valorEmolumentos || 0),
    'Valor Corretor': formatCurrencyFromCents(processo.valorCorretor || 0),
    'Valor Assessoria': formatCurrencyFromCents(processo.valorAssessoria || 0),
    'Mês Referência': processo.mesReferencia || '',
  }));

  // Adicionar linha de totais
  (data as any).push({
    'Talão': '',
    'Número SICASE': '',
    'Status Pagamento': '',
    'Status Escritura': '',
    'RGI/Entrega': '',
    'Natureza': '',
    'Edifício/Adquirente/Responsável': 'TOTAL',
    'Valor Emolumentos': formatCurrencyFromCents(totalEmolumentos),
    'Valor Corretor': formatCurrencyFromCents(totalCorretor),
    'Valor Assessoria': formatCurrencyFromCents(totalAssessoria),
    'Mês Referência': '',
  });

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 },  // Talão
    { wch: 15 },  // Número SICASE
    { wch: 15 },  // Status Pagamento
    { wch: 18 },  // Status Escritura
    { wch: 12 },  // RGI/Entrega
    { wch: 20 },  // Natureza
    { wch: 50 },  // Edifício/Adquirente/Responsável
    { wch: 18 },  // Valor Emolumentos
    { wch: 15 },  // Valor Corretor
    { wch: 15 },  // Valor Assessoria
    { wch: 15 },  // Mês Referência
  ];
  ws['!cols'] = colWidths;

  // Estilizar a linha de totais (última linha)
  const lastRowIndex = data.length + 1; // +1 porque a primeira linha é o header
  const totalRowCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  
  totalRowCells.forEach(col => {
    const cellRef = `${col}${lastRowIndex}`;
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E7EBF3' } }
      };
    }
  });

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Processos');

  // Gerar nome do arquivo
  const fileName = mesReferencia 
    ? `processos_${mesReferencia.replace(' - ', '_')}.xlsx`
    : 'processos_todos.xlsx';

  // Fazer download
  XLSX.writeFile(wb, fileName);
}
