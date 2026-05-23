"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";

type ErrorLevel = "L" | "M" | "Q" | "H";
type DotStyle = "square" | "rounded" | "dots";

const PRESET_COLORS = [
  { name: "经典黑", qr: "#000000", bg: "#ffffff" },
  { name: "科技蓝", qr: "#1890ff", bg: "#ffffff" },
  { name: "自然绿", qr: "#52c41a", bg: "#ffffff" },
  { name: "热情红", qr: "#f5222d", bg: "#ffffff" },
  { name: "优雅紫", qr: "#722ed1", bg: "#ffffff" },
  { name: "深邃蓝", qr: "#ffffff", bg: "#1890ff" },
  { name: "简约灰", qr: "#595959", bg: "#f5f5f5" },
  { name: "金色豪华", qr: "#d4af37", bg: "#1a1a1a" },
];

export default function QRCodeGenerator() {
  const [content, setContent] = useState("https://example.com");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [margin, setMargin] = useState(2);
  const [width, setWidth] = useState(300);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.2);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Array<{ id: number; content: string; created_at: string }>>([]);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQRCode = useCallback(async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const canvas = qrCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await QRCode.toCanvas(canvas, content, {
        errorCorrectionLevel: errorLevel,
        margin: margin,
        width: width,
        color: {
          dark: qrColor,
          light: bgColor,
        },
      });

      if (dotStyle !== "square") {
        const imageData = ctx.getImageData(0, 0, width, width);
        const data = imageData.data;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, width);

        const moduleCount = 25 + margin * 2;
        const moduleSize = width / moduleCount;
        const offset = moduleSize * margin;

        for (let y = margin; y < moduleCount - margin; y++) {
          for (let x = margin; x < moduleCount - margin; x++) {
            const pixelX = Math.floor(offset + (x - margin) * moduleSize + moduleSize / 2);
            const pixelY = Math.floor(offset + (y - margin) * moduleSize + moduleSize / 2);
            const idx = (pixelY * width + pixelX) * 4;

            const isDark = data[idx] === 0 && data[idx + 1] === 0 && data[idx + 2] === 0;

            if (isDark) {
              ctx.fillStyle = qrColor;
              const centerX = offset + (x - margin) * moduleSize + moduleSize / 2;
              const centerY = offset + (y - margin) * moduleSize + moduleSize / 2;
              const radius = dotStyle === "dots" ? moduleSize * 0.45 : moduleSize * 0.4;

              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      if (logoData) {
        const img = new Image();
        img.onload = () => {
          const logoWidth = width * logoSize;
          const logoHeight = (img.height / img.width) * logoWidth;
          const logoX = (width - logoWidth) / 2;
          const logoY = (width - logoHeight) / 2;

          ctx.fillStyle = bgColor;
          const padding = logoWidth * 0.1;
          ctx.beginPath();
          ctx.roundRect(
            logoX - padding,
            logoY - padding,
            logoWidth + padding * 2,
            logoHeight + padding * 2,
            8
          );
          ctx.fill();

          ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
          setQrImage(canvas.toDataURL("image/png"));
        };
        img.src = logoData;
      } else {
        setQrImage(canvas.toDataURL("image/png"));
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [content, qrColor, bgColor, errorLevel, dotStyle, margin, width, logoData, logoSize]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (qrImage) {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = qrImage;
      link.click();
    }
  };

  const handleSaveHistory = async () => {
    if (!qrImage || !content.trim()) return;

    try {
      const response = await fetch("/api/qrcode/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          qr_color: qrColor,
          bg_color: bgColor,
          error_level: errorLevel,
          dot_style: dotStyle,
          logo_data: logoData,
          logo_size: logoSize,
          margin,
          width,
          qr_image: qrImage,
        }),
      });

      if (response.ok) {
        alert("保存成功！");
        fetchHistory();
      }
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/qrcode/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const applyPreset = (preset: { qr: string; bg: string }) => {
    setQrColor(preset.qr);
    setBgColor(preset.bg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">二维码美化生成器</h1>
          <p className="text-gray-600">生成带 Logo、圆点、颜色的精美二维码</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">设置选项</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  二维码内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="输入网址、文本等内容"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预设配色
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="relative h-12 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all overflow-hidden group"
                      title={preset.name}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${preset.qr} 50%, ${preset.bg} 50%)`,
                        }}
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-xs bg-black/50 text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    二维码颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    容错级别
                  </label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">低 (7%)</option>
                    <option value="M">中 (15%)</option>
                    <option value="Q">较高 (25%)</option>
                    <option value="H">高 (30%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    圆点样式
                  </label>
                  <select
                    value={dotStyle}
                    onChange={(e) => setDotStyle(e.target.value as DotStyle)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="square">方形</option>
                    <option value="rounded">圆角</option>
                    <option value="dots">圆点</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    边距: {margin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尺寸: {width}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    step="10"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo 上传
                </label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    选择图片
                  </button>
                  {logoData && (
                    <div className="flex items-center gap-2">
                      <img src={logoData} alt="Logo preview" className="w-10 h-10 object-contain rounded" />
                      <button
                        onClick={() => setLogoData(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        移除
                      </button>
                    </div>
                  )}
                </div>
                {logoData && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      Logo 占比: {Math.round(logoSize * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.3"
                      step="0.01"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      建议不超过 30%，否则可能影响二维码识别
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={generateQRCode}
                disabled={isGenerating || !content.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isGenerating ? "生成中..." : "生成二维码"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">预览</h2>

            <div className="flex flex-col items-center">
              <div
                className="relative rounded-xl overflow-hidden shadow-inner"
                style={{ backgroundColor: bgColor, minHeight: "300px", minWidth: "300px" }}
              >
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] w-[300px] text-gray-400">
                    点击生成二维码
                  </div>
                )}
              </div>

              <canvas ref={qrCanvasRef} width={width} height={width} className="hidden" />

              {qrImage && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载 PNG
                  </button>
                  <button
                    onClick={handleSaveHistory}
                    className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    保存到历史
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">历史记录</h3>
                <button
                  onClick={fetchHistory}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  刷新
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">暂无历史记录</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setContent(item.content)}
                    >
                      <p className="text-sm text-gray-700 truncate">{item.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• 添加 Logo 时建议选择较高的容错级别（Q 或 H）</li>
            <li>• Logo 占比建议控制在 25% 以内，避免影响扫描</li>
            <li>• 深色二维码配浅色背景通常扫描效果更好</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
