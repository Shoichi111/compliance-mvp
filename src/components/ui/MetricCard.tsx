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
  const iconColors = {
    primary: 'bg-indigo-100 text-indigo-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-orange-100 text-orange-600',
    error: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColors[iconColor]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            trend.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}