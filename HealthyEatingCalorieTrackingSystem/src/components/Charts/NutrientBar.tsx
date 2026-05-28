import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NutrientBarProps {
  protein: number;
  fat: number;
  carbs: number;
  proteinGoal?: number;
  fatGoal?: number;
  carbsGoal?: number;
}

const NutrientBar = ({
  protein,
  fat,
  carbs,
  proteinGoal = 120,
  fatGoal = 60,
  carbsGoal = 250,
}: NutrientBarProps) => {
  const data = [
    {
      name: '蛋白质',
      value: protein,
      goal: proteinGoal,
      unit: 'g',
    },
    {
      name: '脂肪',
      value: fat,
      goal: fatGoal,
      unit: 'g',
    },
    {
      name: '碳水',
      value: carbs,
      goal: carbsGoal,
      unit: 'g',
    },
  ];

  const colors = ['#10B981', '#3B82F6', '#F59E0B'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">{item.name}</p>
          <p className="text-sm text-gray-600">
            已摄入: <span className="font-semibold text-primary-600">{item.value.toFixed(1)}g</span>
          </p>
          <p className="text-sm text-gray-600">
            目标: <span className="font-semibold text-gray-800">{item.goal}g</span>
          </p>
          <p className="text-sm text-gray-500">
            完成度: {((item.value / item.goal) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
            maxBarSize={50}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#color${['Protein', 'Fat', 'Carbs'][index]})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
            <span className="text-xs text-gray-600">
              {item.name}: {item.value.toFixed(1)}/{item.goal}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutrientBar;
