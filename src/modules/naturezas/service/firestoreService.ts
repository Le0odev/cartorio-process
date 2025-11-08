import { firestoreService, createQuery } from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/utils/constants';
import { Natureza } from '../types';

export class NaturezasFirestoreService {
  private collectionName = COLLECTIONS.NATUREZAS;

  async createNatureza(data: Omit<Natureza, 'id'>): Promise<string> {
    return await firestoreService.create<Natureza>(this.collectionName, data);
  }

  async updateNatureza(id: string, data: Partial<Natureza>): Promise<void> {
    return await firestoreService.update<Natureza>(this.collectionName, id, data);
  }

  async deleteNatureza(id: string): Promise<void> {
    return await firestoreService.delete(this.collectionName, id);
  }

  async getNaturezaById(id: string): Promise<Natureza | null> {
    return await firestoreService.getById<Natureza>(this.collectionName, id);
  }

  async getAllNaturezas(): Promise<Natureza[]> {
    const constraints = [createQuery.orderByCreated()];
    return await firestoreService.getAll<Natureza>(this.collectionName, constraints);
  }

  subscribeToNaturezas(callback: (naturezas: Natureza[]) => void): () => void {
    const constraints = [createQuery.orderByCreated()];
    return firestoreService.subscribe<Natureza>(this.collectionName, callback, constraints);
  }
}

export const naturezasFirestoreService = new NaturezasFirestoreService();