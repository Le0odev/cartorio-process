'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyFromCents } from '@/utils/formatters';

interface EvolucaoEmolumentosChartProps {
  data: { name: string; emolumentos: number; pagos: number }[];
  isLoading?: boolean;
  change?: number;
}

export function EvolucaoEmolumentosChart({ data, isLoading, change }: EvolucaoEmolumentosChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolução Mensal de Emolumentos
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comparação entre emolumentos totais e valores pagos por mês.
            </p>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(change)}`}>
              {getChangeIcon(change)}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrencyFromCents(value),
                  name === 'emolumentos' ? 'Total Emolumentos' : 'Total Pago'
                ]}
              />
              <Bar 
                dataKey="emolumentos" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="emolumentos"
              />
              <Bar 
                dataKey="pagos" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="pagos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Emolumentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Pago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}