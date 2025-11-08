'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyFromCents } from '@/utils/formatters';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  isLoading?: boolean;
  isCurrency?: boolean;
  isYearComparison?: boolean; // true = vs. ano passado, false = vs. mês passado
}

export function MetricCard({ title, value, change, isLoading, isCurrency, isYearComparison = false }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return isCurrency ? formatCurrencyFromCents(val) : val.toLocaleString('pt-BR');
    }
    return val;
  };

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

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(change)}`}>
              {getChangeIcon(change)}
              <span>{Math.abs(change)}% vs. {isYearComparison ? 'ano passado' : 'mês passado'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}