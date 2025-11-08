import { useProcessos } from '@/modules/processos/hooks/useProcessos';
import { testProcessosData } from './seedData';

// Hook para executar o seeding do banco de dados
export const useSeedDatabase = () => {
  const { createProcesso } = useProcessos();

  const seedTestProcessos = async () => {
    console.log('🌱 Iniciando seeding do banco de dados...');
    
    const results = [];
    
    for (let i = 0; i < testProcessosData.length; i++) {
      const processoData = testProcessosData[i];
      
      try {
        console.log(`📝 Criando processo ${i + 1}/10: ${processoData.numeroSicase}`);
        
        const result = await createProcesso(processoData);
        
        if (result.success) {
          console.log(`✅ Processo ${processoData.numeroSicase} criado com sucesso (ID: ${result.id})`);
          results.push({ success: true, id: result.id, sicase: processoData.numeroSicase });
        } else {
          console.error(`❌ Erro ao criar processo ${processoData.numeroSicase}:`, result.error);
          results.push({ success: false, error: result.error, sicase: processoData.numeroSicase });
        }
        
        // Pequeno delay para não sobrecarregar o Firestore
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Erro inesperado ao criar processo ${processoData.numeroSicase}:`, error);
        results.push({ success: false, error: error, sicase: processoData.numeroSicase });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    console.log(`🎉 Seeding concluído! ${successCount} sucessos, ${errorCount} erros`);
    
    if (errorCount > 0) {
      console.log('❌ Processos com erro:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.sicase}: ${r.error}`);
      });
    }
    
    return {
      total: results.length,
      success: successCount,
      errors: errorCount,
      results
    };
  };

  return {
    seedTestProcessos
  };
};