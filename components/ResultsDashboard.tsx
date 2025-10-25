import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sale, Piece } from '../types';

interface ResultsDashboardProps {
  sales: Sale[];
  pieces: Piece[];
}

type Period = '7d' | '30d' | 'all';

const GlassPanel: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/30 dark:border-gray-700/50 ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
  <div className={`text-center ${className}`}>
    <p className="text-sm text-graphite/80 dark:text-graphite-light/80">{title}</p>
    <p className="text-2xl md:text-3xl font-bold text-graphite dark:text-snow-white">{value}</p>
  </div>
);

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ sales, pieces }) => {
  const [period, setPeriod] = useState<Period>('30d');
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filteredSales = useMemo(() => {
    if (period === 'all') return sales;
    const now = new Date();
    const daysToSubtract = period === '7d' ? 7 : 30;
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    return sales.filter(sale => new Date(sale.date) >= cutoffDate);
  }, [sales, period]);
  
  const stats = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      acc.totalProfit += sale.profit;
      acc.grossRevenue += sale.salePrice;
      acc.totalSales += sale.quantity;
      return acc;
    }, { totalProfit: 0, grossRevenue: 0, totalSales: 0 });
  }, [filteredSales]);
  
  const pieceRanking = useMemo(() => {
    // By typing the initial value for the `reduce` method, TypeScript can correctly
    // infer the type of the accumulator `acc`. This resolves the type inference issue
    // for the `sort` method's parameters downstream.
    type RankingData = { name: string; totalProfit: number; totalSold: number };
    const ranking = filteredSales.reduce((acc, sale) => {
      if (!acc[sale.pieceId]) {
        acc[sale.pieceId] = { name: sale.pieceName, totalProfit: 0, totalSold: 0 };
      }
      acc[sale.pieceId].totalProfit += sale.profit;
      acc[sale.pieceId].totalSold += sale.quantity;
      return acc;
    }, {} as Record<string, RankingData>);
    
    return Object.values(ranking)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);
  }, [filteredSales]);
  
  const salesByDay = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.date).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(sale);
      return acc;
    }, {} as Record<string, Sale[]>);
  }, [filteredSales]);
  
  const sortedDays = Object.keys(salesByDay).sort((a, b) => new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime());

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-center bg-gray-200 dark:bg-gray-700 p-1 rounded-full w-full max-w-sm mx-auto">
        {(['7d', '30d', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`w-full py-2 text-sm font-semibold rounded-full transition-colors ${period === p ? 'bg-white dark:bg-gray-900 text-dusty-rose shadow' : 'text-graphite/70 dark:text-graphite-light/70'}`}
          >
            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : 'Tudo'}
          </button>
        ))}
      </div>
      
      <GlassPanel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Lucro Total" value={formatCurrency(stats.totalProfit)} />
          <StatCard title="Receita Bruta" value={formatCurrency(stats.grossRevenue)} />
          <StatCard title="Peças Vendidas" value={stats.totalSales.toString()} />
        </div>
      </GlassPanel>

      <GlassPanel>
        <h3 className="text-xl font-bold text-graphite dark:text-snow-white mb-4">Ranking de Peças (por Lucro)</h3>
        {pieceRanking.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieceRanking} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-graphite/80 dark:text-graphite-light/80" />
                <YAxis tickFormatter={val => `R$${val}`} tick={{ fill: 'currentColor' }} className="text-xs text-graphite/80 dark:text-graphite-light/80" />
                <Tooltip
                  cursor={{ fill: 'rgba(217,119,6, 0.1)' }}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '0.75rem',
                    color: '#333'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Lucro']}
                />
                <Bar dataKey="totalProfit" fill="#FBBF24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
            <p className="text-center text-graphite/70 dark:text-graphite-light/70 py-10">Nenhuma venda no período para exibir o ranking.</p>
        )}
      </GlassPanel>
      
      <GlassPanel>
        <h3 className="text-xl font-bold text-graphite dark:text-snow-white mb-4">Histórico de Vendas</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {sortedDays.length > 0 ? sortedDays.map(date => (
            <div key={date}>
              <p className="font-semibold text-graphite dark:text-graphite-light mb-2">{date}</p>
              <ul className="space-y-2">
                {salesByDay[date].map(sale => (
                  <li key={sale.id} className="flex items-center space-x-3 bg-white/50 dark:bg-gray-900/50 p-2 rounded-lg">
                    <img src={sale.piecePhoto} alt={sale.pieceName} className="w-12 h-12 rounded-md object-cover"/>
                    <div className="flex-1">
                      <p className="font-semibold text-graphite dark:text-snow-white">{sale.pieceName}</p>
                      <p className="text-xs text-graphite/70 dark:text-graphite-light/70">{sale.quantity}x {formatCurrency(sale.salePrice)}</p>
                    </div>
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm">+{formatCurrency(sale.profit)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )) : (
             <p className="text-center text-graphite/70 dark:text-graphite-light/70 py-10">Nenhuma venda registrada no período.</p>
          )}
        </div>
      </GlassPanel>

    </div>
  );
};
