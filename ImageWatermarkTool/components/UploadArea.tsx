'use client';

import React, { useState, useCallback } from 'react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemove: (index: number) => void;
  taskName: string;
  onTaskNameChange: (name: string) => void;
  templateId: number | null;
  onTemplateChange: (id: number | null) => void;
  templates: Array<{ id: number; name: string }>;
  onUpload: () => void;
  isUploading: boolean;
}

export default function UploadArea({
  onFilesSelected,
  files,
  onRemove,
  taskName,
  onTaskNameChange,
  templateId,
  onTemplateChange,
  templates,
  onUpload,
  isUploading,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesSelected([...files, ...droppedFiles]);
  }, [files, onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesSelected([...files, ...newFiles]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => onTaskNameChange(e.target.value)}
            placeholder="输入任务名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择模板</label>
          <select
            value={templateId || ''}
            onChange={(e) => onTemplateChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">不使用模板</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">点击或拖拽图片到此处上传</p>
            <p className="text-sm text-gray-400 mt-1">支持批量上传，支持 JPG、PNG、GIF、WEBP 格式</p>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">已选择 {files.length} 个文件</span>
            <button
              onClick={onUpload}
              disabled={isUploading}
              className="btn btn-primary"
            >
              {isUploading ? '上传中...' : '开始上传'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
