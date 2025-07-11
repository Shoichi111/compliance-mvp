import { ReactNode } from 'react';

interface StatusItemProps {
  label: string;
  value: string | number;
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
}

function StatusItem({ label, value, variant = 'info', icon }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`status-badge ${variant} flex items-center gap-1`}>
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
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

StatusCard.Item = StatusItem;

export { StatusItem };