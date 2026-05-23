'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import WatermarkConfigForm from '@/components/WatermarkConfigForm';
import PositionPreview from '@/components/PositionPreview';
import { WatermarkPosition } from '@/lib/watermark';

interface Image {
  id: number;
  original_filename: string;
  original_path: string;
  watermarked_path: string | null;
  status: string;
  error_message: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
}

interface Template {
  id: number;
  name: string;
  type: string;
  text_content: string | null;
  position: WatermarkPosition;
  opacity: number;
  font_size: number;
  font_color: string;
  margin: number;
}

export default function EditPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [images, setImages] = useState<Image[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');

  const [config, setConfig] = useState({
    type: 'text' as 'text' | 'logo',
    text: 'www.example.com',
    logoPath: '',
    position: 'bottom-right' as WatermarkPosition,
    opacity: 1,
    fontSize: 24,
    fontColor: 'rgba(255, 255, 255, 0.8)',
    margin: 20,
  });

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('获取模板失败:', err);
    }
  };

  const fetchImages = useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
        if (data.images.length > 0 && !selectedImage) {
          setSelectedImage(data.images[0]);
        }
      }
    } catch (err) {
      console.error('获取图片列表失败:', err);
    }
  }, [taskId, selectedImage]);

  useEffect(() => {
    fetchTemplates();
    fetchImages();
  }, [fetchImages]);

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === parseInt(templateId));
    if (template) {
      setConfig({
        type: template.type as 'text' | 'logo',
        text: template.text_content || '',
        logoPath: '',
        position: template.position,
        opacity: parseFloat(String(template.opacity)),
        fontSize: template.font_size,
        fontColor: template.font_color,
        margin: template.margin,
      });
    }
  };

  const handleProcess = async () => {
    if (!taskId) {
      setError('缺少任务ID');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingResult(null);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: parseInt(taskId),
          config,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProcessingResult(data.message);
        fetchImages();
      } else {
        setError(data.error || '处理失败');
      }
    } catch (err: any) {
      setError(err.message || '处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          type: config.type,
          text_content: config.text,
          position: config.position,
          opacity: config.opacity,
          font_size: config.fontSize,
          font_color: config.fontColor,
          margin: config.margin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('模板保存成功');
        setTemplateName('');
        fetchTemplates();
      } else {
        setError(data.error || '保存模板失败');
      }
    } catch (err: any) {
      setError(err.message || '保存模板失败');
    }
  };

  const handleDownload = () => {
    if (taskId) {
      window.location.href = `/api/download?taskId=${taskId}`;
    }
  };

  const completedImages = images.filter((img) => img.status === 'completed');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => (window.location.href = '/')}
              className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1"
            >
              <span>←</span> 返回列表
            </button>
            <h1 className="text-3xl font-bold text-gray-900">水印编辑</h1>
            <p className="text-gray-600">配置水印参数并批量处理图片</p>
          </div>
          {completedImages.length > 0 && (
            <button onClick={handleDownload} className="btn btn-primary">
              下载全部 ({completedImages.length})
            </button>
          )}
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {processingResult && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {processingResult}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <WatermarkConfigForm
              config={config}
              onChange={setConfig}
              onProcess={handleProcess}
              isProcessing={isProcessing}
              onSaveTemplate={handleSaveTemplate}
              templateName={templateName}
              onTemplateNameChange={setTemplateName}
            />

            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">选择模板</h3>
              <select
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">不使用模板</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">位置预览</h3>
              {selectedImage ? (
                <PositionPreview
                  imageUrl={`/api/images?imageId=${selectedImage.id}&type=original`}
                  watermarkText={config.type === 'text' ? config.text : 'LOGO'}
                  position={config.position}
                  opacity={config.opacity}
                  fontSize={config.fontSize}
                  fontColor={config.fontColor}
                />
              ) : (
                <p className="text-gray-500">请选择图片进行预览</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">图片列表 ({images.length})</h3>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage?.id === img.id
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={`/api/images?imageId=${img.id}&type=${img.status === 'completed' ? 'watermarked' : 'original'}`}
                        alt={img.original_filename}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">{img.original_filename}</p>
                        <p className={`text-xs mt-1 ${
                          img.status === 'completed' ? 'text-green-600' :
                          img.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {img.status === 'completed' ? '已完成' :
                           img.status === 'failed' ? '失败' :
                           img.status === 'processing' ? '处理中' : '等待中'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无图片</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
