'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { loadImage } from '@/utils/canvasUtils';

export default function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { setImage, image } = useEditorStore();
  
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    
    try {
      const img = await loadImage(file);
      setImage(img);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('图片加载失败');
    }
  }, [setImage]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);
  
  const handleRemove = useCallback(() => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setImage]);
  
  if (image) {
    return (
      <div className="flex items-center justify-center gap-4">
        <span className="text-gray-300 text-sm">已加载图片</span>
        <button
          onClick={handleRemove}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <X size={16} />
          移除图片
        </button>
      </div>
    );
  }
  
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-accent bg-accent/10'
          : 'border-gray-600 hover:border-accent hover:bg-white/5'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-300 mb-2">点击或拖拽图片到此处</p>
      <p className="text-gray-500 text-sm">支持 JPG、PNG 格式</p>
    </div>
  );
}
