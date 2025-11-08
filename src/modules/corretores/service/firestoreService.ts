import { firestoreService, createQuery } from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/utils/constants';
import { Corretor } from '../types';

export class CorretoresFirestoreService {
  private collectionName = COLLECTIONS.CORRETORES;

  async createCorretor(data: Omit<Corretor, 'id'>): Promise<string> {
    return await firestoreService.create<Corretor>(this.collectionName, data);
  }

  async updateCorretor(id: string, data: Partial<Corretor>): Promise<void> {
    return await firestoreService.update<Corretor>(this.collectionName, id, data);
  }

  async deleteCorretor(id: string): Promise<void> {
    return await firestoreService.delete(this.collectionName, id);
  }

  async getCorretorById(id: string): Promise<Corretor | null> {
    return await firestoreService.getById<Corretor>(this.collectionName, id);
  }

  async getAllCorretores(): Promise<Corretor[]> {
    const constraints = [createQuery.orderByCreated()];
    return await firestoreService.getAll<Corretor>(this.collectionName, constraints);
  }

  async getCorretoresAtivos(): Promise<Corretor[]> {
    const constraints = [
      createQuery.whereEqual('status', 'ativo'),
      createQuery.orderByCreated()
    ];
    return await firestoreService.getAll<Corretor>(this.collectionName, constraints);
  }

  subscribeToCorretores(callback: (corretores: Corretor[]) => void): () => void {
    const constraints = [createQuery.orderByCreated()];
    return firestoreService.subscribe<Corretor>(this.collectionName, callback, constraints);
  }
}

export const corretoresFirestoreService = new CorretoresFirestoreService();