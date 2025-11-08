import { useState, useEffect, useCallback } from 'react';
import { Assessoria, AssessoriaFormData } from '../types';
import { assessoriasFirestoreService } from '../service/firestoreService';

export interface UseAssessoriasReturn {
  assessorias: Assessoria[];
  loading: boolean;
  error: string | null;
  createAssessoria: (data: AssessoriaFormData) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateAssessoria: (id: string, data: Partial<AssessoriaFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteAssessoria: (id: string) => Promise<{ success: boolean; error?: string }>;
  getAssessoriaById: (id: string) => Promise<Assessoria | null>;
  refetch: () => void;
}

export const useAssessorias = (): UseAssessoriasReturn => {
  const [assessorias, setAssessorias] = useState<Assessoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription em tempo real
  useEffect(() => {
    const unsubscribe = assessoriasFirestoreService.subscribeToAssessorias((data) => {
      setAssessorias(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Criar assessoria
  const createAssessoria = useCallback(async (data: AssessoriaFormData) => {
    try {
      const id = await assessoriasFirestoreService.createAssessoria(data);
      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar assessoria' };
    }
  }, []);

  // Atualizar assessoria
  const updateAssessoria = useCallback(async (id: string, data: Partial<AssessoriaFormData>) => {
    try {
      await assessoriasFirestoreService.updateAssessoria(id, data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar assessoria' };
    }
  }, []);

  // Deletar assessoria
  const deleteAssessoria = useCallback(async (id: string) => {
    try {
      await assessoriasFirestoreService.deleteAssessoria(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir assessoria' };
    }
  }, []);

  // Buscar assessoria por ID
  const getAssessoriaById = useCallback(async (id: string) => {
    try {
      return await assessoriasFirestoreService.getAssessoriaById(id);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar assessoria');
      return null;
    }
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assessoriasFirestoreService.getAllAssessorias();
      setAssessorias(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar assessorias');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assessorias,
    loading,
    error,
    createAssessoria,
    updateAssessoria,
    deleteAssessoria,
    getAssessoriaById,
    refetch,
  };
};