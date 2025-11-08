import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTotalizadores } from './useTotalizadores';

interface Totais {
  totalEmolumentos: number;
  totalCorretor: number;
  totalAssessoria: number;
  totalProcessos: number;
}

export function useTotaisProcessos(filtros?: Record<string, any>) {
  const [totais, setTotais] = useState<Totais>({
    totalEmolumentos: 0,
    totalCorretor: 0,
    totalAssessoria: 0,
    totalProcessos: 0,
  });
  const [loading, setLoading] = useState(true);

  // Determinar se deve usar totalizador baseado nos filtros
  const mesReferencia = filtros?.mesReferencia || null;
  const temOutrosFiltros = filtros && Object.keys(filtros).some(key => key !== 'mesReferencia' && filtros[key]);
  
  // Se tem filtro de mês e não tem outros filtros, usar totalizador
  const usarTotalizador = mesReferencia && !temOutrosFiltros;
  
  // Se não tem filtro de mês e não tem outros filtros, usar totalizador GERAL
  const usarTotalizadorGeral = !mesReferencia && !temOutrosFiltros;
  
  const mesParaBuscar = usarTotalizadorGeral ? 'GERAL' : (usarTotalizador ? mesReferencia : null);
  const { totalizador, loading: totalizadorLoading } = useTotalizadores(mesParaBuscar);

  useEffect(() => {
    // Se deve usar totalizador e ele está disponível
    if ((usarTotalizador || usarTotalizadorGeral) && totalizador && !totalizadorLoading) {
      console.log(`[useTotaisProcessos] ✅ Usando totalizador: ${mesParaBuscar}`);
      setTotais({
        totalEmolumentos: totalizador.totalEmolumentos,
        totalCorretor: totalizador.totalCorretor,
        totalAssessoria: totalizador.totalAssessoria,
        totalProcessos: totalizador.quantidadeProcessos,
      });
      setLoading(false);
      return;
    }

    // Fallback: calcular em tempo real (quando há filtros adicionais ou totalizador não disponível)
    if ((usarTotalizador || usarTotalizadorGeral) && mesParaBuscar) {
      console.warn(`[useTotaisProcessos] ⚠️ Totalizador não disponível para ${mesParaBuscar}, usando cálculo em tempo real`);
    } else {
      console.log(`[useTotaisProcessos] Usando cálculo em tempo real (filtros adicionais aplicados)`);
    }

    // Criar query base
    let q = query(collection(db, 'processos'));
    
    // Aplicar filtros se existirem
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
          q = query(q, where(key, '==', value));
        }
      });
    }
    
    // Usar onSnapshot para atualizar em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let emolumentos = 0;
      let corretor = 0;
      let assessoria = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        emolumentos += data.valorEmolumentos || 0;
        corretor += data.valorCorretor || 0;
        assessoria += data.valorAssessoria || 0;
      });
      
      setTotais({
        totalEmolumentos: emolumentos,
        totalCorretor: corretor,
        totalAssessoria: assessoria,
        totalProcessos: snapshot.size,
      });
      
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar totais:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [JSON.stringify(filtros), totalizador, totalizadorLoading, usarTotalizador, usarTotalizadorGeral, mesParaBuscar]);

  return { totais, loading: loading || totalizadorLoading };
}
