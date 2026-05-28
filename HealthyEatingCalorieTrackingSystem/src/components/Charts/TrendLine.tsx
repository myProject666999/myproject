import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TrendData } from '../../types';

interface TrendLineProps {
  data: TrendData[];
}

const TrendLine = ({ data }: TrendLineProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const processedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value} kcal</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (payload && payload.length) {
      return (
        <div className="flex justify-center gap-6 mt-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-0.5"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={processedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="total_calories_intake"
            name="摄入热量"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6, fill: '#10B981' }}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="total_calories_burned"
            name="消耗热量"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ fill: '#F59E0B', r: 4 }}
            activeDot={{ r: 6, fill: '#F59E0B' }}
            animationDuration={1000}
            animationBegin={200}
          />
          <Line
            type="monotone"
            dataKey="net_calories"
            name="净热量"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6, fill: '#3B82F6' }}
            animationDuration={1000}
            animationBegin={400}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLine;
