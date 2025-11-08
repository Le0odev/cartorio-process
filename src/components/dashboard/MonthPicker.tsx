'use client';

import { useState, useRef, useEffect } from 'react';
import { useMesesDisponiveis } from '@/hooks/useMesesDisponiveis';

interface MonthPickerProps {
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
  variant?: 'default' | 'compact'; // default = dashboard, compact = processos
}

const MESES_PT = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
];

const MESES_COMPLETOS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export function MonthPicker({ selectedMonth, onMonthChange, variant = 'default' }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Iniciar com o ano do mês selecionado ou ano atual
  const getAnoInicial = () => {
    if (selectedMonth) {
      const match = selectedMonth.match(/- (\d{4})$/);
      if (match) return parseInt(match[1]);
    }
    return new Date().getFullYear();
  };

  const [selectedYear, setSelectedYear] = useState(getAnoInicial());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { meses: mesesDisponiveis } = useMesesDisponiveis();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Extrair anos disponíveis dos meses
  const anosDisponiveis = Array.from(
    new Set(mesesDisponiveis.map(mes => {
      const match = mes.match(/- (\d{4})$/);
      return match ? parseInt(match[1]) : new Date().getFullYear();
    }))
  ).sort((a, b) => b - a);

  // Verificar se um mês está disponível (formato completo ou abreviado)
  const isMesDisponivel = (mesIndex: number, ano: number) => {
    const mesNomeCompleto = MESES_COMPLETOS[mesIndex];
    const mesReferenciaCompleta = `${mesNomeCompleto} - ${ano}`;

    const mesAbreviado = MESES_PT[mesIndex];
    const mesReferenciaAbreviada = `${mesAbreviado} - ${ano}`;

    return mesesDisponiveis.includes(mesReferenciaCompleta) ||
      mesesDisponiveis.includes(mesReferenciaAbreviada);
  };

  // Selecionar mês - usar formato padrão (AGOSTO e SETEMBRO completos, resto abreviado)
  const handleSelectMonth = (mesIndex: number) => {
    // Array com formato padrão: AGOSTO e SETEMBRO completos, resto abreviado
    const mesesPadrao = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGOSTO', 'SETEMBRO', 'OUT', 'NOV', 'DEZ'];
    const mesNome = mesesPadrao[mesIndex];
    const mesReferencia = `${mesNome} - ${selectedYear}`;
    onMonthChange(mesReferencia);
    setIsOpen(false);
  };

  // Formatar label do botão
  const getButtonLabel = () => {
    if (!selectedMonth) return 'Todos os Meses';

    // Extrair mês e ano
    const match = selectedMonth.match(/^(\w+) - (\d{4})$/);
    if (match) {
      const [, mes, ano] = match;
      
      // Array com formato de exibição (AGOSTO e SETEMBRO completos, resto abreviado)
      const mesesExibicao = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
        'JUL', 'AGOSTO', 'SETEMBRO', 'OUT', 'NOV', 'DEZ'];
      
      // Verificar se está no formato padrão
      const mesIndexPadrao = mesesExibicao.indexOf(mes);
      if (mesIndexPadrao !== -1) {
        return `${mes} ${ano}`;
      }
      
      // Verificar se está no formato abreviado antigo (AGO, SET)
      const mesIndexAbreviado = MESES_PT.indexOf(mes);
      if (mesIndexAbreviado !== -1) {
        return `${mesesExibicao[mesIndexAbreviado]} ${ano}`;
      }
      
      // Verificar se está no formato completo
      const mesIndexCompleto = MESES_COMPLETOS.indexOf(mes);
      if (mesIndexCompleto !== -1) {
        return `${mesesExibicao[mesIndexCompleto]} ${ano}`;
      }
    }

    return selectedMonth;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === 'compact'
            ? "flex shrink-0 min-w-[140px] sm:min-w-[180px] cursor-pointer items-center justify-center gap-1.5 sm:gap-2 overflow-hidden rounded-lg h-9 sm:h-10 px-3 sm:px-4 bg-[#e7ebf3] dark:bg-gray-800 text-[#0d121b] dark:text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            : "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        }
      >
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-base sm:text-lg">
          event
        </span>
        <span className={variant === 'compact' ? "text-xs sm:text-sm font-bold truncate" : "text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap"}>
          {getButtonLabel()}
        </span>
        <span className={`material-symbols-outlined text-gray-600 dark:text-gray-400 transition-transform text-base sm:text-lg ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-[280px] sm:w-auto sm:min-w-[320px]">
          {/* Header com seletor de ano */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              disabled={!anosDisponiveis.includes(selectedYear - 1)}
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">
                chevron_left
              </span>
            </button>

            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {selectedYear}
            </span>

            <button
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              disabled={!anosDisponiveis.includes(selectedYear + 1)}
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">
                chevron_right
              </span>
            </button>
          </div>

          {/* Grid de meses */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-3 sm:p-4">
            {MESES_PT.map((mes, index) => {
              const disponivel = isMesDisponivel(index, selectedYear);
              
              // Array com formato padrão
              const mesesPadrao = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
                'JUL', 'AGOSTO', 'SETEMBRO', 'OUT', 'NOV', 'DEZ'];
              
              // Verificar se está selecionado (aceitar todos os formatos)
              const mesReferenciaCompleta = `${MESES_COMPLETOS[index]} - ${selectedYear}`;
              const mesReferenciaAbreviada = `${MESES_PT[index]} - ${selectedYear}`;
              const mesReferenciaPadrao = `${mesesPadrao[index]} - ${selectedYear}`;
              const isSelected = selectedMonth === mesReferenciaCompleta || 
                                selectedMonth === mesReferenciaAbreviada ||
                                selectedMonth === mesReferenciaPadrao;

              return (
                <button
                  key={mes}
                  onClick={() => handleSelectMonth(index)}
                  disabled={!disponivel}
                  className={`
                    px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-primary text-white'
                      : disponivel
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {mes}
                </button>
              );
            })}
          </div>

          {/* Footer com opção "Todos os Meses" */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-2">
            <button
              onClick={() => {
                onMonthChange(null);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
                ${!selectedMonth
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              Todos os Meses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
