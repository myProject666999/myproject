'use client';

import { useState, useEffect } from 'react';
import {
  AlignJustify,
  Minimize2,
  Download,
  Copy,
  Check,
  FileJson,
  TreePine,
  AlertCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import JsonTree from './JsonTree';
import { formatJson, minifyJson, validateJson } from '@/lib/jsonUtils';

interface EditorPageProps {
  initialContent?: string;
}

export default function EditorPage({ initialContent = '' }: EditorPageProps) {
  const [inputValue, setInputValue] = useState(initialContent);

  useEffect(() => {
    const savedContent = sessionStorage.getItem('jsonContent');
    if (savedContent) {
      setInputValue(savedContent);
      sessionStorage.removeItem('jsonContent');
    }
  }, []);
  const [outputValue, setOutputValue] = useState('');
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFormat = () => {
    try {
      const formatted = formatJson(inputValue, indentSize);
      setOutputValue(formatted);
      setValidationError(null);
      setParsedData(JSON.parse(inputValue));
    } catch (error: any) {
      setValidationError(error.message);
      setOutputValue('');
      setParsedData(null);
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyJson(inputValue);
      setOutputValue(minified);
      setValidationError(null);
      setParsedData(JSON.parse(inputValue));
    } catch (error: any) {
      setValidationError(error.message);
      setOutputValue('');
      setParsedData(null);
    }
  };

  const handleCopy = async () => {
    if (!outputValue) return;
    await navigator.clipboard.writeText(outputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputValue) return;
    const blob = new Blob([outputValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputValue('');
    setOutputValue('');
    setValidationError(null);
    setParsedData(null);
  };

  const handleValidate = () => {
    const result = validateJson(inputValue);
    if (result.valid) {
      setValidationError(null);
    } else {
      setValidationError(result.error || '无效的JSON');
    }
  };

  const handleSaveHistory = async () => {
    if (!inputValue.trim()) return;

    const title = prompt('请输入记录标题:');
    if (!title) return;

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: inputValue,
        }),
      });

      if (response.ok) {
        alert('保存成功！');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <FileJson className="w-7 h-7 text-primary" />
          JSON编辑器
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">缩进:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">输入</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleValidate} className="btn btn-secondary text-sm">
                <Eye className="w-4 h-4" />
                校验
              </button>
              <button onClick={handleClear} className="btn btn-secondary text-sm">
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>
          <textarea
            className={`code-editor ${validationError ? 'error' : ''}`}
            placeholder="在此输入或粘贴JSON..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setValidationError(null);
            }}
          />
          {validationError && (
            <div className="flex items-center gap-2 text-danger text-sm">
              <AlertCircle className="w-4 h-4" />
              {validationError}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">输出</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('code')}
                className={`btn text-sm ${viewMode === 'code' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileJson className="w-4 h-4" />
                代码
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`btn text-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <TreePine className="w-4 h-4" />
                树形
              </button>
            </div>
          </div>

          {viewMode === 'code' ? (
            <textarea
              className="code-editor"
              placeholder="格式化或压缩后的输出将显示在这里..."
              value={outputValue}
              readOnly
            />
          ) : (
            <JsonTree data={parsedData} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button onClick={handleFormat} className="btn btn-primary px-6 py-3">
          <AlignJustify className="w-5 h-5" />
          格式化
        </button>
        <button onClick={handleMinify} className="btn btn-secondary px-6 py-3">
          <Minimize2 className="w-5 h-5" />
          压缩
        </button>
        <button
          onClick={handleCopy}
          className="btn btn-secondary px-6 py-3"
          disabled={!outputValue}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              复制
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-secondary px-6 py-3"
          disabled={!outputValue}
        >
          <Download className="w-5 h-5" />
          下载
        </button>
        <button
          onClick={handleSaveHistory}
          className="btn btn-secondary px-6 py-3"
          disabled={!inputValue.trim()}
        >
          <FileJson className="w-5 h-5" />
          保存历史
        </button>
      </div>
    </div>
  );
}
