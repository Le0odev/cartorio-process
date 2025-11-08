import { useState } from 'react';
import { writeBatch, doc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/utils/constants';
import { parseExcelFile, ExcelParseResult, ParsedRow } from '@/utils/excelParser';
import { parseCSVFile, parseMultipleCSVFiles, CSVParseResult } from '@/utils/csvParser';
import { NovoProcessoData } from '@/modules/processos/types';

type ParseResult = ExcelParseResult | CSVParseResult;

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export function useExcelImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Parseia o arquivo (Excel ou CSV)
  const parseFile = async (file: File): Promise<ParseResult> => {
    setIsLoading(true);
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      let result: ParseResult;
      if (fileExtension === 'csv') {
        result = await parseCSVFile(file);
      } else {
        result = await parseExcelFile(file);
      }
      
      setParseResult(result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Parseia múltiplos arquivos CSV (um por mês)
  const parseMultipleFiles = async (files: File[]): Promise<ParseResult> => {
    setIsLoading(true);
    try {
      const result = await parseMultipleCSVFiles(files);
      setParseResult(result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gera próximo número de talão
  const generateTalao = async (): Promise<string> => {
    // Implementação simples - pode ser melhorada com contador no Firestore
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `T${timestamp}${random}`;
  };

  // Importa os dados para o Firestore
  const importToFirestore = async (
    parsedRows: ParsedRow[],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> => {
    setIsLoading(true);
    
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const total = parsedRows.length;
      let current = 0;

      // Firestore permite até 500 operações por batch
      const BATCH_SIZE = 500;
      
      for (let i = 0; i < parsedRows.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchRows = parsedRows.slice(i, i + BATCH_SIZE);

        for (const parsedRow of batchRows) {
          try {
            const { data } = parsedRow;
            
            // Gera talão se não existir
            if (!data.talao) {
              data.talao = await generateTalao();
            }

            // Cria documento no Firestore
            const docRef = doc(collection(db, COLLECTIONS.PROCESSOS));
            const processoData = {
              ...data,
              mesReferencia: (data as any).mesReferencia,
              data_criacao: Timestamp.now(),
              data_atualizacao: Timestamp.now(),
              historico: []
            };

            batch.set(docRef, processoData);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              row: parsedRow.rowNumber,
              message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }

          current++;
          const progressData: ImportProgress = {
            current,
            total,
            percentage: Math.round((current / total) * 100)
          };
          
          setProgress(progressData);
          onProgress?.(progressData);
        }

        // Commit do batch
        await batch.commit();
      }

      return result;
    } catch (error) {
      throw new Error(`Erro ao importar dados: ${error}`);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  // Limpa o resultado do parse
  const clearParseResult = () => {
    setParseResult(null);
  };

  return {
    isLoading,
    progress,
    parseResult,
    parseFile,
    parseMultipleFiles,
    importToFirestore,
    clearParseResult
  };
}
