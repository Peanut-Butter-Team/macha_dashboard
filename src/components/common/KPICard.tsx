import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  metricKey?: string;
  loading?: boolean;
}

export function KPICard({ title, value, change, icon: Icon, metricKey, loading }: KPICardProps) {
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-8 bg-slate-200 rounded w-28 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-slate-500">{title}</span>
          {metricKey && <InfoTooltip metricKey={metricKey} />}
        </div>
        <div className="p-2.5 bg-primary-50 rounded-xl">
          <Icon size={20} className="text-primary-600" />
        </div>
      </div>
      <div className="text-3xl font-bold text-primary-950 mb-2">{value}</div>
      <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        <span>{Math.abs(change).toFixed(1)}% vs 이전 기간</span>
      </div>
    </div>
  );
}
