import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '婚礼邀请函',
  description: '专属婚礼网站 - 记录我们的美好时刻',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
