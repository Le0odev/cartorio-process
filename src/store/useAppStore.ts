import { create } from 'zustand';
import { Processo, Corretor, Assessoria, Natureza, Indicadores } from '@/modules/processos/types';

interface AppState {
  // Processos
  processos: Processo[];
  selectedProcesso: Processo | null;
  processosLoading: boolean;
  
  // Corretores
  corretores: Corretor[];
  corretoresLoading: boolean;
  
  // Assessorias
  assessorias: Assessoria[];
  assessoriasLoading: boolean;
  
  // Naturezas
  naturezas: Natureza[];
  naturezasLoading: boolean;
  
  // Indicadores
  indicadores: Indicadores | null;
  indicadoresLoading: boolean;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isMobileMenuOpen: boolean;
  
  // Actions
  setProcessos: (processos: Processo[]) => void;
  setSelectedProcesso: (processo: Processo | null) => void;
  setProcessosLoading: (loading: boolean) => void;
  
  setCorretores: (corretores: Corretor[]) => void;
  setCorretoresLoading: (loading: boolean) => void;
  
  setAssessorias: (assessorias: Assessoria[]) => void;
  setAssessoriasLoading: (loading: boolean) => void;
  
  setNaturezas: (naturezas: Natureza[]) => void;
  setNaturezasLoading: (loading: boolean) => void;
  
  setIndicadores: (indicadores: Indicadores | null) => void;
  setIndicadoresLoading: (loading: boolean) => void;
  
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  processos: [],
  selectedProcesso: null,
  processosLoading: false,
  
  corretores: [],
  corretoresLoading: false,
  
  assessorias: [],
  assessoriasLoading: false,
  
  naturezas: [],
  naturezasLoading: false,
  
  indicadores: null,
  indicadoresLoading: false,
  
  sidebarOpen: true,
  theme: 'light',
  isMobileMenuOpen: false,
  
  // Actions
  setProcessos: (processos) => set({ processos }),
  setSelectedProcesso: (selectedProcesso) => set({ selectedProcesso }),
  setProcessosLoading: (processosLoading) => set({ processosLoading }),
  
  setCorretores: (corretores) => set({ corretores }),
  setCorretoresLoading: (corretoresLoading) => set({ corretoresLoading }),
  
  setAssessorias: (assessorias) => set({ assessorias }),
  setAssessoriasLoading: (assessoriasLoading) => set({ assessoriasLoading }),
  
  setNaturezas: (naturezas) => set({ naturezas }),
  setNaturezasLoading: (naturezasLoading) => set({ naturezasLoading }),
  
  setIndicadores: (indicadores) => set({ indicadores }),
  setIndicadoresLoading: (indicadoresLoading) => set({ indicadoresLoading }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));