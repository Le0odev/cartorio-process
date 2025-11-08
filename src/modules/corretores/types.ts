import { Timestamp } from 'firebase/firestore';

export interface Corretor {
  id?: string;
  nome: string;
  contato: string;
  email?: string;
  status: 'ativo' | 'inativo';
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

export interface CorretorFormData {
  nome: string;
  contato: string;
  email?: string;
  status: 'ativo' | 'inativo';
}