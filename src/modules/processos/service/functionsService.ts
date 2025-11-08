import { 
  updateIndicadores, 
  logHistorico, 
  recalcularTotais, 
  gerarRelatorio,
  callFunction 
} from '@/lib/firebase/functions';
import { Processo } from '../types';

export class ProcessosFunctionsService {
  async triggerUpdateIndicadores(
    action: 'create' | 'update' | 'delete',
    processoId: string,
    oldData?: Processo,
    newData?: Processo
  ): Promise<{ success: boolean; error?: string }> {
    const { result, error } = await callFunction(updateIndicadores, {
      action,
      processoId,
      oldData,
      newData
    });

    return { success: !error, error: error || undefined };
  }

  async triggerLogHistorico(
    processoId: string,
    action: string,
    userId: string,
    oldData?: any,
    newData?: any
  ): Promise<{ success: boolean; error?: string }> {
    const { result, error } = await callFunction(logHistorico, {
      processoId,
      action,
      oldData,
      newData,
      userId
    });

    return { success: !error, error: error || undefined };
  }

  async triggerRecalcularTotais(): Promise<{ success: boolean; error?: string }> {
    const { result, error } = await callFunction(recalcularTotais, undefined);
    return { success: !error, error: error || undefined };
  }

  async gerarRelatorioProcessos(
    tipo: 'geral' | 'por_corretor' | 'por_assessoria' | 'por_status',
    filtros?: any
  ): Promise<{ data: any; success: boolean; error?: string }> {
    const { result, error } = await callFunction(gerarRelatorio, {
      tipo,
      filtros
    });

    return { 
      data: result, 
      success: !error, 
      error: error || undefined 
    };
  }

  async gerarRelatorioFinanceiro(
    periodo: { inicio: Date; fim: Date },
    filtros?: any
  ): Promise<{ data: any; success: boolean; error?: string }> {
    const { result, error } = await callFunction(gerarRelatorio, {
      tipo: 'financeiro',
      filtros: {
        ...filtros,
        periodo
      }
    });

    return { 
      data: result, 
      success: !error, 
      error: error || undefined 
    };
  }

  async gerarRelatorioDesempenho(
    periodo: { inicio: Date; fim: Date }
  ): Promise<{ data: any; success: boolean; error?: string }> {
    const { result, error } = await callFunction(gerarRelatorio, {
      tipo: 'desempenho',
      filtros: { periodo }
    });

    return { 
      data: result, 
      success: !error, 
      error: error || undefined 
    };
  }
}

export const processosFunctionsService = new ProcessosFunctionsService();