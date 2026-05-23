'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { JsonNode } from '@/lib/types';

interface JsonTreeProps {
  data: any;
}

function getNodeType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function JsonTreeNode({
  nodeKey,
  value,
  depth,
}: {
  nodeKey: string;
  value: any;
  depth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const type = getNodeType(value);
  const isExpandable = type === 'object' || type === 'array';

  const getValueDisplay = () => {
    switch (type) {
      case 'string':
        return <span className="tree-value-string">&quot;{value}&quot;</span>;
      case 'number':
        return <span className="tree-value-number">{value}</span>;
      case 'boolean':
        return <span className="tree-value-boolean">{String(value)}</span>;
      case 'null':
        return <span className="tree-value-null">null</span>;
      default:
        return null;
    }
  };

  const getChildrenCount = () => {
    if (type === 'array') return value.length;
    if (type === 'object') return Object.keys(value).length;
    return 0;
  };

  if (isExpandable) {
    const entries =
      type === 'array'
        ? value.map((item: any, index: number) => [String(index), item])
        : Object.entries(value);

    return (
      <div className="tree-node">
        <div
          className="flex items-center cursor-pointer py-0.5 hover:bg-surface-light rounded px-1"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <span className="tree-toggle">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            )}
          </span>
          {nodeKey && <span className="tree-key mr-1">{nodeKey}:</span>}
          <span className="text-text-secondary">
            {type === 'array' ? '[' : '{'}
            {!isExpanded && (
              <span className="ml-1">
                {getChildrenCount()} 项
                {type === 'array' ? ']' : '}'}
              </span>
            )}
          </span>
        </div>
        {isExpanded && (
          <div>
            {entries.map(([key, val]: [string, any], index: number) => (
              <JsonTreeNode
                key={key}
                nodeKey={key}
                value={val}
                depth={depth + 1}
              />
            ))}
            <div
              className="text-text-secondary py-0.5"
              style={{ paddingLeft: `${depth * 16 + 24}px` }}
            >
              {type === 'array' ? ']' : '}'}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="tree-node flex items-center py-0.5"
      style={{ paddingLeft: `${depth * 16 + 24}px` }}
    >
      {nodeKey && <span className="tree-key mr-1">{nodeKey}:</span>}
      {getValueDisplay()}
    </div>
  );
}

export default function JsonTree({ data }: JsonTreeProps) {
  if (data === undefined || data === null) {
    return (
      <div className="text-text-secondary p-4">请输入有效的JSON数据</div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-4 overflow-auto max-h-[600px] border border-border">
      <JsonTreeNode nodeKey="" value={data} depth={0} />
    </div>
  );
}
