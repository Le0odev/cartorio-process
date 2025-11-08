import { Timestamp } from 'firebase/firestore';
import { CURRENCY_FORMAT } from './constants';

// Formatação de moeda (valor em reais)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(CURRENCY_FORMAT.locale, {
    style: 'currency',
    currency: CURRENCY_FORMAT.currency,
  }).format(value);
};

// Formatação de moeda a partir de centavos (usado no Firestore)
export const formatCurrencyFromCents = (cents: number): string => {
  const reais = cents / 100;
  return new Intl.NumberFormat(CURRENCY_FORMAT.locale, {
    style: 'currency',
    currency: CURRENCY_FORMAT.currency,
  }).format(reais);
};

// Formatação de data
export const formatDate = (date: Date | Timestamp | string): string => {
  let dateObj: Date;
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

// Formatação de data e hora
export const formatDateTime = (date: Date | Timestamp | string): string => {
  let dateObj: Date;
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Formatação de número
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// Formatação de CPF/CNPJ
export const formatDocument = (document: string): string => {
  const cleaned = document.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // CPF
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleaned.length === 14) {
    // CNPJ
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
};

// Capitalizar primeira letra
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Capitalizar todas as palavras
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Truncar texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Remover acentos
export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Slug para URLs
export const createSlug = (text: string): string => {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Parse de números com diferentes formatos (100.000, 150,000, 150000)
export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  
  // Remove espaços e caracteres não numéricos exceto . , -
  let cleanValue = value.toString().trim().replace(/[^\d,.-]/g, '');
  
  // Se tem ponto e vírgula, assume formato brasileiro (1.000,50)
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    // Remove pontos (separadores de milhares) e troca vírgula por ponto decimal
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  // Se tem apenas ponto, verifica se é separador de milhares ou decimal
  else if (cleanValue.includes('.')) {
    const parts = cleanValue.split('.');
    if (parts.length === 2) {
      // Se a parte depois do ponto tem mais de 2 dígitos, é separador de milhares
      if (parts[1].length > 2) {
        // Ex: 100.000 -> 100000
        cleanValue = cleanValue.replace(/\./g, '');
      }
      // Se tem exatamente 1-2 dígitos, pode ser decimal
      // Mas se o número é grande (>999), provavelmente é separador de milhares
      else if (parseInt(parts[0]) > 999) {
        // Ex: 1000.50 -> provavelmente 100050, não 1000.50
        cleanValue = cleanValue.replace(/\./g, '');
      }
      // Caso contrário, mantém como decimal
    } else {
      // Múltiplos pontos = separadores de milhares (1.000.000)
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  // Se tem apenas vírgula, pode ser decimal brasileiro (1000,50) ou separador de milhares americano (1,000)
  else if (cleanValue.includes(',')) {
    const parts = cleanValue.split(',');
    if (parts.length === 2 && parts[1].length <= 2 && parseInt(parts[0]) <= 999) {
      // Provavelmente decimal brasileiro (1000,50) - só se a parte antes da vírgula for pequena
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Provavelmente separador de milhares americano (1,000 ou 1,000,000)
      cleanValue = cleanValue.replace(/,/g, '');
    }
  }
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};