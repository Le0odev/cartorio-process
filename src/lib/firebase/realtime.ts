import { ref, set, get, onValue, off, push, remove, update } from 'firebase/database';
import { realtimeDb } from './config';

export interface RealtimeService {
  set: (path: string, data: any) => Promise<void>;
  get: <T>(path: string) => Promise<T | null>;
  update: (path: string, data: any) => Promise<void>;
  remove: (path: string) => Promise<void>;
  push: (path: string, data: any) => Promise<string>;
  subscribe: <T>(path: string, callback: (data: T | null) => void) => () => void;
}

export const realtimeService: RealtimeService = {
  async set(path: string, data: any): Promise<void> {
    const dbRef = ref(realtimeDb, path);
    await set(dbRef, data);
  },

  async get<T>(path: string): Promise<T | null> {
    const dbRef = ref(realtimeDb, path);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  },

  async update(path: string, data: any): Promise<void> {
    const dbRef = ref(realtimeDb, path);
    await update(dbRef, data);
  },

  async remove(path: string): Promise<void> {
    const dbRef = ref(realtimeDb, path);
    await remove(dbRef);
  },

  async push(path: string, data: any): Promise<string> {
    const dbRef = ref(realtimeDb, path);
    const newRef = await push(dbRef, data);
    return newRef.key!;
  },

  subscribe<T>(path: string, callback: (data: T | null) => void): () => void {
    const dbRef = ref(realtimeDb, path);
    
    onValue(dbRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    return () => off(dbRef);
  }
};

// Specific paths for the application
export const REALTIME_PATHS = {
  INDICADORES: 'indicadores',
  TOTAIS: 'totais',
  METRICAS: 'metricas',
  LOGS: 'logs'
} as const;