import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  highlight = false,
}) => {
  return (
    <div className={`p-4 rounded border transition-all ${
      highlight 
        ? 'bg-graphite-800 border-lime-accent/50 shadow-glow' 
        : 'bg-graphite-800/90 border-graphite-600 hover:border-graphite-500'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-mono text-graphite-400 font-semibold">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-graphite-400" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-graphite-100">{value}</span>
        {unit && <span className="text-xs font-mono text-graphite-400">{unit}</span>}
      </div>
      {(subtext || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-graphite-400">
          {subtext && <span className="truncate">{subtext}</span>}
          {trend && (
            <span className={`font-mono font-medium ${trend.isPositive ? 'text-lime-accent' : 'text-status-warning'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
