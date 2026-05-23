import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '个人信息流',
  description: '聚合博客、RSS、B站、GitHub等多源动态的个人信息流平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
