import { ReactNode } from 'react';

interface StatusItemProps {
  label: string;
  value: string | number;
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
}

function StatusItem({ label, value, variant = 'info', icon }: StatusItemProps) {
  const variantColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${variantColors[variant]}`}>
        {icon}
        {value}
      </span>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  children: ReactNode;
}

export function StatusCard({ title, children }: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

StatusCard.Item = StatusItem;

export { StatusItem };