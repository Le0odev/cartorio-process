import { useState, useEffect, useCallback } from 'react';
import { Natureza, NaturezaFormData } from '../types';
import { naturezasFirestoreService } from '../service/firestoreService';

export interface UseNaturezasReturn {
  naturezas: Natureza[];
  loading: boolean;
  error: string | null;
  createNatureza: (data: NaturezaFormData) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateNatureza: (id: string, data: Partial<NaturezaFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteNatureza: (id: string) => Promise<{ success: boolean; error?: string }>;
  getNaturezaById: (id: string) => Promise<Natureza | null>;
  refetch: () => void;
}

export const useNaturezas = (): UseNaturezasReturn => {
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription em tempo real
  useEffect(() => {
    const unsubscribe = naturezasFirestoreService.subscribeToNaturezas((data) => {
      setNaturezas(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Criar natureza
  const createNatureza = useCallback(async (data: NaturezaFormData) => {
    try {
      const id = await naturezasFirestoreService.createNatureza(data);
      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar natureza' };
    }
  }, []);

  // Atualizar natureza
  const updateNatureza = useCallback(async (id: string, data: Partial<NaturezaFormData>) => {
    try {
      await naturezasFirestoreService.updateNatureza(id, data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar natureza' };
    }
  }, []);

  // Deletar natureza
  const deleteNatureza = useCallback(async (id: string) => {
    try {
      await naturezasFirestoreService.deleteNatureza(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir natureza' };
    }
  }, []);

  // Buscar natureza por ID
  const getNaturezaById = useCallback(async (id: string) => {
    try {
      return await naturezasFirestoreService.getNaturezaById(id);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar natureza');
      return null;
    }
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await naturezasFirestoreService.getAllNaturezas();
      setNaturezas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar naturezas');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    naturezas,
    loading,
    error,
    createNatureza,
    updateNatureza,
    deleteNatureza,
    getNaturezaById,
    refetch,
  };
};