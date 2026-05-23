'use client';

import { useState, useRef, useEffect } from 'react';
import { GitCompare, RefreshCw, Copy, Check } from 'lucide-react';

export default function DiffPage() {
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [diffResult, setDiffResult] = useState<{
    leftLines: { content: string; type: string; lineNumber: number }[];
    rightLines: { content: string; type: string; lineNumber: number }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);

  const handleCompare = () => {
    const leftLines = leftValue.split('\n');
    const rightLines = rightValue.split('\n');

    const maxLen = Math.max(leftLines.length, rightLines.length);
    const leftResult: { content: string; type: string; lineNumber: number }[] = [];
    const rightResult: { content: string; type: string; lineNumber: number }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const leftLine = leftLines[i];
      const rightLine = rightLines[i];

      if (leftLine === undefined) {
        leftResult.push({ content: '', type: 'empty', lineNumber: i + 1 });
        rightResult.push({
          content: rightLine,
          type: 'added',
          lineNumber: i + 1,
        });
      } else if (rightLine === undefined) {
        leftResult.push({
          content: leftLine,
          type: 'removed',
          lineNumber: i + 1,
        });
        rightResult.push({ content: '', type: 'empty', lineNumber: i + 1 });
      } else if (leftLine === rightLine) {
        leftResult.push({
          content: leftLine,
          type: 'equal',
          lineNumber: i + 1,
        });
        rightResult.push({
          content: rightLine,
          type: 'equal',
          lineNumber: i + 1,
        });
      } else {
        leftResult.push({
          content: leftLine,
          type: 'modified',
          lineNumber: i + 1,
        });
        rightResult.push({
          content: rightLine,
          type: 'modified',
          lineNumber: i + 1,
        });
      }
    }

    setDiffResult({ leftLines: leftResult, rightLines: rightResult });
  };

  const handleSyncScroll = (source: 'left' | 'right') => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;

    if (!leftEl || !rightEl) return;

    if (source === 'left') {
      rightEl.scrollTop = leftEl.scrollTop;
    } else {
      leftEl.scrollTop = rightEl.scrollTop;
    }
  };

  const handleClear = () => {
    setLeftValue('');
    setRightValue('');
    setDiffResult(null);
  };

  const handleCopyDiff = async () => {
    if (!diffResult) return;
    const diffText = diffResult.leftLines
      .map((line, i) => {
        const rightLine = diffResult.rightLines[i];
        if (line.type === 'added' || rightLine?.type === 'added') {
          return `+ ${rightLine?.content || ''}`;
        }
        if (line.type === 'removed') {
          return `- ${line.content}`;
        }
        return `  ${line.content}`;
      })
      .join('\n');

    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'added':
        return 'diff-added';
      case 'removed':
        return 'diff-removed';
      case 'modified':
        return 'bg-warning/10 border-l-2 border-warning';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-primary" />
          JSON Diff对比
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="btn btn-secondary text-sm">
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleCopyDiff}
            className="btn btn-secondary text-sm"
            disabled={!diffResult}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制Diff
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">原始JSON</h2>
          <textarea
            ref={leftRef}
            className="code-editor"
            placeholder="在此输入原始JSON..."
            value={leftValue}
            onChange={(e) => setLeftValue(e.target.value)}
            onScroll={() => handleSyncScroll('left')}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">修改后JSON</h2>
          <textarea
            ref={rightRef}
            className="code-editor"
            placeholder="在此输入修改后的JSON..."
            value={rightValue}
            onChange={(e) => setRightValue(e.target.value)}
            onScroll={() => handleSyncScroll('right')}
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <button onClick={handleCompare} className="btn btn-primary px-8 py-3 text-lg">
          <GitCompare className="w-6 h-6" />
          开始对比
        </button>
      </div>

      {diffResult && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">对比结果</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden">
            <div className="border-r border-border">
              <div className="bg-surface-light px-4 py-2 text-sm font-medium text-text-secondary">
                原始
              </div>
              <div className="bg-surface font-mono text-sm overflow-auto max-h-[500px]">
                {diffResult.leftLines.map((line, index) => (
                  <div
                    key={index}
                    className={`flex ${getLineClass(line.type)} px-2 py-0.5`}
                  >
                    <span className="w-10 text-right text-text-secondary select-none pr-2 border-r border-border">
                      {line.lineNumber}
                    </span>
                    <span className="ml-2 whitespace-pre">
                      {line.content || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-surface-light px-4 py-2 text-sm font-medium text-text-secondary">
                修改后
              </div>
              <div className="bg-surface font-mono text-sm overflow-auto max-h-[500px]">
                {diffResult.rightLines.map((line, index) => (
                  <div
                    key={index}
                    className={`flex ${getLineClass(line.type)} px-2 py-0.5`}
                  >
                    <span className="w-10 text-right text-text-secondary select-none pr-2 border-r border-border">
                      {line.lineNumber}
                    </span>
                    <span className="ml-2 whitespace-pre">
                      {line.content || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/20 border-l-2 border-success"></div>
              <span className="text-text-secondary">新增</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger/20 border-l-2 border-danger"></div>
              <span className="text-text-secondary">删除</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning/10 border-l-2 border-warning"></div>
              <span className="text-text-secondary">修改</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
