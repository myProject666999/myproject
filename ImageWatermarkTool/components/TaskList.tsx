'use client';

import React from 'react';

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

interface TaskListProps {
  tasks: Task[];
  onSelect: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onDownload: (taskId: number) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: '等待中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
};

export default function TaskList({ tasks, onSelect, onDelete, onDownload }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>暂无任务，上传图片开始处理</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="card hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium">{task.task_name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>图片数量: {task.image_count || task.total_count}</p>
                <p>创建时间: {new Date(task.created_at).toLocaleString('zh-CN')}</p>
                {task.status === 'completed' && (
                  <p>
                    成功: {task.success_count} / 失败: {task.failed_count}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelect(task.id)}
                className="btn btn-secondary text-sm"
              >
                查看
              </button>
              {task.status === 'completed' && (task.success_count || 0) > 0 && (
                <button
                  onClick={() => onDownload(task.id)}
                  className="btn btn-primary text-sm"
                >
                  下载
                </button>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="btn btn-danger text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
