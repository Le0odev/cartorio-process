import { firestoreService } from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/utils/constants';
import { Totalizador, TOTALIZADOR_GERAL_ID, RecalculoResult } from '../types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export class TotalizadoresService {
  private collectionName = COLLECTIONS.TOTALIZADORES;

  /**
   * Busca um totalizador por mês de referência
   * @param mesReferencia - Mês no formato "AGOSTO - 2025" ou "GERAL"
   * @returns Totalizador ou null se não encontrado
   */
  async getTotalizador(mesReferencia: string): Promise<Totalizador | null> {
    try {
      const docRef = doc(db, this.collectionName, mesReferencia);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ...docSnap.data() } as Totalizador;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar totalizador:', error);
      throw error;
    }
  }

  /**
   * Recalcula o totalizador de um mês específico
   * Busca todos os processos do mês e soma os valores
   * @param mesReferencia - Mês no formato "AGOSTO - 2025"
   * @returns Totalizador recalculado
   */
  async recalcularTotalizadorMes(mesReferencia: string): Promise<RecalculoResult> {
    try {
      // Buscar todos os processos do mês
      const processosRef = collection(db, COLLECTIONS.PROCESSOS);
      const q = query(processosRef, where('mesReferencia', '==', mesReferencia));
      const snapshot = await getDocs(q);

      // Inicializar totais
      let totalEmolumentos = 0;
      let totalCorretor = 0;
      let totalAssessoria = 0;
      let totalPagamento = 0;
      let quantidadeProcessos = 0;

      // Somar valores de cada processo
      snapshot.forEach((doc) => {
        const processo = doc.data();
        
        // Somar valores (já estão em centavos no banco)
        totalEmolumentos += processo.valorEmolumentos || 0;
        totalCorretor += processo.valorCorretor || 0;
        totalAssessoria += processo.valorAssessoria || 0;
        
        // Somar pagamento apenas se status for "Pago"
        if (processo.statusPagamento === 'Pago') {
          totalPagamento += processo.valorEmolumentos || 0;
        }
        
        quantidadeProcessos++;
      });

      // Criar objeto totalizador
      const totalizador: Totalizador = {
        mesReferencia,
        totalEmolumentos,
        totalCorretor,
        totalAssessoria,
        totalPagamento,
        quantidadeProcessos,
        dataAtualizacao: Timestamp.now(),
      };

      // Salvar no Firestore usando o mesReferencia como ID
      const docRef = doc(db, this.collectionName, mesReferencia);
      await setDoc(docRef, totalizador);

      return {
        mesReferencia,
        totalizador,
        processosContados: quantidadeProcessos,
      };
    } catch (error) {
      console.error('Erro ao recalcular totalizador do mês:', error);
      throw error;
    }
  }

  /**
   * Recalcula o totalizador geral (soma de todos os meses)
   * @returns Totalizador geral
   */
  async recalcularTotalizadorGeral(): Promise<RecalculoResult> {
    try {
      // Buscar todos os totalizadores de meses (exceto o GERAL)
      const totalizadoresRef = collection(db, this.collectionName);
      const snapshot = await getDocs(totalizadoresRef);

      // Inicializar totais
      let totalEmolumentos = 0;
      let totalCorretor = 0;
      let totalAssessoria = 0;
      let totalPagamento = 0;
      let quantidadeProcessos = 0;

      // Somar valores de cada totalizador (exceto GERAL)
      snapshot.forEach((doc) => {
        if (doc.id !== TOTALIZADOR_GERAL_ID) {
          const totalizador = doc.data() as Totalizador;
          totalEmolumentos += totalizador.totalEmolumentos || 0;
          totalCorretor += totalizador.totalCorretor || 0;
          totalAssessoria += totalizador.totalAssessoria || 0;
          totalPagamento += totalizador.totalPagamento || 0;
          quantidadeProcessos += totalizador.quantidadeProcessos || 0;
        }
      });

      // Criar objeto totalizador geral
      const totalizadorGeral: Totalizador = {
        mesReferencia: TOTALIZADOR_GERAL_ID,
        totalEmolumentos,
        totalCorretor,
        totalAssessoria,
        totalPagamento,
        quantidadeProcessos,
        dataAtualizacao: Timestamp.now(),
      };

      // Salvar no Firestore com ID "GERAL"
      const docRef = doc(db, this.collectionName, TOTALIZADOR_GERAL_ID);
      await setDoc(docRef, totalizadorGeral);

      return {
        mesReferencia: TOTALIZADOR_GERAL_ID,
        totalizador: totalizadorGeral,
        processosContados: quantidadeProcessos,
      };
    } catch (error) {
      console.error('Erro ao recalcular totalizador geral:', error);
      throw error;
    }
  }

  /**
   * Recalcula todos os totalizadores (todos os meses + geral)
   * Busca todos os meses únicos e recalcula cada um
   */
  async recalcularTodosTotalizadores(): Promise<void> {
    try {
      // Buscar todos os meses únicos dos processos
      const processosRef = collection(db, COLLECTIONS.PROCESSOS);
      const snapshot = await getDocs(processosRef);

      const mesesUnicos = new Set<string>();
      snapshot.forEach((doc) => {
        const processo = doc.data();
        if (processo.mesReferencia) {
          mesesUnicos.add(processo.mesReferencia);
        }
      });

      console.log(`Recalculando ${mesesUnicos.size} meses...`);

      // Recalcular cada mês
      for (const mes of Array.from(mesesUnicos)) {
        const result = await this.recalcularTotalizadorMes(mes);
        console.log(`✓ ${mes}: ${result.processosContados} processos`);
      }

      // Recalcular totalizador geral
      const resultGeral = await this.recalcularTotalizadorGeral();
      console.log(`✓ GERAL: ${resultGeral.processosContados} processos totais`);

      console.log('Recalculo completo!');
    } catch (error) {
      console.error('Erro ao recalcular todos os totalizadores:', error);
      throw error;
    }
  }

  /**
   * Atualiza totalizadores após criar/editar/excluir um processo
   * Recalcula o mês do processo e o totalizador geral
   * @param mesReferencia - Mês do processo afetado
   */
  async atualizarTotalizadoresProcesso(mesReferencia: string): Promise<void> {
    try {
      console.log(`[totalizadoresService] Atualizando totalizadores para ${mesReferencia}`);
      
      // Recalcular o mês específico
      await this.recalcularTotalizadorMes(mesReferencia);
      
      // Recalcular o totalizador geral
      await this.recalcularTotalizadorGeral();
      
      console.log(`[totalizadoresService] ✅ Totalizadores atualizados`);
    } catch (error) {
      console.error('[totalizadoresService] Erro ao atualizar totalizadores:', error);
      // Não lançar erro para não bloquear a operação principal
    }
  }
}

export const totalizadoresService = new TotalizadoresService();
