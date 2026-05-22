import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '壁纸下载站 - Wallpaper Download Station',
  description: '高清壁纸下载站，多分辨率分类壁纸下载，支持4K、2K、1080P等多种分辨率',
  keywords: '壁纸,高清壁纸,4K壁纸,桌面壁纸,手机壁纸,壁纸下载',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                壁纸下载站
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                首页
              </Link>
              <Link
                href="/category"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                分类
              </Link>
              <Link
                href="/favorites"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                我的收藏
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
        <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© 2024 壁纸下载站 - Wallpaper Download Station</p>
            <p className="text-sm mt-2">提供高清壁纸下载 · 多分辨率适配 · 免费使用</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
