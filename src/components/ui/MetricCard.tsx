import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: 'primary' | 'success' | 'warning' | 'error';
}

export function MetricCard({ 
  label, 
  value, 
  icon, 
  trend, 
  iconColor = 'primary' 
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`metric-icon ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`status-badge ${trend.isPositive ? 'success' : 'error'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}