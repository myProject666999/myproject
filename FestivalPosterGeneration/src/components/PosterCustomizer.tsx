"use client";

import { useState, useRef, useCallback } from "react";
import { PosterTemplate } from "@/lib/types";
import PosterCanvas from "./PosterCanvas";
import { Download, Upload, RotateCcw, Share2 } from "lucide-react";

interface Props {
  template: PosterTemplate;
}

export default function PosterCustomizer({ template }: Props) {
  const [texts, setTexts] = useState<Record<string, string>>(() => {
    if (!template.text_config) return {};
    const initial: Record<string, string> = {};
    Object.entries(template.text_config).forEach(([key, config]) => {
      initial[key] = config.text;
    });
    return initial;
  });
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTextChange = (key: string, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${template.name}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 0.95);
    link.click();
  };

  const handleReset = () => {
    if (template.text_config) {
      const reset: Record<string, string> = {};
      Object.entries(template.text_config).forEach(([key, config]) => {
        reset[key] = config.text;
      });
      setTexts(reset);
    }
    setAvatarDataUrl(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4 overflow-auto max-h-[75vh]">
            <PosterCanvas
              template={template}
              posterData={{ texts, avatarDataUrl }}
              onCanvasRef={handleCanvasRef}
              scale={0.5}
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download size={20} />
              下载海报
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={20} />
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Upload size={20} />
            上传头像
          </h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarDataUrl ? (
              <div className="space-y-2">
                <img
                  src={avatarDataUrl}
                  alt="头像预览"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-primary"
                />
                <p className="text-sm text-gray-500">点击更换头像</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">👤</div>
                <p className="text-gray-600">点击上传头像</p>
                <p className="text-xs text-gray-400">支持 JPG、PNG 格式</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4">编辑文字</h3>
          <div className="space-y-4">
            {template.text_config &&
              Object.entries(template.text_config).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key === "title"
                      ? "主标题"
                      : key === "subtitle"
                      ? "副标题"
                      : key === "blessing"
                      ? "祝福语"
                      : key}
                  </label>
                  {key === "blessing" ? (
                    <textarea
                      value={texts[key] || ""}
                      onChange={(e) => handleTextChange(key, e.target.value)}
                      maxLength={100}
                      rows={3}
                      className="input-field resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={texts[key] || ""}
                      onChange={(e) => handleTextChange(key, e.target.value)}
                      maxLength={config.maxWidth ? 30 : 20}
                      className="input-field"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {(texts[key] || "").length} / {config.maxWidth ? 100 : 20}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {template.is_limited === 1 && template.online_from && template.online_to && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-4 text-white">
            <p className="font-medium">⏰ 限时模板</p>
            <p className="text-sm opacity-90 mt-1">
              {new Date(template.online_from).toLocaleDateString("zh-CN")} -{" "}
              {new Date(template.online_to).toLocaleDateString("zh-CN")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
