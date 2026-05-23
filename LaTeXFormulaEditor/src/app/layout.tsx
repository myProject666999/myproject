import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaTeX 公式编辑器",
  description: "在线 LaTeX 数学公式编辑器，支持实时渲染、模板、导出 PNG/SVG、收藏与历史",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-ink-200 bg-white/70 backdrop-blur sticky top-0 z-20">
            <nav className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-6">
              <a
                href="/"
                className="flex items-center gap-2 font-semibold text-brand-700"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-mono">
                  ∑
                </span>
                <span>LaTeX 公式编辑器</span>
              </a>
              <div className="flex items-center gap-1 text-sm text-ink-700">
                <a
                  href="/"
                  className="rounded-md px-3 py-1.5 hover:bg-ink-100 transition-colors"
                >
                  编辑
                </a>
                <a
                  href="/templates"
                  className="rounded-md px-3 py-1.5 hover:bg-ink-100 transition-colors"
                >
                  模板
                </a>
                <a
                  href="/favorites"
                  className="rounded-md px-3 py-1.5 hover:bg-ink-100 transition-colors"
                >
                  收藏
                </a>
                <a
                  href="/history"
                  className="rounded-md px-3 py-1.5 hover:bg-ink-100 transition-colors"
                >
                  历史
                </a>
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-ink-700">
                <span className="chip">MathJax SSR</span>
                <span className="chip">KaTeX Live</span>
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-ink-200 py-4 text-center text-xs text-ink-700">
            © {new Date().getFullYear()} LaTeX 公式编辑器 · 数学之美触手可及
          </footer>
        </div>
      </body>
    </html>
  );
}
