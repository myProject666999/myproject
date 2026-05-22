'use client';

import { useEffect, useState } from 'react';

interface ResolutionFilterProps {
  selectedResolution: string;
  onResolutionChange: (resolution: string) => void;
}

export default function ResolutionFilter({
  selectedResolution,
  onResolutionChange,
}: ResolutionFilterProps) {
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resolutions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResolutions(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onResolutionChange('')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          selectedResolution === ''
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        全部分辨率
      </button>
      {resolutions.map(res => (
        <button
          key={res}
          onClick={() => onResolutionChange(res)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedResolution === res
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {res}
        </button>
      ))}
    </div>
  );
}
