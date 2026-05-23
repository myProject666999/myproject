'use client';

import { RotateCcw, Download } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { downloadCanvas } from '@/utils/canvasUtils';

export default function ActionBar() {
  const { image, canvasRef, reset } = useEditorStore();
  
  const handleDownload = () => {
    if (!canvasRef || !image) return;
    
    const shape = useEditorStore.getState().shape;
    const fileName = `avatar-${shape}-${Date.now()}.png`;
    downloadCanvas(canvasRef, fileName);
  };
  
  return (
    <div className="flex gap-3">
      <button
        onClick={reset}
        disabled={!image}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <RotateCcw size={18} />
        重置
      </button>
      <button
        onClick={handleDownload}
        disabled={!image}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Download size={18} />
        下载头像
      </button>
    </div>
  );
}
