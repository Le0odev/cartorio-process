import { firestoreService, createQuery } from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/utils/constants';
import { Assessoria } from '../types';

export class AssessoriasFirestoreService {
  private collectionName = COLLECTIONS.ASSESSORIAS;

  async createAssessoria(data: Omit<Assessoria, 'id'>): Promise<string> {
    return await firestoreService.create<Assessoria>(this.collectionName, data);
  }

  async updateAssessoria(id: string, data: Partial<Assessoria>): Promise<void> {
    return await firestoreService.update<Assessoria>(this.collectionName, id, data);
  }

  async deleteAssessoria(id: string): Promise<void> {
    return await firestoreService.delete(this.collectionName, id);
  }

  async getAssessoriaById(id: string): Promise<Assessoria | null> {
    return await firestoreService.getById<Assessoria>(this.collectionName, id);
  }

  async getAllAssessorias(): Promise<Assessoria[]> {
    const constraints = [createQuery.orderByCreated()];
    return await firestoreService.getAll<Assessoria>(this.collectionName, constraints);
  }

  subscribeToAssessorias(callback: (assessorias: Assessoria[]) => void): () => void {
    const constraints = [createQuery.orderByCreated()];
    return firestoreService.subscribe<Assessoria>(this.collectionName, callback, constraints);
  }
}

export const assessoriasFirestoreService = new AssessoriasFirestoreService();