import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Snippet } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = parseInt(params.id);

    const [rows]: any[] = await pool.query(
      'SELECT * FROM snippets WHERE id = ? AND visibility = ?',
      [snippetId, 'public']
    );

    if (rows.length === 0) {
      return new NextResponse('// 代码片段不存在或为私有', {
        status: 404,
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const snippet: Snippet = rows[0];

    const js = `
(function() {
  var container = document.currentScript.parentNode;
  var embedId = 'snippet-embed-' + ${snippet.id} + '-' + Date.now();

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
  document.head.appendChild(link);

  var style = document.createElement('style');
  style.textContent = '
    #' + embedId + ' {
      background: #2d2d2d;
      border-radius: 8px;
      overflow: hidden;
      margin: 16px 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    #' + embedId + ' .snippet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #1e1e1e;
      border-bottom: 1px solid #444;
    }
    #' + embedId + ' .snippet-title {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }
    #' + embedId + ' .snippet-lang {
      color: #888;
      font-size: 12px;
    }
    #' + embedId + ' .snippet-body {
      padding: 16px;
      margin: 0;
      overflow-x: auto;
    }
    #' + embedId + ' .snippet-body pre {
      margin: 0;
      padding: 0;
      background: transparent;
    }
    #' + embedId + ' .snippet-footer {
      padding: 8px 16px;
      background: #1e1e1e;
      border-top: 1px solid #444;
      text-align: right;
    }
    #' + embedId + ' .snippet-footer a {
      color: #888;
      font-size: 12px;
      text-decoration: none;
    }
    #' + embedId + ' .snippet-footer a:hover {
      color: #fff;
    }
  ';
  document.head.appendChild(style);

  var div = document.createElement('div');
  div.id = embedId;
  div.innerHTML = '<div class="snippet-header">' +
    '<h4 class="snippet-title"></h4>' +
    '<span class="snippet-lang"></span>' +
  '</div>' +
  '<div class="snippet-body"><pre><code class="language-"></code></pre></div>' +
  '<div class="snippet-footer"><a href="' + (typeof window !== 'undefined' ? window.location.origin : '') + '/snippets/' + ${snippet.id} + '" target="_blank">查看完整代码</a></div>';

  var header = div.querySelector('.snippet-header');
  header.querySelector('.snippet-title').textContent = ${JSON.stringify(snippet.title)};
  header.querySelector('.snippet-lang').textContent = ${JSON.stringify(snippet.language)};

  var code = div.querySelector('code');
  code.className = 'language-' + ${JSON.stringify(snippet.language)};
  code.textContent = ${JSON.stringify(snippet.code)};

  container.insertBefore(div, document.currentScript);

  var prismScript = document.createElement('script');
  prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
  prismScript.onload = function() {
    var langScript = document.createElement('script');
    langScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-' + ${JSON.stringify(snippet.language === 'jsx' ? 'jsx' : snippet.language === 'tsx' ? 'tsx' : snippet.language === 'html' ? 'markup' : snippet.language)} + '.min.js';
    langScript.onload = function() {
      if (window.Prism) {
        Prism.highlightElement(code);
      }
    };
    document.head.appendChild(langScript);
  };
  document.head.appendChild(prismScript);
})();
`;

    return new NextResponse(js, {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return new NextResponse(`// Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
