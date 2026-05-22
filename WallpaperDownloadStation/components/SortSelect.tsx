'use client';

interface SortSelectProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: 'latest', label: '最新上传' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'downloads', label: '下载最多' },
  { value: 'random', label: '随机推荐' },
];

export default function SortSelect({ currentSort, onSortChange }: SortSelectProps) {
  return (
    <select
      value={currentSort}
      onChange={(e) => onSortChange(e.target.value)}
      className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
    >
      {sortOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
