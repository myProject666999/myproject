import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'warning';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const StatCard = ({ title, value, icon, color = 'primary', trend }: StatCardProps) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-yellow-500 to-orange-500',
  };

  const bgClasses = {
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
    success: 'bg-success-50',
    warning: 'bg-yellow-50',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-800">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend.isUp ? 'text-success-500' : 'text-red-500'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-neutral-400 ml-1">较上月</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className={`mt-4 h-1 ${bgClasses[color]} rounded-full overflow-hidden`}>
        <div className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`} style={{ width: '60%' }} />
      </div>
    </div>
  );
};

export default StatCard;
