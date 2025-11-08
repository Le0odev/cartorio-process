'use client';

import { PeriodoFiltro } from '@/hooks/useDashboardMetrics';

interface PeriodFilterProps {
  selectedPeriod: PeriodoFiltro;
  onPeriodChange: (period: PeriodoFiltro) => void;
}

const periods = [
  { key: 'esteMes' as PeriodoFiltro, label: 'Este Mês' },
  { key: 'ultimos30dias' as PeriodoFiltro, label: 'Últimos 30 dias' },
  { key: 'esteAno' as PeriodoFiltro, label: 'Este Ano' },
  { key: 'todosMeses' as PeriodoFiltro, label: 'Todos os Meses' }
];

export function PeriodFilter({ selectedPeriod, onPeriodChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === period.key
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}