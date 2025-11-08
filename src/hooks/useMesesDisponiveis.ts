import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useMesesDisponiveis() {
    const [meses, setMeses] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeses = async () => {
            try {
                setLoading(true);

                // Buscar todos os processos
                const q = query(collection(db, 'processos'));
                const snapshot = await getDocs(q);

                // Extrair meses únicos
                const mesesSet = new Set<string>();
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.mesReferencia) {
                        mesesSet.add(data.mesReferencia);
                    }
                });

                // Converter para array e ordenar
                const mesesArray = Array.from(mesesSet).sort((a, b) => {
                    // Extrair ano e mês para ordenar corretamente
                    const [mesA, anoA] = a.split(' - ');
                    const [mesB, anoB] = b.split(' - ');

                    if (anoA !== anoB) {
                        return parseInt(anoB) - parseInt(anoA); // Ano mais recente primeiro
                    }

                    // Ordenar por mês
                    const mesesOrdem = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
                    return mesesOrdem.indexOf(mesB) - mesesOrdem.indexOf(mesA); // Mês mais recente primeiro
                });

                setMeses(mesesArray);
            } catch (error) {
                console.error('Erro ao buscar meses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeses();
    }, []);

    return { meses, loading };
}
