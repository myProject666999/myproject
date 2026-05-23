'use client';

import React, { useState } from 'react';
import { ImageItem } from '@/types';
import { fileToDataUrl, loadImage, generateId } from '@/lib/puzzle';

interface ImageUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files: FileList) => {
    const newImages: ImageItem[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const dataUrl = await fileToDataUrl(file);
        const img = await loadImage(dataUrl);

        newImages.push({
          id: generateId(),
          dataUrl,
          width: img.width,
          height: img.height,
          name: file.name,
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-input"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <label htmlFor="image-input" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">拖拽图片到此处或点击上传</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、GIF 格式</p>
          </div>
        </label>
      </div>

      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">已上传 {images.length} 张图片</span>
            <button
              onClick={() => onImagesChange([])}
              className="text-sm text-red-500 hover:text-red-600"
            >
              清空全部
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
