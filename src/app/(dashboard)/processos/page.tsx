'use client';

import React, { useState, useEffect } from 'react';
import { useProcessos } from '@/modules/processos/hooks/useProcessos';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { formatCurrencyFromCents } from '@/utils/formatters';
import { NovoProcessoModal } from '@/components/shared/NovoProcessoModal';
import { ProcessoDetailsModal } from '@/components/shared/ProcessoDetailsModal';
import ImportarPlanilhaModal from '@/components/shared/ImportarPlanilhaModal';
import { useTotaisProcessos } from '@/hooks/useTotaisProcessos';
import { MonthPicker } from '@/components/dashboard/MonthPicker';
import { exportProcessosToExcel } from '@/utils/excelExport';

import { Processo } from '@/modules/processos/types';

const statusFilters = [
  { key: 'todos', label: 'Todos', active: true },
  { key: 'pago', label: 'Pago', active: false },
  { key: 'pronta', label: 'Pronta', active: false },
  { key: 'em_tramitacao', label: 'Em tramitação', active: false },
];

const getStatusBadgeClass = (status: string, type: 'pagamento' | 'escritura' = 'pagamento') => {
  if (type === 'pagamento') {
    switch (status) {
      case 'Pago':
        return 'status-badge status-badge-green';
      case 'A gerar':
        return 'status-badge status-badge-yellow';
      case 'Gerado':
        return 'status-badge status-badge-blue';
      case 'Não enviado':
        return 'status-badge status-badge-red';
      default:
        return 'status-badge status-badge-yellow';
    }
  } else {
    switch (status) {
      case 'Pronta':
        return 'status-badge status-badge-green';
      case 'Lavrada':
        return 'status-badge status-badge-blue';
      case 'Em tramitação':
        return 'status-badge status-badge-yellow';
      case 'Enviada':
        return 'status-badge status-badge-purple';
      case 'Inventário':
        return 'status-badge status-badge-orange';
      case 'Não enviado':
        return 'status-badge status-badge-red';
      default:
        return 'status-badge status-badge-yellow';
    }
  }
};

export default function ProcessosPage() {
  // Iniciar com o mês atual
  const getMesAtual = () => {
    const now = new Date();
    const mesesAbreviados = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mesNome = mesesAbreviados[now.getMonth()];
    const ano = now.getFullYear();
    return `${mesNome} - ${ano}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [mesFilter, setMesFilter] = useState<string | null>(getMesAtual());
  const [showNovoProcessoModal, setShowNovoProcessoModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);

  // Criar filtros para o backend
  const filtros = React.useMemo(() => {
    const filters: any = {};

    // Filtro de mês
    if (mesFilter) {
      filters.mesReferencia = mesFilter;
    }

    if (activeFilter !== 'todos') {
      switch (activeFilter) {
        case 'pago':
          filters.statusPagamento = 'Pago';
          break;
        case 'pronta':
          filters.statusEscritura = 'Pronta';
          break;
        case 'em_tramitacao':
          filters.statusEscritura = 'Em tramitação';
          break;
        case 'inventario':
          filters.statusEscritura = 'Inventário';
          break;
        case 'nao_enviado':
          // Para "não enviado", vamos fazer a filtragem no frontend por enquanto
          // pois é uma condição OR que o Firestore não suporta facilmente
          break;
      }
    }

    return filters;
  }, [activeFilter, mesFilter]);

  // Carregar TODOS os processos do mês (sem paginação)
  const {
    processos,
    loading,
    error,
    createProcesso,
    updateProcesso,
    deleteProcesso,
    hasMore,
    loadingMore,
    loadMore
  } = useProcessos(filtros, 500); // Carregar até 500 processos de uma vez

  // Buscar totais estáticos (de TODOS os processos, não só os carregados)
  const { totais, loading: loadingTotais } = useTotaisProcessos(filtros);

  // Aplicar filtros que não puderam ser feitos no backend
  const filteredProcessos = React.useMemo(() => {
    return processos.filter(processo => {
      // Filtro por busca - busca precisa nos campos principais
      if (searchTerm && searchTerm.trim() !== '') {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch = (
          (processo.edificioAdquirenteResponsavel || '').toLowerCase().includes(search) ||
          (processo.numeroSicase || '').toLowerCase().includes(search) ||
          (processo.talao || '').toLowerCase().includes(search) ||
          (processo.natureza || '').toLowerCase().includes(search)
        );

        if (!matchesSearch) return false;
      }

      // Filtro especial para "não enviado" (OR condition)
      if (activeFilter === 'nao_enviado') {
        return processo.statusPagamento === 'Não enviado' || processo.statusEscritura === 'Não enviado';
      }

      return true;
    });
  }, [processos, searchTerm, activeFilter]);

  // Usar totais estáticos do hook (não dos processos carregados)
  const totalValorEmolumentos = totais.totalEmolumentos;
  const totalCorretor = totais.totalCorretor;
  const totalAssessoria = totais.totalAssessoria;

  // Função para abrir modal de detalhes
  const handleRowClick = (processo: Processo) => {
    setSelectedProcesso(processo);
    setShowDetailsModal(true);
  };

  // Função para salvar alterações no processo
  const handleSaveProcesso = async (data: Partial<Processo>) => {
    if (!selectedProcesso?.id) return;

    const result = await updateProcesso(selectedProcesso.id, data);
    if (result.success) {
      // Atualizar o processo selecionado com os novos dados
      setSelectedProcesso({ ...selectedProcesso, ...data });
    }
  };

  // Função para excluir processo
  const handleDeleteProcesso = async () => {
    if (!selectedProcesso?.id) return;

    const result = await deleteProcesso(selectedProcesso.id);
    if (result.success) {
      setSelectedProcesso(null);
      setShowDetailsModal(false);
    }
  };

  // Função para exportar processos
  const handleExportarProcessos = () => {
    // Exportar os processos filtrados (se houver busca) ou todos os processos carregados
    const processosParaExportar = hasSearch ? filteredProcessos : processos;
    exportProcessosToExcel(processosParaExportar, mesFilter);
  };

  // Verificar se há busca ativa
  const hasSearch = searchTerm && searchTerm.trim() !== '';



  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="sticky top-0 z-20 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 md:py-4 gap-3 md:gap-4">
            {/* Título */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Processos
            </h1>

            {/* Filtros e Ações */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="w-full sm:w-[200px] md:w-[280px]">
                <div className="flex items-stretch rounded-lg h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <div className="flex items-center justify-center pl-3">
                    <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                  </div>
                  <input
                    type="text"
                    className="flex-1 px-3 bg-transparent text-[#0d121b] dark:text-white focus:outline-none text-sm placeholder:text-gray-400"
                    placeholder="Buscar processos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="flex items-center justify-center pr-3 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Limpar busca"
                    >
                      <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
                    </button>
                  )}
                </div>
              </div>

              <MonthPicker
                selectedMonth={mesFilter}
                onMonthChange={setMesFilter}
              />

              <button
                onClick={handleExportarProcessos}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[#0d121b] dark:text-white text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={mesFilter ? `Exportar processos de ${mesFilter}` : 'Exportar todos os processos'}
              >
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="hidden md:inline">Exportar</span>
              </button>

              <button
                onClick={() => setShowNovoProcessoModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span className="hidden md:inline">Novo Processo</span>
              </button>
            </div>
          </div>
          <div className="flex gap-2 py-2 flex-wrap overflow-x-auto">
            {statusFilters.map((filter) => (
              <div
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex h-8 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-3 transition-colors ${activeFilter === filter.key
                  ? 'bg-primary/20 text-primary'
                  : 'bg-[#e7ebf3] dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-[#0d121b] dark:text-white'
                  }`}
              >
                <p className="text-sm font-medium leading-normal">{filter.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content with Table */}
      <main className="flex-grow overflow-auto" data-scroll-container>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto border border-[#dee2e6] dark:border-gray-700 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-[#dee2e6] dark:divide-gray-700">
              <thead className="bg-background-light dark:bg-background-dark table-sticky-header">
                <tr>
                  <th className="min-w-[140px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Status PGTO
                  </th>
                  <th className="min-w-[160px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Status da Escritura
                  </th>
                  <th className="min-w-[120px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    RGI/Entrega
                  </th>
                  <th className="min-w-[140px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Natureza
                  </th>
                  <th className="min-w-[400px] px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Edifício / Adquirente / Responsável
                  </th>
                  <th className="min-w-[160px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Valor / Emolumentos
                  </th>
                  <th className="min-w-[120px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Valor Corretor
                  </th>
                  <th className="min-w-[120px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Valor Assessoria
                  </th>
                  <th className="min-w-[140px] px-4 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                    Número SICASE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee2e6] dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                      Carregando processos...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-red-500">
                      Erro: {error}
                    </td>
                  </tr>
                ) : filteredProcessos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                      {searchTerm ? `Nenhum processo encontrado para "${searchTerm}"` : 'Nenhum processo encontrado'}
                    </td>
                  </tr>
                ) : (
                  filteredProcessos.map((processo) => (
                    <tr
                      key={processo.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(processo)}
                    >
                      <td className="px-3 py-3 text-center text-sm">
                        <span className={getStatusBadgeClass(processo.statusPagamento)}>
                          {processo.statusPagamento}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-sm">
                        <span className={getStatusBadgeClass(processo.statusEscritura, 'escritura')}>
                          {processo.statusEscritura}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {processo.rgiEntrega}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {processo.natureza}
                      </td>
                      <td className="px-3 py-3 text-left text-sm text-[#0d121b] dark:text-gray-200 font-medium">
                        {processo.edificioAdquirenteResponsavel}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrencyFromCents(processo.valorEmolumentos)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrencyFromCents(processo.valorCorretor || 0)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrencyFromCents(processo.valorAssessoria || 0)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {processo.numeroSicase}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Visible only on mobile */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando processos...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Erro: {error}
              </div>
            ) : filteredProcessos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? `Nenhum processo encontrado para "${searchTerm}"` : 'Nenhum processo encontrado'}
              </div>
            ) : (
              filteredProcessos.map((processo) => (
                <div
                  key={processo.id}
                  onClick={() => handleRowClick(processo)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  {/* Status Badges */}
                  <div className="flex gap-2 mb-3">
                    <span className={getStatusBadgeClass(processo.statusPagamento)}>
                      {processo.statusPagamento}
                    </span>
                    <span className={getStatusBadgeClass(processo.statusEscritura, 'escritura')}>
                      {processo.statusEscritura}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-[#0d121b] dark:text-white text-sm mb-1">
                      {processo.edificioAdquirenteResponsavel}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{processo.natureza}</span>
                      {processo.numeroSicase && (
                        <>
                          <span>•</span>
                          <span>{processo.numeroSicase}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Values Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Emolumentos</span>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrencyFromCents(processo.valorEmolumentos)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">RGI/Entrega</span>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {processo.rgiEntrega || '-'}
                      </p>
                    </div>
                    {(processo.valorCorretor || processo.valorAssessoria) && (
                      <>
                        {processo.valorCorretor > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Corretor</span>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrencyFromCents(processo.valorCorretor)}
                            </p>
                          </div>
                        )}
                        {processo.valorAssessoria > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Assessoria</span>
                            <p className="font-semibold text-purple-600 dark:text-purple-400">
                              {formatCurrencyFromCents(processo.valorAssessoria)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="sticky bottom-0 z-20 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          {/* Desktop Footer */}
          <div className="hidden md:flex md:justify-between md:items-center gap-4">
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {hasSearch ? (
                <>
                  Exibindo <span className="font-bold text-[#0d121b] dark:text-white">{filteredProcessos.length}</span> {filteredProcessos.length === 1 ? 'resultado' : 'resultados'}
                </>
              ) : (
                <>
                  Exibindo <span className="font-bold text-[#0d121b] dark:text-white">{filteredProcessos.length}</span> de <span className="font-bold text-[#0d121b] dark:text-white">{totais.totalProcessos}</span> processos
                </>
              )}
            </div>
            <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm overflow-x-auto">
              <div className="flex flex-col text-right min-w-[100px]">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">Total Emolumentos</span>
                <span className="font-bold text-base md:text-xl text-blue-600 dark:text-blue-400">
                  {formatCurrencyFromCents(totalValorEmolumentos)}
                </span>
              </div>
              <div className="border-l h-8 md:h-10 border-gray-300 dark:border-gray-700"></div>
              <div className="flex flex-col text-right min-w-[90px]">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">Total Corretor</span>
                <span className="font-bold text-base md:text-xl text-green-600 dark:text-green-400">
                  {formatCurrencyFromCents(totalCorretor)}
                </span>
              </div>
              <div className="border-l h-8 md:h-10 border-gray-300 dark:border-gray-700"></div>
              <div className="flex flex-col text-right min-w-[90px]">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">Total Assessoria</span>
                <span className="font-bold text-base md:text-xl text-purple-600 dark:text-purple-400">
                  {formatCurrencyFromCents(totalAssessoria)}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="md:hidden space-y-2">
            <div className="text-xs text-center text-gray-600 dark:text-gray-400">
              {hasSearch ? (
                <>
                  Exibindo <span className="font-bold text-[#0d121b] dark:text-white">{filteredProcessos.length}</span> {filteredProcessos.length === 1 ? 'resultado' : 'resultados'}
                </>
              ) : (
                <>
                  Exibindo <span className="font-bold text-[#0d121b] dark:text-white">{filteredProcessos.length}</span> de <span className="font-bold text-[#0d121b] dark:text-white">{totais.totalProcessos}</span> processos
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider block">Emolumentos</span>
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                  {formatCurrencyFromCents(totalValorEmolumentos)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider block">Corretor</span>
                <span className="font-bold text-sm text-green-600 dark:text-green-400">
                  {formatCurrencyFromCents(totalCorretor)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider block">Assessoria</span>
                <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                  {formatCurrencyFromCents(totalAssessoria)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Novo Processo */}
      <NovoProcessoModal
        isOpen={showNovoProcessoModal}
        onClose={() => setShowNovoProcessoModal(false)}
        onSave={createProcesso}
      />

      {/* Modal Importar Planilha */}
      <ImportarPlanilhaModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Os dados serão atualizados automaticamente pelo listener em tempo real
          setShowImportModal(false);
        }}
      />

      {/* Modal Detalhes do Processo */}
      <ProcessoDetailsModal
        processo={selectedProcesso}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProcesso(null);
        }}
        onSave={handleSaveProcesso}
        onDelete={handleDeleteProcesso}
      />


    </div>
  );
}