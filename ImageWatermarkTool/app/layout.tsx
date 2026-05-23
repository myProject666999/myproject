import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '图片水印工具',
  description: '批量添加文字/Logo水印，支持模板保存和批量下载',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
