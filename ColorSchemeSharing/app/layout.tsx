import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '配色方案分享',
  description: '设计师分享色彩搭配的平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav className="navbar">
          <div className="container">
            <Link href="/" className="logo">
              🎨 配色方案分享
            </Link>
            <div className="nav-links">
              <Link href="/">广场</Link>
              <Link href="/create">创建</Link>
            </div>
          </div>
        </nav>
        <main className="main">
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
