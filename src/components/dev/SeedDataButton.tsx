'use client';

import { useState } from 'react';
import { useSeedDatabase } from '@/utils/seedDatabase';

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const { seedTestProcessos } = useSeedDatabase();

  const handleSeed = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      const result = await seedTestProcessos();
      setSeedResult(result);
    } catch (error) {
      console.error('Erro no seeding:', error);
      setSeedResult({ error: 'Erro inesperado durante o seeding' });
    } finally {
      setIsSeeding(false);
    }
  };

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-blue-600">science</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">Dev Tools</h3>
      </div>
      
      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSeeding
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSeeding ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Criando processos...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Criar 10 Processos de Teste
          </>
        )}
      </button>

      {seedResult && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {seedResult.error ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              <strong>Erro:</strong> {seedResult.error}
            </div>
          ) : (
            <div className="text-sm">
              <div className="text-green-600 dark:text-green-400 font-medium mb-1">
                ✅ Seeding concluído!
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                • Total: {seedResult.total}<br/>
                • Sucessos: {seedResult.success}<br/>
                • Erros: {seedResult.errors}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        ⚠️ Apenas em desenvolvimento
      </div>
    </div>
  );
}