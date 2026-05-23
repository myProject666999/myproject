import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "节日海报生成器",
  description: "精美节日海报一键生成，上传头像、定制文字、下载分享",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="bg-gradient-to-r from-primary to-primary-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🎨</span>
              <span>节日海报生成器</span>
            </a>
            <nav className="flex items-center gap-6">
              <a
                href="/"
                className="hover:text-red-200 transition-colors font-medium"
              >
                模板中心
              </a>
              <a
                href="/templates"
                className="hover:text-red-200 transition-colors font-medium"
              >
                全部模板
              </a>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
        <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 节日海报生成器 · 数据驱动模板 · Next.js + Canvas</p>
        </footer>
      </body>
    </html>
  );
}
