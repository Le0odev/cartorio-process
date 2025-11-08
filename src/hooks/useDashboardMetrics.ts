import { useState, useEffect, useCallback } from 'react';
import { Processo, Indicadores } from '@/modules/processos/types';
import { processosFirestoreService } from '@/modules/processos/service/firestoreService';
import { useAppStore } from '@/store/useAppStore';
import { useTotalizadores } from './useTotalizadores';

export interface DashboardMetrics {
  totalProcessos: number;
  totalEmolumentos: number;
  totalPago: number;
  processosPorStatus: { name: string; value: number; color: string }[];
  processosPorNatureza: { name: string; value: number; color: string }[];
  evolucaoMensal: { name: string; emolumentos: number; pagos: number }[];
  valoresFinanceiros: { name: string; emolumentos: number; corretor: number; assessoria: number }[];
  percentualVariacao: {
    processos: number;
    emolumentos: number;
    pagos: number;
  };
}

export const useDashboardMetrics = (mesReferencia: string | null = null) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setIndicadores, setIndicadoresLoading } = useAppStore();

  // Se mesReferencia é null, usar GERAL (todos os meses)
  // Se mesReferencia é string, usar o mês específico
  const mesParaBuscar = mesReferencia === null ? 'GERAL' : mesReferencia;

  const { totalizador, loading: totalizadorLoading } = useTotalizadores(mesParaBuscar);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setIndicadoresLoading(true);
      setError(null);

      // Se temos totalizador disponível, usar APENAS os valores do totalizador
      const usarTotalizador = totalizador && !totalizadorLoading;

      if (usarTotalizador && totalizador) {
        console.log(`[useDashboardMetrics] ✅ Usando totalizador para ${mesParaBuscar}`);

        // Buscar processos apenas para dados que não estão no totalizador (gráficos de distribuição)
        const todosProcessos = await processosFirestoreService.getAllProcessos();

        let processosFiltrados: Processo[];
        const now = new Date();
        let dataInicio: Date;

        if (mesParaBuscar === 'GERAL') {
          // Todos os processos
          processosFiltrados = todosProcessos;
          dataInicio = new Date(2020, 0, 1); // Data arbitrária antiga
        } else {
          // Filtrar processos do mês específico
          processosFiltrados = todosProcessos.filter(p => p.mesReferencia === mesParaBuscar);

          // Extrair ano e mês para dataInicio
          const match = mesParaBuscar.match(/^(\w+) - (\d{4})$/);
          if (match) {
            const [, mesNome, ano] = match;
            const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
              'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
            const mesIndex = meses.indexOf(mesNome);
            dataInicio = new Date(parseInt(ano), mesIndex, 1);
          } else {
            dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
          }
        }

        // Usar valores do totalizador para métricas principais
        const totalProcessos = totalizador.quantidadeProcessos;
        const totalEmolumentos = totalizador.totalEmolumentos;

        // Calcular totalPago da mesma forma que o gráfico (processos com status "Pago")
        const totalPago = processosFiltrados
          .filter(p => p.statusPagamento === 'Pago')
          .reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);

        // Calcular dados que não estão no totalizador (gráficos de distribuição)
        const statusCount = processosFiltrados.reduce((acc, p) => {
          acc[p.statusEscritura] = (acc[p.statusEscritura] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const processosPorStatus = [
          { name: 'Concluído', value: statusCount['Pronta'] || 0, color: '#10b981' },
          { name: 'Em Andamento', value: statusCount['Em tramitação'] || 0, color: '#f59e0b' },
          { name: 'Pendente', value: statusCount['Não enviado'] || 0, color: '#ef4444' },
          { name: 'Inventário', value: statusCount['Inventário'] || 0, color: '#8b5cf6' }
        ];

        const naturezaCount = processosFiltrados.reduce((acc, p) => {
          acc[p.natureza] = (acc[p.natureza] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const processosPorNatureza = Object.entries(naturezaCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, value], index) => ({
            name,
            value,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'][index]
          }));

        // Usar valores do totalizador para o gráfico financeiro
        const valoresFinanceiros = gerarValoresPorSemanaTotalizador(
          processosFiltrados,
          dataInicio,
          now,
          totalizador.totalEmolumentos,
          totalizador.totalCorretor,
          totalizador.totalAssessoria
        );

        const evolucaoMensal = gerarEvolucaoMensal(todosProcessos);

        // Calcular variação percentual comparando com o mês anterior
        const percentualVariacao = await calcularVariacaoPercentual(
          mesParaBuscar,
          totalProcessos,
          totalEmolumentos,
          totalPago
        );

        const metrics: DashboardMetrics = {
          totalProcessos,
          totalEmolumentos,
          totalPago,
          processosPorStatus,
          processosPorNatureza,
          evolucaoMensal,
          valoresFinanceiros,
          percentualVariacao
        };

        setMetrics(metrics);

        const indicadores: Indicadores = {
          total_processos: metrics.totalProcessos,
          total_emolumentos: metrics.totalEmolumentos,
          total_pago: metrics.totalPago,
          total_pendente: metrics.totalEmolumentos - metrics.totalPago,
          processos_por_status: metrics.processosPorStatus.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {} as Record<string, number>),
          processos_por_corretor: {},
          processos_por_assessoria: {},
          processos_por_natureza: {},
          ultima_atualizacao: new Date().toISOString()
        };

        setIndicadores(indicadores);
        return;
      }

      // Fallback: cálculo em tempo real (apenas quando totalizador não disponível)
      console.warn(`[useDashboardMetrics] ⚠️ Totalizador não disponível para ${mesParaBuscar}, usando cálculo em tempo real (fallback)`);

      const todosProcessos = await processosFirestoreService.getAllProcessos();

      // Filtrar por mês
      const now = new Date();
      let dataInicio: Date;
      let processosFiltrados: Processo[];

      if (mesParaBuscar === 'GERAL') {
        // Todos os processos
        processosFiltrados = todosProcessos;
        dataInicio = new Date(2020, 0, 1);
      } else {
        // Filtrar processos do mês específico
        processosFiltrados = todosProcessos.filter(p => p.mesReferencia === mesParaBuscar);

        // Extrair ano e mês para dataInicio
        const match = mesParaBuscar.match(/^(\w+) - (\d{4})$/);
        if (match) {
          const [, mesNome, ano] = match;
          const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
          const mesIndex = meses.indexOf(mesNome);
          dataInicio = new Date(parseInt(ano), mesIndex, 1);
        } else {
          dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        }
      }


      // Métricas
      const totalProcessos = processosFiltrados.length;
      const totalEmolumentos = processosFiltrados.reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);
      const totalPago = processosFiltrados.filter(p => p.statusPagamento === 'Pago').reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);

      // Status
      const statusCount = processosFiltrados.reduce((acc, p) => {
        acc[p.statusEscritura] = (acc[p.statusEscritura] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const processosPorStatus = [
        { name: 'Concluído', value: statusCount['Pronta'] || 0, color: '#10b981' },
        { name: 'Em Andamento', value: statusCount['Em tramitação'] || 0, color: '#f59e0b' },
        { name: 'Pendente', value: statusCount['Não enviado'] || 0, color: '#ef4444' },
        { name: 'Inventário', value: statusCount['Inventário'] || 0, color: '#8b5cf6' }
      ];

      // Naturezas
      const naturezaCount = processosFiltrados.reduce((acc, p) => {
        acc[p.natureza] = (acc[p.natureza] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const processosPorNatureza = Object.entries(naturezaCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'][index]
        }));

      // Valores financeiros por semana
      const valoresFinanceiros = gerarValoresPorSemana(processosFiltrados, dataInicio, now);

      // Evolução mensal (últimos 6 meses)
      const evolucaoMensal = gerarEvolucaoMensal(todosProcessos);

      // Calcular variação percentual
      const percentualVariacao = await calcularVariacaoPercentual(
        mesParaBuscar,
        totalProcessos,
        totalEmolumentos,
        totalPago
      );

      const metrics: DashboardMetrics = {
        totalProcessos,
        totalEmolumentos,
        totalPago,
        processosPorStatus,
        processosPorNatureza,
        evolucaoMensal,
        valoresFinanceiros,
        percentualVariacao
      };

      setMetrics(metrics);

      const indicadores: Indicadores = {
        total_processos: metrics.totalProcessos,
        total_emolumentos: metrics.totalEmolumentos,
        total_pago: metrics.totalPago,
        total_pendente: metrics.totalEmolumentos - metrics.totalPago,
        processos_por_status: metrics.processosPorStatus.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {} as Record<string, number>),
        processos_por_corretor: {},
        processos_por_assessoria: {},
        processos_por_natureza: {},
        ultima_atualizacao: new Date().toISOString()
      };

      setIndicadores(indicadores);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas do dashboard');
    } finally {
      setLoading(false);
      setIndicadoresLoading(false);
    }
  }, [mesParaBuscar, setIndicadores, setIndicadoresLoading, totalizador, totalizadorLoading]);

  useEffect(() => {
    // Aguardar totalizador carregar antes de buscar métricas
    if (totalizadorLoading) {
      return;
    }
    fetchMetrics();
  }, [fetchMetrics, totalizadorLoading, totalizador]);

  return { metrics, loading: loading || totalizadorLoading, error, refetch: fetchMetrics };
};

// Gerar valores por semana usando totalizador
function gerarValoresPorSemanaTotalizador(
  processos: Processo[],
  dataInicio: Date,
  dataFim: Date,
  totalEmolumentos: number,
  totalCorretor: number,
  totalAssessoria: number
) {
  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const intervalo = (dataFim.getTime() - dataInicio.getTime()) / 4;

  // Contar processos por semana para distribuição proporcional
  const processosPorSemana = labels.map((label, index) => {
    const semanaInicio = new Date(dataInicio.getTime() + (index * intervalo));
    const semanaFim = new Date(dataInicio.getTime() + ((index + 1) * intervalo));

    return processos.filter(p => {
      if (!p.data_criacao) return index === 0;
      const data = p.data_criacao.toDate();
      return data >= semanaInicio && data < semanaFim;
    }).length;
  });

  const totalProcessosMes = processos.length || 1; // Evitar divisão por zero

  return labels.map((label, index) => {
    const proporcao = processosPorSemana[index] / totalProcessosMes;

    return {
      name: label,
      emolumentos: Math.round(totalEmolumentos * proporcao),
      corretor: Math.round(totalCorretor * proporcao),
      assessoria: Math.round(totalAssessoria * proporcao)
    };
  });
}

// Gerar valores por semana (fallback - cálculo em tempo real)
function gerarValoresPorSemana(processos: Processo[], dataInicio: Date, dataFim: Date) {
  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const intervalo = (dataFim.getTime() - dataInicio.getTime()) / 4;

  return labels.map((label, index) => {
    const semanaInicio = new Date(dataInicio.getTime() + (index * intervalo));
    const semanaFim = new Date(dataInicio.getTime() + ((index + 1) * intervalo));

    const processosDaSemana = processos.filter(p => {
      if (!p.data_criacao) return index === 0; // Processos sem data vão para Sem 1
      const data = p.data_criacao.toDate();
      return data >= semanaInicio && data < semanaFim;
    });

    return {
      name: label,
      emolumentos: processosDaSemana.reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0),
      corretor: processosDaSemana.reduce((sum, p) => sum + (p.valorCorretor || 0), 0),
      assessoria: processosDaSemana.reduce((sum, p) => sum + (p.valorAssessoria || 0), 0)
    };
  });
}

// Gerar evolução mensal baseado nos meses que realmente têm dados
function gerarEvolucaoMensal(processos: Processo[]) {
  const mesesAbreviados: Record<string, string> = {
    'JANEIRO': 'Jan', 'FEVEREIRO': 'Fev', 'MARÇO': 'Mar', 'ABRIL': 'Abr',
    'MAIO': 'Mai', 'JUNHO': 'Jun', 'JULHO': 'Jul', 'AGOSTO': 'Ago',
    'SETEMBRO': 'Set', 'OUTUBRO': 'Out', 'NOVEMBRO': 'Nov', 'DEZEMBRO': 'Dez',
    'JAN': 'Jan', 'FEV': 'Fev', 'MAR': 'Mar', 'ABR': 'Abr',
    'MAI': 'Mai', 'JUN': 'Jun', 'JUL': 'Jul', 'AGO': 'Ago',
    'SET': 'Set', 'OUT': 'Out', 'NOV': 'Nov', 'DEZ': 'Dez'
  };

  // Agrupar processos por mesReferencia
  const processosPorMes = processos.reduce((acc, p) => {
    if (p.mesReferencia) {
      if (!acc[p.mesReferencia]) {
        acc[p.mesReferencia] = [];
      }
      acc[p.mesReferencia].push(p);
    }
    return acc;
  }, {} as Record<string, Processo[]>);

  // Converter para array e ordenar por data
  const mesesOrdenados = Object.keys(processosPorMes).sort((a, b) => {
    // Extrair ano e mês para ordenar
    const matchA = a.match(/^(\w+) - (\d{4})$/);
    const matchB = b.match(/^(\w+) - (\d{4})$/);

    if (!matchA || !matchB) return 0;

    const [, mesA, anoA] = matchA;
    const [, mesB, anoB] = matchB;

    // Comparar por ano primeiro
    if (anoA !== anoB) return parseInt(anoA) - parseInt(anoB);

    // Depois por mês
    const mesesOrdem = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    return mesesOrdem.indexOf(mesA) - mesesOrdem.indexOf(mesB);
  });

  // Gerar resultado
  return mesesOrdenados.map(mesRef => {
    const processosDoMes = processosPorMes[mesRef];
    const match = mesRef.match(/^(\w+) - (\d{4})$/);
    const mesNome = match ? mesesAbreviados[match[1]] || match[1] : mesRef;

    return {
      name: mesNome,
      emolumentos: processosDoMes.reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0),
      pagos: processosDoMes.filter(p => p.statusPagamento === 'Pago').reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0)
    };
  });
}


// Calcular variação percentual comparando com o mês anterior ou ano anterior
async function calcularVariacaoPercentual(
  mesAtual: string,
  totalProcessosAtual: number,
  totalEmolumentosAtual: number,
  totalPagoAtual: number
): Promise<{ processos: number; emolumentos: number; pagos: number }> {
  try {
    // Se for GERAL, comparar com o ano anterior (todos os meses de 2024)
    if (mesAtual === 'GERAL') {
      const todosProcessos = await processosFirestoreService.getAllProcessos();

      // Filtrar processos de 2024
      const processos2024 = todosProcessos.filter(p => {
        if (!p.mesReferencia) return false;
        return p.mesReferencia.includes('2024');
      });

      if (processos2024.length === 0) {
        return { processos: 0, emolumentos: 0, pagos: 0 };
      }

      // Calcular totais de 2024
      const totalProcessos2024 = processos2024.length;
      const totalEmolumentos2024 = processos2024.reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);
      const totalPago2024 = processos2024
        .filter(p => p.statusPagamento === 'Pago')
        .reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);

      // Calcular variações
      const variacaoProcessos = totalProcessos2024 > 0
        ? ((totalProcessosAtual - totalProcessos2024) / totalProcessos2024) * 100
        : 0;

      const variacaoEmolumentos = totalEmolumentos2024 > 0
        ? ((totalEmolumentosAtual - totalEmolumentos2024) / totalEmolumentos2024) * 100
        : 0;

      const variacaoPagos = totalPago2024 > 0
        ? ((totalPagoAtual - totalPago2024) / totalPago2024) * 100
        : 0;

      return {
        processos: Math.round(variacaoProcessos * 10) / 10,
        emolumentos: Math.round(variacaoEmolumentos * 10) / 10,
        pagos: Math.round(variacaoPagos * 10) / 10
      };
    }

    // Extrair mês e ano atual
    const match = mesAtual.match(/^(\w+) - (\d{4})$/);
    if (!match) {
      return { processos: 0, emolumentos: 0, pagos: 0 };
    }

    const [, mesNome, ano] = match;

    // Mapear meses
    const mesesCompletos = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    const mesesAbreviados = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    let mesIndex = mesesCompletos.indexOf(mesNome);
    if (mesIndex === -1) {
      mesIndex = mesesAbreviados.indexOf(mesNome);
    }

    if (mesIndex === -1) {
      return { processos: 0, emolumentos: 0, pagos: 0 };
    }

    // Calcular mês anterior
    let mesAnteriorIndex = mesIndex - 1;
    let anoAnterior = parseInt(ano);

    if (mesAnteriorIndex < 0) {
      mesAnteriorIndex = 11; // Dezembro
      anoAnterior -= 1;
    }

    // Tentar ambos os formatos (completo e abreviado)
    const mesAnteriorCompleto = `${mesesCompletos[mesAnteriorIndex]} - ${anoAnterior}`;
    const mesAnteriorAbreviado = `${mesesAbreviados[mesAnteriorIndex]} - ${anoAnterior}`;

    // Buscar totalizador do mês anterior
    const { totalizadoresService } = await import('@/modules/totalizadores/service/totalizadoresService');

    let totalizadorAnterior = await totalizadoresService.getTotalizador(mesAnteriorCompleto);
    if (!totalizadorAnterior) {
      totalizadorAnterior = await totalizadoresService.getTotalizador(mesAnteriorAbreviado);
    }

    if (!totalizadorAnterior) {
      return { processos: 0, emolumentos: 0, pagos: 0 };
    }

    // Calcular total pago do mês anterior
    const todosProcessos = await processosFirestoreService.getAllProcessos();
    const processosAnterior = todosProcessos.filter(p =>
      p.mesReferencia === mesAnteriorCompleto || p.mesReferencia === mesAnteriorAbreviado
    );
    const totalPagoAnterior = processosAnterior
      .filter(p => p.statusPagamento === 'Pago')
      .reduce((sum, p) => sum + (p.valorEmolumentos || 0), 0);

    // Calcular variações percentuais
    const variacaoProcessos = totalizadorAnterior.quantidadeProcessos > 0
      ? ((totalProcessosAtual - totalizadorAnterior.quantidadeProcessos) / totalizadorAnterior.quantidadeProcessos) * 100
      : 0;

    const variacaoEmolumentos = totalizadorAnterior.totalEmolumentos > 0
      ? ((totalEmolumentosAtual - totalizadorAnterior.totalEmolumentos) / totalizadorAnterior.totalEmolumentos) * 100
      : 0;

    const variacaoPagos = totalPagoAnterior > 0
      ? ((totalPagoAtual - totalPagoAnterior) / totalPagoAnterior) * 100
      : 0;

    return {
      processos: Math.round(variacaoProcessos * 10) / 10, // Arredondar para 1 casa decimal
      emolumentos: Math.round(variacaoEmolumentos * 10) / 10,
      pagos: Math.round(variacaoPagos * 10) / 10
    };
  } catch (error) {
    console.error('Erro ao calcular variação percentual:', error);
    return { processos: 0, emolumentos: 0, pagos: 0 };
  }
}
