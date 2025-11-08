'use client';

import { useState, useEffect } from 'react';
import { Processo, StatusPagamento, StatusEscritura } from '@/modules/processos/types';
import { parseCurrencyInput, formatCentsToDisplay } from '@/utils/currencyInput';

interface ProcessoDetailsModalProps {
  processo: Processo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Partial<Processo>) => void;
  onDelete?: () => void;
}

export function ProcessoDetailsModal({ 
  processo, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: ProcessoDetailsModalProps) {
  const [formData, setFormData] = useState({
    statusEscritura: 'Em tramitação' as StatusEscritura,
    statusPagamento: 'A gerar' as StatusPagamento,
    natureza: 'Compra e Venda',
    numeroSicase: '',
    edificioAdquirenteResponsavel: '',
    rgiEntrega: '',
    valorEmolumentos: 0,
    valorCorretor: 0,
    valorAssessoria: 0,
  });

  // Estados para inputs de valores (strings para permitir edição livre)
  const [inputEmolumentos, setInputEmolumentos] = useState('');
  const [inputCorretor, setInputCorretor] = useState('');
  const [inputAssessoria, setInputAssessoria] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Atualizar formData quando o processo mudar
  useEffect(() => {
    if (processo) {
      setFormData({
        statusEscritura: (processo.statusEscritura || 'Em tramitação') as StatusEscritura,
        statusPagamento: (processo.statusPagamento || 'A gerar') as StatusPagamento,
        natureza: processo.natureza || 'Compra e Venda',
        numeroSicase: processo.numeroSicase || '',
        edificioAdquirenteResponsavel: processo.edificioAdquirenteResponsavel || '',
        rgiEntrega: processo.rgiEntrega || '',
        valorEmolumentos: processo.valorEmolumentos || 0,
        valorCorretor: processo.valorCorretor || 0,
        valorAssessoria: processo.valorAssessoria || 0,
      });
      
      // Atualizar inputs de valores
      setInputEmolumentos(formatCentsToDisplay(processo.valorEmolumentos || 0));
      setInputCorretor(formatCentsToDisplay(processo.valorCorretor || 0));
      setInputAssessoria(formatCentsToDisplay(processo.valorAssessoria || 0));
    }
  }, [processo]);

  if (!isOpen || !processo) return null;

  const handleSave = () => {
    onSave?.(formData);
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">description</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalhes do Processo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{processo.numeroSicase || '---'} • Talão: {processo.talao || '---'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Informações Principais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status da Escritura
                </label>
                <select
                  value={formData.statusEscritura}
                  onChange={(e) => setFormData({ ...formData, statusEscritura: e.target.value as StatusEscritura })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="Pronta">Pronta</option>
                  <option value="Lavrada">Lavrada</option>
                  <option value="Em tramitação">Em tramitação</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Inventário">Inventário</option>
                  <option value="Não enviado">Não enviado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status do Pagamento
                </label>
                <select
                  value={formData.statusPagamento}
                  onChange={(e) => setFormData({ ...formData, statusPagamento: e.target.value as StatusPagamento })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="Pago">Pago</option>
                  <option value="A gerar">A gerar</option>
                  <option value="Gerado">Gerado</option>
                  <option value="Não enviado">Não enviado</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Natureza do Processo
                </label>
                <select
                  value={formData.natureza}
                  onChange={(e) => setFormData({ ...formData, natureza: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="COMPRA E VENDA">Compra e Venda</option>
                  <option value="COMPRA E VENDA + CESSÃO">Compra e Venda + Cessão</option>
                  <option value="C/V + USUFRUTO">C/V + Usufruto</option>
                  <option value="DOAÇÃO">Doação</option>
                  <option value="INVENTÁRIO">Inventário</option>
                  <option value="PERMUTA">Permuta</option>
                  <option value="ADJUDICAÇÃO">Adjudicação</option>
                  <option value="USUCAPIÃO">Usucapião</option>
                  <option value="PROCURAÇÃO">Procuração</option>
                  <option value="ATA NOTARIAL">Ata Notarial</option>
                  <option value="CESSÃO HERED.">Cessão Hereditária</option>
                  <option value="NOMEAÇÃO DE INVENTARIANTE">Nomeação de Inventariante</option>
                  <option value="HIPOTECA">Hipoteca</option>
                  <option value="DAÇÃO EM PAGAMENTO">Dação em Pagamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RGI/Entrega
                </label>
                <input
                  type="text"
                  value={formData.rgiEntrega}
                  onChange={(e) => setFormData({ ...formData, rgiEntrega: e.target.value })}
                  placeholder="Ex: RGI123456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número do SICASE
                </label>
                <input
                  type="text"
                  value={formData.numeroSicase}
                  onChange={(e) => setFormData({ ...formData, numeroSicase: e.target.value })}
                  placeholder="Ex: BR-556-XYZ"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Talão
                </label>
                <input
                  type="text"
                  value={processo.talao || '---'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Partes Envolvidas */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Partes Envolvidas
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edifício / Adquirente / Responsável
              </label>
              <textarea
                value={formData.edificioAdquirenteResponsavel}
                onChange={(e) => setFormData({ ...formData, edificioAdquirenteResponsavel: e.target.value })}
                placeholder="Ex: Edifício Solar dos Ipês - João da Silva - Maria Santos"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Valores */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Valores
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor dos Emolumentos
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
                  <input
                    type="text"
                    value={inputEmolumentos}
                    onChange={(e) => {
                      setInputEmolumentos(e.target.value);
                      const centavos = parseCurrencyInput(e.target.value);
                      setFormData({ ...formData, valorEmolumentos: centavos });
                    }}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor do Corretor
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
                    <input
                      type="text"
                      value={inputCorretor}
                      onChange={(e) => {
                        setInputCorretor(e.target.value);
                        const centavos = parseCurrencyInput(e.target.value);
                        setFormData({ ...formData, valorCorretor: centavos });
                      }}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor da Assessoria
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
                    <input
                      type="text"
                      value={inputAssessoria}
                      onChange={(e) => {
                        setInputAssessoria(e.target.value);
                        const centavos = parseCurrencyInput(e.target.value);
                        setFormData({ ...formData, valorAssessoria: centavos });
                      }}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Excluir registro
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Salvar alterações
          </button>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmar Exclusão
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Esta ação não pode ser desfeita
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Tem certeza que deseja excluir o processo <strong>#{processo.numeroSicase || processo.talao}</strong>? 
                  Todos os dados relacionados serão permanentemente removidos.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}