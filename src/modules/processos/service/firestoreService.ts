import { firestoreService, createQuery } from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/utils/constants';
import { Processo, ProcessoFiltros } from '../types';
import { QueryConstraint, where, orderBy, limit, startAfter, DocumentSnapshot, query, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export class ProcessosFirestoreService {
  private collectionName = COLLECTIONS.PROCESSOS;

  async createProcesso(data: Omit<Processo, 'id'>): Promise<string> {
    return await firestoreService.create<Processo>(this.collectionName, data);
  }

  async updateProcesso(id: string, data: Partial<Processo>): Promise<void> {
    return await firestoreService.update<Processo>(this.collectionName, id, data);
  }

  async deleteProcesso(id: string): Promise<void> {
    return await firestoreService.delete(this.collectionName, id);
  }

  async getProcessoById(id: string): Promise<Processo | null> {
    return await firestoreService.getById<Processo>(this.collectionName, id);
  }

  async getAllProcessos(filtros?: ProcessoFiltros): Promise<Processo[]> {
    const constraints = this.buildQueryConstraints(filtros);
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  async getProcessosPaginated(
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    filtros?: ProcessoFiltros
  ): Promise<{ processos: Processo[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    const constraints = this.buildQueryConstraints(filtros);

    // Adicionar limit
    constraints.push(limit(pageSize + 1)); // +1 para verificar se há mais páginas

    // Adicionar cursor se fornecido
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, this.collectionName), ...constraints);
    const snapshot = await getDocs(q);

    const processos: Processo[] = [];
    const docs = snapshot.docs;

    // Processar documentos (exceto o último se houver mais páginas)
    const hasMore = docs.length > pageSize;
    const processedDocs = hasMore ? docs.slice(0, -1) : docs;

    processedDocs.forEach(doc => {
      processos.push({ id: doc.id, ...doc.data() } as Processo);
    });

    return {
      processos,
      lastDoc: processedDocs.length > 0 ? processedDocs[processedDocs.length - 1] : null,
      hasMore
    };
  }

  subscribeToProcessos(
    callback: (processos: Processo[]) => void,
    filtros?: ProcessoFiltros
  ): () => void {
    const constraints = this.buildQueryConstraints(filtros);
    return firestoreService.subscribe<Processo>(this.collectionName, callback, constraints);
  }

  async getProcessosByCorretor(corretorNome: string): Promise<Processo[]> {
    const constraints = [
      createQuery.whereEqual('corretor', corretorNome),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  async getProcessosByAssessoria(assessoriaNome: string): Promise<Processo[]> {
    const constraints = [
      createQuery.whereEqual('assessoria', assessoriaNome),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  async getProcessosByStatusPagamento(status: string): Promise<Processo[]> {
    const constraints = [
      createQuery.whereEqual('statusPagamento', status),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  async getProcessosByStatusEscritura(status: string): Promise<Processo[]> {
    const constraints = [
      createQuery.whereEqual('statusEscritura', status),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  async getProcessosPagos(): Promise<Processo[]> {
    const constraints = [
      createQuery.whereEqual('statusPagamento', 'PAGO'),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Processo>(this.collectionName, constraints);
  }

  private buildQueryConstraints(filtros?: ProcessoFiltros | Record<string, any>): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (filtros) {
      // Filtro de mês de referência
      if ((filtros as any).mesReferencia) {
        constraints.push(where('mesReferencia', '==', (filtros as any).mesReferencia));
      }

      if ((filtros as ProcessoFiltros).statusPagamento) {
        constraints.push(where('statusPagamento', '==', (filtros as ProcessoFiltros).statusPagamento));
      }
      if ((filtros as ProcessoFiltros).statusEscritura) {
        constraints.push(where('statusEscritura', '==', (filtros as ProcessoFiltros).statusEscritura));
      }
      if ((filtros as ProcessoFiltros).corretor) {
        constraints.push(where('corretor', '==', (filtros as ProcessoFiltros).corretor));
      }
      if ((filtros as ProcessoFiltros).assessoria) {
        constraints.push(where('assessoria', '==', (filtros as ProcessoFiltros).assessoria));
      }
      if ((filtros as ProcessoFiltros).natureza) {
        constraints.push(where('natureza', '==', (filtros as ProcessoFiltros).natureza));
      }
      if ((filtros as ProcessoFiltros).valorMin !== undefined) {
        constraints.push(where('valorEmolumentos', '>=', (filtros as ProcessoFiltros).valorMin));
      }
      if ((filtros as ProcessoFiltros).valorMax !== undefined) {
        constraints.push(where('valorEmolumentos', '<=', (filtros as ProcessoFiltros).valorMax));
      }
    }

    // Ordenar por ID do documento (sempre existe e é único)
    constraints.push(orderBy('__name__', 'desc'));

    return constraints;
  }
}

export const processosFirestoreService = new ProcessosFirestoreService();