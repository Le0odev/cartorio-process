'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novoProcessoSchema } from '@/utils/validators';
import { NovoProcessoData } from '@/modules/processos/types';
import { STATUS_PAGAMENTO_OPTIONS, STATUS_ESCRITURA_OPTIONS, NATUREZAS_OPTIONS } from '@/utils/constants';
import { parseCurrencyInput } from '@/utils/currencyInput';

interface NovoProcessoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NovoProcessoData & { mesReferencia: string }) => Promise<{ success: boolean; error?: string }>;
}

export function NovoProcessoModal({ isOpen, onClose, onSave }: NovoProcessoModalProps) {
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(0);

    // Iniciar com o mês atual (AGOSTO e SETEMBRO completos, resto abreviado)
    const getMesAtual = () => {
        const now = new Date();
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
            'JUL', 'AGOSTO', 'SETEMBRO', 'OUT', 'NOV', 'DEZ'];
        const mesNome = meses[now.getMonth()];
        const ano = now.getFullYear();
        return `${mesNome} - ${ano}`;
    };

    const [mesReferencia, setMesReferencia] = useState<string | null>(getMesAtual());

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<NovoProcessoData>({
        resolver: zodResolver(novoProcessoSchema),
        defaultValues: {
            statusPagamento: 'A gerar',
            statusEscritura: 'Em tramitação',
        },
    });

    // Limpar campos de valor quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            // Usar setTimeout para garantir que o DOM foi renderizado
            setTimeout(() => {
                const emolumentosInput = document.querySelector('input[name="valorEmolumentos"]') as HTMLInputElement;
                const corretorInput = document.querySelector('input[name="valorCorretor"]') as HTMLInputElement;
                const assessoriaInput = document.querySelector('input[name="valorAssessoria"]') as HTMLInputElement;

                if (emolumentosInput) emolumentosInput.value = '';
                if (corretorInput) corretorInput.value = '';
                if (assessoriaInput) assessoriaInput.value = '';
            }, 100);
        }
    }, [isOpen]);

    const handleClose = () => {
        setFormKey(prev => prev + 1); // Força re-render do form
        reset();
        setMesReferencia(getMesAtual()); // Resetar para o mês atual
        onClose();
    };

    const onSubmit = async (data: NovoProcessoData) => {
        if (!mesReferencia) {
            console.error('Mês de referência não selecionado');
            return;
        }

        setLoading(true);
        try {
            const result = await onSave({
                ...data,
                mesReferencia
            });
            if (result.success) {
                handleClose();
            } else {
                // TODO: Mostrar erro
                console.error('Erro ao salvar:', result.error);
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">add_circle</span>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Novo Processo
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Form */}
                <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Identificação */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Identificação
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Talão
                                </label>
                                <input
                                    type="text"
                                    {...register('talao')}
                                    placeholder="T001 (opcional)"
                                    className="form-input-enhanced"
                                />
                                {errors.talao && (
                                    <p className="text-red-500 text-sm mt-1">{errors.talao.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Número SICASE *
                                </label>
                                <input
                                    type="text"
                                    {...register('numeroSicase')}
                                    placeholder="SICASE-12345"
                                    className="form-input-enhanced"
                                />
                                {errors.numeroSicase && (
                                    <p className="text-red-500 text-sm mt-1">{errors.numeroSicase.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mês de Referência */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Mês de Referência
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mês *
                                </label>
                                <select
                                    value={mesReferencia?.split(' - ')[0] || 'NOV'}
                                    onChange={(e) => {
                                        const mes = e.target.value;
                                        const ano = mesReferencia?.split(' - ')[1] || new Date().getFullYear();
                                        setMesReferencia(`${mes} - ${ano}`);
                                    }}
                                    className="form-select-enhanced"
                                >
                                    <option value="JAN">Janeiro</option>
                                    <option value="FEV">Fevereiro</option>
                                    <option value="MAR">Março</option>
                                    <option value="ABR">Abril</option>
                                    <option value="MAI">Maio</option>
                                    <option value="JUN">Junho</option>
                                    <option value="JUL">Julho</option>
                                    <option value="AGOSTO">Agosto</option>
                                    <option value="SETEMBRO">Setembro</option>
                                    <option value="OUT">Outubro</option>
                                    <option value="NOV">Novembro</option>
                                    <option value="DEZ">Dezembro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ano *
                                </label>
                                <select
                                    value={mesReferencia?.split(' - ')[1] || new Date().getFullYear()}
                                    onChange={(e) => {
                                        const ano = e.target.value;
                                        const mes = mesReferencia?.split(' - ')[0] || 'NOV';
                                        setMesReferencia(`${mes} - ${ano}`);
                                    }}
                                    className="form-select-enhanced"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                                        <option key={ano} value={ano}>{ano}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status de Pagamento
                                </label>
                                <select
                                    {...register('statusPagamento')}
                                    className="form-select-enhanced"
                                >
                                    {STATUS_PAGAMENTO_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.statusPagamento && (
                                    <p className="text-red-500 text-sm mt-1">{errors.statusPagamento.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status da Escritura
                                </label>
                                <select
                                    {...register('statusEscritura')}
                                    className="form-select-enhanced"
                                >
                                    {STATUS_ESCRITURA_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.statusEscritura && (
                                    <p className="text-red-500 text-sm mt-1">{errors.statusEscritura.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detalhes do Processo */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalhes do Processo
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Natureza *
                                </label>
                                <select
                                    {...register('natureza')}
                                    className="form-select-enhanced"
                                >
                                    <option value="">Selecione uma natureza</option>
                                    {NATUREZAS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.natureza && (
                                    <p className="text-red-500 text-sm mt-1">{errors.natureza.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Edifício / Adquirente / Responsável *
                                </label>
                                <textarea
                                    {...register('edificioAdquirenteResponsavel')}
                                    rows={3}
                                    placeholder="Edifício / Adquirente / Responsável"
                                    className="form-textarea-enhanced"
                                />
                                {errors.edificioAdquirenteResponsavel && (
                                    <p className="text-red-500 text-sm mt-1">{errors.edificioAdquirenteResponsavel.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    RGI / Entrega *
                                </label>
                                <input
                                    type="text"
                                    {...register('rgiEntrega')}
                                    placeholder="2024-07-15"
                                    className="form-input-enhanced"
                                />
                                {errors.rgiEntrega && (
                                    <p className="text-red-500 text-sm mt-1">{errors.rgiEntrega.message}</p>
                                )}
                            </div>
                        </div>
                    </div>



                    {/* Valores */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Valores
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Valor dos Emolumentos *
                                </label>
                                <input
                                    type="text"
                                    {...register('valorEmolumentos', {
                                        setValueAs: (value) => value === '' ? 0 : parseCurrencyInput(value)
                                    })}
                                    placeholder="10.000,00"
                                    className="form-input-enhanced"
                                />
                                {errors.valorEmolumentos && (
                                    <p className="text-red-500 text-sm mt-1">{errors.valorEmolumentos.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Valor do Corretor *
                                </label>
                                <input
                                    type="text"
                                    {...register('valorCorretor', {
                                        setValueAs: (value) => value === '' ? 0 : parseCurrencyInput(value)
                                    })}
                                    placeholder="1.500,00"
                                    className="form-input-enhanced"
                                />
                                {errors.valorCorretor && (
                                    <p className="text-red-500 text-sm mt-1">{errors.valorCorretor.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Valor da Assessoria *
                                </label>
                                <input
                                    type="text"
                                    {...register('valorAssessoria', {
                                        setValueAs: (value) => value === '' ? 0 : parseCurrencyInput(value)
                                    })}
                                    placeholder="800,00"
                                    className="form-input-enhanced"
                                />
                                {errors.valorAssessoria && (
                                    <p className="text-red-500 text-sm mt-1">{errors.valorAssessoria.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvando...' : 'Criar Processo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}