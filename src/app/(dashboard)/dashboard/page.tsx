'use client';

import { useState } from 'react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ValoresFinanceirosChart } from '@/components/dashboard/ValoresChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { EvolucaoEmolumentosChart } from '@/components/dashboard/CorretorChart';
import { NaturezasChart } from '@/components/dashboard/NaturezasChart';
import { MonthPicker } from '@/components/dashboard/MonthPicker';
import { exportDashboardToPDF } from '@/utils/pdfExport';

export default function DashboardPage() {
  // Iniciar com o mês atual (formato abreviado que é usado no Firestore)
  const getMesAtual = () => {
    const now = new Date();
    const mesesAbreviados = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mesNome = mesesAbreviados[now.getMonth()];
    const ano = now.getFullYear();
    return `${mesNome} - ${ano}`;
  };

  // null = Todos os Meses (GERAL), string = mês específico
  const [selectedMonth, setSelectedMonth] = useState<string | null>(getMesAtual());
  const { metrics, loading, error } = useDashboardMetrics(selectedMonth);

  console.log('🎯 Dashboard state:', {
    hasMetrics: !!metrics,
    loading,
    error,
    valoresFinanceiros: metrics?.valoresFinanceiros
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Erro ao carregar dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            Visão geral dos processos e métricas dos processos.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => exportDashboardToPDF(selectedMonth)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[#0d121b] dark:text-white text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={selectedMonth ? `Exportar dashboard de ${selectedMonth}` : 'Exportar dashboard completo'}
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total de Processos"
          value={metrics?.totalProcessos || 0}
          change={metrics?.percentualVariacao.processos}
          isLoading={loading}
          isYearComparison={selectedMonth === null}
        />
        <MetricCard
          title="Total de Emolumentos"
          value={metrics?.totalEmolumentos || 0}
          change={metrics?.percentualVariacao.emolumentos}
          isLoading={loading}
          isCurrency
          isYearComparison={selectedMonth === null}
        />
        <MetricCard
          title="Total Pago"
          value={metrics?.totalPago || 0}
          change={metrics?.percentualVariacao.pagos}
          isLoading={loading}
          isCurrency
          isYearComparison={selectedMonth === null}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ValoresFinanceirosChart
            data={metrics?.valoresFinanceiros || []}
            isLoading={loading}
            change={metrics?.percentualVariacao.emolumentos}
          />
        </div>
        <StatusChart
          data={metrics?.processosPorStatus || []}
          isLoading={loading}
        />
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolucaoEmolumentosChart
            data={metrics?.evolucaoMensal || []}
            isLoading={loading}
            change={metrics?.percentualVariacao.emolumentos}
          />
        </div>
        <NaturezasChart
          data={metrics?.processosPorNatureza || []}
          isLoading={loading}
        />
      </div>


    </div>
  );
}