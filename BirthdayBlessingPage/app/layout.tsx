import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '生日快乐 - 生日祝福页',
  description: '朋友们凑钱送的生日祝福页，记录美好的祝福和回忆',
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
