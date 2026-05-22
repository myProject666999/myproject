'use client';

import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
  height = '300px',
}: CodeEditorProps) {
  const [highlightedCode, setHighlightedCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const prismLang = language === 'jsx' ? 'jsx'
      : language === 'tsx' ? 'tsx'
      : language === 'html' ? 'markup'
      : language;

    let grammar = Prism.languages[prismLang];
    
    if (!grammar) {
      grammar = Prism.languages.javascript;
    }

    try {
      const highlighted = Prism.highlight(code || '', grammar, prismLang);
      setHighlightedCode(highlighted);
    } catch (e) {
      setHighlightedCode(escapeHtml(code || ''));
    }
  }, [code, language]);

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative" style={{ height }}>
      <pre
        ref={preRef}
        className="absolute inset-0 p-4 overflow-auto bg-gray-900 rounded-lg text-sm font-mono leading-relaxed"
        style={{ whiteSpace: 'pre', wordBreak: 'normal' }}
      >
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode || '\n' }}
        />
      </pre>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        readOnly={readOnly}
        className="absolute inset-0 p-4 overflow-auto bg-transparent text-transparent caret-white text-sm font-mono leading-relaxed resize-none focus:outline-none"
        style={{
          whiteSpace: 'pre',
          wordBreak: 'normal',
          caretColor: 'white',
        }}
        spellCheck={false}
        placeholder="在此输入代码..."
      />
    </div>
  );
}
