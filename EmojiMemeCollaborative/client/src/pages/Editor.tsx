import { useEffect, useRef, useState } from 'react';
import {
  Download, Undo2, Redo2, Type, Image as ImageIcon, Trash2, ZoomIn, ZoomOut, Smile, AlignLeft, Bold, Italic, Layers
} from 'lucide-react';
import { Canvas, Rect, IText, FabricImage } from 'fabric';
import StickerPicker from '../components/StickerPicker';

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [textValue, setTextValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (canvasRef.current && canvasInstance.current === null) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 600,
        height: 600,
        backgroundColor: '#1A1A2E',
        preserveObjectStacking: true,
      });

      canvasInstance.current = initCanvas;
      setCanvas(initCanvas);

      initCanvas.on('selection:created', handleSelection);
      initCanvas.on('selection:updated', handleSelection);
      initCanvas.on('selection:cleared', () => setActiveObject(null));

      const bg = new Rect({
        left: 0,
        top: 0,
        width: 600,
        height: 600,
        fill: '#2D1B69',
        selectable: false,
        evented: false,
      });
      initCanvas.add(bg);
      initCanvas.sendObjectToBack(bg);

      saveState();
    }

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.dispose();
        canvasInstance.current = null;
      }
    };
  }, []);

  const handleSelection = (e: any) => {
    const selected = e.selected?.[0];
    setActiveObject(selected || null);
    if (selected?.type === 'i-text' || selected?.type === 'textbox') {
      setTextValue(selected.text || '');
    }
  };

  const saveState = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const prevIndex = historyIndex - 1;
      canvas.loadFromJSON(history[prevIndex]).then(() => {
        setHistoryIndex(prevIndex);
        canvas.renderAll();
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const nextIndex = historyIndex + 1;
      canvas.loadFromJSON(history[nextIndex]).then(() => {
        setHistoryIndex(nextIndex);
        canvas.renderAll();
      });
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new IText('双击编辑文字', {
      left: 200,
      top: 200,
      fill: '#FFFFFF',
      fontSize: 32,
      fontFamily: 'Arial',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveState();
  };

  const updateText = (newText: string) => {
    if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      activeObject.set('text', newText);
      canvas?.renderAll();
      saveState();
    }
  };

  const changeTextColor = (color: string) => {
    if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      activeObject.set('fill', color);
      canvas?.renderAll();
      saveState();
    }
  };

  const addSticker = (emoji: string) => {
    if (!canvas) return;
    const text = new IText(emoji, {
      left: 250,
      top: 250,
      fontSize: 64,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setShowStickerPicker(false);
    saveState();
  };

  const deleteSelected = () => {
    if (canvas && activeObject) {
      canvas.remove(activeObject);
      setActiveObject(null);
      saveState();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgElement = document.createElement('img');
        imgElement.src = event.target?.result as string;
        imgElement.onload = () => {
          const fabricImage = new FabricImage(imgElement);
          fabricImage.scaleToWidth(300);
          canvas.add(fabricImage);
          canvas.setActiveObject(fabricImage);
          saveState();
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    setZoom(newZoom);
    canvas?.setZoom(newZoom);
  };

  const downloadImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    });
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataURL;
    link.click();
  };

  const bringToFront = () => {
    if (canvas && activeObject) {
      canvas.bringObjectToFront(activeObject);
      canvas.renderAll();
    }
  };

  const sendToBack = () => {
    if (canvas && activeObject) {
      canvas.sendObjectToBack(activeObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-glow">梗图编辑器</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 cyber-card rounded-xl p-4 space-y-4">
            <h3 className="font-semibold mb-3 text-primary">工具栏</h3>

            <div className="flex flex-wrap gap-2">
              <ToolButton icon={<Undo2 size={18} />} onClick={undo} title="撤销" disabled={historyIndex <= 0} />
              <ToolButton icon={<Redo2 size={18} />} onClick={redo} title="重做" disabled={historyIndex >= history.length - 1} />
              <ToolButton icon={<ZoomIn size={18} />} onClick={() => handleZoom(0.1)} title="放大" />
              <ToolButton icon={<ZoomOut size={18} />} onClick={() => handleZoom(-0.1)} title="缩小" />
            </div>

            <div className="border-t border-primary/20 pt-4">
              <h4 className="text-sm text-gray-400 mb-2">添加元素</h4>
              <div className="flex flex-wrap gap-2">
                <ToolButton icon={<Type size={18} />} onClick={addText} title="添加文字" />
                <ToolButton icon={<Smile size={18} />} onClick={() => setShowStickerPicker(!showStickerPicker)} title="添加贴纸" active={showStickerPicker} />
                <label className="cursor-pointer">
                  <ToolButton icon={<ImageIcon size={18} />} title="添加图片" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {activeObject && (
              <div className="border-t border-primary/20 pt-4">
                <h4 className="text-sm text-gray-400 mb-2">选中元素</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <ToolButton icon={<Layers size={18} />} onClick={bringToFront} title="置顶" />
                  <ToolButton icon={<Layers size={18} />} onClick={sendToBack} title="置底" />
                  <ToolButton icon={<Trash2 size={18} />} onClick={deleteSelected} title="删除" danger />
                </div>

                {(activeObject.type === 'i-text' || activeObject.type === 'textbox') && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={textValue}
                      onChange={(e) => {
                        setTextValue(e.target.value);
                        updateText(e.target.value);
                      }}
                      className="w-full px-3 py-2 cyber-input rounded-lg text-sm"
                      placeholder="编辑文字"
                    />
                    <div className="flex gap-2">
                      <ToolButton icon={<Bold size={16} />} onClick={() => {}} title="粗体" />
                      <ToolButton icon={<Italic size={16} />} onClick={() => {}} title="斜体" />
                      <ToolButton icon={<AlignLeft size={16} />} onClick={() => {}} title="左对齐" />
                    </div>
                    <div className="flex gap-2">
                      <ColorPicker onChange={changeTextColor} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <div className="cyber-card rounded-xl p-6 inline-block">
              <div
                className="overflow-auto"
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              >
                <canvas ref={canvasRef} style={{ border: '2px solid rgba(255, 107, 53, 0.3)' }} />
              </div>
            </div>
          </div>

          <div className="lg:w-64 cyber-card rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-primary">操作</h3>
            <button
              onClick={downloadImage}
              className="w-full py-3 cyber-btn rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Download size={18} />
              下载图片
            </button>

            <div className="mt-4 p-3 bg-dark/50 rounded-lg">
              <p className="text-xs text-gray-400">缩放: {Math.round(zoom * 100)}%</p>
              <p className="text-xs text-gray-400">画布: 600 x 600</p>
            </div>

            {showStickerPicker && (
              <div className="mt-4">
                <StickerPicker
                  onSelect={addSticker}
                  onClose={() => setShowStickerPicker(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

const ToolButton = ({ icon, onClick, title, active = false, danger = false, disabled = false }: ToolButtonProps) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all ${
      disabled
        ? 'opacity-50 cursor-not-allowed text-gray-600'
        : danger
        ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
        : active
        ? 'bg-primary/20 text-primary'
        : 'hover:bg-primary/10 text-gray-400 hover:text-white'
    }`}
  >
    {icon}
  </button>
);

const ColorPicker = ({ onChange }: { onChange: (color: string) => void }) => {
  const colors = ['#FFFFFF', '#FF6B35', '#FFD166', '#06D6A0', '#2D1B69', '#EF476F'];
  return (
    <div className="flex gap-1">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className="w-6 h-6 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export default Editor;
