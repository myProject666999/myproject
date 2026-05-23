'use client';

import React, { useState, useEffect } from 'react';
import UploadArea from '@/components/UploadArea';
import TaskList from '@/components/TaskList';

interface Task {
  id: number;
  task_name: string;
  status: string;
  success_count: number;
  failed_count: number;
  total_count: number;
  created_at: string;
  image_count?: number;
}

interface Template {
  id: number;
  name: string;
  type: string;
}

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [taskName, setTaskName] = useState('批量处理任务');
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('获取任务列表失败:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchTasks();
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('请先选择图片');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('taskName', taskName);
      if (templateId) {
        formData.append('templateId', String(templateId));
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setFiles([]);
        fetchTasks();
      } else {
        setError(data.error || '上传失败');
      }
    } catch (err: any) {
      setError(err.message || '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectTask = (taskId: number) => {
    window.location.href = `/edit?taskId=${taskId}`;
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('确定要删除此任务吗？')) return;

    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('删除任务失败:', err);
    }
  };

  const handleDownload = (taskId: number) => {
    window.location.href = `/api/download?taskId=${taskId}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图片水印工具</h1>
          <p className="text-gray-600">批量添加文字/Logo水印，支持模板保存和批量下载</p>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">上传图片</h2>
          <UploadArea
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemove={handleRemoveFile}
            taskName={taskName}
            onTaskNameChange={setTaskName}
            templateId={templateId}
            onTemplateChange={setTemplateId}
            templates={templates}
            onUpload={handleUpload}
            isUploading={isUploading}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">任务列表</h2>
          <TaskList
            tasks={tasks}
            onSelect={handleSelectTask}
            onDelete={handleDeleteTask}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}
