import { useState, useEffect, useCallback } from 'react';
import { Totalizador } from '@/modules/totalizadores/types';
import { totalizadoresService } from '@/modules/totalizadores/service/totalizadoresService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/utils/constants';

/**
 * Interface para o resultado do hook useTotalizadores
 */
export interface UseTotalizadoresResult {
  totalizador: Totalizador | null;
  loading: boolean;
  error: Error | null;
  recalcular: () => Promise<void>;
}

/**
 * Hook para buscar totalizadores do Firestore com atualização em tempo real
 * 
 * @param mesReferencia - Mês no formato "AGOSTO - 2025" ou "GERAL" para todos os meses
 * @returns Objeto com totalizador, loading, error e função de recalculo
 * 
 * @example
 * ```tsx
 * const { totalizador, loading, error, recalcular } = useTotalizadores('AGOSTO - 2025');
 * 
 * if (loading) return <div>Carregando...</div>;
 * if (error) return <div>Erro: {error.message}</div>;
 * if (!totalizador) return <div>Totalizador não encontrado</div>;
 * 
 * return (
 *   <div>
 *     <p>Total: {totalizador.totalEmolumentos}</p>
 *     <button onClick={recalcular}>Recalcular</button>
 *   </div>
 * );
 * ```
 */
export const useTotalizadores = (mesReferencia: string | null): UseTotalizadoresResult => {
  const [totalizador, setTotalizador] = useState<Totalizador | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Recalcula o totalizador manualmente
   * Útil para forçar atualização após mudanças nos processos
   */
  const recalcular = useCallback(async () => {
    if (!mesReferencia) {
      console.warn('[useTotalizadores] Não é possível recalcular sem mesReferencia');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`[useTotalizadores] Recalculando totalizador: ${mesReferencia}`);

      // Recalcular baseado no tipo
      if (mesReferencia === 'GERAL') {
        await totalizadoresService.recalcularTotalizadorGeral();
        console.log(`[useTotalizadores] Totalizador GERAL recalculado`);
      } else {
        await totalizadoresService.recalcularTotalizadorMes(mesReferencia);
        console.log(`[useTotalizadores] Totalizador recalculado`);
      }
      
      // O listener em tempo real vai atualizar automaticamente
    } catch (err) {
      console.error('[useTotalizadores] Erro ao recalcular totalizador:', err);
      setError(err instanceof Error ? err : new Error('Erro ao recalcular totalizador'));
    } finally {
      setLoading(false);
    }
  }, [mesReferencia]);

  // Escutar mudanças em tempo real no totalizador
  useEffect(() => {
    // Se não há mês de referência, não buscar
    if (!mesReferencia) {
      setTotalizador(null);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`[useTotalizadores] 🔄 Iniciando listener em tempo real para: ${mesReferencia}`);
    setLoading(true);
    setError(null);

    // Criar referência do documento
    const docRef = doc(db, COLLECTIONS.TOTALIZADORES, mesReferencia);

    // Escutar mudanças em tempo real
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Totalizador;
          setTotalizador(data);
          console.log(`[useTotalizadores] ✅ Totalizador atualizado: ${data.quantidadeProcessos} processos`);
        } else {
          setTotalizador(null);
          console.warn(`[useTotalizadores] ⚠️ Totalizador não encontrado para ${mesReferencia}`);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useTotalizadores] ❌ Erro no listener:', err);
        setError(err instanceof Error ? err : new Error('Erro ao escutar totalizador'));
        setTotalizador(null);
        setLoading(false);
      }
    );

    // Cleanup: cancelar listener ao desmontar
    return () => {
      console.log(`[useTotalizadores] 🛑 Parando listener para: ${mesReferencia}`);
      unsubscribe();
    };
  }, [mesReferencia]);

  return {
    totalizador,
    loading,
    error,
    recalcular,
  };
};
