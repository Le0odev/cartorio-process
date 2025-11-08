import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const realtimeDb = admin.database();

// Cloud Function para atualizar indicadores quando um processo é modificado
export const updateIndicadores = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { action, processoId, oldData, newData } = data;

  try {
    // Recalcular totais
    const processosSnapshot = await db.collection('processos').get();
    const processos = processosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calcular indicadores
    const indicadores = {
      total_processos: processos.length,
      total_emolumentos: processos.reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
      total_pago: processos
        .filter(p => p.status_pgto === 'Pago')
        .reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
      total_pendente: processos
        .filter(p => p.status_pgto === 'Pendente')
        .reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
      processos_por_status: processos.reduce((acc, p) => {
        acc[p.status_escritura] = (acc[p.status_escritura] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      processos_por_corretor: processos.reduce((acc, p) => {
        acc[p.corretor] = (acc[p.corretor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      processos_por_assessoria: processos.reduce((acc, p) => {
        acc[p.assessoria] = (acc[p.assessoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      processos_por_natureza: processos.reduce((acc, p) => {
        acc[p.natureza] = (acc[p.natureza] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      ultima_atualizacao: new Date().toISOString(),
    };

    // Atualizar no Realtime Database
    await realtimeDb.ref('indicadores').set(indicadores);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar indicadores:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});

// Cloud Function para registrar histórico de alterações
export const logHistorico = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { processoId, action, oldData, newData, userId } = data;

  try {
    const historicoItem = {
      id: admin.firestore().collection('temp').doc().id,
      data: admin.firestore.Timestamp.now(),
      acao: action,
      usuario: userId,
      valor_anterior: oldData || null,
      valor_novo: newData || null,
    };

    // Adicionar ao histórico do processo
    await db.collection('processos').doc(processoId).update({
      historico: admin.firestore.FieldValue.arrayUnion(historicoItem)
    });

    // Log da atividade no Realtime Database
    await realtimeDb.ref('logs/atividades').push({
      tipo: action,
      descricao: `${action} no processo ${processoId}`,
      usuario: userId,
      timestamp: new Date().toISOString(),
      dados: { processoId, oldData, newData }
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar histórico:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});

// Cloud Function para recalcular todos os totais
export const recalcularTotais = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  try {
    // Trigger da função de atualizar indicadores
    await updateIndicadores({ action: 'recalcular', processoId: '', oldData: null, newData: null }, context);
    return { success: true };
  } catch (error) {
    console.error('Erro ao recalcular totais:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});

// Cloud Function para gerar relatórios
export const gerarRelatorio = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { tipo, filtros } = data;

  try {
    const processosSnapshot = await db.collection('processos').get();
    const processos = processosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let relatorio: any = {};

    switch (tipo) {
      case 'geral':
        relatorio = {
          total_processos: processos.length,
          total_emolumentos: processos.reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
          processos_por_status: processos.reduce((acc, p) => {
            acc[p.status_escritura] = (acc[p.status_escritura] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
        break;

      case 'por_corretor':
        relatorio = processos.reduce((acc, p) => {
          if (!acc[p.corretor]) {
            acc[p.corretor] = { count: 0, total_emolumentos: 0 };
          }
          acc[p.corretor].count += 1;
          acc[p.corretor].total_emolumentos += p.valor_emolumentos || 0;
          return acc;
        }, {} as Record<string, any>);
        break;

      case 'financeiro':
        relatorio = {
          total_emolumentos: processos.reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
          total_pago: processos
            .filter(p => p.status_pgto === 'Pago')
            .reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
          total_pendente: processos
            .filter(p => p.status_pgto === 'Pendente')
            .reduce((sum, p) => sum + (p.valor_emolumentos || 0), 0),
        };
        break;

      default:
        throw new functions.https.HttpsError('invalid-argument', 'Tipo de relatório inválido');
    }

    return relatorio;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});