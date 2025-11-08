import { Timestamp } from 'firebase/firestore';

export interface Natureza {
  id?: string;
  nome: string;
  descricao?: string;
  data_criacao?: Timestamp;
  data_atualizacao?: Timestamp;
}

export interface NaturezaFormData {
  nome: string;
  descricao?: string;
}