'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrencyFromCents } from '@/utils/formatters';

interface ValoresFinanceirosChartProps {
  data: { name: string; emolumentos: number; corretor: number; assessoria: number }[];
  isLoading?: boolean;
  change?: number;
}

export function ValoresFinanceirosChart({ data, isLoading, change }: ValoresFinanceirosChartProps) {
  console.log('📊 ValoresFinanceirosChart recebeu:', { data, dataLength: data?.length, isLoading });

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

  // Calcular totais
  const totalEmolumentos = data.reduce((sum, item) => sum + item.emolumentos, 0);
  const totalCorretor = data.reduce((sum, item) => sum + item.corretor, 0);
  const totalAssessoria = data.reduce((sum, item) => sum + item.assessoria, 0);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolução de Valores Financeiros
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comparação entre emolumentos, corretor e assessoria ao longo do tempo.
            </p>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>{change}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEmolumentos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCorretor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAssessoria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => {
                  // Valores estão em centavos, converter para reais primeiro
                  const reais = value / 100;
                  if (reais >= 1000000) {
                    return `R$ ${(reais / 1000000).toFixed(1)}M`;
                  } else if (reais >= 1000) {
                    return `R$ ${Math.round(reais / 1000)}k`;
                  }
                  return `R$ ${reais.toFixed(0)}`;
                }}
              />
              <Tooltip
                content={(props: any) => {
                  if (!props.active || !props.payload) return null;

                  const data = props.payload[0]?.payload;
                  if (!data) return null;

                  return (
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}>
                      <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{props.label}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                          <span style={{ color: '#3b82f6', fontWeight: 500 }}>Emolumentos : {formatCurrencyFromCents(data.emolumentos || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          <span style={{ color: '#10b981', fontWeight: 500 }}>Corretor : {formatCurrencyFromCents(data.corretor || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                          <span style={{ color: '#8b5cf6', fontWeight: 500 }}>Assessoria : {formatCurrencyFromCents(data.assessoria || 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                content={(props: any) => {
                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                        <span style={{ fontSize: '14px' }}>Emolumentos</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span style={{ fontSize: '14px' }}>Corretor</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                        <span style={{ fontSize: '14px' }}>Assessoria</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="emolumentos"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEmolumentos)"
                name="Emolumentos"
              />
              <Area
                type="monotone"
                dataKey="corretor"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCorretor)"
                name="Corretor"
              />
              <Area
                type="monotone"
                dataKey="assessoria"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAssessoria)"
                name="Assessoria"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Totais do período */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Total Emolumentos</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrencyFromCents(totalEmolumentos)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Total Corretor</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrencyFromCents(totalCorretor)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Total Assessoria</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrencyFromCents(totalAssessoria)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}