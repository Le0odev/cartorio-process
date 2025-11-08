import { useState, useEffect } from 'react';
import { Indicadores } from '../types';
import { processosRealtimeService } from '../service/realtimeService';

export interface UseIndicadoresReturn {
  indicadores: Indicadores | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useIndicadores = (): UseIndicadoresReturn => {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar indicadores
  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await processosRealtimeService.getIndicadores();
      setIndicadores(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar indicadores');
    } finally {
      setLoading(false);
    }
  };

  // Subscription em tempo real
  useEffect(() => {
    const unsubscribe = processosRealtimeService.subscribeToIndicadores((data) => {
      setIndicadores(data);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  return {
    indicadores,
    loading,
    error,
    refetch: fetchIndicadores,
  };
};