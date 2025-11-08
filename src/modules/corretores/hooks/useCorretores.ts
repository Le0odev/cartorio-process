import { useState, useEffect, useCallback } from 'react';
import { Corretor, CorretorFormData } from '../types';
import { corretoresFirestoreService } from '../service/firestoreService';

export interface UseCorretoresReturn {
  corretores: Corretor[];
  loading: boolean;
  error: string | null;
  createCorretor: (data: CorretorFormData) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateCorretor: (id: string, data: Partial<CorretorFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteCorretor: (id: string) => Promise<{ success: boolean; error?: string }>;
  getCorretorById: (id: string) => Promise<Corretor | null>;
  refetch: () => void;
}

export const useCorretores = (): UseCorretoresReturn => {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription em tempo real
  useEffect(() => {
    const unsubscribe = corretoresFirestoreService.subscribeToCorretores((data) => {
      setCorretores(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Criar corretor
  const createCorretor = useCallback(async (data: CorretorFormData) => {
    try {
      const id = await corretoresFirestoreService.createCorretor(data);
      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar corretor' };
    }
  }, []);

  // Atualizar corretor
  const updateCorretor = useCallback(async (id: string, data: Partial<CorretorFormData>) => {
    try {
      await corretoresFirestoreService.updateCorretor(id, data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar corretor' };
    }
  }, []);

  // Deletar corretor
  const deleteCorretor = useCallback(async (id: string) => {
    try {
      await corretoresFirestoreService.deleteCorretor(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir corretor' };
    }
  }, []);

  // Buscar corretor por ID
  const getCorretorById = useCallback(async (id: string) => {
    try {
      return await corretoresFirestoreService.getCorretorById(id);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar corretor');
      return null;
    }
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await corretoresFirestoreService.getAllCorretores();
      setCorretores(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar corretores');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    corretores,
    loading,
    error,
    createCorretor,
    updateCorretor,
    deleteCorretor,
    getCorretorById,
    refetch,
  };
};