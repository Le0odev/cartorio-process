import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

// Cloud Functions interfaces
export interface UpdateIndicadoresParams {
  action: 'create' | 'update' | 'delete';
  processoId: string;
  oldData?: any;
  newData?: any;
}

export interface LogHistoricoParams {
  processoId: string;
  action: string;
  oldData?: any;
  newData?: any;
  userId: string;
}

// Cloud Functions calls
export const updateIndicadores = httpsCallable<UpdateIndicadoresParams, void>(
  functions, 
  'updateIndicadores'
);

export const logHistorico = httpsCallable<LogHistoricoParams, void>(
  functions, 
  'logHistorico'
);

export const recalcularTotais = httpsCallable<void, void>(
  functions, 
  'recalcularTotais'
);

export const gerarRelatorio = httpsCallable<{ tipo: string; filtros?: any }, any>(
  functions, 
  'gerarRelatorio'
);

// Helper function to call cloud functions with error handling
export const callFunction = async <T, R>(
  functionCall: (data: T) => Promise<any>,
  data: T
): Promise<{ result: R | null; error: string | null }> => {
  try {
    const result = await functionCall(data);
    return { result: result.data, error: null };
  } catch (error: any) {
    console.error('Cloud Function Error:', error);
    return { result: null, error: error.message };
  }
};