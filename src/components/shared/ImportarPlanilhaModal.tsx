'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useExcelImport } from '@/hooks/useExcelImport';
import { ExcelParseResult } from '@/utils/excelParser';

interface ImportarPlanilhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportarPlanilhaModal({ isOpen, onClose, onSuccess }: ImportarPlanilhaModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, progress, parseResult, parseFile, importToFirestore, clearParseResult } = useExcelImport();

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
        alert('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    try {
      await parseFile(file);
      setStep('preview');
    } catch (error) {
      alert(`Erro ao processar arquivo: ${error}`);
    }
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep('importing');

    try {
      // Coleta todas as linhas válidas (de sheets ou files)
      const dataSheets = 'sheets' in parseResult ? parseResult.sheets : parseResult.files;
      const allValidRows = dataSheets.flatMap(sheet => sheet.success);
      
      const result = await importToFirestore(allValidRows);
      
      setImportResult(result);
      setStep('result');
      
      if (result.success > 0) {
        onSuccess?.();
      }
    } catch (error) {
      alert(`Erro ao importar dados: ${error}`);
      setStep('preview');
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setImportResult(null);
    clearParseResult();
    onClose();
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Importar Planilha
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Selecione um arquivo Excel (.xlsx) ou CSV (.csv) com os dados dos processos
        </p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {file ? file.name : 'Clique para selecionar ou arraste o arquivo aqui'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setFile(null)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleParse}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processando...
              </>
            ) : (
              'Processar Arquivo'
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => {
    if (!parseResult) return null;

    // Suporta tanto Excel (sheets) quanto CSV (files)
    const dataSheets = 'sheets' in parseResult ? parseResult.sheets : parseResult.files;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Visualizar Dados
          </h3>
          <div className="text-sm text-gray-500">
            {parseResult.totalSuccess} válidos | {parseResult.totalFailed} com erro
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-4">
          {dataSheets.map((sheet, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {'sheetName' in sheet ? sheet.sheetName : sheet.fileName}
                {sheet.mesReferencia && (
                  <span className="ml-2 text-sm text-blue-600">({sheet.mesReferencia})</span>
                )}
              </h4>
              
              {sheet.success.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center text-sm text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {sheet.success.length} registros válidos
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {sheet.success.slice(0, 3).map((row, i) => (
                      <div key={i} className="truncate">
                        Linha {row.rowNumber}: {row.data.natureza} - {row.data.numeroSicase}
                      </div>
                    ))}
                    {sheet.success.length > 3 && (
                      <div className="text-gray-400">
                        ... e mais {sheet.success.length - 3} registros
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sheet.failed.length > 0 && (
                <div>
                  <div className="flex items-center text-sm text-red-600 mb-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {sheet.failed.length} registros com erro
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {sheet.failed.slice(0, 3).map((row, i) => (
                      <div key={i} className="text-red-600">
                        Linha {row.rowNumber}: {row.errors.join(', ')}
                      </div>
                    ))}
                    {sheet.failed.length > 3 && (
                      <div className="text-gray-400">
                        ... e mais {sheet.failed.length - 3} erros
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <button
            onClick={() => setStep('upload')}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Voltar
          </button>
          <button
            onClick={handleImport}
            disabled={parseResult.totalSuccess === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Importar {parseResult.totalSuccess} Registros
          </button>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Importando dados...
      </h3>
      {progress && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {progress.current} de {progress.total} registros
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderResultStep = () => {
    if (!importResult) return null;

    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Importação Concluída!
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ {importResult.success} registros importados com sucesso</p>
          {importResult.failed > 0 && (
            <p className="text-red-600">⚠️ {importResult.failed} registros falharam</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fechar
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Importar Planilha
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={step === 'importing'}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'result' && renderResultStep()}
        </div>
      </div>
    </div>
  );
}
