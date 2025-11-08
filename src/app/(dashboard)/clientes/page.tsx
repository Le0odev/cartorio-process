'use client';

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
            Gestão de clientes e partes envolvidas nos processos.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl p-12 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">group</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Módulo de Clientes
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Esta funcionalidade será implementada em breve.
        </p>
      </div>
    </div>
  );
}