import { useState, useEffect, useCallback } from 'react';
import { Processo, ProcessoFiltros, ProcessoFormData, NovoProcessoData, ProcessosPaginatedResult } from '../types';
import { processosFirestoreService } from '../service/firestoreService';
import { processosRealtimeService } from '../service/realtimeService';
import { processosFunctionsService } from '../service/functionsService';
import { getCurrentUser } from '@/lib/firebase/auth';
import { totalizadoresService } from '@/modules/totalizadores/service/totalizadoresService';

export interface UseProcessosReturn {
  processos: Processo[];
  loading: boolean;
  error: string | null;
  createProcesso: (data: NovoProcessoData) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateProcesso: (id: string, data: Partial<ProcessoFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteProcesso: (id: string) => Promise<{ success: boolean; error?: string }>;
  getProcessoById: (id: string) => Promise<Processo | null>;
  refetch: () => void;
  generateTalao: () => Promise<string>;
  // Novos métodos para scroll infinito
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
}

export const useProcessos = (filtros?: ProcessoFiltros, pageSize: number = 10): UseProcessosReturn => {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Função para buscar processos iniciais
  const fetchProcessos = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setProcessos([]);
        setLastDoc(null);
        setHasMore(true);
      }
      setError(null);
      
      const result = await processosFirestoreService.getProcessosPaginated(
        pageSize,
        reset ? undefined : lastDoc,
        filtros
      );
      
      if (reset) {
        setProcessos(result.processos);
      } else {
        setProcessos(prev => [...prev, ...result.processos]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  }, [filtros, pageSize]);

  // Função para carregar mais processos
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }
    
    try {
      setLoadingMore(true);
      setError(null);
      
      const result = await processosFirestoreService.getProcessosPaginated(
        pageSize,
        lastDoc,
        filtros
      );
      
      setProcessos(prev => [...prev, ...result.processos]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mais processos');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, pageSize, lastDoc, filtros]);

  // Carregar dados iniciais e limpar ao mudar filtros
  useEffect(() => {
    // Limpar lista imediatamente ao mudar filtros
    setProcessos([]);
    setLoading(true);
    setLastDoc(null);
    setHasMore(true);
    fetchProcessos(true);
  }, [JSON.stringify(filtros)]); // Usar JSON.stringify para garantir detecção de mudanças

  // Gerar próximo talão
  const generateTalao = useCallback(async () => {
    try {
      const allProcessos = await processosFirestoreService.getAllProcessos();
      const taloes = allProcessos
        .map(p => p.talao)
        .filter(t => t && t.startsWith('T'))
        .map(t => parseInt(t.substring(1)))
        .filter(n => !isNaN(n));
      
      const maxTalao = taloes.length > 0 ? Math.max(...taloes) : 0;
      return `T${String(maxTalao + 1).padStart(3, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar talão:', error);
      return `T${String(Date.now()).slice(-3)}`;
    }
  }, []);

  // Criar processo
  const createProcesso = useCallback(async (data: NovoProcessoData) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Gerar talão se não fornecido
      const talao = data.talao || await generateTalao();
      
      const processoData: Processo = {
        ...data,
        talao,
        statusPagamento: data.statusPagamento || 'A gerar',
        statusEscritura: data.statusEscritura || 'Em tramitação',
        valorPagamento: 0, // Inicializar com 0
      };

      const id = await processosFirestoreService.createProcesso(processoData);
      
      // Atualização otimista: adicionar à lista local apenas se passar pelos filtros
      const novoProcesso = { ...processoData, id };
      
      // Verificar se o processo passa pelos filtros atuais
      let passaFiltros = true;
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value && (novoProcesso as any)[key] !== value) {
            passaFiltros = false;
          }
        });
      }
      
      if (passaFiltros) {
        setProcessos(prev => [novoProcesso, ...prev]);
      }
      
      // Atualizar totalizadores (não bloqueia a operação)
      if (processoData.mesReferencia) {
        totalizadoresService.atualizarTotalizadoresProcesso(processoData.mesReferencia).catch(err => {
          console.error('Erro ao atualizar totalizadores:', err);
        });
      }
      
      // Trigger cloud function para atualizar indicadores
      await processosFunctionsService.triggerUpdateIndicadores('create', id, undefined, processoData);
      
      // Log da atividade
      await processosFunctionsService.triggerLogHistorico(
        id,
        'Processo criado',
        user.uid,
        undefined,
        processoData
      );

      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar processo' };
    }
  }, [generateTalao]);

  // Atualizar processo
  const updateProcesso = useCallback(async (id: string, data: Partial<ProcessoFormData>) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar dados antigos para o log
      const oldData = await processosFirestoreService.getProcessoById(id);
      
      // Atualização otimista: atualizar na lista local imediatamente
      setProcessos(prev => prev.map(p => 
        p.id === id ? { ...p, ...data } : p
      ));
      
      await processosFirestoreService.updateProcesso(id, data);
      
      // Atualizar totalizadores do mês antigo e novo (se mudou de mês)
      const mesesParaAtualizar = new Set<string>();
      if (oldData?.mesReferencia) {
        mesesParaAtualizar.add(oldData.mesReferencia);
      }
      if ((data as any).mesReferencia) {
        mesesParaAtualizar.add((data as any).mesReferencia);
      }
      
      // Atualizar totalizadores (não bloqueia a operação)
      mesesParaAtualizar.forEach(mes => {
        totalizadoresService.atualizarTotalizadoresProcesso(mes).catch(err => {
          console.error('Erro ao atualizar totalizadores:', err);
        });
      });
      
      // Trigger cloud function para atualizar indicadores
      await processosFunctionsService.triggerUpdateIndicadores('update', id, oldData || undefined, data as Processo);
      
      // Log da atividade
      await processosFunctionsService.triggerLogHistorico(
        id,
        'Processo atualizado',
        user.uid,
        oldData,
        data
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar processo' };
    }
  }, []);

  // Deletar processo
  const deleteProcesso = useCallback(async (id: string) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar dados para o log antes de deletar
      const oldData = await processosFirestoreService.getProcessoById(id);
      
      // Atualização otimista: remover da lista local imediatamente
      setProcessos(prev => prev.filter(p => p.id !== id));
      
      await processosFirestoreService.deleteProcesso(id);
      
      // Atualizar totalizadores (não bloqueia a operação)
      if (oldData?.mesReferencia) {
        totalizadoresService.atualizarTotalizadoresProcesso(oldData.mesReferencia).catch(err => {
          console.error('Erro ao atualizar totalizadores:', err);
        });
      }
      
      // Trigger cloud function para atualizar indicadores
      await processosFunctionsService.triggerUpdateIndicadores('delete', id, oldData || undefined);
      
      // Log da atividade
      await processosFunctionsService.triggerLogHistorico(
        id,
        'Processo excluído',
        user.uid,
        oldData
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir processo' };
    }
  }, []);

  // Buscar processo por ID
  const getProcessoById = useCallback(async (id: string) => {
    try {
      return await processosFirestoreService.getProcessoById(id);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar processo');
      return null;
    }
  }, []);

  return {
    processos,
    loading,
    error,
    createProcesso,
    updateProcesso,
    deleteProcesso,
    getProcessoById,
    refetch: () => fetchProcessos(true),
    generateTalao,
    // Novos retornos para scroll infinito
    hasMore,
    loadingMore,
    loadMore,
  };
};