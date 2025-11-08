import { Timestamp } from 'firebase/firestore';

export interface Assessoria {
  id?: string;
  nome: string;
  contato: string;
  email?: string;
  endereco?: string;
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

export interface AssessoriaFormData {
  nome: string;
  contato: string;
  email?: string;
  endereco?: string;
}