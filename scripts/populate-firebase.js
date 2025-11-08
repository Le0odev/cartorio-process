// Script para popular o Firebase com dados iniciais
const admin = require('firebase-admin');

// Inicializar Firebase Admin (você precisa ter o service account key)
// Para usar este script, baixe o service account key do Firebase Console
// e coloque o caminho aqui ou use variáveis de ambiente

const serviceAccount = {
  // Substitua pelos dados do seu service account
  projectId: "cartorio-system",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function populateCorretores() {
  const corretores = [
    { nome: 'João Santos', contato: '(11) 99999-1111', email: 'joao@email.com', status: 'ativo' },
    { nome: 'Maria Silva', contato: '(11) 99999-2222', email: 'maria@email.com', status: 'ativo' },
    { nome: 'Carlos Alves', contato: '(11) 99999-3333', email: 'carlos@email.com', status: 'ativo' },
    { nome: 'Ana Costa', contato: '(11) 99999-4444', email: 'ana@email.com', status: 'ativo' },
    { nome: 'Roberto Ferreira', contato: '(11) 99999-5555', email: 'roberto@email.com', status: 'ativo' },
    { nome: 'Beatriz Martins', contato: '(11) 99999-6666', email: 'beatriz@email.com', status: 'ativo' },
  ];

  for (const corretor of corretores) {
    await db.collection('corretores').add({
      ...corretor,
      data_criacao: admin.firestore.FieldValue.serverTimestamp(),
      data_atualizacao: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log('Corretores criados com sucesso!');
}

async function populateAssessorias() {
  const assessorias = [
    { nome: 'Assessoria Legal', contato: '(11) 3333-1111', email: 'legal@assessoria.com' },
    { nome: 'Assessoria Financeira', contato: '(11) 3333-2222', email: 'financeira@assessoria.com' },
    { nome: 'Assessoria Top', contato: '(11) 3333-3333', email: 'top@assessoria.com' },
    { nome: 'Assessoria Premium', contato: '(11) 3333-4444', email: 'premium@assessoria.com' },
  ];

  for (const assessoria of assessorias) {
    await db.collection('assessorias').add({
      ...assessoria,
      data_criacao: admin.firestore.FieldValue.serverTimestamp(),
      data_atualizacao: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log('Assessorias criadas com sucesso!');
}

async function populateNaturezas() {
  const naturezas = [
    { nome: 'Compra e Venda', descricao: 'Escritura de compra e venda de imóvel' },
    { nome: 'Doação', descricao: 'Escritura de doação de imóvel' },
    { nome: 'Inventário', descricao: 'Processo de inventário' },
    { nome: 'Permuta', descricao: 'Escritura de permuta de imóveis' },
    { nome: 'Hipoteca', descricao: 'Escritura de hipoteca' },
    { nome: 'Dação em Pagamento', descricao: 'Escritura de dação em pagamento' },
    { nome: 'Usucapião', descricao: 'Processo de usucapião' },
  ];

  for (const natureza of naturezas) {
    await db.collection('naturezas').add({
      ...natureza,
      data_criacao: admin.firestore.FieldValue.serverTimestamp(),
      data_atualizacao: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log('Naturezas criadas com sucesso!');
}

async function main() {
  try {
    console.log('Iniciando população do Firebase...');
    
    await populateCorretores();
    await populateAssessorias();
    await populateNaturezas();
    
    console.log('População concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular Firebase:', error);
    process.exit(1);
  }
}

main();