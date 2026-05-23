import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '网址导航站',
  description: '分类整理常用网站的导航页',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
