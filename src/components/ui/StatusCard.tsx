import { ReactNode } from 'react';
import { Card } from './card';

interface StatusCardProps {
  title: string;
  children: ReactNode;
}

interface StatusItemProps {
  label: string;
  value: string;
  variant?: 'success' | 'warning' | 'info' | 'default';
  icon?: ReactNode;
}

export function StatusCard({ title, children }: StatusCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </Card>
  );
}

StatusCard.Item = function StatusItem({ label, value, variant = 'default', icon }: StatusItemProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${variants[variant]}`}>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
};