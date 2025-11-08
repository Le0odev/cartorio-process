import { realtimeService, REALTIME_PATHS } from '@/lib/firebase/realtime';
import { Indicadores } from '../types';

export class ProcessosRealtimeService {
  private basePath = REALTIME_PATHS.INDICADORES;

  async getIndicadores(): Promise<Indicadores | null> {
    return await realtimeService.get<Indicadores>(this.basePath);
  }

  subscribeToIndicadores(callback: (indicadores: Indicadores | null) => void): () => void {
    return realtimeService.subscribe<Indicadores>(this.basePath, callback);
  }

  async updateTotalProcessos(total: number): Promise<void> {
    await realtimeService.update(`${this.basePath}/total_processos`, total);
  }

  async updateTotalEmolumentos(total: number): Promise<void> {
    await realtimeService.update(`${this.basePath}/total_emolumentos`, total);
  }

  async updateTotalPago(total: number): Promise<void> {
    await realtimeService.update(`${this.basePath}/total_pago`, total);
  }

  async updateTotalPendente(total: number): Promise<void> {
    await realtimeService.update(`${this.basePath}/total_pendente`, total);
  }

  async updateProcessosPorStatus(statusCounts: Record<string, number>): Promise<void> {
    await realtimeService.update(`${this.basePath}/processos_por_status`, statusCounts);
  }

  async updateProcessosPorCorretor(corretorCounts: Record<string, number>): Promise<void> {
    await realtimeService.update(`${this.basePath}/processos_por_corretor`, corretorCounts);
  }

  async updateProcessosPorAssessoria(assessoriaCounts: Record<string, number>): Promise<void> {
    await realtimeService.update(`${this.basePath}/processos_por_assessoria`, assessoriaCounts);
  }

  async updateProcessosPorNatureza(naturezaCounts: Record<string, number>): Promise<void> {
    await realtimeService.update(`${this.basePath}/processos_por_natureza`, naturezaCounts);
  }

  async updateUltimaAtualizacao(): Promise<void> {
    const timestamp = new Date().toISOString();
    await realtimeService.update(`${this.basePath}/ultima_atualizacao`, timestamp);
  }

  // Métodos para logs de atividade
  async logAtividade(atividade: {
    tipo: string;
    descricao: string;
    usuario: string;
    timestamp: string;
    dados?: any;
  }): Promise<string> {
    return await realtimeService.push(`${REALTIME_PATHS.LOGS}/atividades`, atividade);
  }

  subscribeToLogs(callback: (logs: any) => void): () => void {
    return realtimeService.subscribe(`${REALTIME_PATHS.LOGS}/atividades`, callback);
  }

  // Métodos para métricas específicas
  async getMetricasPorPeriodo(periodo: string): Promise<any> {
    return await realtimeService.get(`${REALTIME_PATHS.METRICAS}/${periodo}`);
  }

  async updateMetricasPorPeriodo(periodo: string, metricas: any): Promise<void> {
    await realtimeService.update(`${REALTIME_PATHS.METRICAS}/${periodo}`, metricas);
  }

  subscribeToMetricas(periodo: string, callback: (metricas: any) => void): () => void {
    return realtimeService.subscribe(`${REALTIME_PATHS.METRICAS}/${periodo}`, callback);
  }
}

export const processosRealtimeService = new ProcessosRealtimeService();