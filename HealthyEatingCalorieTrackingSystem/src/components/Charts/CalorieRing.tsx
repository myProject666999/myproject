import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

const CalorieRing = ({ consumed, goal, size = 200 }: CalorieRingProps) => {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);

  const data = [
    { name: '已摄入', value: consumed },
    { name: '剩余', value: remaining },
  ];

  const getGradientColor = () => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10B981';
  };

  const renderCustomizedLabel = () => null;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="colorConsumed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={getGradientColor()} stopOpacity={1} />
              <stop offset="100%" stopColor={getGradientColor()} stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            animationDuration={1000}
            animationBegin={0}
            label={renderCustomizedLabel}
          >
            <Cell fill="url(#colorConsumed)" />
            <Cell fill="#f3f4f6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{Math.round(consumed)}</span>
        <span className="text-sm text-gray-500">/ {goal} kcal</span>
        <span className="text-sm font-medium" style={{ color: getGradientColor() }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default CalorieRing;
