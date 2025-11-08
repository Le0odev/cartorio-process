import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

export interface FirestoreService {
  create: <T>(collectionName: string, data: Omit<T, 'id'>) => Promise<string>;
  update: <T>(collectionName: string, id: string, data: Partial<T>) => Promise<void>;
  delete: (collectionName: string, id: string) => Promise<void>;
  getById: <T>(collectionName: string, id: string) => Promise<T | null>;
  getAll: <T>(collectionName: string, constraints?: QueryConstraint[]) => Promise<T[]>;
  subscribe: <T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    constraints?: QueryConstraint[]
  ) => () => void;
}

export const firestoreService: FirestoreService = {
  async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    const docData = {
      ...data,
      data_criacao: serverTimestamp(),
      data_atualizacao: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionName), docData);
    return docRef.id;
  },

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      data_atualizacao: serverTimestamp(),
    };
    
    await updateDoc(docRef, updateData);
  },

  async delete(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  async getAll<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  },

  subscribe<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      callback(data);
    });
  }
};

// Helper functions for common queries
export const createQuery = {
  orderByCreated: () => orderBy('data_criacao', 'desc'),
  orderByUpdated: () => orderBy('data_atualizacao', 'desc'),
  whereEqual: (field: string, value: any) => where(field, '==', value),
  whereIn: (field: string, values: any[]) => where(field, 'in', values),
  whereGreaterThan: (field: string, value: any) => where(field, '>', value),
};